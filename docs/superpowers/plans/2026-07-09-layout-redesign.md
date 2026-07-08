# Synergy HRMS Layout Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the React frontend layout to match the "Synergy HRMS" dashboard layout from the screenshot.

**Architecture:** Left sidebar navigation, top header bar with search and profile, and a split task dashboard layout.

**Tech Stack:** React 19, Material UI (MUI v9), CSS

---

## File Structure

The redesign will modify:
*   `frontend/src/App.jsx` - Rebuild the main layout shell to render the Left Sidebar, Top Header, and Main Content area.
*   `frontend/src/components/Navbar.jsx` - Remove the old navbar (since the new top header and sidebar will replace it).
*   `frontend/src/components/TaskCard.jsx` - Restyle the task cards to show title on left, status on right, description, avatars with names underneath, and deadline on the right.
*   `frontend/src/pages/AdminDashboard.jsx` - Restyle the Create Task card, adjust titles, date display, and grid layout.
*   `frontend/src/pages/EmployeeBoard.jsx` - Align layout padding and headings with the new dashboard shell.

---

### Task 1: Main Layout Shell & Navigation (Sidebar + Header)

**Files:**
*   Modify: `frontend/src/App.jsx`
*   Delete: `frontend/src/components/Navbar.jsx` (will be replaced by sidebar/header)

- [x] **Step 1: Rebuild App.jsx layout shell**

Update `frontend/src/App.jsx` to introduce the left sidebar drawer and top header bar.
Configure navigation highlights and user state integration.
```jsx
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, InputBase, Badge, Container } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import WorkIcon from '@mui/icons-material/Work';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import theme from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeBoard from './pages/EmployeeBoard';
import Footer from './components/Footer';

const DRAWER_WIDTH = 240;

const SidebarAndHeaderLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return <Box sx={{ width: '100%' }}>{children}</Box>;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard-placeholder' },
    { text: 'Employees', icon: <PeopleIcon />, path: '/employees-placeholder' },
    { text: 'Performance', icon: <AssessmentIcon />, path: '/performance-placeholder' },
    { text: 'Attendance', icon: <CalendarMonthIcon />, path: '/attendance-placeholder' },
    { text: 'Recruitment', icon: <WorkIcon />, path: '/recruitment-placeholder' },
    { 
      text: user.role === 'admin' ? 'Tasks (Active)' : 'My Work Board', 
      icon: <PlaylistAddCheckIcon />, 
      path: user.role === 'admin' ? '/admin/dashboard' : '/employee/board' 
    },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#090d16' }}>
      {/* Left Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            background: '#090d16',
            borderRight: '1px solid #141b2d',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            py: 3,
            px: 2,
          },
        }}
      >
        <Box>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4, px: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#fff',
                fontSize: '0.9rem',
              }}
            >
              S
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: '"Outfit", sans-serif', color: '#10b981', letterSpacing: '0.5px', fontSize: '1.05rem' }}>
              SYNERGY <span style={{ color: '#94a3b8', fontWeight: 500 }}>HRMS</span>
            </Typography>
          </Box>

          {/* Navigation Links */}
          <List sx={{ px: 0 }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    sx={{
                      borderRadius: '8px',
                      py: 1,
                      px: 1.5,
                      background: isActive ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                      border: isActive ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid transparent',
                      color: isActive ? '#10b981' : '#94a3b8',
                      '&:hover': {
                        background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                        color: isActive ? '#10b981' : '#f8fafc',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: isActive ? 600 : 500 }} 
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* Bottom Actions */}
        <Box>
          <List sx={{ px: 0, pb: 0 }}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                sx={{
                  borderRadius: '8px',
                  py: 1,
                  px: 1.5,
                  color: '#94a3b8',
                  '&:hover': { color: '#f8fafc', background: 'rgba(255, 255, 255, 0.03)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="settings" primaryTypographyProps={{ fontSize: '0.85rem' }} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  borderRadius: '8px',
                  py: 1,
                  px: 1.5,
                  color: '#ef4444',
                  '&:hover': { background: 'rgba(239, 68, 68, 0.05)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.85rem' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: `calc(100% - ${DRAWER_WIDTH}px)` }}>
        {/* Top Header */}
        <Box
          sx={{
            height: 70,
            borderBottom: '1px solid #141b2d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 4,
            background: '#090d16',
          }}
        >
          {/* Search Box */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              background: '#0e1424',
              borderRadius: '20px',
              px: 2,
              py: 0.5,
              width: '320px',
              border: '1px solid #1c253d',
            }}
          >
            <SearchIcon sx={{ color: '#475569', mr: 1, fontSize: '1.2rem' }} />
            <InputBase
              placeholder="Search employees, tasks..."
              sx={{ color: '#f8fafc', fontSize: '0.85rem', width: '100%' }}
            />
          </Box>

          {/* Right Side Tools */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3.5 }}>
            <IconButton sx={{ color: '#94a3b8', p: 0.5 }}>
              <Badge color="error" variant="dot">
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>

            {/* User Profile Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f8fafc', fontSize: '0.85rem' }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#475569', display: 'block', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                  {user.role === 'admin' ? 'Admin' : 'Employee'}
                </Typography>
              </Box>
              <Avatar
                sx={{
                  bgcolor: user.role === 'admin' ? '#10b981' : '#3b82f6',
                  width: 36,
                  height: 36,
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                }}
              >
                {user.name.charAt(0)}
              </Avatar>
            </Box>
          </Box>
        </Box>

        {/* Content Box */}
        <Container maxWidth="xl" sx={{ flexGrow: 1, px: 4, py: 4 }}>
          {children}
        </Container>
        <Footer />
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <SidebarAndHeaderLayout>
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
          </SidebarAndHeaderLayout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
```

