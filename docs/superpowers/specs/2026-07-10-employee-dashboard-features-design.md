# Design Specification: Employee Dashboard List, Deactivation, Availability Status, Skills, and Task Rebalancing

---
title: Employee Dashboard List, Deactivation, Availability Status, Skills, and Task Rebalancing
date: 2026-07-10
status: Approved
author: Antigravity CLI
---

## 1. Executive Summary
This document defines the architectural and user experience design for introducing an **Employee List Sidebar** into the Admin Dashboard, enabling real-time capacity monitoring, direct management actions (deactivation), task rebalancing (via Drag & Drop), skills tracking, and employee availability status updates. 

This update provides Managers with direct visibility into team workloads and capacity, preventing bottlenecking and task allocation issues.

---

## 2. System Architecture & Relational Schema

We will use the **Lightweight JSON Schema (Approach A)** for skills and add direct status indicators to the `users` table, minimizing database join overhead while utilizing Laravel's built-in JSON query features.

### 2.1 Database Migrations
A new migration will add three columns to the `users` table:
* `is_active` (boolean, default: `true`): Tracks employee activity status. Deactivated users cannot log in.
* `availability_status` (string, default: `'active'`): Current availability status of the user (`active`, `ooo`, `in_meetings`, `deep_work`).
* `skills` (json, nullable): Array of strings (e.g., `["Frontend", "React", "SQL"]`).

```php
Schema::table('users', function (Blueprint $table) {
    $table->boolean('is_active')->default(true);
    $table->string('availability_status')->default('active');
    $table->json('skills')->nullable();
});
```

### 2.2 Model Casts (`App\Models\User.php`)
```php
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

---

## 3. API Boundaries & Endpoints

To maintain secured boundaries and block Broken Object Level Authorization (BOLA), status changes are verified against session identity, and deactivation is locked to Admin role access.

### 3.1 Fetching Employees (`GET /api/users`)
* **Controller**: `UserController@index`
* **Access**: All authenticated users.
* **Behavior**:
  * Admins receive **all** users with the `employee` role (both active and inactive) along with their related tasks (titles, status, priorities).
  * Employees receive **only active** employees.
* **Payload**:
  ```json
  [
    {
      "id": 2,
      "name": "Yosh Batula",
      "email": "yoshiem@gmail.com",
      "is_active": true,
      "availability_status": "active",
      "skills": ["Frontend", "React", "CSS"],
      "tasks": [
        { "id": 1, "title": "Design Landing Page", "status": "in_progress", "priority": "high" }
      ]
    }
  ]
  ```

### 3.2 Update Availability Status (`PATCH /api/users/{user}/status`)
* **Controller**: `UserController@updateStatus`
* **Access**: Authenticated owner of the user account.
* **BOLA Check**: Enforces `$request->user()->id === $user->id`.
* **Payload**:
  ```json
  { "availability_status": "deep_work" }
  ```

### 3.3 Admin Update Details (`PUT /api/users/{user}/admin-update`)
* **Controller**: `UserController@adminUpdate`
* **Access**: Admins only (via `role:admin` middleware).
* **Payload**:
  ```json
  {
    "is_active": false,
    "skills": ["Frontend", "React", "CSS", "TypeScript"]
  }
  ```

### 3.4 Assignment Constraint (Task Controller validation)
When creating or updating a task, the `user_ids` array will validate that the corresponding users are active:
```php
'user_ids.*' => 'exists:users,id|in:' . implode(',', User::where('is_active', true)->pluck('id')->toArray())
```

---

## 4. Frontend Interface Layout & Interactions

The user interface will be built using Material-UI (MUI) components with a premium glassmorphic theme.

### 4.1 "Our Team" Panel (Admin Dashboard)
A floating panel containing the employee list sits beside the main task list.

* **Workload Progress Bar**:
  * Calculated client-side based on task status counts.
  * **Low** (0-1 In Progress / Pending tasks): Green progress bar.
  * **Optimal** (2-3 active tasks): Orange/Blue progress bar.
  * **High** (4+ active tasks): Red progress bar (flashes a warning).
* **Deactivation Switch**:
  * A toggle switch. When switched off, prompts: `"Are you sure you want to deactivate [Name]? They will be logged out and cannot be assigned new tasks."`
  * Deactivated cards are styled with `opacity: 0.5` and a grey strike-through.
* **Skill Tags Manager**:
  * Clicking the `+` icon on an employee's card opens a small input field inside a Popover. 
  * The Admin can enter new skills or click `x` on existing chips to remove them.
* **Quick Actions Row**:
  * **Email Action**: Opens `mailto:email@company.com`.
  * **Comment Shortcut**: If the employee has an active task, clicking this opens the slide-out Task Details Drawer directly to the comment section of their active task.

### 4.2 Availability Status Bar (Employee Board)
A status selector is added at the top of the Kanban Board for the logged-in employee.
* Dropdown options: `🟢 Active`, `🔴 On Leave (OOO)`, `🟡 In Meetings`, `🔵 Deep Work`.
* Changing the status updates the database immediately.

### 4.3 Drag-and-Drop Task Rebalancing
* Task cards in the main task list are marked `draggable={true}`.
* Employee cards in the Team panel implement `onDragOver` and `onDrop`.
* **Flow**:
  1. The user drags a task card from the task list.
  2. The user drops the task on an employee card.
  3. The app determines the current task ID and reassigns it to the target employee, removing the previous assignee to balance workloads.
  4. The system executes a `PUT /api/tasks/{id}` request, updates local state, and triggers a success notification.

---

## 5. Security & Verification Strategy

### 5.1 Verification Checklist
* **Authentication**: Attempting to login with a deactivated user account must fail with a `403 Forbidden` error.
* **BOLA Prevention**: Employees trying to call `PATCH /api/users/{other_user_id}/status` must receive a `403 Unauthorized` error.
* **Active Status Constraint**: Assigning a task to a deactivated user must return a validation error.
* **Historical Integrity**: Verify that deactivating a user does not delete or alter their past task completions or comments.
