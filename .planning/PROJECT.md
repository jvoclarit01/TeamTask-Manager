# Team Task & Workload Manager

## What This Is
A web-based Team Task & Workload Manager built with a Laravel (PHP) backend and a React (Vite/MUI) frontend. It allows admins to assign and schedule tasks to multiple employees, and allows employees to view and update their active workloads.

## Core Value
Empowers team managers to track workload capacity and helps employees prioritize their active tasks in real-time.

## Requirements

### Validated
- ✓ **REQ-01**: Multi-tenant or Role-Based User switching (Admin / Employee views) — Phase 1
- ✓ **REQ-02**: Task Creation & Assignment (Many-to-Many employee relationships) — Phase 2
- ✓ **REQ-03**: Workload Board Columns (To Do, In Progress, Completed status transitions) — Phase 1
- ✓ **REQ-04**: Global Dashboard Metrics & Overdue alerts — Phase 4
- ✓ **REQ-05**: Task Priority selections & Visual badge colors — Phase 4
- ✓ **REQ-06**: Threaded Collaborative Task Comments & Activity Drawer — Phase 4
- ✓ **REQ-07**: Performance upgrades (Vite page-level lazy loading and image optimization) — Phase 3

### Active
- [ ] **REQ-08**: Security verification & audit of the completed workload manager features — Phase 5

### Out of Scope
- **Real-time WebSockets**: Polling or reactive local state updates are sufficient for local prototype validation.

## Context
This is a brownfield project mapping. We have already developed the core requirements in previous checkpoints, including the database migrations, controllers, API routing, and complete React/MUI layout pages.

## Constraints
- **Tech Stack**: Laravel backend (SQLite database), React + Vite + Material UI frontend.
- **Architecture**: Single-tenant SQLite file-based persistent store, session-based notifications context.

## Key Decisions
| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Session-based Notification Context | Local session storage is fast, avoids complex backend queue listeners for prototype demo | ✓ Good |
| SWR Global State Caching | Solves page-switch latency by keeping pre-loaded lists available in AuthContext | ✓ Good |
| SQLite file database | Standard default for local Laravel prototype apps | ✓ Good |

## Evolution
This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-09 after GSD initialization mapping*
