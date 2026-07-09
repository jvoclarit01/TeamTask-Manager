# Employee Dashboard Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a team overview panel with status, skills, capacity metrics, deactivation/email actions, employee status updates, and Drag & Drop task reassignment.

**Architecture:** Lightweight Approach A (JSON column for user skills, status columns directly on the `users` table). Frontend uses draggable/droppable HTML5 events in Vite-React + Material-UI (MUI).

**Tech Stack:** Laravel 11/12, SQLite, React 18, TailwindCSS, Axios, Material-UI (MUI)

---

## Proposed Changes File Map

* **Create**:
  * `backend/database/migrations/2026_07_10_000000_add_active_status_and_skills_to_users_table.php` (Add `is_active`, `availability_status`, `skills` columns)
* **Modify**:
  * `backend/app/Models/User.php` (Add casts and fillable fields)
  * `backend/app/Http/Controllers/Api/AuthController.php` (Add check for deactivated login)
  * `backend/database/seeders/DatabaseSeeder.php` (Seed initial skills & availability status)
  * `backend/app/Http/Controllers/Api/UserController.php` (Add `index` task select, `updateStatus`, and `adminUpdate` methods)
  * `backend/routes/api.php` (Register user update routes)
  * `backend/app/Http/Controllers/Api/TaskController.php` (Add active employee constraint validation on tasks)
  * `backend/tests/Feature/SecurityTest.php` (Add tests for deactivation blocking and status updates)
  * `frontend/src/services/apiService.js` (Add API client wrapper functions)
  * `frontend/src/pages/EmployeeBoard.jsx` (Add OOO/Availability selector)
  * `frontend/src/pages/AdminDashboard.jsx` (Add "Our Team" list, capacity meter, skills manager, and drag-and-drop targets)
  * `frontend/src/components/TaskCard.jsx` (Enable HTML5 draggable actions)

---

## Tasks

### Task 1: Database Migration & User Model

**Files:**
- Create: `backend/database/migrations/2026_07_10_000000_add_active_status_and_skills_to_users_table.php`
- Modify: `backend/app/Models/User.php:23-50`

- [ ] **Step 1: Write the migration**
  Create migration file at `backend/database/migrations/2026_07_10_000000_add_active_status_and_skills_to_users_table.php` with:
  ```php
  <?php

  use Illuminate\Database\Migrations\Migration;
  use Illuminate\Database\Schema\Blueprint;
  use Illuminate\Support\Facades\Schema;

  return new class extends Migration
  {
      public function up(): void
      {
          Schema::table('users', function (Blueprint $table) {
              $table->boolean('is_active')->default(true);
              $table->string('availability_status')->default('active'); // active, ooo, in_meetings, deep_work
              $table->json('skills')->nullable(); // array of strings
          });
      }

      public function down(): void
      {
          Schema::table('users', function (Blueprint $table) {
              $table->dropColumn(['is_active', 'availability_status', 'skills']);
          });
      }
  };
  ```

- [ ] **Step 2: Run migration command**
  Run: `php artisan migrate` in the `backend` directory.
  Expected output: `Migration table created successfully. / Running migration: 2026_07_10_000000_add_active_status_and_skills_to_users_table`

- [ ] **Step 3: Modify User.php model**
  Update `backend/app/Models/User.php` fillable and casts:
  ```php
      protected $fillable = [
          'name',
          'email',
          'password',
          'is_active',
          'availability_status',
          'skills',
      ];
  
      protected function casts(): array
      {
          return [
              'email_verified_at' => 'datetime',
              'password' => 'hashed',
              'is_active' => 'boolean',
              'skills' => 'array',
          ];
      }
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add backend/database/migrations/*_add_active_status_and_skills_to_users_table.php backend/app/Models/User.php
  git commit -m "feat: add active status and skills to users table and model casts"
  ```

---

### Task 2: Auth Check for Deactivated Users

**Files:**
- Modify: `backend/app/Http/Controllers/Api/AuthController.php:14-35`
- Modify: `backend/database/seeders/DatabaseSeeder.php:32-41`

- [ ] **Step 1: Update AuthController login logic**
  Modify `login` method in `backend/app/Http/Controllers/Api/AuthController.php` to prevent deactivated users from logging in:
  ```php
      public function login(Request $request)
      {
          $credentials = $request->validate([
              'email' => 'required|email',
              'password' => 'required|string',
          ]);

          $user = User::where('email', $credentials['email'])->first();

          if (!$user || !Hash::check($credentials['password'], $user->password)) {
              return response()->json(['message' => 'Invalid credentials'], 401);
          }

          if (!$user->is_active) {
              return response()->json(['message' => 'Your account has been deactivated. Please contact an admin.'], 403);
          }

          $token = $user->createToken('auth_token')->plainTextToken;

          return response()->json([
              'user' => [
                  'id' => $user->id,
                  'name' => $user->name,
                  'email' => $user->email,
                  'role' => $user->roles->first()?->name,
              ],
              'token' => $token,
          ]);
      }
  ```

