# Design Specification: Team Task & Workload Manager Frontend

**Date**: 2026-07-09  
**Status**: APPROVED  
**Author**: Antigravity  

---

## 1. Overview
The **Team Task & Workload Manager** frontend is a modern React SPA designed to provide a professional user interface for task management. It connects to a Laravel API backend. The system divides workflows into an **Admin View** (task creation and multi-employee assignment) and an **Employee View** (Kanban board for tracking assigned work).

---

## 2. Technology Stack
*   **Build System**: Vite + React 19 (ESM)
*   **Routing**: React Router DOM (v6+)
*   **UI/UX Framework**: Material UI (MUI v9) + Emotion
*   **API Client**: Axios (configured with Base URL pointing to the Laravel backend)
*   **State Management**: React Context (for authentication and global session state)
*   **Icons**: Material Icons (`@mui/icons-material`)

---

## 3. Design System & Aesthetics
To create a premium, high-end look, the application utilizes a tailored OLED Dark Mode theme:

*   **Colors**:
    *   `background.default`: Deep Slate-Black (`#020617`) with a subtle radial gradient top-glow: `radial-gradient(ellipse at top, #0f172a, #020617)`.
    *   `background.paper`: Charcoal-Slate (`#0f172a`) for cards, boards, and inputs.
    *   `borders`: Slate 800 (`#1e293b`).
    *   `primary`: Emerald Green (`#10b981`) representing success, progress, and active controls.
    *   `secondary`: Royal Blue (`#3b82f6`) representing user/employee tagging and badges.
*   **Typography**:
    *   Headers: **Fira Sans** (heavy geometric sans-serif for striking visual hierarchy).
    *   Data/Monospace: **Fira Code** (monospace for numbers, tags, and status labels).
    *   Body: **Inter** or system-ui sans-serif.
*   **Card & Board Components**:
    *   1px solid borders (`#1e293b`).
    *   Soft hover scales (`scale(1.02)`) with a subtle green outer glow: `box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 10px rgba(16, 185, 129, 0.15)`.

---

## 4. Routing & Page Architecture
We use a client-side routed architecture with path-based protection.

### Route Map
*   `/login`: The portal page where users choose to sign in as "Alice Admin" or any employee from the database.
*   `/admin/dashboard`: Protected route. Only accessible to users with the role `admin`. Contains task creation and the workload monitor.
*   `/employee/board`: Protected route. Only accessible to users with the role `employee`. Contains the employee's personal Kanban task tracker.

### AuthContext Schema
The session is managed by `AuthContext`, which exports:
*   `user`: `{ id: number, name: string, email: string, role: 'admin'|'employee' }` or `null`.
*   `login(user)`: Saves session to React state and `localStorage`.
*   `logout()`: Clears React state and `localStorage`, then redirects to `/login`.

---

## 5. UI Layouts & Features

### 5.1 Portal Login Page (`/login`)
A dedicated dashboard landing page featuring card selectors for each user:
*   An **Admin Portal** card to login as Alice Admin.
*   An **Employee Portal** section displaying cards for each active employee (fetched from `GET /api/users`).
*   Logging in updates the `AuthContext` and redirects the user to their designated view.

### 5.2 Admin Dashboard (`/admin/dashboard`)
Split layout (Grid):
*   **Form Pane (4 Columns)**: 
    *   TextFields for Title and Description.
    *   Multi-Select Dropdown with checkboxes listing all employees.
    *   "Assign Task" button to post task data to `POST /api/tasks`.
*   **Task List (8 Columns)**:
    *   A feed of all tasks fetched from `GET /api/tasks`.
    *   Each task card lists title, description, colored status chip, and horizontal circular avatars representing assigned employees (with tooltip titles).

### 5.3 Employee Kanban Board (`/employee/board`)
A three-column board (To Do, In Progress, Completed) displaying only the active employee's assigned tasks (fetched from `GET /api/my-tasks/{userId}`):
*   **To Do column**: Shows tasks with "Start" buttons. Clicking transitions the status to `in_progress`.
*   **In Progress column**: Shows tasks with "Complete" buttons. Clicking transitions the status to `completed`.
*   **Completed column**: Displays finished tasks with a muted green checkmark.
*   Transitions are handled dynamically to slide task cards between columns on update.

---

## 6. Backend Integration & API Mapping
The React frontend connects to the following endpoints on `http://localhost:8000`:
1.  `GET /api/users`: Fetches employee directory for login and assignments.
2.  `GET /api/tasks`: Fetches all created tasks for the Admin Dashboard.
3.  `POST /api/tasks`: Submits task title, description, and list of assigned user IDs: `{ title, description, user_ids: [] }`.
4.  `GET /api/my-tasks/{userId}`: Fetches tasks assigned to a specific employee.
5.  `PATCH /api/tasks/{id}/status`: Updates task status: `{ status: 'pending'|'in_progress'|'completed' }`.
