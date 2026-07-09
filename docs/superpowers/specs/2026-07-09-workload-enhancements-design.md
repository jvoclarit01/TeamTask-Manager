# Design Specification: Workload Enhancements (Priority, Metrics, Comments, Overdue Alerts)

This document specifies the technical design for adding task priority, deadline overdue warnings, analytics metrics, and collaborative comments on the `feature/branding-integration` branch.

---

## 1. Database Schema Extensions (Laravel & SQLite)

### 1.1 Task Table Upgrades
*   **Column**: `priority` (string, default: `'medium'`, nullable).
*   **Values**: `'low'`, `'medium'`, `'high'`.

### 1.2 Comments Table Schema
Create `comments` table:
*   `id` (integer, Primary Key)
*   `task_id` (integer, Foreign Key to `tasks.id`, delete cascade)
*   `user_id` (integer, Foreign Key to `users.id`, delete cascade)
*   `content` (text)
*   `timestamps` (`created_at`, `updated_at`)

---

## 2. Models & API Routes (Backend)

### 2.1 Model Relationships
*   **Task.php**:
    ```php
    protected $fillable = ['title', 'description', 'status', 'due_date', 'priority'];
    public function comments() { return $this->hasMany(Comment::class)->orderBy('created_at', 'desc'); }
    ```
*   **Comment.php**:
    Create `app/Models/Comment.php`:
    ```php
    protected $fillable = ['task_id', 'user_id', 'content'];
    public function task() { return $this->belongsTo(Task::class); }
    public function user() { return $this->belongsTo(User::class); }
    ```

### 2.2 Routes & Controllers
In `routes/api.php`:
```php
Route::get('/tasks/{id}/comments', [TaskController::class, 'getComments']);
Route::post('/tasks/{id}/comments', [TaskController::class, 'addComment']);
```

In `TaskController.php`:
*   `getComments($id)`: Fetches comments with user relation (`Comment::with('user')->where('task_id', $id)->orderBy('created_at', 'desc')->get()`).
*   `addComment(Request $request, $id)`: Validates `content`, saves with `auth()->id()` (or `user_id` parameter if mock session), and returns the new comment loaded with user relation.

---

## 3. Frontend Upgrades (React & Material UI)

### 3.1 Task Card Priority & Overdue Flags (`TaskCard.jsx`)
*   **Priority Chip**: Renders beside status.
    *   `high`: border `#ef4444`, text `#ef4444`, bg `rgba(239,68,68,0.05)`.
    *   `medium`: border `#f59e0b`, text `#f59e0b`, bg `rgba(245,158,11,0.05)`.
    *   `low`: border `#3b82f6`, text `#3b82f6`, bg `rgba(59,130,246,0.05)`.
*   **Overdue Flag**: Calculated using `new Date(task.due_date) < new Date() && task.status !== 'completed'`. Renders a small warning chip: `"⚠️ Overdue"`.

### 3.2 Analytics Metrics Row (`AdminDashboard.jsx`)
*   Four visual stats cards placed above task lists:
    1.  **Total Tasks**: Count of open tasks.
    2.  **Completion Rate**: `%` of completed tasks.
    3.  **Active Workload**: Tasks currently in progress.
    4.  **Highest Load**: Names the employee with the most assigned tasks.

### 3.3 Comments Slide-out Drawer (`TaskCard.jsx` / `App.jsx`)
*   **Visual Interface**: A right-side `<Drawer>` component.
*   **Content Panel**:
    *   Task details header (monogram, title, description).
    *   Timeline list showing task comments.
    *   Text input field with a submit button to post a comment.
