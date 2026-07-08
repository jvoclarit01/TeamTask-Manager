import { useState, useEffect } from 'react';
import { Box, TextField, Button, MenuItem, Select, FormControl, OutlinedInput, Checkbox, ListItemText, Typography, CircularProgress, Chip, Dialog } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FilterListIcon from '@mui/icons-material/FilterList';
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
  const [open, setOpen] = useState(false);

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
      setOpen(false);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to assign task', err);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setAssignedUserIds([]);
    setOpen(false);
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 1, maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {/* Title Header with Action Button & Date */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', mb: 0.5 }}>
            Task Management Dashboard
          </Typography>
          <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.8rem' }}>
            Active Team Tasks ({tasks.length})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#94a3b8' }}>
            <CalendarMonthIcon fontSize="small" />
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
              {formattedDate}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{
              bgcolor: '#10b981',
              color: '#090d16',
              textTransform: 'none',
              fontWeight: 'bold',
              px: 2.5,
              py: 1,
              borderRadius: '8px',
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            Create Task
          </Button>
        </Box>
      </Box>

      {/* Main Task List View (Full-Width breathing room) */}
      <Box sx={{ width: '100%', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
            Team Task Cards
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94a3b8', cursor: 'pointer', '&:hover': { color: '#f8fafc' } }}>
            <FilterListIcon fontSize="small" />
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
              Filter & Sort
            </Typography>
          </Box>
        </Box>

        {tasks.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            py: 15, 
            border: '1px dashed #1c253d', 
            borderRadius: '12px',
            background: 'rgba(14, 20, 36, 0.4)'
          }}>
            <Typography variant="h6" sx={{ color: '#94a3b8', mb: 1, fontWeight: 'bold', fontSize: '1rem' }}>
              All Clear!
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}>
              No tasks created yet. Click the "+ Create Task" button at the top to assign one.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </Box>
        )}
      </Box>

      {/* CREATE TASK MODAL (Popup Dialog) */}
      <Dialog
        open={open}
        onClose={handleCancel}
        PaperProps={{
          sx: {
            background: '#0e1424',
            border: '1px solid #1c253d',
            borderRadius: '16px',
            p: 1.5,
            width: '450px',
            maxWidth: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3.5, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
            Create New Task
          </Typography>
          <form onSubmit={handleSubmit}>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1, fontWeight: 600 }}>
              Title
            </Typography>
            <TextField
              fullWidth
              placeholder="Task title..."
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  background: '#090d16',
                  '& fieldset': { borderColor: '#1c253d' },
                  '&:hover fieldset': { borderColor: '#2e3b5e' },
                },
                '& input': { py: 1.5, fontSize: '0.85rem', color: '#f8fafc' }
              }}
              required
            />

            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1, fontWeight: 600 }}>
              Description
            </Typography>
            <TextField
              fullWidth
              placeholder="Task description details..."
              variant="outlined"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  background: '#090d16',
                  '& fieldset': { borderColor: '#1c253d' },
                  '&:hover fieldset': { borderColor: '#2e3b5e' },
                },
                '& textarea': { fontSize: '0.85rem', color: '#f8fafc' }
              }}
            />

            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1, fontWeight: 600 }}>
              Assign Employees
            </Typography>
            <FormControl fullWidth sx={{ mb: 4.5 }}>
              <Select
                multiple
                displayEmpty
                value={assignedUserIds}
                onChange={(e) => setAssignedUserIds(e.target.value)}
                input={
                  <OutlinedInput
                    sx={{
                      background: '#090d16',
                      '& fieldset': { borderColor: '#1c253d' },
                      '&:hover fieldset': { borderColor: '#2e3b5e' },
                      '& .MuiSelect-select': { py: 1.5, fontSize: '0.85rem', color: '#f8fafc' }
                    }}
                  />
                }
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return <span style={{ color: '#475569' }}>[Search/Select Employees...]</span>;
                  }
                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((id) => {
                        const emp = employees.find((e) => e.id === id);
                        return emp ? (
                          <Chip
                            key={id}
                            label={emp.name}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(16, 185, 129, 0.1)',
                              color: '#10b981',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              height: '22px'
                            }}
                          />
                        ) : null;
                      })}
                    </Box>
                  );
                }}
              >
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id} sx={{ py: 0.5 }}>
                    <Checkbox checked={assignedUserIds.indexOf(employee.id) > -1} size="small" />
                    <ListItemText primary={employee.name} primaryTypographyProps={{ fontSize: '0.85rem' }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Bottom Actions */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleCancel}
                sx={{
                  height: '42px',
                  color: '#94a3b8',
                  borderColor: '#1c253d',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  '&:hover': { borderColor: '#2e3b5e', background: 'rgba(255, 255, 255, 0.02)' }
                }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                sx={{
                  height: '42px',
                  bgcolor: '#10b981',
                  color: '#090d16',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  '&:hover': { bgcolor: '#059669' }
                }}
              >
                Create Task
              </Button>
            </Box>
          </form>
        </Box>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
