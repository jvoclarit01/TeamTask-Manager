# Workload Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement task priority levels, overdue alerts, dashboard analytics metrics, and task comments in the Laravel backend and React/MUI frontend on the `feature/branding-integration` branch.

---

### Task 1: Database Migrations (Laravel Backend)

**Files:**
- Create: `backend/database/migrations/2026_07_09_153000_add_priority_and_comments_tables.php`

- [ ] **Step 1: Write migration schema**
  Implement schema modifications to add the `priority` column and create the `comments` table:
  ```php
  <?php

  use Illuminate\Database\Migrations\Migration;
  use Illuminate\Database\Schema\Blueprint;
  use Illuminate\Support\Facades\Schema;

  return new class extends Migration
  {
      public function up(): void
      {
          // Add priority to tasks table
          Schema::table('tasks', function (Blueprint $table) {
              $table->string('priority')->default('medium')->nullable()->after('due_date');
          });

          // Create comments table
          Schema::create('comments', function (Blueprint $table) {
              $table->id();
              $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
              $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
              $table->text('content');
              $table->timestamps();
          });
      }

      public function down(): void
      {
          Schema::dropIfExists('comments');
          Schema::table('tasks', function (Blueprint $table) {
              $table->dropColumn('priority');
          });
      }
  };
  ```

- [ ] **Step 2: Run migration command**
  Run `php artisan migrate` in the backend directory.

- [ ] **Step 3: Commit migration**
  Run:
  ```bash
  git add backend/database/migrations/
  git commit -m "db: add priority column to tasks and create comments table"
  ```

---

### Task 2: Models, Routes & Controllers (Laravel Backend)

**Files:**
- Create: `backend/app/Models/Comment.php`
- Modify: `backend/app/Models/Task.php`
- Modify: `backend/routes/api.php`
- Modify: `backend/app/Http/Controllers/TaskController.php`

- [ ] **Step 1: Create Comment Model**
  Define `Comment.php` with Task and User relationships:
  ```php
  <?php

  namespace App\Models;

  use Illuminate\Database\Eloquent\Factories\HasFactory;
  use Illuminate\Database\Eloquent\Model;

  class Comment extends Model
  {
      use HasFactory;

      protected $fillable = ['task_id', 'user_id', 'content'];

      public function task()
      {
          return $this->belongsTo(Task::class);
      }

      public function user()
      {
          return $this->belongsTo(User::class);
      }
  }
  ```

- [ ] **Step 2: Update Task Model Relationships & Fillables**
  Add `priority` to fillables and define the comments relationship inside `Task.php`:
  ```php
  protected $fillable = ['title', 'description', 'status', 'due_date', 'priority'];

  public function comments()
  {
      return $this->hasMany(Comment::class)->orderBy('created_at', 'desc');
  }
  ```

- [ ] **Step 3: Register API Routes**
  Register routes inside `backend/routes/api.php`:
  ```php
  Route::get('/tasks/{id}/comments', [TaskController::class, 'getComments']);
  Route::post('/tasks/{id}/comments', [TaskController::class, 'addComment']);
  ```

- [ ] **Step 4: Implement Controller logic**
  Update `TaskController.php` to handle priority parsing, comments retrieval, and comment creation.
  - In `store()` and `update()`, add `'priority'` parsing (default: `'medium'`).
  - Implement endpoints:
  ```php
      public function getComments($id)
      {
          $comments = Comment::with('user')
              ->where('task_id', $id)
              ->orderBy('created_at', 'asc')
              ->get();
          return response()->json($comments);
      }

      public function addComment(Request $request, $id)
      {
          $request->validate([
              'user_id' => 'required|exists:users,id',
              'content' => 'required|string',
          ]);

          $comment = Comment::create([
              'task_id' => $id,
              'user_id' => $request->input('user_id'),
              'content' => $request->input('content'),
          ]);

          return response()->json($comment->load('user'), 201);
      }
  ```

- [ ] **Step 5: Commit backend integrations**
  Run:
  ```bash
  git add backend/app/
  git add backend/routes/
  git commit -m "feat: implement Comment model, relation maps, and task controller CRUD endpoints"
  ```

---

### Task 3: API Service Integration (Frontend)

**Files:**
- Modify: `frontend/src/services/apiService.js`
- Modify: `frontend/src/pages/AdminDashboard.jsx` (Create & Edit requests)

- [ ] **Step 1: Define comment wrapper functions**
  Expose comment fetchers and posters in `apiService.js`:
  ```javascript
  export const getComments = (taskId) => {
    return api.get(`/tasks/${taskId}/comments`);
  };

  export const addComment = (taskId, commentData) => {
    return api.post(`/tasks/${taskId}/comments`, commentData);
  };
  ```

- [ ] **Step 2: Update Create & Edit task requests with priority**
  Inside `AdminDashboard.jsx`:
  - Bind task creation and update calls to include priority values.

- [ ] **Step 3: Commit service changes**
  Run:
  ```bash
  git add frontend/src/services/apiService.js
  git commit -m "feat: integrate getComments and addComment service endpoints"
  ```

---

### Task 4: UI Upgrades: Priority & Overdue Flags (TaskCard.jsx)

**Files:**
- Modify: `frontend/src/components/TaskCard.jsx`

- [ ] **Step 1: Render priority chips, overdue alerts, and comment button**
  Add priority badges and check if `due_date` is past to render an `"Overdue"` tag. Add a styled Comments button to slide open the detail drawer.
  - Implement priority style maps.
  - Add Overdue checks.
  - Render a styled Comment icon button.

- [ ] **Step 2: Commit TaskCard updates**
  Run:
  ```bash
  git add frontend/src/components/TaskCard.jsx
  git commit -m "feat: render priority levels, overdue warnings, and comments triggers on TaskCards"
  ```

---

### Task 5: UI Upgrades: Workload Metrics Row (AdminDashboard.jsx / EmployeeBoard.jsx)

**Files:**
- Modify: `frontend/src/pages/AdminDashboard.jsx`
- Modify: `frontend/src/pages/EmployeeBoard.jsx`

- [ ] **Step 1: Render summary analytics panel**
  Add a metrics bar above the task lists showing active task counts, completion rate percentage, and queue status.
  - Admin: Summary across all team workloads.
  - Employee: Summary restricted to their own assigned tasks.

- [ ] **Step 2: Commit dashboard layout upgrades**
  Run:
  ```bash
  git add frontend/src/pages/AdminDashboard.jsx frontend/src/pages/EmployeeBoard.jsx
  git commit -m "feat: render glassmorphic workload metrics summary panels on dashboards"
  ```

---

### Task 6: UI Upgrades: Task Comments Drawer (TaskCard.jsx)

**Files:**
- Modify: `frontend/src/components/TaskCard.jsx`

- [ ] **Step 1: Write slide-out Drawer and threaded comment stream**
  Declare a `Drawer` component inside `TaskCard.jsx` showing task specs, activity logs, and a scrollable comments section with form posting.
  - Bind drawer toggle.
  - Fetch comments on open.
  - Wire up add comment callback.

- [ ] **Step 2: Commit comments drawer**
  Run:
  ```bash
  git add frontend/src/components/TaskCard.jsx
  git commit -m "feat: implement sliding comments and activity thread drawer on task selection"
  ```
