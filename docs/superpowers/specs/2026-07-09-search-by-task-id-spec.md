# Design Specification: Search by Task ID ("TSK-XX")

This document specifies the design for adding direct task ID search queries inside the workload hub search bar on the `feature/branding-integration` branch.

---

## 1. Goal

Allow users to find tasks instantly by typing their ID prefix (e.g. `TSK-1`, `tsk1`, or `1`) in the top global search bar.

---

## 2. Filtering Logic

In both `AdminDashboard.jsx` and `EmployeeBoard.jsx`, update the active task filter callback to check:
1.  **Prefix with hyphen**: `"tsk-1"`, `"tsk-2"`
2.  **Prefix without hyphen**: `"tsk1"`, `"tsk2"`
3.  **Raw ID number**: `"1"`, `"2"`

### 2.1 Code Expression
```javascript
const matchesId = `tsk-${task.id}`.includes(query) || 
                  `tsk${task.id}`.includes(query) || 
                  task.id.toString() === query;
```

Return matching tasks if any of `matchesTitle`, `matchesDescription`, `matchesEmployee`, or `matchesId` are true.