- [x] **Step 2: Remove old Navbar.jsx**

Remove the now-unused file `frontend/src/components/Navbar.jsx`.

---

### Task 2: TaskCard Restyling

**Files:**
*   Modify: `frontend/src/components/TaskCard.jsx`

- [x] **Step 1: Re-implement TaskCard based on screenshot styling**

Modify `frontend/src/components/TaskCard.jsx` to render:
- Rounded status badge on right (In Progress, Completed, Pending).
- Assigned employees showing avatars with names underneath.
- Mock deadline date on the right.
```jsx
import { Card, CardContent, Typography, Box, Chip, Avatar, Tooltip } from '@mui/material';

const statusColors = {
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  in_progress: { label: 'In Progress', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  completed: { label: 'Completed', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
};

const TaskCard = ({ task }) => {
  const currentStatus = statusColors[task.status] || { label: task.status, color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' };

  // Calculate mock deadline based on created date + 7 days
  const createdDate = task.created_at ? new Date(task.created_at) : new Date();
  const deadlineDate = new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Card 
      sx={{ 
        mb: 2, 
        background: '#0e1424', 
        border: '1px solid #1c253d',
        borderRadius: '12px',
        boxShadow: 'none',
        '&:hover': {
          borderColor: 'rgba(59, 130, 246, 0.3)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        {/* Top Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#f8fafc' }}>
            {task.title}
          </Typography>
          <Chip
            label={currentStatus.label}
            size="small"
            sx={{
              bgcolor: currentStatus.bg,
              color: currentStatus.color,
              fontWeight: 600,
              fontSize: '0.75rem',
              borderRadius: '20px',
              border: 'none',
              px: 1
            }}
          />
        </Box>

        {/* Description */}
        <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3, lineHeight: 1.6, fontSize: '0.85rem' }}>
          {task.description || 'No description provided.'}
        </Typography>

        {/* Footer Area */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {/* Assigned Avatars List */}
          <Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {task.users?.map((userObj) => (
                <Box key={userObj.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 48 }}>
                  <Avatar 
                    sx={{ 
                      width: 28, 
                      height: 28, 
                      bgcolor: '#3b82f6', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold',
                      mb: 0.5 
                    }}
                  >
                    {userObj.name.charAt(0)}
                  </Avatar>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {userObj.name.split(' ')[0]}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Deadline */}
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 0.5, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Deadline
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.8rem' }}>
              {formattedDeadline}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
```

---

### Task 3: AdminDashboard Restyling

**Files:**
*   Modify: `frontend/src/pages/AdminDashboard.jsx`

- [x] **Step 1: Re-implement AdminDashboard.jsx**

