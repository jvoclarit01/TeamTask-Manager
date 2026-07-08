import React, { useState, useEffect } from 'react';
import { Box, MenuItem, Select, InputLabel, FormControl, Typography, Grid, Paper } from '@mui/material';
import { getEmployees, getMyTasks, updateTaskStatus } from '../services/apiService';
import TaskCard from '../components/TaskCard';

const EmployeeBoard = () => {
  const [employees, setEmployees] = useState([]);
  const [currentEmployeeId, setCurrentEmployeeId] = useState('');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (currentEmployeeId) {
      loadMyTasks();
    } else {
      setTasks([]);
    }
  }, [currentEmployeeId]);

  const loadEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data);
      if (res.data.length > 0) {
        setCurrentEmployeeId(res.data[0].id); // Default to first employee
      }
    } catch (err) {
      console.error("Error loading employees", err);
    }
  };

  const loadMyTasks = async () => {
    try {
      const res = await getMyTasks(currentEmployeeId);
      setTasks(res.data);
    } catch (err) {
      console.error("Error loading tasks for employee", err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      loadMyTasks(); // Reload immediately so state updates
    } catch (err) {
      console.error("Error updating task status", err);
    }
  };

  // Group tasks by status
  const tasksByStatus = {
    pending: tasks.filter(t => t.status === 'pending'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed'),
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4.5, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Typography 
          variant="h5" 
          fontWeight="700" 
          sx={{ color: '#f8fafc', fontFamily: '"Fira Sans", sans-serif' }}
        >
          My Work Board
        </Typography>
        
        {/* Simulate logging in as a specific employee */}
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="active-employee-label" style={{ color: '#94a3b8', fontFamily: '"Fira Sans", sans-serif' }}>Logged in as:</InputLabel>
          <Select
            labelId="active-employee-label"
            value={currentEmployeeId}
            label="Logged in as"
            onChange={(e) => setCurrentEmployeeId(e.target.value)}
            sx={{ 
              color: '#f8fafc', 
              fontFamily: '"Fira Sans", sans-serif',
              '& fieldset': { borderColor: '#334155' },
              '&:hover fieldset': { borderColor: '#475569' }
            }}
          >
            {employees.map((emp) => (
              <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Kanban Column View */}
      <Grid container spacing={3}>
        {['pending', 'in_progress', 'completed'].map((status) => {
          const title = status === 'pending' ? 'To Do' : status === 'in_progress' ? 'In Progress' : 'Completed';
          const currentTasks = tasksByStatus[status] || [];
          return (
            <Grid size={{ xs: 12, md: 4 }} key={status}>
              <Paper 
                sx={{ 
                  p: 2.5, 
                  background: 'rgba(15, 23, 42, 0.6)', 
                  border: '1px solid #1e293b', 
                  minHeight: '65vh', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                }}
              >
                <Typography 
                  variant="h6" 
                  fontWeight="600" 
                  mb={2.5} 
                  sx={{ 
                    color: '#f8fafc', 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontFamily: '"Fira Sans", sans-serif',
                    fontSize: '1rem',
                    letterSpacing: '0.5px'
                  }}
                >
                  <span>{title}</span>
                  <Typography 
                    component="span" 
                    color="#64748b"
                    sx={{ fontFamily: '"Fira Code", monospace', fontSize: '0.9rem' }}
                  >
                    ({currentTasks.length})
                  </Typography>
                </Typography>

                {currentTasks.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
                    <Typography color="#475569" variant="body2" sx={{ fontFamily: '"Fira Sans", sans-serif' }}>
                      No tasks assigned
                    </Typography>
                  </Box>
                ) : (
                  currentTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isEmployeeView={true}
                      onStatusChange={handleStatusChange}
                    />
                  ))
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default EmployeeBoard;
