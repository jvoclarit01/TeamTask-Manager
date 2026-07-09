import { useState, useEffect } from 'react';
import { Box, TextField, Button, MenuItem, Select, FormControl, OutlinedInput, Checkbox, ListItemText, Typography, CircularProgress, Chip, Dialog, Popover, Radio, RadioGroup, FormControlLabel, Pagination, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { getEmployees, getTasks, createTask, updateTask } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';

const AdminDashboard = () => {
  const { searchQuery, addNotification } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedUserIds, setAssignedUserIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [open, setOpen] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAssignedUserIds, setEditAssignedUserIds] = useState([]);
  const [editDueDate, setEditDueDate] = useState('');
  const [editPriority, setEditPriority] = useState('medium');

  // Filter & Sort States
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest, alphabetical
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, in_progress, completed
  const [employeeFilter, setEmployeeFilter] = useState('all'); // all, or employee ID

  // Pagination State
  const [page, setPage] = useState(1);
  const itemsPerPage = 3; // Setting to 3 to easily demonstrate page switching

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
        due_date: dueDate || null,
        user_ids: assignedUserIds,
        priority,
      });
      addNotification('Task Created', `Admin assigned a new task: "${title}"`);
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
      setAssignedUserIds([]);
      setOpen(false);
      setPage(1);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to assign task', err);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
    setAssignedUserIds([]);
    setOpen(false);
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditDueDate(task.due_date || '');
    setEditAssignedUserIds(task.users ? task.users.map((u) => u.id) : []);
    setEditPriority(task.priority || 'medium');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || editAssignedUserIds.length === 0) return;

    try {
      await updateTask(editingTask.id, {
        title: editTitle,
        description: editDescription,
        due_date: editDueDate || null,
        user_ids: editAssignedUserIds,
        priority: editPriority,
      });
      addNotification('Task Updated', `Admin updated task details: "${editTitle}"`);
      setEditingTask(null);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to update task details', err);
    }
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // 1. Process tasks matching search query
  let filteredTasks = tasks.filter((task) => {
    const query = searchQuery.toLowerCase();
    const matchesTitle = task.title.toLowerCase().includes(query);
    const matchesDescription = task.description ? task.description.toLowerCase().includes(query) : false;
    const matchesEmployee = task.users ? task.users.some((user) => user.name.toLowerCase().includes(query)) : false;
    const matchesId = `tsk-${task.id}`.includes(query) || `tsk${task.id}`.includes(query) || task.id.toString() === query;
    return matchesTitle || matchesDescription || matchesEmployee || matchesId;
  });

  // 2. Process tasks matching status filter
  if (statusFilter !== 'all') {
    filteredTasks = filteredTasks.filter((task) => task.status === statusFilter);
  }

  // 3. Process tasks matching employee assignee filter
  if (employeeFilter !== 'all') {
    filteredTasks = filteredTasks.filter((task) =>
      task.users?.some((user) => user.id === Number(employeeFilter))
    );
  }

  // 4. Sort tasks
  filteredTasks.sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.created_at || b.id) - new Date(a.created_at || a.id);
    } else if (sortOrder === 'oldest') {
      return new Date(a.created_at || a.id) - new Date(b.created_at || b.id);
    } else if (sortOrder === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  // 5. Paginate tasks (Clamp activePage to ensure it is always within valid page bounds)
  const pageCount = Math.ceil(filteredTasks.length / itemsPerPage);
  const activePage = Math.min(page, Math.max(1, pageCount));
  const paginatedTasks = filteredTasks.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 1, width: '100%' }}>
      {/* Title Header with Action Button & Date */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', mb: 0.5 }}>
            Task Management Dashboard
          </Typography>
          <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.8rem' }}>
            Active Team Tasks ({filteredTasks.length})
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
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{ px: 2.5, py: 1 }}
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
          
          {/* Filter & Sort Clickable Row */}
          <Box 
            onClick={handleFilterClick}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94a3b8', cursor: 'pointer', '&:hover': { color: '#f8fafc' } }}
          >
            <FilterListIcon fontSize="small" />
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
              Filter & Sort
            </Typography>
          </Box>
        </Box>

        {paginatedTasks.length === 0 ? (
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
              No results found
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}>
              Try adjusting your search keywords, assignee filters, or status selections.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {paginatedTasks.map((task) => (
              <TaskCard key={task.id} task={task} onEditClick={handleEditClick} />
            ))}

            {/* Pagination Controls */}
            {pageCount > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 1 }}>
                <Pagination
                  count={pageCount}
                  page={activePage}
                  onChange={(e, val) => setPage(val)}
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#94a3b8',
                      fontFamily: '"Outfit", sans-serif',
                      fontWeight: 600,
                      borderRadius: '8px',
                      '&:hover': {
                        bgcolor: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                      },
                      '&.Mui-selected': {
                        bgcolor: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        fontWeight: 'bold',
                        '&:hover': {
                          bgcolor: 'rgba(16, 185, 129, 0.25)',
                        }
                      }
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* FILTER & SORT DROPDOWN POPOVER */}
      <Popover
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: '280px',
            background: '#0e1424',
            border: '1px solid #1c253d',
            borderRadius: '12px',
            mt: 1.5,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', mb: 2, pb: 0.5, borderBottom: '1px solid #1c253d', color: '#f8fafc' }}>
            Sort & Filters
          </Typography>

          {/* Sort Group */}
          <Typography variant="caption" sx={{ color: '#e2e8f0', fontWeight: 'bold', display: 'block', mb: 1, textTransform: 'uppercase' }}>
            Sort by
          </Typography>
          <RadioGroup 
            value={sortOrder} 
            onChange={(e) => {
              setSortOrder(e.target.value);
              setPage(1);
            }} 
            sx={{ mb: 3 }}
          >
            <FormControlLabel 
              value="newest" 
              control={<Radio size="small" sx={{ color: '#1c253d', '&.Mui-checked': { color: '#10b981' } }} />} 
              label="Newest First" 
              componentsProps={{ typography: { fontSize: '0.8rem', color: '#cbd5e1' } }}
            />
            <FormControlLabel 
              value="oldest" 
              control={<Radio size="small" sx={{ color: '#1c253d', '&.Mui-checked': { color: '#10b981' } }} />} 
              label="Oldest First" 
              componentsProps={{ typography: { fontSize: '0.8rem', color: '#cbd5e1' } }}
            />
            <FormControlLabel 
              value="alphabetical" 
              control={<Radio size="small" sx={{ color: '#1c253d', '&.Mui-checked': { color: '#10b981' } }} />} 
              label="Alphabetical (A-Z)" 
              componentsProps={{ typography: { fontSize: '0.8rem', color: '#cbd5e1' } }}
            />
          </RadioGroup>

          {/* Status Filter Group */}
          <Typography variant="caption" sx={{ color: '#e2e8f0', fontWeight: 'bold', display: 'block', mb: 1, textTransform: 'uppercase' }}>
            Filter Status
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              sx={{
                background: '#0b0f19', // High contrast background
                fontSize: '0.8rem',
                color: '#f8fafc',
                '& fieldset': { borderColor: '#1c253d' },
                '&:hover fieldset': { borderColor: '#2e3b5e' },
              }}
            >
              <MenuItem value="all" sx={{ fontSize: '0.8rem' }}>All Statuses</MenuItem>
              <MenuItem value="pending" sx={{ fontSize: '0.8rem' }}>Pending</MenuItem>
              <MenuItem value="in_progress" sx={{ fontSize: '0.8rem' }}>In Progress</MenuItem>
              <MenuItem value="completed" sx={{ fontSize: '0.8rem' }}>Completed</MenuItem>
            </Select>
          </FormControl>

          {/* Assignee Filter Group */}
          <Typography variant="caption" sx={{ color: '#e2e8f0', fontWeight: 'bold', display: 'block', mb: 1, textTransform: 'uppercase' }}>
            Filter Assignee
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 1 }}>
            <Select
              value={employeeFilter}
              onChange={(e) => {
                setEmployeeFilter(e.target.value);
                setPage(1);
              }}
              sx={{
                background: '#0b0f19', // High contrast background
                fontSize: '0.8rem',
                color: '#f8fafc',
                '& fieldset': { borderColor: '#1c253d' },
                '&:hover fieldset': { borderColor: '#2e3b5e' },
              }}
            >
              <MenuItem value="all" sx={{ fontSize: '0.8rem' }}>All Employees</MenuItem>
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id} sx={{ fontSize: '0.8rem' }}>
                  {emp.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Popover>

      {/* CREATE TASK MODAL (Popup Dialog with UI/UX Pro Max guidelines) */}
      <Dialog
        open={open}
        onClose={handleCancel}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(3, 7, 18, 0.65)',
              backdropFilter: 'blur(8px)', // Glassmorphic blur
            }
          }
        }}
        PaperProps={{
          sx: {
            background: '#0e1424',
            border: '1px solid #1c253d',
            borderRadius: '16px',
            width: '460px',
            maxWidth: '90%',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          }
        }}
      >
        {/* Inner Wrapper Box to enforce padding boundaries */}
        <Box sx={{ p: 4 }}>
          {/* Header Title Section */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', color: '#f8fafc', letterSpacing: '-0.02em', fontSize: '1.25rem', lineHeight: 1.2 }}>
                Create Task
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mt: 0.5, fontSize: '0.75rem' }}>
                Assign a new task to team members
              </Typography>
            </Box>
            <IconButton onClick={handleCancel} sx={{ color: '#cbd5e1', p: 0.5, '&:hover': { color: '#f8fafc', bgcolor: 'rgba(255,255,255,0.05)' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <form onSubmit={handleSubmit}>
            <Typography variant="body2" sx={{ color: '#e2e8f0', display: 'block', mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
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
                  background: '#0b0f19', // High contrast input background
                  borderRadius: '10px',
                  '& fieldset': { borderColor: '#1c253d' },
                  '&:hover fieldset': { borderColor: '#2e3b5e' },
                  '&.Mui-focused fieldset': { borderColor: '#10b981' }, // focus feedback
                },
                '& input': { py: 1.5, fontSize: '0.85rem', color: '#f8fafc' },
                '& input::placeholder': { color: '#64748b', opacity: 1 }
              }}
              required
            />

            <Typography variant="body2" sx={{ color: '#e2e8f0', display: 'block', mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
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
                  background: '#0b0f19', // High contrast input background
                  borderRadius: '10px',
                  '& fieldset': { borderColor: '#1c253d' },
                  '&:hover fieldset': { borderColor: '#2e3b5e' },
                  '&.Mui-focused fieldset': { borderColor: '#10b981' }, // focus feedback
                },
                '& textarea': { fontSize: '0.85rem', color: '#f8fafc' },
                '& textarea::placeholder': { color: '#64748b', opacity: 1 }
              }}
            />

            <Typography variant="body2" sx={{ color: '#e2e8f0', display: 'block', mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
              Due Date
            </Typography>
            <TextField
              fullWidth
              type="date"
              variant="outlined"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  background: '#0b0f19',
                  borderRadius: '10px',
                  '& fieldset': { borderColor: '#1c253d' },
                  '&:hover fieldset': { borderColor: '#2e3b5e' },
                  '&.Mui-focused fieldset': { borderColor: '#10b981' },
                },
                '& input': { py: 1.5, fontSize: '0.85rem', color: '#f8fafc' }
              }}
            />

            <Typography variant="body2" sx={{ color: '#e2e8f0', display: 'block', mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
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
                      background: '#0b0f19', // High contrast input background
                      borderRadius: '10px',
                      '& fieldset': { borderColor: '#1c253d' },
                      '&:hover fieldset': { borderColor: '#2e3b5e' },
                      '&.Mui-focused fieldset': { borderColor: '#10b981' }, // focus feedback
                      '& .MuiSelect-select': { py: 1.5, fontSize: '0.85rem', color: '#f8fafc' }
                    }}
                  />
                }
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return <span style={{ color: '#64748b' }}>[Search/Select Employees...]</span>;
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
                sx={{ height: '44px' }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
                sx={{ height: '44px' }}
              >
                Create Task
              </Button>
            </Box>
          </form>
        </Box>
      </Dialog>

      {/* EDIT TASK MODAL (Popup Dialog with UI/UX Pro Max guidelines) */}
      <Dialog
        open={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(3, 7, 18, 0.65)',
              backdropFilter: 'blur(8px)',
            }
          }
        }}
        PaperProps={{
          sx: {
            background: '#0e1424',
            border: '1px solid #1c253d',
            borderRadius: '16px',
            width: '460px',
            maxWidth: '90%',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          }
        }}
      >
        {/* Inner Wrapper Box to enforce padding boundaries */}
        <Box sx={{ p: 4 }}>
          {/* Header Title Section */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', color: '#f8fafc', letterSpacing: '-0.02em', fontSize: '1.25rem', lineHeight: 1.2 }}>
                Edit Task
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mt: 0.5, fontSize: '0.75rem' }}>
                Modify task attributes and deadline
              </Typography>
            </Box>
            <IconButton onClick={() => setEditingTask(null)} sx={{ color: '#cbd5e1', p: 0.5, '&:hover': { color: '#f8fafc', bgcolor: 'rgba(255,255,255,0.05)' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <form onSubmit={handleEditSubmit}>
            <Typography variant="body2" sx={{ color: '#e2e8f0', display: 'block', mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
              Title
            </Typography>
            <TextField
              fullWidth
              placeholder="Task title..."
              variant="outlined"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  background: '#0b0f19',
                  borderRadius: '10px',
                  '& fieldset': { borderColor: '#1c253d' },
                  '&:hover fieldset': { borderColor: '#2e3b5e' },
                  '&.Mui-focused fieldset': { borderColor: '#10b981' },
                },
                '& input': { py: 1.5, fontSize: '0.85rem', color: '#f8fafc' },
                '& input::placeholder': { color: '#64748b', opacity: 1 }
              }}
              required
            />

            <Typography variant="body2" sx={{ color: '#e2e8f0', display: 'block', mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
              Description
            </Typography>
            <TextField
              fullWidth
              placeholder="Task description details..."
              variant="outlined"
              multiline
              rows={4}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  background: '#0b0f19',
                  borderRadius: '10px',
                  '& fieldset': { borderColor: '#1c253d' },
                  '&:hover fieldset': { borderColor: '#2e3b5e' },
                  '&.Mui-focused fieldset': { borderColor: '#10b981' },
                },
                '& textarea': { fontSize: '0.85rem', color: '#f8fafc' },
                '& textarea::placeholder': { color: '#64748b', opacity: 1 }
              }}
            />

            <Typography variant="body2" sx={{ color: '#e2e8f0', display: 'block', mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
              Due Date
            </Typography>
            <TextField
              fullWidth
              type="date"
              variant="outlined"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  background: '#0b0f19',
                  borderRadius: '10px',
                  '& fieldset': { borderColor: '#1c253d' },
                  '&:hover fieldset': { borderColor: '#2e3b5e' },
                  '&.Mui-focused fieldset': { borderColor: '#10b981' },
                },
                '& input': { py: 1.5, fontSize: '0.85rem', color: '#f8fafc' }
              }}
            />

            <Typography variant="body2" sx={{ color: '#e2e8f0', display: 'block', mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
              Assign Employees
            </Typography>
            <FormControl fullWidth sx={{ mb: 4.5 }}>
              <Select
                multiple
                displayEmpty
                value={editAssignedUserIds}
                onChange={(e) => setEditAssignedUserIds(e.target.value)}
                input={
                  <OutlinedInput
                    sx={{
                      background: '#0b0f19',
                      borderRadius: '10px',
                      '& fieldset': { borderColor: '#1c253d' },
                      '&:hover fieldset': { borderColor: '#2e3b5e' },
                      '&.Mui-focused fieldset': { borderColor: '#10b981' },
                      '& .MuiSelect-select': { py: 1.5, fontSize: '0.85rem', color: '#f8fafc' }
                    }}
                  />
                }
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return <span style={{ color: '#64748b' }}>[Search/Select Employees...]</span>;
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
                    <Checkbox checked={editAssignedUserIds.indexOf(employee.id) > -1} size="small" />
                    <ListItemText primary={employee.name} primaryTypographyProps={{ fontSize: '0.85rem' }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setEditingTask(null)}
                sx={{ height: '44px' }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
                sx={{ height: '44px' }}
              >
                Save Changes
              </Button>
            </Box>
          </form>
        </Box>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