Update `frontend/src/pages/AdminDashboard.jsx` to render the Task Management Dashboard with date display, create card, and tasks feed aligning with the screenshot design.
```jsx
import { useState, useEffect } from 'react';
import { Box, Grid, TextField, Button, MenuItem, Select, InputLabel, FormControl, OutlinedInput, Checkbox, ListItemText, Typography, Card, CardContent, CircularProgress, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FilterListIcon from '@mui/icons-material/FilterList';
import { getEmployees, getTasks, createTask } from '../services/apiService';
import TaskCard from '../components/TaskCard';

const AdminDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedUserIds, setAssignedUserIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const [tasksRes, employeesRes] = await Promise.all([getTasks(), getEmployees()]);
        if (active) {
          setTasks(tasksRes.data);
          setEmployees(employeesRes.data);
        }
      } catch (err) {
        console.error('Failed to load Admin workload data', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => {
      active = false;
    };
  }, [refreshKey]);

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
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to assign task', err);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setAssignedUserIds([]);
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 1 }}>
      {/* Title Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc' }}>
          Task Management Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#94a3b8' }}>
          <CalendarMonthIcon fontSize="small" />
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
            {formattedDate}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* CREATE NEW TASK Panel (4 columns) */}
        <Grid item xs={12} md={4.2}>
          <Card sx={{ background: '#0e1424', border: '1px solid #1c253d', borderRadius: '12px' }}>
            <CardContent sx={{ p: 3.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3.5, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                Create New Task
              </Typography>
              <form onSubmit={handleSubmit}>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1, fontWeight: 600 }}>
                  Title
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Task title..."
                  variant="outlined"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      background: '#090d16',
                      '& fieldset': { borderColor: '#1c253d' },
                      '&:hover fieldset': { borderColor: '#2e3b5e' },
                    },
                    '& input': { py: 1.5, fontSize: '0.85rem', color: '#f8fafc' }
                  }}
                  required
                />

                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1, fontWeight: 600 }}>
                  Description
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Task description details..."
                  variant="outlined"
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      background: '#090d16',
                      '& fieldset': { borderColor: '#1c253d' },
                      '&:hover fieldset': { borderColor: '#2e3b5e' },
                    },
                    '& textarea': { fontSize: '0.85rem', color: '#f8fafc' }
                  }}
                />

                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1, fontWeight: 600 }}>
                  Assign Employees
                </Typography>
                <FormControl fullWidth sx={{ mb: 4.5 }}>
                  <Select
                    multiple
                    displayEmpty
                    value={assignedUserIds}
                    onChange={(e) => setAssignedUserIds(e.target.value)}
                    input={
                      <OutlinedInput
                        sx={{
                          background: '#090d16',
                          '& fieldset': { borderColor: '#1c253d' },
                          '&:hover fieldset': { borderColor: '#2e3b5e' },
                          '& .MuiSelect-select': { py: 1.5, fontSize: '0.85rem', color: '#f8fafc' }
                        }}
                      />
                    }
                    renderValue={(selected) => {
                      if (selected.length === 0) {
                        return <span style={{ color: '#475569' }}>[Search/Select Employees...]</span>;
                      }
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((id) => {
                            const emp = employees.find((e) => e.id === id);
                            return emp ? (
                              <Chip
                                key={id}
                                label={emp.name}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(16, 185, 129, 0.1)',
                                  color: '#10b981',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  height: '22px'
                                }}
                              />
                            ) : null;
                          })}
                        </Box>
                      );
                    }}
                  >
                    {employees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id} sx={{ py: 0.5 }}>
                        <Checkbox checked={assignedUserIds.indexOf(employee.id) > -1} size="small" />
                        <ListItemText primary={employee.name} primaryTypographyProps={{ fontSize: '0.85rem' }} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Bottom Actions */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{
                      height: '42px',
                      color: '#94a3b8',
                      borderColor: '#1c253d',
                      '&:hover': { borderColor: '#2e3b5e', background: 'rgba(255, 255, 255, 0.02)' }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    sx={{
                      height: '42px',
                      bgcolor: '#10b981',
                      color: '#090d16',
                      fontWeight: 'bold',
                      '&:hover': { bgcolor: '#059669' }
                    }}
                  >
                    Create Task
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* TEAM TASK CARDS Panel (7.8 columns) */}
        <Grid item xs={12} md={7.8}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                Team Task Cards
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                Active Team Tasks ({tasks.length})
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94a3b8', cursor: 'pointer', '&:hover': { color: '#f8fafc' } }}>
              <FilterListIcon fontSize="small" />
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                Filter & Sort
              </Typography>
            </Box>
          </Box>

          {tasks.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              py: 12, 
              border: '1px dashed #1c253d', 
              borderRadius: '12px',
              background: 'rgba(14, 20, 36, 0.4)'
            }}>
              <Typography variant="h6" sx={{ color: '#94a3b8', mb: 1, fontWeight: 'bold', fontSize: '1rem' }}>
                All Clear!
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}>
                No tasks created yet. Use the panel on the left to assign one.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
```
