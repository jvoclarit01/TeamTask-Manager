import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import SynergyLogo from './SynergyLogo';

const WelcomeOverlay = ({ user, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      const closeTimer = setTimeout(onClose, 300);
      return () => clearTimeout(closeTimer);
    }, 1500);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!user) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(circle at center, rgba(5, 8, 17, 0.9) 0%, rgba(3, 7, 18, 0.98) 100%)',
        backgroundImage: 'linear-gradient(to bottom, rgba(5, 8, 17, 0.85), rgba(3, 7, 18, 0.95)), url("/src/assets/brand_bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backdropFilter: 'blur(20px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '@keyframes scaleIn': {
            '0%': { transform: 'scale(0.9)', opacity: 0 },
            '100%': { transform: 'scale(1)', opacity: 1 }
          }
        }}
      >
        <SynergyLogo size={90} sx={{ mb: 3, filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.2))' }} />

        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            fontFamily: '"Outfit", sans-serif',
            letterSpacing: '3px',
            background: 'linear-gradient(to right, #10b981, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          SYNERGY
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: '#94a3b8',
            fontFamily: '"Fira Code", monospace',
            letterSpacing: '5px',
            display: 'block',
            mb: 4,
            textTransform: 'uppercase',
            fontSize: '0.75rem'
          }}
        >
          ALIGN. EXECUTE. SCALE.
        </Typography>

        <Box
          sx={{
            py: 1,
            px: 3,
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(5px)',
          }}
        >
          <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 600 }}>
            Welcome back, <span style={{ color: '#f8fafc', fontWeight: 800 }}>{user.name}</span>
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'capitalize', display: 'block', mt: 0.2 }}>
            Active Role: {user.role === 'admin' ? 'Administrator' : 'Team Member'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default WelcomeOverlay;
