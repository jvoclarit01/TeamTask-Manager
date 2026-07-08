import React, { useState } from 'react';
import { Container, Box, ToggleButtonGroup, ToggleButton, Typography, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BadgeIcon from '@mui/icons-material/Badge';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeBoard from './pages/EmployeeBoard';

// Premium OLED Dark Mode Theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#020617', // Slate 950 (OLED Deep Black-Blue)
      paper: '#0f172a', // Slate 900
    },
    primary: {
      main: '#22c55e', // Accent Green
    },
    secondary: {
      main: '#3b82f6', // Midnight Blue Accent
    },
    text: {
      primary: '#f8fafc', // Slate 50
      secondary: '#94a3b8', // Slate 400
    },
  },
  typography: {
    fontFamily: '"Fira Sans", "Fira Code", "Roboto", sans-serif',
  },
});

function App() {
  const [viewMode, setViewMode] = useState('admin');

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box 
        sx={{ 
          minHeight: '100vh', 
          background: 'radial-gradient(ellipse at top, #0f172a, #020617)', // Deep dark radial glow
          py: 6,
          px: { xs: 2, sm: 3 }
        }}
      >
        <Container maxWidth="lg">
          {/* Header & Switcher */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 6 }}>
            <Typography 
              variant="h3" 
              fontWeight="800" 
              sx={{ 
                mb: 1, 
                fontFamily: '"Fira Sans", sans-serif',
                background: 'linear-gradient(to right, #4ade80, #3b82f6)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                textAlign: 'center',
                letterSpacing: '-0.5px'
              }}
            >
              HRMS Workload Hub
            </Typography>
            <Typography 
              variant="subtitle1" 
              mb={4} 
              textAlign="center"
              sx={{ 
                color: '#64748b', 
                fontFamily: '"Fira Sans", sans-serif',
                fontSize: '1.05rem'
              }}
            >
              Task Assignment & Progress Tracking Panel
            </Typography>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewChange}
              color="primary"
              sx={{ 
                background: '#0f172a', 
                border: '1px solid #1e293b', 
                borderRadius: '10px',
                '& .MuiToggleButton-root': { 
                  border: 'none', 
                  color: '#64748b', 
                  px: 3, 
                  py: 1.2,
                  fontFamily: '"Fira Sans", sans-serif',
                  fontWeight: 600,
                  textTransform: 'none',
                  transition: 'color 0.2s ease, background-color 0.2s ease',
                  '&.Mui-selected': {
                    color: '#f8fafc',
                    background: '#1e293b',
                  },
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.02)'
                  }
                } 
              }}
            >
              <ToggleButton value="admin">
                <AdminPanelSettingsIcon sx={{ mr: 1, fontSize: '1.2rem' }} /> Admin View
              </ToggleButton>
              <ToggleButton value="employee">
                <BadgeIcon sx={{ mr: 1, fontSize: '1.2rem' }} /> Employee View
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Render Active View */}
          <Box sx={{ mt: 2 }}>
            {viewMode === 'admin' ? <AdminDashboard /> : <EmployeeBoard />}
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
