import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, InputBase, Badge, Container, IconButton, ToggleButtonGroup, ToggleButton, Menu, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import theme from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeBoard from './pages/EmployeeBoard';
import Footer from './components/Footer';
import { getEmployees } from './services/apiService';

const DRAWER_WIDTH = 240;

const SidebarAndHeaderLayout = ({ children }) => {
  const { user, switchRole, switchUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [switchableUsers, setSwitchableUsers] = useState([]);

  useEffect(() => {
    let active = true;
    const loadUsers = async () => {
      try {
        const res = await getEmployees();
        if (active) {
          const adminUser = { id: 999, name: 'Alice Admin', email: 'admin@company.com', role: 'admin' };
          setSwitchableUsers([adminUser, ...res.data]);
        }
      } catch (err) {
        console.error('Failed to load switchable users', err);
      }
    };
    if (user) {
      loadUsers();
    }
    return () => {
      active = false;
    };
  }, [user]);

  if (!user) return <Box sx={{ width: '100%' }}>{children}</Box>;

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUserSwitch = (selectedUser) => {
    switchUser(selectedUser);
    handleMenuClose();
    const isSelAdmin = selectedUser.name.includes('Admin') || selectedUser.role === 'admin';
    if (isSelAdmin) {
      navigate('/admin/dashboard');
    } else {
      navigate('/employee/board');
    }
  };

  const handleRoleChange = (event, newRole) => {
    if (!newRole) return;
    switchRole(newRole);
    if (newRole === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/employee/board');
    }
  };

  const menuItems = [
    { 
      text: user.role === 'admin' ? 'Tasks (Active)' : 'My Work Board', 
      icon: <PlaylistAddCheckIcon />, 
      path: user.role === 'admin' ? '/admin/dashboard' : '/employee/board' 
    },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0b0f19' }}>
      {/* Left Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            background: '#0b0f19',
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
            background: '#0b0f19',
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
              width: '300px',
              border: '1px solid #1c253d',
            }}
          >
            <SearchIcon sx={{ color: '#475569', mr: 1, fontSize: '1.2rem' }} />
            <InputBase
              placeholder="Search employees, tasks..."
              sx={{ color: '#f8fafc', fontSize: '0.85rem', width: '100%' }}
            />
          </Box>

          {/* Role Switching Control */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
              View as:
            </Typography>
            <ToggleButtonGroup
              value={user.role}
              exclusive
              onChange={handleRoleChange}
              size="small"
              sx={{
                bgcolor: '#0e1424',
                border: '1px solid #1c253d',
                borderRadius: '12px',
                '& .MuiToggleButton-root': {
                  color: '#94a3b8',
                  border: 'none',
                  px: 2.5,
                  py: 0.6,
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    bgcolor: user.role === 'admin' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    color: user.role === 'admin' ? '#10b981' : '#3b82f6',
                    '&:hover': {
                      bgcolor: user.role === 'admin' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                    }
                  }
                }
              }}
            >
              <ToggleButton value="admin">Admin</ToggleButton>
              <ToggleButton value="employee">Employee</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Right Side Tools */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3.5 }}>
            <IconButton sx={{ color: '#94a3b8', p: 0.5 }}>
              <Badge color="error" variant="dot">
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>

            {/* User Profile Info (Clickable for switch profile dropdown) */}
            <Box 
              onClick={handleProfileClick}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5, 
                cursor: 'pointer',
                p: 0.8,
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
              }}
            >
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

            {/* Profile Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  background: '#0e1424',
                  border: '1px solid #1c253d',
                  color: '#f8fafc',
                  mt: 1,
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                  '& .MuiMenuItem-root': {
                    fontSize: '0.85rem',
                    py: 1,
                    px: 2.5,
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.03)',
                    },
                    '&.Mui-selected': {
                      background: user.role === 'admin' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                      color: user.role === 'admin' ? '#10b981' : '#3b82f6',
                      fontWeight: 'bold',
                    }
                  }
                }
              }}
            >
              <Box sx={{ px: 2.5, py: 1, borderBottom: '1px solid #1c253d', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Switch User
                </Typography>
              </Box>
              {switchableUsers.map((u) => {
                const isUserAdmin = u.name.includes('Admin') || u.role === 'admin';
                return (
                  <MenuItem 
                    key={u.id} 
                    onClick={() => handleUserSwitch(u)}
                    selected={u.id === user.id}
                  >
                    {u.name} ({isUserAdmin ? 'Admin' : 'Employee'})
                  </MenuItem>
                );
              })}
            </Menu>
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

// Route redirect based on active user role
const RootRedirect = () => {
  const { user } = useAuth();
  const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/employee/board';
  return <Navigate to={redirectPath} replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <SidebarAndHeaderLayout>
            <Routes>
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
              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </SidebarAndHeaderLayout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
