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
