# Step-by-Step Implementation Guide: Team Task & Workload Manager

This guide walks you through building the **Team Task & Workload Manager** MVP from scratch. The project is split into a **Laravel (PHP) Backend** and a **React (JS) Frontend** using **Material UI (MUI)**.

---

## Table of Contents
1. [Prerequisites & System Setup](#prerequisites--system-setup)
2. [Phase 1: Backend Setup (Laravel & Database)](#phase-1-backend-setup-laravel--database)
3. [Phase 2: Database Schema & Eloquent Relationships](#phase-2-database-schema--eloquent-relationships)
4. [Phase 3: Roles & Permissions (Spatie)](#phase-3-roles--permissions-spatie)
5. [Phase 4: API Controllers, Requests & Routes](#phase-4-api-controllers-requests--routes)
6. [Phase 5: Frontend Setup (React & MUI)](#phase-5-frontend-setup-react--mui)
7. [Phase 6: Frontend Pages & Components](#phase-6-frontend-pages--components)
8. [Phase 7: Running & Testing the Application](#phase-7-running--testing-the-application)

---

## Prerequisites & System Setup

Ensure you have the following installed on your local machine:
- **PHP 8.2+** and **Composer**
- **Node.js** (v18+) and **npm**
- **MySQL Server** (or XAMPP / Laragon / LocalWP)

---

## Phase 1: Backend Setup (Laravel & Database)

### 1. Create the Laravel Project
Run this command in your terminal to create a new Laravel project in a folder named `backend`:
```bash
composer create-project laravel/laravel backend
cd backend
```

### 2. Configure Environment Variables
Open the `.env` file in the `backend` folder. By default, Laravel 11/12 uses `sqlite`. You **must** change it to `mysql` and set your database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=team_task_manager
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
```

Create the database in MySQL:
```sql
CREATE DATABASE team_task_manager;
```

### 3. Install API Routing (Required for Laravel 11/12)
By default, Laravel 11 and 12 do not configure API routes out-of-the-box. Run this command inside the `backend/` directory to initialize API support:
```bash
php artisan install:api
```
*(This command creates the `routes/api.php` file, configures Sanctum, and registers the API routing middleware.)*


---

## Phase 2: Database Schema & Eloquent Relationships

We need a Many-to-Many relationship between `users` and `tasks` via a pivot table `task_user`.

### 1. Create the Task Model & Migrations
Create the `Task` model, migration, and factory in one command:
```bash
php artisan make:model Task -m -f
```

Create the migration for the pivot table:
```bash
php artisan make:migration create_task_user_table
```

### 2. Define Migrations

#### `database/migrations/xxxx_xx_xx_xxxxxx_create_tasks_table.php`
Open the tasks migration and add the `title`, `description`, and `status` fields:
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            // Statuses: pending, in_progress, completed
            $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
```

#### `database/migrations/xxxx_xx_xx_xxxxxx_create_task_user_table.php`
Open the pivot table migration and define the foreign keys:
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('task_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_user');
    }
};
```

### 3. Define Models & Relationships (Many-to-Many)

#### `app/Models/User.php`
Add the `tasks()` relationship to your User model:
```php
public function tasks()
{
    return $this->belongsToMany(Task::class, 'task_user');
}
```

#### `app/Models/Task.php`
Add fillable columns and the `users()` relationship to the Task model:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'status',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'task_user');
    }
}
```

---

## Phase 3: Roles & Permissions (Spatie)

We use the popular Spatie Laravel Permission package to assign `admin` and `employee` roles.

### 1. Install Spatie Laravel Permission
Run the following commands inside the `backend/` directory:
```bash
composer require spatie/laravel-permission
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan optimize:clear
```

### 2. Configure the User Model
Add the `HasRoles` trait to `app/Models/User.php`:
```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles; // <-- Import Trait

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles; // <-- Add Trait Here
    
    // ...
}
```

### 3. Set Up the Database Seeder
Create default roles (`admin`, `employee`) and seed some test users.

Open `database/seeders/DatabaseSeeder.php` and replace its content:
```php
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Roles
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $employeeRole = Role::firstOrCreate(['name' => 'employee', 'guard_name' => 'web']);

        // 2. Create Admin Users
        $admin = User::firstOrCreate([
            'email' => 'admin@company.com',
        ], [
            'name' => 'Alice Admin',
            'password' => bcrypt('password123'),
        ]);
        $admin->assignRole($adminRole);

        // 3. Create Employee Users
        $employee1 = User::firstOrCreate([
            'email' => 'bob@company.com',
        ], [
            'name' => 'Bob Employee',
            'password' => bcrypt('password123'),
        ]);
        $employee1->assignRole($employeeRole);

        $employee2 = User::firstOrCreate([
            'email' => 'charlie@company.com',
        ], [
            'name' => 'Charlie Employee',
            'password' => bcrypt('password123'),
        ]);
        $employee2->assignRole($employeeRole);

        $employee3 = User::firstOrCreate([
            'email' => 'diana@company.com',
        ], [
            'name' => 'Diana Employee',
            'password' => bcrypt('password123'),
        ]);
        $employee3->assignRole($employeeRole);
    }
}
```

Run migrations and seed the database:
```bash
php artisan migrate --seed
```

---

## Phase 4: API Controllers, Requests & Routes

We will create our API controllers inside the `Api/` folder following the project's naming conventions.

### 1. Create Requests for Validation
```bash
php artisan make:request Api/StoreTaskRequest
php artisan make:request Api/UpdateTaskStatusRequest
```

#### `app/Http/Requests/Api/StoreTaskRequest.php`
```php
<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Simple auth check for MVP
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ];
    }
}
```

#### `app/Http/Requests/Api/UpdateTaskStatusRequest.php`
```php
<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'status' => 'required|string|in:pending,in_progress,completed',
        ];
    }
}
```

### 2. Create Controllers

```bash
php artisan make:controller Api/UserController
php artisan make:controller Api/TaskController
```

#### `app/Http/Controllers/Api/UserController.php`
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        // Fetch only users with role "employee"
        $employees = User::role('employee')->get(['id', 'name', 'email']);
        return response()->json($employees);
    }
}
```

#### `app/Http/Controllers/Api/TaskController.php`
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreTaskRequest;
use App\Http\Requests\Api\UpdateTaskStatusRequest;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{
    // Retrieve all tasks with assigned employees (for Admin Dashboard)
    public function index(): JsonResponse
    {
        $tasks = Task::with('users:id,name')->latest()->get();
        return response()->json($tasks);
    }

    // Create a new task and sync with user IDs
    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = Task::create([
            'title' => $request->title,
            'description' => $request->description,
            'status' => 'pending',
        ]);

        // Sync pivot table: task_user
        $task->users()->sync($request->user_ids);

        return response()->json($task->load('users:id,name'), 201);
    }

    // Fetch tasks assigned to a specific user (for Employee View)
    public function getMyTasks($userId): JsonResponse
    {
        $user = User::findOrFail($userId);
        $tasks = $user->tasks()->with('users:id,name')->latest()->get();
        
        return response()->json($tasks);
    }

    // Update status of a task
    public function updateStatus(UpdateTaskStatusRequest $request, $id): JsonResponse
    {
        $task = Task::findOrFail($id);
        $task->update([
            'status' => $request->status,
        ]);

        return response()->json([
            'message' => 'Task status updated successfully',
            'task' => $task->load('users:id,name')
        ]);
    }
}
```

### 3. Register API Routes
Open `routes/api.php` and define the endpoints:
```php
<?php

use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

// Employee list (For the assignment dropdown)
Route::get('/users', [UserController::class, 'index']);

// Create & List all tasks (Admin)
Route::get('/tasks', [TaskController::class, 'index']);
Route::post('/tasks', [TaskController::class, 'store']);

// Tasks assigned to a specific user (Employee)
Route::get('/my-tasks/{userId}', [TaskController::class, 'getMyTasks']);

// Update task status (Employee)
Route::patch('/tasks/{id}/status', [TaskController::class, 'updateStatus']);
```

---

## Phase 5: Frontend Setup (React & MUI)

We will use Vite to initialize the React application next to the backend folder.

### 1. Initialize the React App
In the parent directory (outside of `backend`), run:
```bash
npx -y create-vite@latest frontend --template react
cd frontend
```

### 2. Install Material UI (MUI) & Axios
Install MUI, emotion components, icons, and Axios:
```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material axios
```

### 3. Set Up API Services
Create `src/services/apiService.js` to manage all backend HTTP requests:
```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getEmployees = () => api.get('/users');
export const getTasks = () => api.get('/tasks');
export const createTask = (taskData) => api.post('/tasks', taskData);
export const getMyTasks = (userId) => api.get(`/my-tasks/${userId}`);
export const updateTaskStatus = (taskId, status) => api.patch(`/tasks/${taskId}/status`, { status });

export default api;
```

---

## Phase 6: Frontend Pages & Components

We'll build a neat, fully responsive UI following premium visual standards with a Dark Mode feel.

### 1. Task Card Component (`src/components/TaskCard.jsx`)
```jsx
import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, AvatarGroup, Avatar, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const statusColors = {
  pending: { label: 'Pending', color: 'warning' },
  in_progress: { label: 'In Progress', color: 'info' },
  completed: { label: 'Completed', color: 'success' },
};

const TaskCard = ({ task, isEmployeeView, onStatusChange }) => {
  const currentStatus = statusColors[task.status] || { label: task.status, color: 'default' };

  return (
    <Card sx={{ mb: 2, background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" fontWeight="bold">
            {task.title}
          </Typography>
          <Chip label={currentStatus.label} color={currentStatus.color} size="small" variant="outlined" />
        </Box>
        <Typography variant="body2" sx={{ color: '#aaa', mb: 2 }}>
          {task.description || 'No description provided.'}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          {/* Assigned Employees */}
          <Box display="flex" alignItems="center">
            <Typography variant="caption" sx={{ mr: 1, color: '#888' }}>
              Assigned:
            </Typography>
            <AvatarGroup max={4}>
              {task.users?.map((user) => (
                <Tooltip key={user.id} title={user.name}>
                  <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem', bgcolor: '#3f51b5' }}>
                    {user.name.charAt(0)}
                  </Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
          </Box>

          {/* Action Buttons for Employees */}
          {isEmployeeView && task.status !== 'completed' && (
            <Box>
              {task.status === 'pending' && (
                <Button
                  variant="contained"
                  color="info"
                  size="small"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => onStatusChange(task.id, 'in_progress')}
                >
                  Start
                </Button>
              )}
              {task.status === 'in_progress' && (
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => onStatusChange(task.id, 'completed')}
                >
                  Complete
                </Button>
              )}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
```

### 2. Admin Dashboard Component (`src/pages/AdminDashboard.jsx`)
```jsx
import React, { useState, useEffect } from 'react';
import { Box, Grid, TextField, Button, MenuItem, Select, InputLabel, FormControl, OutlinedInput, Checkbox, ListItemText, Typography, Card, CardContent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getEmployees, getTasks, createTask } from '../services/apiService';
import TaskCard from '../components/TaskCard';

const AdminDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedUserIds, setAssignedUserIds] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksRes, employeesRes] = await Promise.all([getTasks(), getEmployees()]);
      setTasks(tasksRes.data);
      setEmployees(employeesRes.data);
    } catch (err) {
      console.error("Error fetching admin dashboard data", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || assignedUserIds.length === 0) return;

    try {
      await createTask({
        title,
        description,
        user_ids: assignedUserIds,
      });
      setTitle('');
      setDescription('');
      setAssignedUserIds([]);
      loadData(); // Reload tasks immediately to update UI state
    } catch (err) {
      console.error("Error creating task", err);
    }
  };

  return (
    <Grid container spacing={4}>
      {/* Create Task Form */}
      <Grid item xs={12} md={4}>
        <Card sx={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent>
            <Typography variant="h5" mb={3} fontWeight="bold">Create New Task</Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Task Title"
                variant="outlined"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: '#555' } } }}
                InputLabelProps={{ style: { color: '#aaa' } }}
                required
              />
              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: '#555' } } }}
                InputLabelProps={{ style: { color: '#aaa' } }}
              />
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="assign-employees-label" style={{ color: '#aaa' }}>Assign Employees</InputLabel>
                <Select
                  labelId="assign-employees-label"
                  multiple
                  value={assignedUserIds}
                  onChange={(e) => setAssignedUserIds(e.target.value)}
                  input={<OutlinedInput label="Assign Employees" sx={{ color: '#fff', '& fieldset': { borderColor: '#555' } }} />}
                  renderValue={(selected) => 
                    selected.map(id => employees.find(emp => emp.id === id)?.name).join(', ')
                  }
                >
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      <Checkbox checked={assignedUserIds.indexOf(employee.id) > -1} />
                      <ListItemText primary={employee.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
                startIcon={<AddIcon />}
                size="large"
              >
                Assign Task
              </Button>
            </form>
          </CardContent>
        </Card>
      </Grid>

      {/* Task List Dashboard */}
      <Grid item xs={12} md={8}>
        <Typography variant="h5" mb={3} fontWeight="bold" sx={{ color: '#fff' }}>All Team Tasks</Typography>
        {tasks.length === 0 ? (
          <Typography color="#888">No tasks created yet.</Typography>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} isEmployeeView={false} />
          ))
        )}
      </Grid>
    </Grid>
  );
};

export default AdminDashboard;
```

### 3. Employee Board Component (`src/pages/EmployeeBoard.jsx`)
```jsx
import React, { useState, useEffect } from 'react';
import { Box, MenuItem, Select, InputLabel, FormControl, Typography, Grid, Paper } from '@mui/material';
import { getEmployees, getMyTasks, updateTaskStatus } from '../services/apiService';
import TaskCard from '../components/TaskCard';

const EmployeeBoard = () => {
  const [employees, setEmployees] = useState([]);
  const [currentEmployeeId, setCurrentEmployeeId] = useState('');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (currentEmployeeId) {
      loadMyTasks();
    } else {
      setTasks([]);
    }
  }, [currentEmployeeId]);

  const loadEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data);
      if (res.data.length > 0) {
        setCurrentEmployeeId(res.data[0].id); // Default to first employee
      }
    } catch (err) {
      console.error("Error loading employees", err);
    }
  };

  const loadMyTasks = async () => {
    try {
      const res = await getMyTasks(currentEmployeeId);
      setTasks(res.data);
    } catch (err) {
      console.error("Error loading tasks for employee", err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      loadMyTasks(); // Reload immediately so state updates
    } catch (err) {
      console.error("Error updating task status", err);
    }
  };

  // Group tasks by status
  const tasksByStatus = {
    pending: tasks.filter(t => t.status === 'pending'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed'),
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#fff' }}>My Work Board</Typography>
        
        {/* Simulate logging in as a specific employee */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="active-employee-label" style={{ color: '#aaa' }}>Logged in as:</InputLabel>
          <Select
            labelId="active-employee-label"
            value={currentEmployeeId}
            label="Logged in as"
            onChange={(e) => setCurrentEmployeeId(e.target.value)}
            sx={{ color: '#fff', '& fieldset': { borderColor: '#555' } }}
          >
            {employees.map((emp) => (
              <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Kanban Column View */}
      <Grid container spacing={3}>
        {['pending', 'in_progress', 'completed'].map((status) => {
          const title = status === 'pending' ? 'To Do' : status === 'in_progress' ? 'In Progress' : 'Completed';
          const currentTasks = tasksByStatus[status] || [];
          return (
            <Grid item xs={12} md={4} key={status}>
              <Paper sx={{ p: 2, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', minHeight: '60vh', borderRadius: '12px' }}>
                <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{title}</span>
                  <Typography component="span" color="#888">({currentTasks.length})</Typography>
                </Typography>

                {currentTasks.length === 0 ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height="150px">
                    <Typography color="#555" variant="body2">No tasks</Typography>
                  </Box>
                ) : (
                  currentTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isEmployeeView={true}
                      onStatusChange={handleStatusChange}
                    />
                  ))
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default EmployeeBoard;
```

### 4. Main App Entry (`src/App.jsx`)
Combine components with a view mode switcher (`Admin` vs `Employee`).
```jsx
import React, { useState } from 'react';
import { Container, Box, ToggleButtonGroup, ToggleButton, Typography, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BadgeIcon from '@mui/icons-material/Badge';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeBoard from './pages/EmployeeBoard';

// Premium Sleek Dark Mode Theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0f172a', // Slate 900
      paper: '#1e293b', // Slate 800
    },
    primary: {
      main: '#6366f1', // Indigo 500
    },
    secondary: {
      main: '#ec4899', // Pink 500
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", sans-serif',
  },
});

function App() {
  const [viewMode, setViewMode] = useState('admin');

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top, #1e1b4b, #0f172a)', py: 4 }}>
        <Container maxWidth="lg">
          {/* Header & Switcher */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={6}>
            <Typography variant="h3" fontWeight="900" sx={{ mb: 1, background: 'linear-gradient(to right, #818cf8, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center' }}>
              HRMS Workload Hub
            </Typography>
            <Typography variant="subtitle1" color="#8892b0" mb={3} textAlign="center">
              Task Delegation & Progress Tracker
            </Typography>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewChange}
              color="primary"
              sx={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', '& .MuiToggleButton-root': { border: 'none', color: '#aaa', px: 3 } }}
            >
              <ToggleButton value="admin" startIcon={<AdminPanelSettingsIcon />}>
                <AdminPanelSettingsIcon sx={{ mr: 1 }} /> Admin View
              </ToggleButton>
              <ToggleButton value="employee" startIcon={<BadgeIcon />}>
                <BadgeIcon sx={{ mr: 1 }} /> Employee View
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Render Active View */}
          {viewMode === 'admin' ? <AdminDashboard /> : <EmployeeBoard />}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
```

---

## Phase 7: Running & Testing the Application

### 1. Launch the Backend API
Run this command from the `backend/` directory:
```bash
php artisan serve
```
By default, the server will boot up at `http://localhost:8000`.

### 2. Configure React CORS (Optional but highly recommended)
To make API calls from `localhost:5173` (Vite) to `localhost:8000` (Laravel) without cors blockage:
Ensure CORS is correctly configured in your backend. In Laravel 11, CORS config is automatic, but if needed check your `config/cors.php` or make sure headers allow requests from `http://localhost:5173`.

### 3. Launch the Frontend
Run this command from the `frontend/` directory:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Summary of Completed Technical Specs

- **Pivot Table Relationships**: Successfully handled via the `belongsToMany` Eloquent connection on both `User` and `Task` models.
- **Spatie Roles**: Seeded admin and employee roles during migration, assignable to database records.
- **Dynamic Updates**: Axios calls inside React fetch updated items instantly, reflecting UI changes on tasks assignment or completion state changes.
