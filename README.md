# Synergy HRMS: Team Task & Workload Manager

Synergy HRMS is a modern, premium Team Task and Workload Management application designed to help managers distribute, schedule, and monitor work across multiple team members while giving employees a clean, focused Kanban board to track their active assignments.

---

## 🚀 Key Features

* **Role-Based Access Control (RBAC):** Dedicated dashboards for **Admins** (create, edit, delete, and assign tasks) and **Employees** (view workload, update task status, and post comments).
* **Many-to-Many Assignments:** Distribute a single task to multiple team members concurrently using database pivot structures.
* **Threaded Team Collaboration:** Write comments and track discussion timelines directly inside the slide-out Task Details Drawer.
* **Workload Metrics & Analytics:** Interactive dashboards displaying active task loads, completion rates, and workload category metrics.
* **Sub-Second Switching Performance:** Features a client-side key-value token cache mapping (`user_tokens` in `localStorage`) to bypass bcrypt hashing overhead on user toggles.
* **Secured Backend Boundaries:** Full route protection via Laravel Sanctum token validation, Spatie role verification, and server-side resolved identifiers to block Broken Object Level Authorization (BOLA).

---

## 🛠️ Technology Stack

### Backend
* **Core:** Laravel 13.x (Clean MVC structure enforcing [gemini.md](file:///D:/TeamTask/gemini.md) guidelines)
* **Architecture:** Form Request validation layers (Fast-Fail validation early abort) keeping controllers thin
* **Authentication:** Laravel Sanctum (Token-based)
* **Access Control:** Spatie Laravel-Permission (Role boundaries)
* **Database:** MySQL / SQLite (Transactional integrity)

### Frontend
* **Core:** React 18 (Vite template, dynamic lazy-loading)
* **State Management:** Context API with SWR caching, session memory mapping, and `cachedUserId` session boundary guards
* **Styling:** Material UI (MUI), TailwindCSS & Custom Glassmorphic CSS variables
* **API Client:** Axios (Custom header token injects)

---

## 📊 Database Schema (ERD)

The system utilizes four core relational entities:

```
+------------+         +-------------------+         +------------+
|   users    |1-------*|     comments      |*-------1|   tasks    |
| (profiles) |         | (discussion log)  |         | (work item)|
+------------+         +-------------------+         +------------+
      1                                                    1
      |                                                    |
      *                                                    *
+-----------------------------------------------------------------+
|                            task_user                            |
|             (Many-to-Many Pivot Junction Table)                 |
+-----------------------------------------------------------------+
```

An interactive visual layout of the ERD can be viewed locally by opening [task_management_erd.html](task_management_erd.html) in your browser.

---

## ⚙️ Installation & Setup

### Prerequisites
* **PHP:** `^8.2`
* **Composer:** `^2.x`
* **Node.js:** `^18.x` / `^20.x`
* **npm:** `^10.x`

### 1. Backend Setup
Navigate into the backend directory and configure the environment:
```bash
cd backend
composer install
copy .env.example .env
```
Generate the application key and initialize the database (SQLite default):
```bash
php artisan key:generate
php artisan migrate --seed
```
*Note: The database seeder will create mock profiles including an Admin (`admin@company.com`) and Employees (`bob@company.com`, `charlie@company.com`, `diana@company.com`) with the default password `password123`.*

Start the backend server:
```bash
php artisan serve --port=8000
```

### 2. Frontend Setup
Navigate into the frontend directory, install dependencies, and launch Vite:
```bash
cd ../frontend
npm install
npm run dev
```
Open your browser to `http://localhost:5173` to access the application.

---

## 🧪 Running Security Tests

We have developed a comprehensive PHPUnit feature security integration suite to audit access rules and prevent BOLA/impersonation:
```bash
cd backend
php artisan test
```
The test suite validates:
* Role-based creation restrictions (Employees cannot write tasks).
* Task ownership scoping (Employees cannot view other users' individual task endpoints).
* Server-side user verification (Preventing comment author ID spoofing).
