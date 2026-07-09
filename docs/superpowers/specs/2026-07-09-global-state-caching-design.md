# Design Specification: Global SWR Caching for Dashboard Data

This document specifies the technical design for implementing a Stale-While-Revalidate (SWR) cache pattern inside the `AuthContext` to eliminate perceived loading times on tab/user switching.

---

## 1. Goal

Provide instantaneous rendering of tasks and employees when loading dashboards, eliminating the blank screen and `<CircularProgress />` loading spinner for recurring loads, while keeping data fresh via background refetching.

---

## 2. Global State & Fetch Handlers (`AuthContext.jsx`)

### 2.1 State Properties
Add the following states to `AuthContext.jsx`:
*   `tasks`: Array of tasks (cached).
*   `employees`: Array of employees (cached).
*   `tasksLoading`: Boolean indicating if tasks are loading.
*   `employeesLoading`: Boolean indicating if employees are loading.

### 2.2 Cache Loading Logic
Add the following methods:
*   `refreshCache()`: Triggers background fetches for both tasks and employees concurrently without forcing a full-screen loading state if cached data exists.
*   `clearCache()`: Resets `tasks` and `employees` to empty arrays (triggered on logout or user switch to prevent security leakages).

---

## 3. Security & Role Isolation

To ensure that employees do not see admin tasks or other users' tasks upon switching accounts:
1.  **Clear on switch**: Inside `switchUser` and `switchRole`, the cache is immediately cleared.
2.  **User-based Fetching**: The `loadTasks` request dynamically checks `user.role`:
    *   If `admin`, fetches all tasks via `getTasks()`.
    *   If `employee`, fetches assigned tasks via `getMyTasks(user.id)`.
