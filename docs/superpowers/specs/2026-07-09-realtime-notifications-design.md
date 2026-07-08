# Design Specification: Session-Based Realtime Notifications

This document specifies the design for converting the placeholder Notification Bell into a reactive, functional system powered by global React state inside `AuthContext`.

---

## 1. Global Context Architecture (`AuthContext.jsx`)

Expose shared notification states and action handlers globally so they can be triggered from any child view.

### 1.1 State Definitions
*   `notifications`: Array of objects containing:
    *   `id` (number/timestamp)
    *   `title` (string)
    *   `message` (string)
    *   `time` (string, e.g. "Just now")
    *   `read` (boolean)
*   **Seed Data**: Initialized with standard simulation notifications.

### 1.2 Action Handlers
*   `addNotification(title, message)`:
    Appends a new unread notification to the top of the array:
    ```javascript
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
    ```
*   `markAllNotificationsAsRead()`:
    Loops through the array and marks all items as read.

---

## 2. Page Event Bindings (Triggers)

Inject `addNotification` into form submit handlers and status changers to trigger reactive alerts.

### 2.1 Admin Dashboard (`AdminDashboard.jsx`)
*   **Task Creation**:
    On successful task creation post-request, call:
    `addNotification('Task Created', 'Admin assigned a new task: "' + title + '"');`
*   **Task Modification**:
    On successful task update PUT-request, call:
    `addNotification('Task Updated', 'Admin updated task details: "' + editTitle + '"');`

### 2.2 Employee Board (`EmployeeBoard.jsx`)
*   **Status Changes**:
    On successful task status update PATCH-request, call:
    `addNotification('Task Progress', user.name + ' updated task to "' + statusLabel + '"');`

---

## 3. Navbar Rendering (`App.jsx`)

*   Subscribe to `notifications` and `markAllNotificationsAsRead` via `useAuth()`.
*   Calculate the active badge count using:
    `const unreadCount = notifications.filter((n) => !n.read).length;`
*   Render the reactive lists inside the padded Popover component.
