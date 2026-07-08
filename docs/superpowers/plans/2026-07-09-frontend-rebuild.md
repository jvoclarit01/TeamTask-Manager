# Frontend Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild a professional, functional Team Task & Workload Manager frontend in React and Material UI (MUI v9) from scratch with an OLED Dark Mode theme and path-based routing.

**Architecture:** A client-side routed Single Page Application (SPA) utilizing `react-router-dom` for views. A custom `AuthContext` will handle the mock login state (persisted in `localStorage`), and a `ProtectedRoute` component will guard pages based on roles. A modular design separates routing, API integration, reusable components, and dashboard pages.

**Tech Stack:** React 19, Vite, Material UI (MUI v9), Emotion, Axios, React Router (v6)

---

## File Structure

The project will be organized inside the `frontend` folder as follows:
*   `src/theme.js` - Custom MUI v9 OLED Dark Mode theme specification.
*   `src/context/AuthContext.jsx` - Manage mock user session state.
*   `src/components/ProtectedRoute.jsx` - Route guards for admin/employee roles.
*   `src/services/apiService.js` - Axios instance and backend API wrapper.
*   `src/components/Navbar.jsx` - Header navbar with logout and user indicators.
*   `src/components/TaskCard.jsx` - Reusable task display card with responsive buttons and tooltips.
*   `src/pages/Login.jsx` - Role selection landing page.
*   `src/pages/AdminDashboard.jsx` - Task assignment form and workload overview.
*   `src/pages/EmployeeBoard.jsx` - Personal Kanban board with status-swapping buttons.
*   `src/App.jsx` - Global routing setup and context providers.

---

### Task 1: Initialize Project & Setup Dependencies

**Files:**
*   Modify: `frontend/package.json`

- [ ] **Step 1: Install packages**

Run this command inside the `frontend` folder to install the required client dependencies:
```bash
npm install react-router-dom@6 axios@1.18.1 @mui/material@9.2.0 @mui/icons-material@9.2.0 @emotion/react@11.14.0 @emotion/styled@11.14.1
```
Expected output: Success message confirming package installations.

- [ ] **Step 2: Commit**
```bash
git add package.json package-lock.json
git commit -m "chore: install routing, mui, and api dependencies"
```

---

### Task 2: Custom Theme & Styles (OLED Dark Mode)

**Files:**
*   Create: `frontend/src/theme.js`
*   Modify: `frontend/src/index.css`

- [ ] **Step 1: Create the MUI Theme configuration**

Create `frontend/src/theme.js` with the premium OLED Dark Mode configuration:
```javascript
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#020617', // Slate 950 (Deep OLED Black)
      paper: '#0f172a',   // Slate 900 (Card background)
    },
    primary: {
      main: '#10b981',    // Emerald Green (Success & Main Action)
    },
    secondary: {
      main: '#3b82f6',    // Vivid Blue (Info & Team assignment)
    },
    warning: {
      main: '#f59e0b',    // Pending indicator
    },
    info: {
      main: '#0ea5e9',       // In Progress indicator
    },
    text: {
      primary: '#f8fafc',  // Slate 50
      secondary: '#94a3b8', // Slate 400
    },
    divider: '#1e293b',    // Slate 800
  },
  typography: {
    fontFamily: '"Inter", "Fira Sans", sans-serif',
    h3: {
      fontFamily: '"Fira Sans", sans-serif',
      fontWeight: 800,
    },
    h5: {
      fontFamily: '"Fira Sans", sans-serif',
      fontWeight: 700,
    },
    h6: {
      fontFamily: '"Fira Sans", sans-serif',
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
          transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: '#334155',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 12px rgba(16, 185, 129, 0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
```

- [ ] **Step 2: Update index.css styles**

Overwrite `frontend/src/index.css` to add the custom gradients and fonts:
```css
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color-scheme: dark;
}

body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: #020617;
  background-image: radial-gradient(ellipse at top, #0f172a, #020617);
  background-attachment: fixed;
  min-height: 100vh;
  color: #f8fafc;
}

#root {
  min-height: 100vh;
  width: 100%;
}
```

- [ ] **Step 3: Commit**
```bash
git add src/theme.js src/index.css
git commit -m "feat: configure design system and index.css with premium oled dark theme"
```

---

### Task 3: AuthContext & Protection Route Guard

**Files:**
*   Create: `frontend/src/context/AuthContext.jsx`
*   Create: `frontend/src/components/ProtectedRoute.jsx`

- [ ] **Step 1: Create AuthContext**

