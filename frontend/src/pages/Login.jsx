import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, Avatar, CircularProgress, Divider } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEmployees } from '../services/apiService';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getEmployees();
        setEmployees(res.data);
      } catch (err) {
        console.error('Failed to load employee list', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleLogin = (userObj, role) => {
    const sessionUser = {
      id: userObj.id,
      name: userObj.name,
      email: userObj.email,
      role: role,
    };
    login(sessionUser);
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/employee/board');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
      <Box sx={{ maxWidth: '600px', width: '100%' }}>
        <Card sx={{ p: 4, textAlign: 'center', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)' }}>
          <CardContent>
            <Typography variant="h3" sx={{ mb: 1, color: '#f8fafc', background: 'linear-gradient(to right, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Workload Hub
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
              Select a profile below to log in
            </Typography>

            {/* Admin Profile Section */}
            <Typography variant="subtitle2" color="primary" sx={{ textAlign: 'left', fontWeight: 'bold', mb: 1.5, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Administration Portal
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleLogin({ id: 999, name: 'Alice Admin', email: 'admin@company.com' }, 'admin')}
              startIcon={<AdminPanelSettingsIcon />}
              sx={{
                py: 2,
                mb: 4,
                borderColor: '#1e293b',
                color: '#f8fafc',
                background: 'rgba(30, 41, 59, 0.3)',
                '&:hover': {
                  borderColor: '#10b981',
                  background: 'rgba(16, 185, 129, 0.05)',
                },
              }}
            >
              Log in as Alice Admin
            </Button>

            <Divider sx={{ mb: 4 }} />

            {/* Employee Profiles Section */}
            <Typography variant="subtitle2" color="secondary" sx={{ textAlign: 'left', fontWeight: 'bold', mb: 1.5, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Employee Portal
            </Typography>

            {loading ? (
              <CircularProgress color="secondary" size={30} />
            ) : employees.length === 0 ? (
              <Typography color="textSecondary">No employees available. Ensure database seed is run.</Typography>
            ) : (
              <Grid container spacing={2}>
                {employees.map((emp) => (
                  <Grid item xs={12} sm={6} key={emp.id}>
                    <Card
                      onClick={() => handleLogin(emp, 'employee')}
                      sx={{
                        cursor: 'pointer',
                        background: 'rgba(30, 41, 59, 0.2)',
                        border: '1px solid #1e293b',
                        '&:hover': {
                          borderColor: '#3b82f6',
                          background: 'rgba(59, 130, 246, 0.05)',
                        },
                      }}
                    >
                      <CardContent sx={{ display: 'flex', alignItems: 'center', py: '16px !important' }}>
                        <Avatar sx={{ bgcolor: '#3b82f6', mr: 2, width: 36, height: 36 }}>
                          {emp.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ textAlign: 'left' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                            {emp.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {emp.email}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Login;
