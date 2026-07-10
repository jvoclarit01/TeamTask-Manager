# Project Naming Conventions & Developer Guidelines

This file serves as the source of truth for code styling, file naming conventions, and architectural boundaries across the frontend and backend of this project.

---

## 1. Naming Conventions

| Type | Convention | Example |
| :--- | :--- | :--- |
| **Laravel Models** | PascalCase Singular | `User.php` |
| **Laravel Controllers** | PascalCase + Controller | `UserController.php` |
| **Laravel API Controllers** | `Api/` folder | `Api/UserController.php` |
| **Laravel Requests** | Action + Model + Request | `StoreUserRequest.php` |
| **Laravel Middleware** | PascalCase | `CheckAdmin.php` |
| **Laravel Policies** | Model + Policy | `UserPolicy.php` |
| **Laravel Jobs** | Verb + Subject | `SendEmailJob.php` |
| **Laravel Events** | Action + Subject | `UserRegistered.php` |
| **Laravel Listeners** | Verb phrase | `SendWelcomeEmail.php` |
| **Database Tables** | plural snake_case | `order_items` |
| **Migrations** | timestamp + snake_case | `create_users_table.php` |
| **Seeders** | PascalCase + Seeder | `UserSeeder.php` |
| **Factories** | Model + Factory | `UserFactory.php` |
| **API Routes** | plural REST endpoints | `/users/{id}` |
| **React Components** | PascalCase | `UserCard.jsx` |
| **React Hooks** | camelCase starting with use | `useAuth.js` |
| **React Pages** | PascalCase | `Dashboard.jsx` |
| **React Services** | camelCase | `userService.js` |
| **React Utils** | camelCase | `formatDate.js` |
| **React Context** | PascalCase + Context | `AuthContext.jsx` |
| **Constants** | UPPER_SNAKE_CASE | `API_BASE_URL` |
| **Folders** | kebab-case or lowercase | `user-management` |

---

## 2. Rule of Thumb Summary

* **Backend Classes**: PascalCase (e.g., `UserService`, `ProcessOrder`)
* **Frontend Components & Pages**: PascalCase (e.g., `UserProfile`, `Dashboard`)
* **Functions & Helpers**: camelCase (e.g., `calculateTotal`, `formatDate`)
* **Database (Tables/Columns/Migrations)**: snake_case (e.g., `created_at`, `order_details`)
* **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_LIMIT`)
* **Directories/Folders**: kebab-case (e.g., `components/ui-elements`, `app/Http/Controllers`)

---

## 3. Active Skill Bindings & Orchestration

To ensure compliance with these conventions, the AI agent is instructed to orchestrate the following skills together:

* **Backend Development (Laravel)**:
  * Combine the structural discipline of the [Lattice Backend Skill](file:///C:/Users/janvi/.gemini/skills/lattice/domains/webdev/skill-backend.md) (thin controllers, fat services, queued side-effects) with the syntax and APIs in the [Laravel Docs Skill](file:///C:/Users/janvi/.gemini/skills/laravel-docs/SKILL.md).
* **Frontend Development (React)**:
  * Combine the UI architectural rules of the [Lattice Frontend Skill](file:///C:/Users/janvi/.gemini/skills/lattice/domains/webdev/skill-frontend.md) (RSC vs. Client Components, state boundaries, form libraries) with the framework-specific guides in the [React Docs Skill](file:///C:/Users/janvi/.gemini/skills/react-docs/SKILL.md).
