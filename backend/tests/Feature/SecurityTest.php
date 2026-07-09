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

    public function test_employee_can_only_see_active_employees_in_list()
    {
        // Deactivate employee2
        $this->employee2->is_active = false;
        $this->employee2->save();

        $response = $this->actingAs($this->employee1, 'sanctum')
            ->getJson('/api/users');

        $response->assertStatus(200);
        // Should see employee1 but not employee2
        $response->assertJsonFragment(['id' => $this->employee1->id]);
        $response->assertJsonMissing(['id' => $this->employee2->id]);
    }

    public function test_admin_can_see_inactive_employees_in_list()
    {
        // Deactivate employee2
        $this->employee2->is_active = false;
        $this->employee2->save();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/users');

        $response->assertStatus(200);
        // Admin should see both employee1 and employee2
        $response->assertJsonFragment(['id' => $this->employee1->id]);
        $response->assertJsonFragment(['id' => $this->employee2->id]);
    }

    public function test_employee_can_update_own_status()
    {
        $response = $this->actingAs($this->employee1, 'sanctum')
            ->patchJson("/api/users/{$this->employee1->id}/status", [
                'availability_status' => 'deep_work',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Status updated successfully',
                'availability_status' => 'deep_work',
            ]);

        $this->assertEquals(\App\Enums\AvailabilityStatus::DEEP_WORK, $this->employee1->fresh()->availability_status);
    }

    public function test_employee_cannot_update_others_status()
    {
        $response = $this->actingAs($this->employee1, 'sanctum')
            ->patchJson("/api/users/{$this->employee2->id}/status", [
                'availability_status' => 'ooo',
            ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_update_employee_active_status_and_skills()
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/users/{$this->employee1->id}/admin-update", [
                'is_active' => false,
                'skills' => ['Backend', 'Laravel'],
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Employee details updated successfully',
                'user' => [
                    'id' => $this->employee1->id,
                    'is_active' => false,
                    'skills' => ['Backend', 'Laravel'],
                ]
            ]);

        $fresh = $this->employee1->fresh();
        $this->assertFalse($fresh->is_active);
        $this->assertEquals(['Backend', 'Laravel'], $fresh->skills);
    }

    public function test_non_admin_cannot_update_employee_details()
    {
        $response = $this->actingAs($this->employee1, 'sanctum')
            ->putJson("/api/users/{$this->employee2->id}/admin-update", [
                'is_active' => false,
            ]);

        $response->assertStatus(403);
    }

    public function test_admin_deactivating_employee_revokes_tokens()
    {
        // Generate a token for employee1
        $token = $this->employee1->createToken('test-token')->plainTextToken;

        // Verify employee1 can access tasks using the token
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/tasks');
        $response->assertStatus(200);

        // Admin deactivates employee1
        $adminResponse = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/users/{$this->employee1->id}/admin-update", [
                'is_active' => false,
            ]);
        $adminResponse->assertStatus(200);

        // Clear actingAs authentication state
        $this->app['auth']->forgetUser();
        $this->app['auth']->guard('sanctum')->forgetUser();

        // Verify employee1 can no longer access tasks using the old token (should return 401 unauthorized)
        $response2 = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/tasks');
        $response2->assertStatus(401);
    }

    public function test_admin_cannot_deactivate_self()
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/users/{$this->admin->id}/admin-update", [
                'is_active' => false,
            ]);

        $response->assertStatus(403)
            ->assertJson(['message' => 'You cannot deactivate your own account.']);
    }
}
