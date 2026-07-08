import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, InputBase, Badge, Container, IconButton } from '@mui/material';
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
            <IconButton sx={{ p: 0.5, color: '#94a3b8' }}>
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
