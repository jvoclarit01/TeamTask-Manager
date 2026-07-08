import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#030712', // Darker black-tinted neutral
      paper: '#0b1329',   // Deep dark card tone
    },
    primary: {
      main: '#10b981',    // Emerald Green
    },
    secondary: {
      main: '#3b82f6',    // Vivid Blue
    },
    warning: {
      main: '#f59e0b',
    },
    info: {
      main: '#38bdf8',       // Sky Blue (soft)
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
    divider: '#1e293b',
  },
  typography: {
    fontFamily: '"Inter", "Outfit", sans-serif',
    h3: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 800,
      letterSpacing: '-0.03em',
      lineHeight: 1.1,
    },
    h5: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#070f21',
          border: '1px solid rgba(255, 255, 255, 0.05)', // Refined border
          borderRadius: '16px',
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 4px 30px rgba(0, 0, 0, 0.4)', // Inner border glow
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            borderColor: 'rgba(16, 185, 129, 0.3)',
            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.08), 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 16px rgba(16, 185, 129, 0.1)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          textTransform: 'none',
          fontWeight: 600,
          transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '&:active': {
            transform: 'scale(0.97)', // Tap physics click feedback
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
        },
      },
    },
  },
});

export default theme;