- [ ] **Step 2: Update DatabaseSeeder with skills & statuses**
  Modify `backend/database/seeders/DatabaseSeeder.php` to assign initial skills/status for the employee:
  ```php
          // 3. Create Employee Users
          $employee = User::firstOrCreate([
              'email' => 'yoshiem@gmail.com',
          ], [
              'name' => 'Yosh Batula',
              'password' => bcrypt('password123'),
              'availability_status' => 'active',
              'skills' => ['Frontend', 'React', 'CSS'],
          ]);
          $employee->assignRole($employeeRole);
  ```

- [ ] **Step 3: Reset database and reseed**
  Run: `php artisan migrate:fresh --seed` in `backend`.
  Expected: Success, database tables populated, Yosh seeded with skills.

- [ ] **Step 4: Commit**
  ```bash
  git add backend/app/Http/Controllers/Api/AuthController.php backend/database/seeders/DatabaseSeeder.php
  git commit -m "feat: check for active user status on login and seed initial skills"
  ```

---

### Task 3: API Endpoints for User Update & Retrieval

**Files:**
- Modify: `backend/app/Http/Controllers/Api/UserController.php`
- Modify: `backend/routes/api.php:12-25`

- [ ] **Step 1: Implement updateStatus and adminUpdate in UserController**
  Add the methods in `backend/app/Http/Controllers/Api/UserController.php`:
  ```php
      public function index(Request $request): JsonResponse {
          $query = User::role('employee')->with(['tasks' => function ($q) {
              $q->select('tasks.id', 'tasks.title', 'tasks.status', 'tasks.priority');
          }]);

          if (!$request->user()->hasRole('admin')) {
              $query->where('is_active', true);
          }

          $employees = $query->get(['id', 'name', 'email', 'is_active', 'availability_status', 'skills']);
          return response()->json($employees);
      }

      public function updateStatus(Request $request, User $user): JsonResponse {
          if ($request->user()->id !== $user->id) {
              return response()->json(['message' => 'Unauthorized'], 403);
          }

          $validated = $request->validate([
              'availability_status' => 'required|string|in:active,ooo,in_meetings,deep_work',
          ]);

          $user->update(['availability_status' => $validated['availability_status']]);

          return response()->json([
              'message' => 'Status updated successfully',
              'availability_status' => $user->availability_status
          ]);
      }

      public function adminUpdate(Request $request, User $user): JsonResponse {
          $validated = $request->validate([
              'is_active' => 'sometimes|boolean',
              'skills' => 'sometimes|array',
              'skills.*' => 'string|max:50',
          ]);

          if (isset($validated['is_active'])) {
              $user->is_active = $validated['is_active'];
          }
          if (isset($validated['skills'])) {
              $user->skills = $validated['skills'];
          }

          $user->save();

          return response()->json([
              'message' => 'Employee details updated successfully',
              'user' => [
                  'id' => $user->id,
                  'is_active' => $user->is_active,
                  'skills' => $user->skills
              ]
          ]);
      }
  ```

- [ ] **Step 2: Add API routes**
  Modify `backend/routes/api.php` to define the status and admin update endpoints:
  ```php
  Route::middleware('auth:sanctum')->group(function () {
      Route::post('/logout', [AuthController::class, 'logout']);
      Route::get('/user', [AuthController::class, 'user']);

      // Employee list
      Route::get('/users',  [UserController::class, 'index']);
      // Update employee availability status (self only)
      Route::patch('/users/{user}/status', [UserController::class, 'updateStatus']);

      // Tasks (Admin-only creation & deletion)
      Route::middleware('role:admin')->group(function () {
          Route::post('/tasks', [TaskController::class, 'store']);
          Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
          Route::post('/users', [UserController::class, 'store']);
          // Admin update of employee details
          Route::put('/users/{user}/admin-update', [UserController::class, 'adminUpdate']);
      });
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add backend/app/Http/Controllers/Api/UserController.php backend/routes/api.php
  git commit -m "feat: implement employee status update and admin update endpoints with routes"
  ```

---

### Task 4: Deactivation Safety Guard on Task Controller