Create `frontend/src/context/AuthContext.jsx` to store current user details (id, name, email, role):
```jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user_session', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

- [ ] **Step 2: Create ProtectedRoute**

Create `frontend/src/components/ProtectedRoute.jsx` to lock access depending on login state and role:
```jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not authorized, redirect employee to board and admin to dashboard
    return user.role === 'admin' 
      ? <Navigate to="/admin/dashboard" replace /> 
      : <Navigate to="/employee/board" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

- [ ] **Step 3: Commit**
```bash
git add src/context/AuthContext.jsx src/components/ProtectedRoute.jsx
git commit -m "feat: add AuthContext and role-based ProtectedRoute guards"
```

---

### Task 4: API Service Setup

**Files:**
*   Create: `frontend/src/services/apiService.js`

- [ ] **Step 1: Create apiService.js**

Create `frontend/src/services/apiService.js` to manage calls using Axios:
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

- [ ] **Step 2: Commit**
```bash
git add src/services/apiService.js
git commit -m "feat: setup Axios backend api service client"
```

---

### Task 5: Portal Login Page Layout

**Files:**
*   Create: `frontend/src/pages/Login.jsx`

- [ ] **Step 1: Create Login Page**

Create `frontend/src/pages/Login.jsx` to let the user select their active persona:
```jsx
import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, Avatar, CircularProgress, Divider } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BadgeIcon from '@mui/icons-material/Badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEmployees } from '../services/apiService';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getEmployees();
        setEmployees(res.data);
      } catch (err) {
        console.error('Failed to load employee list', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleLogin = (userObj, role) => {
    const sessionUser = {
      id: userObj.id,
      name: userObj.name,
      email: userObj.email,
      role: role,
    };
    login(sessionUser);
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/employee/board');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
      <Box sx={{ maxWidth: '600px', width: '100%' }}>
        <Card sx={{ p: 4, textAlign: 'center', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)' }}>
          <CardContent>
            <Typography variant="h3" sx={{ mb: 1, color: '#f8fafc', background: 'linear-gradient(to right, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Workload Hub
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
              Select a profile below to log in
            </Typography>

            {/* Admin Profile Section */}
            <Typography variant="subtitle2" color="primary" sx={{ textAlign: 'left', fontWeight: 'bold', mb: 1.5, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Administration Portal
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleLogin({ id: 999, name: 'Alice Admin', email: 'admin@company.com' }, 'admin')}
              startIcon={<AdminPanelSettingsIcon />}
              sx={{
                py: 2,
                mb: 4,
                borderColor: '#1e293b',
                color: '#f8fafc',
                background: 'rgba(30, 41, 59, 0.3)',
                '&:hover': {
                  borderColor: '#10b981',
                  background: 'rgba(16, 185, 129, 0.05)',
                },
              }}
            >
              Log in as Alice Admin
            </Button>

            <Divider sx={{ mb: 4 }} />

            {/* Employee Profiles Section */}
            <Typography variant="subtitle2" color="secondary" sx={{ textAlign: 'left', fontWeight: 'bold', mb: 1.5, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Employee Portal
            </Typography>

            {loading ? (
              <CircularProgress color="secondary" size={30} />
            ) : employees.length === 0 ? (
              <Typography color="textSecondary">No employees available. Ensure database seed is run.</Typography>
            ) : (
              <Grid container spacing={2}>
                {employees.map((emp) => (
                  <Grid item xs={12} sm={6} key={emp.id}>
                    <Card
                      onClick={() => handleLogin(emp, 'employee')}
                      sx={{
                        cursor: 'pointer',
                        background: 'rgba(30, 41, 59, 0.2)',
                        border: '1px solid #1e293b',
                        '&:hover': {
                          borderColor: '#3b82f6',
                          background: 'rgba(59, 130, 246, 0.05)',
                        },
                      }}
                    >
                      <CardContent sx={{ display: 'flex', alignItems: 'center', py: '16px !important' }}>
                        <Avatar sx={{ bgcolor: '#3b82f6', mr: 2, width: 36, height: 36 }}>
                          {emp.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ textAlign: 'left' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                            {emp.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {emp.email}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Login;
```

- [ ] **Step 2: Commit**
```bash
git add src/pages/Login.jsx
git commit -m "feat: implement portal login user-selection screen"
```

---

### Task 6: Reusable Navbar Layout Component

**Files:**
*   Create: `frontend/src/components/Navbar.jsx`

- [ ] **Step 1: Create Navbar Component**

