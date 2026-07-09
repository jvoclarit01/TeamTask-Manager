# Requirements: Team Task & Workload Manager

**Defined:** 2026-07-09
**Core Value:** Track team workload capacity and help employees prioritize their active tasks in real-time.

## v1 Requirements

### Authentication & Roles
- [x] **AUTH-01**: User switching dropdown in the top header
- [x] **AUTH-02**: Protected routes locking Admin view and Employee board views by user role

### Task Management
- [x] **TASK-01**: Create task with title, description, due date, priority, and multiple assignee IDs
- [x] **TASK-02**: Edit existing task parameters (title, description, due date, priority, assignees)
- [x] **TASK-03**: Search tasks by title, description, assigned employee name, or task ID ("TSK-XX")

### Work Board & Progress
- [x] **BOARD-01**: Columns rendering "To Do", "In Progress", "Completed" task cards
- [x] **BOARD-02**: Status transition buttons allowing employees to start or complete tasks
- [x] **BOARD-03**: Scrollable column card wrappers avoiding screen stretch on overflow
- [x] **BOARD-04**: Overdue alerts marking tasks in past-due deadlines

### Collaboration & Analytics
- [x] **COLL-01**: Interactive task details slide-out drawer
- [x] **COLL-02**: Threaded task comments timeline posting updates to SQLite database
- [x] **ANL-01**: Summary metrics cards showing total active tasks, completion rate, and workload queue status

### Security
- [ ] **SEC-01**: Security Threat model mitigation review & verification of codebase features

## Traceability
| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01     | Phase 1 | Complete |
| AUTH-02     | Phase 1 | Complete |
| TASK-01     | Phase 2 | Complete |
| TASK-02     | Phase 2 | Complete |
| TASK-03     | Phase 3 | Complete |
| BOARD-01    | Phase 1 | Complete |
| BOARD-02    | Phase 1 | Complete |
| BOARD-03    | Phase 4 | Complete |
| BOARD-04    | Phase 4 | Complete |
| COLL-01     | Phase 4 | Complete |
| COLL-02     | Phase 4 | Complete |
| ANL-01      | Phase 4 | Complete |
| SEC-01      | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-09*
*Last updated: 2026-07-09 after GSD mapping*