**Files:**
- Modify: `backend/app/Http/Controllers/Api/TaskController.php`

- [ ] **Step 1: Check active users on task store & update**
  Modify validation logic in `store` and `update` methods in `backend/app/Http/Controllers/Api/TaskController.php` to filter out deactivated users:
  ```php
      // In store method:
      $validated = $request->validate([
          'title'       => 'required|string|max:255',
          'description' => 'nullable|string',
          'due_date'    => 'nullable|date',
          'user_ids'    => 'required|array|min:1',
          'user_ids.*'  => 'exists:users,id',
          'priority'    => 'nullable|in:low,medium,high',
      ]);

      // Enforce only active assignees
      $activeIds = User::where('is_active', true)->pluck('id')->toArray();
      foreach ($validated['user_ids'] as $uid) {
          if (!in_array($uid, $activeIds)) {
              return response()->json(['message' => 'Cannot assign tasks to deactivated employees.'], 422);
          }
      }

      // In update method:
      $validated = $request->validate([
          'title'       => 'sometimes|string|max:255',
          'description' => 'nullable|string',
          'due_date'    => 'nullable|date',
          'user_ids'    => 'sometimes|array|min:1',
          'user_ids.*'  => 'exists:users,id',
          'priority'    => 'nullable|in:low,medium,high',
          'status'      => 'nullable|in:pending,in_progress,completed',
      ]);

      if (isset($validated['user_ids'])) {
          $activeIds = User::where('is_active', true)->pluck('id')->toArray();
          foreach ($validated['user_ids'] as $uid) {
              if (!in_array($uid, $activeIds)) {
                  return response()->json(['message' => 'Cannot assign tasks to deactivated employees.'], 422);
              }
          }
      }
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add backend/app/Http/Controllers/Api/TaskController.php
  git commit -m "feat: prevent task assignments to deactivated employees"
  ```

---

### Task 5: Backend Security & Integration Tests

**Files:**
- Modify: `backend/tests/Feature/SecurityTest.php`

- [ ] **Step 1: Add deactivation & status verification tests**
  Add these tests to `backend/tests/Feature/SecurityTest.php` to verify BOLA controls and deactivation block:
  ```php
      public function test_deactivated_user_cannot_login()
      {
          $this->employee1->update(['is_active' => false]);

          $response = $this->postJson('/api/login', [
              'email' => 'bob@company.com',
              'password' => 'password123',
          ]);

          $response->assertStatus(403);
      }

      public function test_cannot_assign_task_to_deactivated_user()
      {
          $this->employee2->update(['is_active' => false]);

          $response = $this->actingAs($this->admin, 'sanctum')
              ->postJson('/api/tasks', [
                  'title' => 'Test Task',
                  'user_ids' => [$this->employee2->id],
              ]);

          $response->assertStatus(422);
      }

      public function test_employee_cannot_update_others_status()
      {
          $response = $this->actingAs($this->employee1, 'sanctum')
              ->patchJson("/api/users/{$this->employee2->id}/status", [
                  'availability_status' => 'ooo',
              ]);

          $response->assertStatus(403);
      }

      public function test_employee_can_update_own_status()
      {
          $response = $this->actingAs($this->employee1, 'sanctum')
              ->patchJson("/api/users/{$this->employee1->id}/status", [
                  'availability_status' => 'deep_work',
              ]);

          $response->assertStatus(200);
          $this->assertDatabaseHas('users', [
              'id' => $this->employee1->id,
              'availability_status' => 'deep_work',
          ]);
      }
  ```

- [ ] **Step 2: Run PHPUnit tests**
  Run: `php artisan test` in `backend`.
  Expected: All tests pass.

- [ ] **Step 3: Commit**
  ```bash
  git add backend/tests/Feature/SecurityTest.php
  git commit -m "test: add integration tests for active statuses and BOLA guards"
  ```

---

### Task 6: Frontend API Service Updates

**Files:**
- Modify: `frontend/src/services/apiService.js`

- [ ] **Step 1: Add new API endpoints**
  Update `frontend/src/services/apiService.js` to include the user status and admin update endpoints:
  ```javascript
  // Update employee availability status (Self)
  export const updateEmployeeStatus = (userId, status) => api.patch(`/users/${userId}/status`, { availability_status: status });

  // Admin update employee details (active status, skills)
  export const adminUpdateEmployee = (userId, data) => api.put(`/users/${userId}/admin-update`, data);
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add frontend/src/services/apiService.js
  git commit -m "feat: add frontend api endpoints for employee status and admin details updates"
  ```

---