Create `frontend/src/components/Navbar.jsx` displaying details of the current user:
```jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Chip, Avatar } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BadgeIcon from '@mui/icons-material/Badge';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <AppBar position="sticky" sx={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e293b', boxShadow: 'none' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            fontFamily: '"Fira Sans", sans-serif',
            background: 'linear-gradient(to right, #10b981, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
          }}
        >
          Workload Hub
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Active Role Indicator */}
          <Chip
            size="small"
            icon={user.role === 'admin' ? <AdminPanelSettingsIcon /> : <BadgeIcon />}
            label={user.role === 'admin' ? 'Admin' : 'Employee'}
            color={user.role === 'admin' ? 'primary' : 'secondary'}
            variant="outlined"
            sx={{ fontWeight: 'bold', fontFamily: '"Fira Code", monospace' }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: user.role === 'admin' ? '#10b981' : '#3b82f6', width: 32, height: 32, fontSize: '0.85rem' }}>
              {user.name.charAt(0)}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f8fafc', display: { xs: 'none', sm: 'block' } }}>
              {user.name}
            </Typography>
          </Box>

          <Button
            variant="text"
            color="error"
            size="small"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{ fontSize: '0.85rem', textTransform: 'none', ml: 1 }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
```

- [ ] **Step 2: Commit**
```bash
git add src/components/Navbar.jsx
git commit -m "feat: implement header navbar with logout flow and active role indicator"
```

---

### Task 7: Shared TaskCard Component

**Files:**
*   Create: `frontend/src/components/TaskCard.jsx`

- [ ] **Step 1: Create TaskCard**

