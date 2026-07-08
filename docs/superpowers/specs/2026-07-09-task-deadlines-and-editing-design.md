# Design Specification: Task Deadlines & Admin Editing

This document specifies the design for adding task deadlines (due dates) to the HRMS Task Board database and enabling administrators to edit existing tasks (title, description, assignees, and deadlines) through a high-end modal interface.

---

## 1. Database & Backend Updates (Laravel)

### 1.1 Database Migration
Create a migration to add a `due_date` column to the `tasks` table:
*   **Column**: `due_date`
*   **Type**: `date` (nullable)
*   **Default**: `NULL`

### 1.2 Model & Controller Changes
*   **Model (`Task.php`)**: Add `due_date` to `$fillable`.
*   **Validation Rules**:
    *   Include `'due_date' => 'nullable|date'` in validation.
*   **API Routes**:
    *   Add `PUT /api/tasks/{id}` route pointing to `TaskController@update`.
*   **Controller (`TaskController.php`)**:
    *   Implement `update(Request $request, $id)`:
        *   Find task by ID.
        *   Validate inputs (`title`, `description`, `due_date`, `user_ids`).
        *   Update task properties.
        *   Sync the pivot table `task_user` with the list of `user_ids`.
        *   Return the updated task resource.

---

## 2. Frontend Integration & Layout Upgrades

### 2.1 API Service (`apiService.js`)
*   Update `createTask(data)` to pass `due_date`.
*   Add `updateTask(taskId, data)` targeting `PUT /api/tasks/{taskId}`.

### 2.2 Task Card Edit Action (`TaskCard.jsx`)
*   **Admin-Only Edit Button**: Render an `EditIcon` (pencil) next to the status chip at the top-right of the card if the logged-in user is an `admin`.
*   **Real Deadline Display**: Instead of calculating the mock `+7 days`, read and format `task.due_date` from the database. Show a fallback `"No deadline set"` if null.
*   **Callback Trigger**: Clicking the edit button calls `onEdit(task)`.

### 2.3 Create & Edit Dialog Modals (`AdminDashboard.jsx`)
*   **Due Date Selector**: Add a native date input field (`type="date"`) to both Create and Edit modals.
*   **Edit Task Dialog**: Create a new modal dialog pre-filled with the title, description, assigned user IDs, and due date of the selected task. Submit calls `updateTask()` and triggers list refresh.

---

## 3. UI/UX & High-Contrast Design Standards

### 3.1 Dialog Modals (Create & Edit Task)
*   **Padding**: Inset all dialog contents inside a `<Box sx={{ p: 4 }}>` wrapper to enforce a generous 32px padding boundary.
*   **Contrast**:
    *   Labels: `#e2e8f0` (medium bold body2, size `0.85rem`).
    *   Input Fields Background: `#0b0f19` (high contrast against `#0e1424` dialog background).
    *   Placeholders: `#64748b` (full opacity).
    *   Backdrop: Scrim opacity of 65% (`rgba(3, 7, 18, 0.65)`) with an `8px` blur.

### 3.2 Notification Bell Popover (`App.jsx`)
*   **Card Container**: Use a structured popover with `#0e1424` background and `#1c253d` border.
*   **Padding**: Generous list item padding (`p: 2.5` / `20px` spacing) and a dedicated padded title header.
*   **Text Contrast**:
    *   Notification Title: `#f8fafc` (bold).
    *   Notification Description/Time: `#cbd5e1` (light gray).
    *   Close / Mark Read buttons: `#cbd5e1` and hover states `#10b981`.

### 3.3 Filter & Sort Dropdown Menu (`AdminDashboard.jsx`)
*   **Spacing**: Increase container padding to `p: 3` (24px) for breathing room.
*   **Text Contrast**:
    *   Heading Title: `#f8fafc` (Outfit font, bold).
    *   Sub-headings (Sort by, Status, Assignee): `#cbd5e1` (bold, uppercase).
    *   Radio & Dropdown Option Labels: `#cbd5e1`.
    *   Select Inputs Background: `#0b0f19` with `#1c253d` borders, focusing to `#10b981`.
