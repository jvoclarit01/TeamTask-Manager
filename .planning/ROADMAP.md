# Roadmap: Team Task & Workload Manager

## Overview
Phased implementation of the workload manager application, starting from the basic core layout views and database schemas up to premium collaboration details and final security auditing.

## Phases
- [x] **Phase 1: Foundation Layout & User Context** - Set up MUI layout page and user switching auth state
- [x] **Phase 2: Task Assignment Database & API** - Create tasks schema with many-to-many pivot tables
- [x] **Phase 3: ID-Search & Page Splitting Performance** - Implement search-by-ID and route-level lazy loading
- [x] **Phase 4: Workload Analytics, Overdue Warnings & Comments** - Add dashboard metrics, overdue alerts, and comments drawer
- [ ] **Phase 5: GSD Security Audit** - Perform security verification of the codebase

## Phase Details

### Phase 1: Foundation Layout & User Context
**Goal**: Establish the basic page structure and user auth role context
**Depends on**: Nothing
**Success Criteria**:
  1. User can switch roles in the header dropdown.
  2. Page layout locks views depending on active role permissions.
**Plans**: 1 plan
Plans:
- [x] 01-01: Foundation layout views

### Phase 2: Task Assignment Database & API
**Goal**: Integrate the Laravel backend sqlite DB schema and endpoints
**Depends on**: Phase 1
**Success Criteria**:
  1. Tasks can be created and stored in the database.
  2. Tasks can be assigned to multiple employees.
**Plans**: 1 plan
Plans:
- [x] 02-01: Laravel DB migrations and API controllers

### Phase 3: ID-Search & Page Splitting Performance
**Goal**: Implement fast search operations and bundle performance code splitting
**Depends on**: Phase 2
**Success Criteria**:
  1. User can search tasks directly by typing "TSK-XX" keys in the searchbar.
  2. JavaScript packages are code-split and lazy-loaded on routing.
**Plans**: 1 plan
Plans:
- [x] 03-01: Search filters and lazy loading setup

### Phase 4: Workload Analytics, Overdue Warnings & Comments
**Goal**: Build the summary statistics cards, deadline checks, and collaborative drawers
**Depends on**: Phase 3
**Success Criteria**:
  1. Dashboards show workload count metrics and completion percentage.
  2. Overdue task cards render warning flags.
  3. Users can read and post comments inside task detail drawers.
**Plans**: 1 plan
Plans:
- [x] 04-01: Dashboard metrics and comments drawer integration

### Phase 5: GSD Security Audit
**Goal**: Run GSD security audit verification
**Depends on**: Phase 4
**Success Criteria**:
  1. Mitigations for all STRIDE threat model classifications are verified in the codebase.
  2. A completed SECURITY.md is generated.
**Plans**: 1 plan
Plans:
- [ ] 05-01: GSD security threat audit review

## Progress
| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation Layout | 1/1 | Complete | 2026-07-09 |
| 2. Task Assignment | 1/1 | Complete | 2026-07-09 |
| 3. ID-Search & Lazy Load | 1/1 | Complete | 2026-07-09 |
| 4. Analytics & Comments | 1/1 | Complete | 2026-07-09 |
| 5. GSD Security Audit | 0/1 | Not started | - |
