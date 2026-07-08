import React, { useState, useEffect } from 'react';
import { Box, Grid, TextField, Button, MenuItem, Select, InputLabel, FormControl, OutlinedInput, Checkbox, ListItemText, Typography, Card, CardContent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getEmployees, getTasks, createTask } from '../services/apiService';
import TaskCard from '../components/TaskCard';

const AdminDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedUserIds, setAssignedUserIds] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksRes, employeesRes] = await Promise.all([getTasks(), getEmployees()]);
      setTasks(tasksRes.data);
      setEmployees(employeesRes.data);
    } catch (err) {
      console.error("Error fetching admin dashboard data", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || assignedUserIds.length === 0) return;

    try {
      await createTask({
        title,
        description,
        user_ids: assignedUserIds,
      });
      setTitle('');
      setDescription('');
      setAssignedUserIds([]);
      loadData(); // Reload tasks immediately to update UI state
    } catch (err) {
      console.error("Error creating task", err);
    }
  };

  return (
    <Grid container spacing={4}>
      {/* Create Task Form */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card 
          sx={{ 
            background: '#0f172a', 
            color: '#f8fafc', 
            border: '1px solid #1e293b',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography 
              variant="h5" 
              mb={3} 
              fontWeight="700" 
              sx={{ fontFamily: '"Fira Sans", sans-serif' }}
            >
              Create New Task
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Task Title"
                variant="outlined"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ 
                  mb: 2.5, 
                  '& .MuiOutlinedInput-root': { 
                    color: '#f8fafc', 
                    fontFamily: '"Fira Sans", sans-serif',
                    '& fieldset': { borderColor: '#334155' },
                    '&:hover fieldset': { borderColor: '#475569' }
                  } 
                }}
                slotProps={{ inputLabel: { style: { color: '#94a3b8', fontFamily: '"Fira Sans", sans-serif' } } }}
                required
              />
              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{ 
                  mb: 2.5, 
                  '& .MuiOutlinedInput-root': { 
                    color: '#f8fafc', 
                    fontFamily: '"Fira Sans", sans-serif',
                    '& fieldset': { borderColor: '#334155' },
                    '&:hover fieldset': { borderColor: '#475569' }
                  } 
                }}
                slotProps={{ inputLabel: { style: { color: '#94a3b8', fontFamily: '"Fira Sans", sans-serif' } } }}
              />
              
              <FormControl fullWidth sx={{ mb: 4.5 }}>
                <InputLabel id="assign-employees-label" style={{ color: '#94a3b8', fontFamily: '"Fira Sans", sans-serif' }}>Assign Employees</InputLabel>
                <Select
                  labelId="assign-employees-label"
                  multiple
                  value={assignedUserIds}
                  onChange={(e) => setAssignedUserIds(e.target.value)}
                  input={
                    <OutlinedInput 
                      label="Assign Employees" 
                      sx={{ 
                        color: '#f8fafc', 
                        fontFamily: '"Fira Sans", sans-serif',
                        '& fieldset': { borderColor: '#334155' },
                        '&:hover fieldset': { borderColor: '#475569' }
                      }} 
                    />
                  }
                  renderValue={(selected) => 
                    selected.map(id => employees.find(emp => emp.id === id)?.name).join(', ')
                  }
                >
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      <Checkbox checked={assignedUserIds.indexOf(employee.id) > -1} />
                      <ListItemText primary={employee.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
                startIcon={<AddIcon />}
                size="large"
                sx={{
                  fontFamily: '"Fira Sans", sans-serif',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: '8px',
                  height: '48px',
                  bgcolor: '#22c55e', // Accent green
                  '&:hover': {
                    bgcolor: '#16a34a',
                  }
                }}
              >
                Assign Task
              </Button>
            </form>
          </CardContent>
        </Card>
      </Grid>

      {/* Task List Dashboard */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Typography 
          variant="h5" 
          mb={3} 
          fontWeight="700" 
          sx={{ color: '#f8fafc', fontFamily: '"Fira Sans", sans-serif' }}
        >
          All Team Tasks
        </Typography>
        {tasks.length === 0 ? (
          <Typography color="#64748b" sx={{ fontFamily: '"Fira Sans", sans-serif' }}>No tasks created yet.</Typography>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} isEmployeeView={false} />
          ))
        )}
      </Grid>
    </Grid>
  );
};

export default AdminDashboard;
