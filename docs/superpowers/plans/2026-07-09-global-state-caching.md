# Global SWR Caching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize tasks and employees data inside the global `AuthContext` to support instant UI loading and silent background synchronization on the `feature/branding-integration` branch.

---

### Task 1: Update AuthContext.jsx with SWR Cache State

**Files:**
- Modify: `frontend/src/context/AuthContext.jsx`

- [ ] **Step 1: Edit AuthContext to hold cache state and fetch triggers**
  Import `getTasks`, `getEmployees`, and `getMyTasks`. Add tasks/employees cache state variables. Add automatic loading hook triggered when the active user switches.
  ```javascript
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  ```

- [ ] **Step 2: Commit AuthContext caching changes**
  Run:
  ```bash
  git add frontend/src/context/AuthContext.jsx
  git commit -m "feat: implement global tasks and employees caching in AuthContext"
  ```

---

### Task 2: Update AdminDashboard.jsx with Cached State

**Files:**
- Modify: `frontend/src/pages/AdminDashboard.jsx`

- [ ] **Step 1: Replace local fetch states with global AuthContext cache**
  Subscribe to `tasks`, `employees`, `tasksLoading`, `employeesLoading`, and `refreshCache` from `useAuth()`. Remove local tasks and employees state declarations.
  - Calculate `loading` dynamically:
    ```javascript
    const loading = (tasks.length === 0 && tasksLoading) || (employees.length === 0 && employeesLoading);
    ```
  - Call `refreshCache()` inside component mount and after creations/edits.

- [ ] **Step 2: Commit AdminDashboard caching changes**
  Run:
  ```bash
  git add frontend/src/pages/AdminDashboard.jsx
  git commit -m "feat: migrate AdminDashboard to leverage global SWR cache"
  ```

---

### Task 3: Update EmployeeBoard.jsx with Cached State

**Files:**
- Modify: `frontend/src/pages/EmployeeBoard.jsx`

- [ ] **Step 1: Replace local fetch states with global AuthContext cache**
  Subscribe to `tasks`, `tasksLoading`, and `refreshCache` from `useAuth()`. Remove local tasks state.
  - Calculate `loading` dynamically:
    ```javascript
    const loading = tasks.length === 0 && tasksLoading;
    ```
  - Call `refreshCache()` inside component mount and after status transitions.

- [ ] **Step 2: Commit EmployeeBoard caching changes**
  Run:
  ```bash
  git add frontend/src/pages/EmployeeBoard.jsx
  git commit -m "feat: migrate EmployeeBoard to leverage global SWR cache"
  ```
