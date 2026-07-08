# Session-Based Realtime Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the placeholder Notification Bell dropdown list into a fully reactive, functional notification feed where task creation, task editing, and task status updates trigger live notifications instantly.

**Architecture:** Expose global notifications array, addNotification, and markAllNotificationsAsRead helpers inside AuthContext.jsx. Modify App.jsx, AdminDashboard.jsx, and EmployeeBoard.jsx to hook into these methods.

**Tech Stack:** React, Material UI v9, AuthContext.

---

### Task 1: Global State Setup (AuthContext.jsx)

**Files:**
- Modify: `frontend/src/context/AuthContext.jsx`

- [ ] **Step 1: Declare notification states and action methods**
  Update `frontend/src/context/AuthContext.jsx` to define notifications list, addNotification pusher, and mark read updater, exposing them in the context value.
  Inside AuthProvider, add:
  ```javascript
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Task Created', message: 'Alice Admin created task: Redesign logo', time: 'Just now', read: false },
    { id: 2, title: 'Task Started', message: 'Bob Employee started task: update backend', time: '10 mins ago', read: false },
    { id: 3, title: 'Task Completed', message: 'Charlie Employee completed task: Update UI Components', time: '1 hr ago', read: true },
  ]);

  const addNotification = (title, message) => {
    setNotifications((prev) => [
      {
        id: Date.now(),
        title,
        message,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  ```
  Ensure these are passed in the value object of `<AuthContext.Provider>`:
  ```javascript
  value={{
    user,
    login,
    logout,
    switchUser,
    searchQuery,
    setSearchQuery,
    notifications,
    addNotification,
    markAllNotificationsAsRead,
  }}
  ```

- [ ] **Step 2: Commit AuthContext changes**
  Run:
  ```bash
  git add frontend/src/context/AuthContext.jsx
  git commit -m "feat: expose notifications and trigger actions in AuthContext"
  ```

---

### Task 2: Navbar Subscription & Bell Badge (App.jsx)

**Files:**
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Extract notifications from context and clean local state**
  Remove local `notifications` state, `markAllNotificationsAsRead` function, and local bindings in `App.jsx`. Subscibe to `useAuth()` to retrieve notifications instead.
  In `App.jsx` remove:
  - `const [notifications, setNotifications] = useState(...)`
  - `const markAllNotificationsAsRead = () => { ... }`
  Add extraction from `useAuth()`:
  ```javascript
  const { user, logout, switchUser, searchQuery, setSearchQuery, notifications, markAllNotificationsAsRead } = useAuth();
  ```
  Keep the unreadCount calculation dynamic:
  ```javascript
  const unreadCount = notifications.filter((n) => !n.read).length;
  ```

- [ ] **Step 2: Commit App.jsx updates**
  Run:
  ```bash
  git add frontend/src/App.jsx
  git commit -m "feat: subscribe App shell navbar to global notifications context"
  ```

---

### Task 3: Admin Task Action Hooks (AdminDashboard.jsx)

**Files:**
- Modify: `frontend/src/pages/AdminDashboard.jsx`

- [ ] **Step 1: Trigger notifications on task creation and edit saves**
  Subscribe to `addNotification` inside `AdminDashboard.jsx`:
  ```javascript
  const { searchQuery, addNotification } = useAuth();
  ```
  Update `handleSubmit` (Create Task) to call `addNotification` upon success:
  ```javascript
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || assignedUserIds.length === 0) return;

    try {
      await createTask({
        title,
        description,
        due_date: dueDate || null,
        user_ids: assignedUserIds,
      });
      addNotification('Task Created', `Admin assigned a new task: "${title}"`);
      setTitle('');
      setDescription('');
      setDueDate('');
      setAssignedUserIds([]);
      setOpen(false);
      setPage(1);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to assign task', err);
    }
  };
  ```
  Update `handleEditSubmit` (Edit Task) to call `addNotification` upon success:
  ```javascript
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || editAssignedUserIds.length === 0) return;

    try {
      await updateTask(editingTask.id, {
        title: editTitle,
        description: editDescription,
        due_date: editDueDate || null,
        user_ids: editAssignedUserIds,
      });
      addNotification('Task Updated', `Admin updated task details: "${editTitle}"`);
      setEditingTask(null);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to update task details', err);
    }
  };
  ```

- [ ] **Step 2: Commit AdminDashboard action updates**
  Run:
  ```bash
  git add frontend/src/pages/AdminDashboard.jsx
  git commit -m "feat: trigger notifications when admin creates or edits tasks"
  ```

---

### Task 4: Employee Progress Status Hooks (EmployeeBoard.jsx)

**Files:**
- Modify: `frontend/src/pages/EmployeeBoard.jsx`

- [ ] **Step 1: Trigger notifications on task status changes**
  Subscribe to `addNotification` inside `EmployeeBoard.jsx`:
  ```javascript
  const { user, searchQuery, addNotification } = useAuth();
  ```
  Modify `handleStatusChange` to trigger notification alerts:
  ```javascript
  const handleStatusChange = async (taskId, newStatus) => {
    const taskObj = tasks.find(t => t.id === taskId);
    const taskTitle = taskObj ? taskObj.title : 'Task';
    const statusLabels = {
      pending: 'To Do',
      in_progress: 'In Progress',
      completed: 'Completed'
    };
    const statusLabel = statusLabels[newStatus] || newStatus;

    try {
      await updateTaskStatus(taskId, newStatus);
      addNotification('Task Progress', `${user.name} moved task "${taskTitle}" to "${statusLabel}"`);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to transition task status', err);
    }
  };
  ```

- [ ] **Step 2: Commit EmployeeBoard updates**
  Run:
  ```bash
  git add frontend/src/pages/EmployeeBoard.jsx
  git commit -m "feat: trigger task progress notifications on status updates"
  ```
