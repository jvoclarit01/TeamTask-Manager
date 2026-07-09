# Search by Task ID Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modify the frontend task filtering blocks on both the Admin Dashboard and the Employee Board to support queries matching task IDs.

---

### Task 1: Update AdminDashboard.jsx Filter Logic

**Files:**
- Modify: `frontend/src/pages/AdminDashboard.jsx`

- [ ] **Step 1: Edit task filter block**
  Update the search query filtering logic inside `AdminDashboard.jsx` (around lines 135-141) to include the new `matchesId` check:
  ```javascript
    let filteredTasks = tasks.filter((task) => {
      const query = searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(query);
      const matchesDescription = task.description ? task.description.toLowerCase().includes(query) : false;
      const matchesEmployee = task.users ? task.users.some((user) => user.name.toLowerCase().includes(query)) : false;
      const matchesId = `tsk-${task.id}`.includes(query) || `tsk${task.id}`.includes(query) || task.id.toString() === query;
      return matchesTitle || matchesDescription || matchesEmployee || matchesId;
    });
  ```

- [ ] **Step 2: Commit AdminDashboard changes**
  Run:
  ```bash
  git add frontend/src/pages/AdminDashboard.jsx
  git commit -m "feat: support searching tasks by task ID key in AdminDashboard"
  ```

---

### Task 2: Update EmployeeBoard.jsx Filter Logic

**Files:**
- Modify: `frontend/src/pages/EmployeeBoard.jsx`

- [ ] **Step 1: Edit task filter block**
  Update the search query filtering logic inside `EmployeeBoard.jsx` (around lines 55-62) to include the new `matchesId` check:
  ```javascript
    const filteredTasks = tasks.filter((task) => {
      const query = searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(query);
      const matchesDescription = task.description ? task.description.toLowerCase().includes(query) : false;
      const matchesEmployee = task.users ? task.users.some((user) => user.name.toLowerCase().includes(query)) : false;
      const matchesId = `tsk-${task.id}`.includes(query) || `tsk${task.id}`.includes(query) || task.id.toString() === query;
      return matchesTitle || matchesDescription || matchesEmployee || matchesId;
    });
  ```

- [ ] **Step 2: Commit EmployeeBoard changes**
  Run:
  ```bash
  git add frontend/src/pages/EmployeeBoard.jsx
  git commit -m "feat: support searching tasks by task ID key in EmployeeBoard"
  ```