### Task 7: EmployeeBoard Status Selector

**Files:**
- Modify: `frontend/src/pages/EmployeeBoard.jsx`

- [ ] **Step 1: Implement Status Selector**
  Modify `frontend/src/pages/EmployeeBoard.jsx` to render an availability selector at the top next to their name:
  ```jsx
  import { useState } from 'react';
  import { Box, MenuItem, Select, FormControl, InputLabel, Typography } from '@mui/material';
  import { updateEmployeeStatus } from '../services/apiService';
  import { useAuth } from '../context/AuthContext';

  // Inside EmployeeBoard component:
  const { user, refreshCache, addNotification } = useAuth();
  const [status, setStatus] = useState(user.availability_status || 'active');

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    try {
      await updateEmployeeStatus(user.id, newStatus);
      addNotification('Status Updated', `Your availability is now set to ${newStatus.toUpperCase()}`);
      refreshCache(true);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // Render selector inside header:
  <FormControl size="small" sx={{ minWidth: 150, ml: 2, background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
    <InputLabel id="availability-label" sx={{ color: '#94a3b8' }}>Status</InputLabel>
    <Select
      labelId="availability-label"
      value={status}
      label="Status"
      onChange={handleStatusChange}
      sx={{ color: '#f8fafc', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } }}
    >
      <MenuItem value="active">🟢 Active</MenuItem>
      <MenuItem value="ooo">🔴 On Leave</MenuItem>
      <MenuItem value="in_meetings">🟡 In Meetings</MenuItem>
      <MenuItem value="deep_work">🔵 Deep Work</MenuItem>
    </Select>
  </FormControl>
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add frontend/src/pages/EmployeeBoard.jsx
  git commit -m "feat: add employee availability status selector on Employee Board"
  ```

---

### Task 8: AdminDashboard "Our Team" Panel

**Files:**
- Modify: `frontend/src/pages/AdminDashboard.jsx`

- [ ] **Step 1: Render team panel**
  Integrate the grid side-by-side with tasks and list out employees. Use clean metrics computation and render deactivation switches and inline skill managers:
  ```jsx
  // Calculate workloads client-side
  const getWorkloadLevel = (taskCount) => {
    if (taskCount <= 1) return { label: 'Low', color: '#10b981' };
    if (taskCount <= 3) return { label: 'Optimal', color: '#f59e0b' };
    return { label: 'Overloaded', color: '#ef4444' };
  };
  
  // Toggle Deactivation
  const handleToggleActive = async (employee) => {
    try {
      await adminUpdateEmployee(employee.id, {
        is_active: !employee.is_active
      });
      addNotification('User Updated', `Updated active status for ${employee.name}`);
      refreshCache(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Skill updates Popover triggers
  const handleSaveSkills = async (employeeId, skillsArray) => {
    try {
      await adminUpdateEmployee(employeeId, { skills: skillsArray });
      addNotification('Skills Updated', 'Employee skills list updated');
      refreshCache(true);
    } catch (err) {
      console.error(err);
    }
  };
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add frontend/src/pages/AdminDashboard.jsx
  git commit -m "feat: implement Our Team panel, deactivation switches and capacity meters in AdminDashboard"
  ```

---

### Task 9: Drag-and-Drop Task Rebalancing

**Files:**
- Modify: `frontend/src/components/TaskCard.jsx`
- Modify: `frontend/src/pages/AdminDashboard.jsx`

- [ ] **Step 1: Make TaskCard draggable**
  Add drag parameters to the main container in `frontend/src/components/TaskCard.jsx`:
  ```jsx
  <Box
    draggable={true}
    onDragStart={(e) => {
      e.dataTransfer.setData('text/plain', task.id);
    }}
    // existing props
  >
  ```

- [ ] **Step 2: Implement drop targets on Employee Cards**
  Update the Employee Card item container in `AdminDashboard.jsx` to receive drops:
  ```jsx
  <Box
    onDragOver={(e) => e.preventDefault()}
    onDrop={async (e) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData('text/plain');
      if (!taskId) return;
      
      try {
        // Reassign task to this employee (clearing other assignees for rebalance)
        await updateTask(Number(taskId), {
          user_ids: [employee.id]
        });
        addNotification('Task Reassigned', `Task rebalanced and assigned to ${employee.name}`);
        refreshCache(true);
      } catch (err) {
        console.error(err);
      }
    }}
  >
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add frontend/src/components/TaskCard.jsx frontend/src/pages/AdminDashboard.jsx
  git commit -m "feat: support workload rebalancing via drag and drop task assignments"
  ```
