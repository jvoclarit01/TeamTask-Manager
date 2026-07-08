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
