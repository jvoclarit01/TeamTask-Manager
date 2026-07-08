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
    <Box sx={{ p: 2, pb: 0 }}>
      <AppBar 
        position="static" 
        sx={{ 
          background: 'rgba(11, 19, 41, 0.75)', 
          backdropFilter: 'blur(16px)', 
          border: '1px solid rgba(255, 255, 255, 0.05)', 
          borderRadius: '16px',
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 8px 32px rgba(0, 0, 0, 0.3)',
          backgroundImage: 'none'
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              fontFamily: '"Outfit", sans-serif',
              background: 'linear-gradient(to right, #10b981, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            Workload Hub
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              size="small"
              icon={user.role === 'admin' ? <AdminPanelSettingsIcon style={{ fontSize: '0.95rem' }} /> : <BadgeIcon style={{ fontSize: '0.95rem' }} />}
              label={user.role === 'admin' ? 'Admin' : 'Employee'}
              color={user.role === 'admin' ? 'primary' : 'secondary'}
              variant="outlined"
              sx={{ fontWeight: 'bold', fontFamily: '"Fira Code", monospace', height: '24px', fontSize: '0.65rem' }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Avatar sx={{ bgcolor: user.role === 'admin' ? '#10b981' : '#3b82f6', width: 28, height: 28, fontSize: '0.75rem', fontWeight: 'bold' }}>
                {user.name.charAt(0)}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#f8fafc', display: { xs: 'none', sm: 'block' } }}>
                {user.name}
              </Typography>
            </Box>

            <Button
              variant="text"
              color="error"
              size="small"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{ fontSize: '0.8rem', textTransform: 'none', px: 1 }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;