Create `frontend/src/components/TaskCard.jsx` to render tasks on both boards:
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
    <Card sx={{ mb: 2.5 }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1.3, color: '#f8fafc' }}>
            {task.title}
          </Typography>
          <Chip
            label={currentStatus.label}
            color={currentStatus.color}
            size="small"
            variant="outlined"
            sx={{ fontFamily: '"Fira Code", monospace', fontWeight: 600, fontSize: '0.7rem' }}
          />
        </Box>

        <Typography variant="body2" sx={{ color: '#94a3b8', minHeight: '38px', mb: 2.5, lineHeight: 1.5 }}>
          {task.description || 'No description provided.'}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Assigned Avatars */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ mr: 1, color: '#64748b', fontWeight: 500 }}>
              Assigned:
            </Typography>
            <AvatarGroup
              max={3}
              sx={{
                '& .MuiAvatar-root': {
                  width: 24,
                  height: 24,
                  fontSize: '0.7rem',
                  border: '2px solid #0f172a',
                  bgcolor: '#3b82f6',
                  fontFamily: '"Fira Code", monospace',
                },
              }}
            >
              {task.users?.map((userObj) => (
                <Tooltip key={userObj.id} title={userObj.name} arrow>
                  <Avatar>{userObj.name.charAt(0)}</Avatar>
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
                  sx={{ py: 0.5, px: 1.5, fontSize: '0.75rem' }}
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
                  sx={{ py: 0.5, px: 1.5, fontSize: '0.75rem' }}
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

- [ ] **Step 2: Commit**
```bash
git add src/components/TaskCard.jsx
git commit -m "feat: implement reusable TaskCard with responsive action triggers"
```

---

### Task 8: Admin Dashboard Layout implementation

**Files:**
*   Create: `frontend/src/pages/AdminDashboard.jsx`

- [ ] **Step 1: Create Admin Dashboard page**

Create `frontend/src/pages/AdminDashboard.jsx` displaying task forms and progress monitoring feeds:
```jsx
import React, { useState, useEffect } from 'react';
import { Box, Grid, TextField, Button, MenuItem, Select, InputLabel, FormControl, OutlinedInput, Checkbox, ListItemText, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getEmployees, getTasks, createTask } from '../services/apiService';
import TaskCard from '../components/TaskCard';

const AdminDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedUserIds, setAssignedUserIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksRes, employeesRes] = await Promise.all([getTasks(), getEmployees()]);
      setTasks(tasksRes.data);
      setEmployees(employeesRes.data);
    } catch (err) {
      console.error('Failed to load Admin workload data', err);
    } finally {
      setLoading(false);
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
      loadData();
    } catch (err) {
      console.error('Failed to assign task', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Task Creation Form Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Assign New Task
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Task Title"
                  variant="outlined"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#334155' },
                      '&:hover fieldset': { borderColor: '#475569' },
                    },
                  }}
                  slotProps={{ inputLabel: { style: { color: '#94a3b8' } } }}
                  required
                />
                <TextField
                  fullWidth
                  label="Task Description"
                  variant="outlined"
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#334155' },
                      '&:hover fieldset': { borderColor: '#475569' },
                    },
                  }}
                  slotProps={{ inputLabel: { style: { color: '#94a3b8' } } }}
                />

                <FormControl fullWidth sx={{ mb: 4 }}>
                  <InputLabel id="assign-employees-label" style={{ color: '#94a3b8' }}>
                    Assign Employees
                  </InputLabel>
                  <Select
                    labelId="assign-employees-label"
                    multiple
                    value={assignedUserIds}
                    onChange={(e) => setAssignedUserIds(e.target.value)}
                    input={
                      <OutlinedInput
                        label="Assign Employees"
                        sx={{
                          '& fieldset': { borderColor: '#334155' },
                          '&:hover fieldset': { borderColor: '#475569' },
                        }}
                      />
                    }
                    renderValue={(selected) =>
                      selected
                        .map((id) => employees.find((emp) => emp.id === id)?.name)
                        .filter(Boolean)
                        .join(', ')
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
                  sx={{ height: '48px' }}
                >
                  Create & Assign Task
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Master Task Dashboard View */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Active Team Tasks
          </Typography>
          {tasks.length === 0 ? (
            <Typography sx={{ color: '#64748b' }}>No tasks assigned yet.</Typography>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} isEmployeeView={false} />
            ))
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
```

- [ ] **Step 2: Commit**
```bash
git add src/pages/AdminDashboard.jsx
git commit -m "feat: implement AdminDashboard page with interactive task creation & listing feed"
```

---

### Task 9: Employee Board Page (Kanban Columns)

**Files:**
*   Create: `frontend/src/pages/EmployeeBoard.jsx`

- [ ] **Step 1: Create Employee Board Page**

Create `frontend/src/pages/EmployeeBoard.jsx` to render the user-scoped Kanban columns:
```jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import { getMyTasks, updateTaskStatus } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';

const EmployeeBoard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadMyTasks();
    }
  }, [user]);

  const loadMyTasks = async () => {
    try {
      const res = await getMyTasks(user.id);
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to load employee tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      loadMyTasks();
    } catch (err) {
      console.error('Failed to transition task status', err);
    }
  };

  const tasksByStatus = {
    pending: tasks.filter((t) => t.status === 'pending'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    completed: tasks.filter((t) => t.status === 'completed'),
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold' }}>
        My Work Board
      </Typography>

      <Grid container spacing={3}>
        {['pending', 'in_progress', 'completed'].map((status) => {
          const title =
            status === 'pending'
              ? 'To Do'
              : status === 'in_progress'
              ? 'In Progress'
              : 'Completed';
          const columnTasks = tasksByStatus[status] || [];

          return (
            <Grid item xs={12} md={4} key={status}>
              <Paper
                sx={{
                  p: 2.5,
                  background: 'rgba(15, 23, 42, 0.45)',
                  border: '1px solid #1e293b',
                  minHeight: '65vh',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 700 }}>
                    {title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: '"Fira Code", monospace',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '12px',
                      background: '#1e293b',
                      color: '#94a3b8',
                      fontWeight: 600,
                    }}
                  >
                    {columnTasks.length}
                  </Typography>
                </Box>

                {columnTasks.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '180px' }}>
                    <Typography variant="body2" sx={{ color: '#475569', fontStyle: 'italic' }}>
                      No tasks assigned
                    </Typography>
                  </Box>
                ) : (
                  columnTasks.map((task) => (
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

- [ ] **Step 2: Commit**
```bash
git add src/pages/EmployeeBoard.jsx
git commit -m "feat: implement EmployeeBoard Kanban view grouped by status columns"
```

---

### Task 10: App Shell Router & Layout Integrations

**Files:**
*   Create: `frontend/src/App.jsx`
*   Create: `frontend/src/main.jsx`

- [ ] **Step 1: Implement App shell with router and layouts**

Overwrite `frontend/src/App.jsx` to coordinate global routes:
```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Container } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeBoard from './pages/EmployeeBoard';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Container maxWidth="lg" sx={{ flexGrow: 1, px: { xs: 2, sm: 3 } }}>
              <Routes>
                {/* Public Route */}
                <Route path="/login" element={<Login />} />

                {/* Admin View */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Employee View */}
                <Route
                  path="/employee/board"
                  element={
                    <ProtectedRoute allowedRoles={['employee']}>
                      <EmployeeBoard />
                    </ProtectedRoute>
                  }
                />

                {/* Default Fallbacks */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Container>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
```

- [ ] **Step 2: Update entry point in main.jsx**

Overwrite `frontend/src/main.jsx` to render the App:
```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 3: Commit**
```bash
git add src/App.jsx src/main.jsx
git commit -m "feat: complete App.jsx shell integration with theme and routing system"
```
