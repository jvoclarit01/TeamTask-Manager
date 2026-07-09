<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $employee1;
    protected User $employee2;

    protected function setUp(): void
    {
        parent::setUp();

        // Set up roles
        $adminRole = Role::create(['name' => 'admin', 'guard_name' => 'web']);
        $employeeRole = Role::create(['name' => 'employee', 'guard_name' => 'web']);

        // Set up users
        $this->admin = User::factory()->create(['name' => 'Alice Admin', 'email' => 'admin@company.com']);
        $this->admin->assignRole($adminRole);

        $this->employee1 = User::factory()->create(['name' => 'Bob Employee', 'email' => 'bob@company.com']);
        $this->employee1->assignRole($employeeRole);

        $this->employee2 = User::factory()->create(['name' => 'Charlie Employee', 'email' => 'charlie@company.com']);
        $this->employee2->assignRole($employeeRole);
    }

    public function test_employee_cannot_create_task()
    {
        $response = $this->actingAs($this->employee1, 'sanctum')
            ->postJson('/api/tasks', [
                'title' => 'Malicious Task',
                'description' => 'Should fail',
                'user_ids' => [$this->employee1->id],
            ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_create_task()
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/tasks', [
                'title' => 'Admin Task',
                'description' => 'Should pass',
                'user_ids' => [$this->employee1->id],
                'priority' => 'high',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('tasks', ['title' => 'Admin Task']);
    }

    public function test_employee_cannot_view_others_tasks_endpoint()
    {
        $response = $this->actingAs($this->employee1, 'sanctum')
            ->getJson("/api/users/{$this->employee2->id}/tasks");

        $response->assertStatus(403);
    }

    public function test_employee_cannot_comment_on_unassigned_task()
    {
        $task = Task::create(['title' => 'Private Task', 'status' => 'pending', 'priority' => 'medium']);
        $task->users()->sync([$this->employee2->id]); // Assigned only to Employee 2

        $response = $this->actingAs($this->employee1, 'sanctum')
            ->postJson("/api/tasks/{$task->id}/comments", [
                'content' => 'Malicious comment',
            ]);

        $response->assertStatus(403);
    }

    public function test_comment_spoofing_user_id_is_prevented()
    {
        $task = Task::create(['title' => 'Shared Task', 'status' => 'pending', 'priority' => 'medium']);
        $task->users()->sync([$this->employee1->id]);

        $response = $this->actingAs($this->employee1, 'sanctum')
            ->postJson("/api/tasks/{$task->id}/comments", [
                'user_id' => $this->admin->id, // Attempt to spoof comment as Admin
                'content' => 'Spoofed message',
            ]);

        $response->assertStatus(201);
        // Verify that the comment saved actually belongs to Employee 1
        $this->assertDatabaseHas('comments', [
            'task_id' => $task->id,
            'user_id' => $this->employee1->id,
            'content' => 'Spoofed message'
        ]);
    }

    public function test_active_user_can_login()
    {
        $response = $this->postJson('/api/login', [
            'email' => 'bob@company.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user', 'token']);
    }

    public function test_inactive_user_cannot_login()
    {
        $inactiveEmployee = User::factory()->inactive()->create([
            'email' => 'inactive@company.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'inactive@company.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Your account has been deactivated. Please contact an admin.'
            ]);
    }
}
