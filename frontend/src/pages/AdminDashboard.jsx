import { useState, useEffect } from 'react';
import { Box, Grid, TextField, Button, MenuItem, Select, InputLabel, FormControl, OutlinedInput, Checkbox, ListItemText, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getEmployees, getTasks, createTask } from '../services/apiService';
import TaskCard from '../components/TaskCard';

const AdminDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedUserIds, setAssignedUserIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const [tasksRes, employeesRes] = await Promise.all([getTasks(), getEmployees()]);
        if (active) {
          setTasks(tasksRes.data);
          setEmployees(employeesRes.data);
        }
      } catch (err) {
        console.error('Failed to load Admin workload data', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => {
      active = false;
    };
  }, [refreshKey]);

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
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to assign task', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Task Creation Form Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Assign New Task
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
                      '& fieldset': { borderColor: '#334155' },
                      '&:hover fieldset': { borderColor: '#475569' },
                    },
                  }}
                  slotProps={{ inputLabel: { style: { color: '#94a3b8' } } }}
                  required
                />
                <TextField
                  fullWidth
                  label="Task Description"
                  variant="outlined"
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#334155' },
                      '&:hover fieldset': { borderColor: '#475569' },
                    },
                  }}
                  slotProps={{ inputLabel: { style: { color: '#94a3b8' } } }}
                />

                <FormControl fullWidth sx={{ mb: 4 }}>
                  <InputLabel id="assign-employees-label" style={{ color: '#94a3b8' }}>
                    Assign Employees
                  </InputLabel>
                  <Select
                    labelId="assign-employees-label"
                    multiple
                    value={assignedUserIds}
                    onChange={(e) => setAssignedUserIds(e.target.value)}
                    input={
                      <OutlinedInput
                        label="Assign Employees"
                        sx={{
                          '& fieldset': { borderColor: '#334155' },
                          '&:hover fieldset': { borderColor: '#475569' },
                        }}
                      />
                    }
                    renderValue={(selected) =>
                      selected
                        .map((id) => employees.find((emp) => emp.id === id)?.name)
                        .filter(Boolean)
                        .join(', ')
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
                  sx={{ height: '48px' }}
                >
                  Create & Assign Task
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Master Task Dashboard View */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Active Team Tasks
          </Typography>
          {tasks.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              py: 10, 
              border: '1px dashed #1e293b', 
              borderRadius: '16px',
              background: 'rgba(15, 23, 42, 0.2)'
            }}>
              <Typography variant="h6" sx={{ color: '#94a3b8', mb: 1, fontWeight: 'bold' }}>
                All Clear!
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569' }}>
                No tasks created yet. Use the panel on the left to assign one.
              </Typography>
            </Box>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} isEmployeeView={false} />
            ))
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
