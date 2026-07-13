import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, InputBase, Badge, Container, IconButton, ToggleButtonGroup, ToggleButton, Menu, MenuItem, Popover, Button, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MenuIcon from '@mui/icons-material/Menu';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import theme from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import { getEmployees } from './services/apiService';

import WelcomeOverlay from './components/WelcomeOverlay';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const EmployeeBoard = lazy(() => import('./pages/EmployeeBoard'));

const DRAWER_WIDTH = 240;

const SidebarAndHeaderLayout = ({ children }) => {
  const { user, switchUser, searchQuery, setSearchQuery, notifications, markAllNotificationsAsRead } = useAuth();
  const { switchRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [switchableUsers, setSwitchableUsers] = useState([]);
  const [showWelcome, setShowWelcome] = useState(Boolean(user));

  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const loadUsers = async () => {
      try {
        const res = await getEmployees();
        if (active) {
          setSwitchableUsers(res.data);
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

  const handleNotifClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

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
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#090d16' }}>
      {showWelcome && (
        <WelcomeOverlay user={user} onClose={() => setShowWelcome(false)} />
      )}
      {/* Left Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileDrawerOpen : true}
        onClose={isMobile ? () => setMobileDrawerOpen(false) : undefined}
        sx={{
          width: { xs: 'auto', md: DRAWER_WIDTH },
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: { xs: 280, md: DRAWER_WIDTH },
            boxSizing: 'border-box',
            background: 'linear-gradient(to bottom, rgba(9, 13, 22, 0.95), rgba(9, 13, 22, 0.98)), url("/src/assets/brand_bg.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'left center',
            borderRight: '1px solid #141b2d',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            py: { xs: 1.5, md: 3 },
            px: { xs: 1.5, md: 2 },
          },
        }}
        ModalProps={{ keepMounted: true }}
      >
        <Box>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: { xs: 2, md: 4 }, px: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: '"Outfit", sans-serif', color: '#10b981', letterSpacing: '0.5px', fontSize: '1.05rem' }}>
                SYNERGY <span style={{ color: '#94a3b8', fontWeight: 500 }}>HRMS</span>
              </Typography>
            </Box>
            {isMobile && (
              <IconButton onClick={() => setMobileDrawerOpen(false)} sx={{ color: '#94a3b8', p: 0.5 }}>
                <MenuIcon />
              </IconButton>
            )}
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
                    onClick={() => isMobile && setMobileDrawerOpen(false)}
                    sx={{
                      borderRadius: '8px',
                      py: 1.5,
                      px: 1.5,
                      background: isActive ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                      border: isActive ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid transparent',
                      color: isActive ? '#10b981' : '#94a3b8',
                      minHeight: '44px',
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

        {/* Mobile role switcher in drawer */}
        {isMobile && user && (
          <Box sx={{ px: 1, py: 2, borderTop: '1px solid #141b2d' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', mb: 1.5, display: 'block', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              View as
            </Typography>
            <ToggleButtonGroup
              value={user.role}
              exclusive
              onChange={handleRoleChange}
              size="small"
              fullWidth
              sx={{
                bgcolor: '#0e1424',
                border: '1px solid #1c253d',
                borderRadius: '12px',
                '& .MuiToggleButton-root': {
                  color: '#94a3b8',
                  border: 'none',
                  px: 2.5,
                  py: 1,
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
              <ToggleButton value="admin" sx={{ flex: 1 }}>Admin</ToggleButton>
              <ToggleButton value="employee" sx={{ flex: 1 }}>Employee</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
        {/* Top Header */}
        <Box
          sx={{
            minHeight: { xs: 56, md: 70 },
            borderBottom: '1px solid #141b2d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 1, md: 0 },
            flexWrap: 'wrap',
            gap: { xs: 1.5, md: 0 },
            background: '#0b0f19',
            position: { xs: 'sticky', md: 'static' },
            top: 0,
            zIndex: 1100,
          }}
        >
          {/* Left: Hamburger + Search */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: { xs: '1 1 100%', md: '0 1 auto' }, order: { xs: 2, md: 1 } }}>
            {isMobile && (
              <IconButton onClick={() => setMobileDrawerOpen(true)} sx={{ color: '#94a3b8', p: 0.5 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flex: { xs: 1, md: 'none' },
                background: '#0e1424',
                borderRadius: '20px',
                px: 2,
                py: 0.5,
                width: { xs: '100%', sm: '100%', md: '300px' },
                border: '1px solid #1c253d',
              }}
            >
              <SearchIcon sx={{ color: '#475569', mr: 1, fontSize: '1.2rem' }} />
              <InputBase
                placeholder={isMobile ? 'Search...' : 'Search employees, tasks...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ color: '#f8fafc', fontSize: '0.85rem', width: '100%' }}
              />
            </Box>
          </Box>

          {/* Center: Role Switching (hidden on mobile) */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5, order: { xs: 3, md: 2 } }}>
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

          {/* Right: Tools */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 3.5 }, order: { xs: 1, md: 3 } }}>
            <IconButton onClick={handleNotifClick} sx={{ color: '#94a3b8', p: 0.5 }}>
              <Badge color="error" badgeContent={unreadCount}>
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>

        {/* Notification Bell Popover */}
        <Popover
          open={Boolean(notificationAnchorEl)}
          anchorEl={notificationAnchorEl}
          onClose={() => setNotificationAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: isMobile ? 'center' : 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: isMobile ? 'center' : 'right' }}
          PaperProps={{
            sx: {
              width: { xs: 'calc(100% - 32px)', sm: '320px' },
              maxWidth: { xs: 'calc(100% - 32px)', sm: '320px' },
              background: '#0e1424',
              border: '1px solid #1c253d',
              borderRadius: '12px',
              mt: 1.5,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            }
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px solid #1c253d' }}>
              <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', color: '#f8fafc' }}>
                Notifications
              </Typography>
              {notifications.some(n => !n.read) && (
                <Button 
                  variant="text" 
                  color="primary"
                  size="small" 
                  onClick={markAllNotificationsAsRead}
                  sx={{ fontSize: '0.75rem', minWidth: 0, p: 0, '&:hover': { background: 'none' } }}
                >
                  Mark all as read
                </Button>
              )}
            </Box>
            {notifications.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#94a3b8', py: 2, textAlign: 'center', fontSize: '0.8rem' }}>
                No notifications.
              </Typography>
            ) : (
              <List disablePadding sx={{ maxHeight: '250px', overflowY: 'auto' }}>
                {notifications.map((n) => (
                  <ListItem 
                    key={n.id} 
                    disablePadding 
                    sx={{ 
                      py: 1, 
                      borderBottom: '1px solid rgba(255,255,255,0.02)',
                      '&:last-child': { borderBottom: 'none' }
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#f8fafc', fontWeight: n.read ? 500 : 700 }}>
                          {n.title}
                        </Typography>
                        {!n.read && (
                          <Box sx={{ width: 6, height: 6, bgcolor: '#10b981', borderRadius: '50%', mt: 0.8 }} />
                        )}
                      </Box>
                      <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '0.75rem', lineHeight: 1.4 }}>
                        {n.message}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem', mt: 0.2 }}>
                        {n.time}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Popover>

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
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f8fafc', fontSize: '0.85rem' }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem', textTransform: 'capitalize' }}>
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
                    py: 1.5,
                    px: 2.5,
                    minHeight: '44px',
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
                <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
        <Container maxWidth="xl" sx={{ flexGrow: 1, px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3, md: 4 } }}>
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
            <Suspense fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress color="primary" />
              </Box>
            }>
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
            </Suspense>
          </SidebarAndHeaderLayout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
