import { useState, useEffect } from 'react';
import { Box, TextField, Button, MenuItem, Select, FormControl, OutlinedInput, Checkbox, ListItemText, Typography, CircularProgress, Chip, Dialog, Popover, Radio, RadioGroup, FormControlLabel, Pagination, IconButton, useMediaQuery, useTheme, Switch, LinearProgress, Menu } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import MailOutlineIcon from '@mui/icons-material/MailOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import { createTask, updateTask, createUser, adminUpdateEmployee } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';

const AdminDashboard = () => {
  const { 
    user, 
    tasks, 
    tasksLoading, 
    employees, 
    employeesLoading, 
    cachedUserId,
    refreshCache, 
    addNotification,
    searchQuery
  } = useAuth();

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  // Calculate dynamic loading state
  const loading = tasksLoading || employeesLoading || cachedUserId !== user?.id;
  console.log('[AdminDashboard] render: tasksLoading =', tasksLoading, 'employeesLoading =', employeesLoading, 'tasks.length =', tasks.length, 'employees.length =', employees.length, 'cachedUserId =', cachedUserId, 'user.id =', user?.id, 'loading =', loading);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedUserIds, setAssignedUserIds] = useState([]);
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
  
  // Add User States
  const [openAddUser, setOpenAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

  const [newUserRole, setNewUserRole] = useState('employee');
  const [addUserError, setAddUserError] = useState('');
  const [addingUser, setAddingUser] = useState(false);

  // Filter & Sort States
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest, alphabetical
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, in_progress, completed
  const [employeeFilter, setEmployeeFilter] = useState('all'); // all, or employee ID

  // Pagination State
  const [page, setPage] = useState(1);
  const itemsPerPage = 3; // Setting to 3 to easily demonstrate page switching

  // Our Team Panel States
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [skillPopoverAnchor, setSkillPopoverAnchor] = useState(null);
  const [selectedEmployeeForSkill, setSelectedEmployeeForSkill] = useState(null);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [dragOverEmpId, setDragOverEmpId] = useState(null);

  const handleToggleActive = async (emp) => {
    if (emp.is_active) {
      const confirmDeactivate = window.confirm(`Are you sure you want to deactivate ${emp.name}?`);
      if (!confirmDeactivate) return;
      try {
        await adminUpdateEmployee(emp.id, { is_active: false });
        addNotification('Employee Deactivated', `${emp.name} has been deactivated.`);
        refreshCache(true);
      } catch (err) {
        console.error('Failed to deactivate employee', err);
      }
    } else {
      handleReactivate(emp);
    }
  };

  const handleReactivate = async (emp) => {
    try {
      await adminUpdateEmployee(emp.id, { is_active: true });
      addNotification('Employee Reactivated', `${emp.name} is now active.`);
      refreshCache(true);
    } catch (err) {
      console.error('Failed to reactivate employee', err);
    }
  };

  const handleDeleteSkill = async (emp, skillToDelete) => {
    const updatedSkills = (emp.skills || []).filter(s => s !== skillToDelete);
    try {
      await adminUpdateEmployee(emp.id, { skills: updatedSkills });
      addNotification('Skills Updated', `Removed skill "${skillToDelete}" from ${emp.name}`);
      refreshCache(true);
    } catch (err) {
      console.error('Failed to delete skill', err);
    }
  };

  const handleAddSkillClick = (e, emp) => {
    setSkillPopoverAnchor(e.currentTarget);
    setSelectedEmployeeForSkill(emp);
    setNewSkillInput('');
  };

  const handleSkillPopoverClose = () => {
    setSkillPopoverAnchor(null);
    setSelectedEmployeeForSkill(null);
  };

  const handleAddSkillSubmit = async () => {
    if (!newSkillInput.trim() || !selectedEmployeeForSkill) return;
    const skillToAdd = newSkillInput.trim();
    const updatedSkills = [...(selectedEmployeeForSkill.skills || []), skillToAdd];
    try {
      await adminUpdateEmployee(selectedEmployeeForSkill.id, { skills: updatedSkills });
      addNotification('Skills Updated', `Added skill "${skillToAdd}" to ${selectedEmployeeForSkill.name}`);
      refreshCache(true);
      handleSkillPopoverClose();
    } catch (err) {
      console.error('Failed to add skill', err);
    }
  };

  const handleMenuOpen = (e, emp) => {
    setMenuAnchor(e.currentTarget);
    setSelectedEmployee(emp);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedEmployee(null);
  };

  const handleCommentOnTask = (taskId) => {
    const index = filteredTasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      const taskPage = Math.floor(index / itemsPerPage) + 1;
      setPage(taskPage);
      setTimeout(() => {
        const commentBtn = document.getElementById(`task-comment-btn-${taskId}`);
        if (commentBtn) {
          commentBtn.click();
        } else {
          console.warn(`Comment button task-comment-btn-${taskId} not found in DOM`);
        }
      }, 150);
    }
  };

  useEffect(() => {
    if (refreshKey > 0) {
      refreshCache(false); // background refresh
    }
  }, [refreshKey, refreshCache]);

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
      refreshCache(false);
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      setAddUserError('All fields are required.');
      return;
    }

    setAddUserError('');
    setAddingUser(true);

    try {
      await createUser({
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
      });

      addNotification('User Created', `Successfully added new employee!: "${newUserName}" (${newUserRole})`);
      refreshCache(true); // force cache refresh to get new user list

      // Reset Form
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('employee');
      setOpenAddUser(false);
    } catch (err) {
      console.error('Failed to create user', err);
      if (err.response && err.response.data && err.response.data.message) {
        setAddUserError(err.response.data.message);
      } else {
        setAddUserError('Failed to add new employee. Check your network or if the email is already registered.');
      }
    } finally {
      setAddingUser(false);
    }
  };

  const handleCancelAddUser = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('employee');
    setAddUserError('');
    setOpenAddUser(false);
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
      refreshCache(false);
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

  const totalTasksCount = filteredTasks.length;
  const completedCount = filteredTasks.filter(t => t.status === 'completed').length;
  const inProgressCount = filteredTasks.filter(t => t.status === 'in_progress').length;
  const pendingCount = filteredTasks.filter(t => t.status === 'pending').length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, md: 4 }, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', mb: 0.5, fontSize: { xs: '1.15rem', sm: '1.25rem', md: '1.5rem' } }}>
            Task Management Dashboard
          </Typography>
          <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.8rem' }}>
            Active Team Tasks ({filteredTasks.length})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 3 }, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, color: '#94a3b8' }}>
            <CalendarMonthIcon fontSize="small" />
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
              {formattedDate}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddUser(true)}
            sx={{ px: 2.5, py: 1, width: { xs: '100%', sm: 'auto' } }}
          >
            Add Employee
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{ px: 2.5, py: 1, width: { xs: '100%', sm: 'auto' } }}
          >
            Create Task
          </Button>
        </Box>
      </Box>

      {/* Workload Metrics Row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 2, md: 3 }, mb: { xs: 2, md: 4 } }}>
        {[
          { label: 'Total Active Tasks', value: totalTasksCount, highlight: '#3b82f6' },
          { label: 'Completion Rate', value: `${completionRate}%`, highlight: '#10b981' },
          { label: 'In Progress Queue', value: inProgressCount, highlight: '#3b82f6' },
          { label: 'Pending Assignment', value: pendingCount, highlight: '#f59e0b' }
        ].map((stat, idx) => (
          <Box
            key={idx}
            sx={{
              background: '#0e1424',
              border: '1px solid #1c253d',
              borderRadius: '12px',
              p: { xs: 1.5, sm: 2.5 },
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
            }}
          >
            <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 600, textTransform: 'uppercase' }}>
              {stat.label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', color: '#f8fafc' }}>
              {stat.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Two-Column Responsive Layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: { xs: 3, lg: 4 }, width: '100%', mb: 3 }}>
        {/* Left Column: Tasks */}
        <Box sx={{ minWidth: 0 }}>
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
              py: { xs: 8, md: 15 }, 
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

        {/* Right Column: "Our Team" Panel (Glassmorphic) */}
        <Box sx={{
          background: 'rgba(14, 20, 36, 0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid #1c253d',
          borderRadius: '16px',
          p: { xs: 2, md: 3 },
          height: 'fit-content',
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem', mb: 3 }}>
            Our Team
          </Typography>

          {employees.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              No employees registered.
            </Typography>
          ) : (
            employees.map((emp) => {
              const activeTasks = emp.tasks ? emp.tasks.filter(t => t.status === 'pending' || t.status === 'in_progress') : [];
              const activeCount = activeTasks.length;

              const pCount = emp.tasks ? emp.tasks.filter(t => t.status === 'pending').length : 0;
              const ipCount = emp.tasks ? emp.tasks.filter(t => t.status === 'in_progress').length : 0;
              const cCount = emp.tasks ? emp.tasks.filter(t => t.status === 'completed').length : 0;

              const statusMap = {
                active: { label: '🟢 Active', color: 'success' },
                ooo: { label: '🔴 On Leave (OOO)', color: 'error' },
                in_meetings: { label: '🟡 In Meetings', color: 'warning' },
                deep_work: { label: '🔵 Deep Work', color: 'primary' },
              };

              const getWorkloadLevel = (count) => {
                if (count <= 1) return { label: 'Low', color: '#10b981', value: 25 };
                if (count <= 3) return { label: 'Optimal', color: '#f59e0b', value: 65 };
                return { label: 'Overloaded', color: '#ef4444', value: 100 };
              };

              return (
                <Box
                  key={emp.id}
                  onDragOver={(e) => {
                    if (emp.is_active) {
                      e.preventDefault();
                      setDragOverEmpId(emp.id);
                    }
                  }}
                  onDragLeave={() => {
                    setDragOverEmpId(null);
                  }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setDragOverEmpId(null);
                    const taskId = e.dataTransfer.getData('text/plain');
                    if (!taskId) return;
                    
                    try {
                      await updateTask(Number(taskId), {
                        user_ids: [emp.id]
                      });
                      addNotification('Task Reassigned', `Task rebalanced and assigned to ${emp.name}`);
                      refreshCache(true);
                    } catch (err) {
                      console.error('Failed to rebalance task', err);
                    }
                  }}
                  sx={{
                    p: 2.5,
                    mb: 2.5,
                    background: dragOverEmpId === emp.id ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.01)',
                    border: dragOverEmpId === emp.id ? '1px dashed #10b981' : '1px solid rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    opacity: emp.is_active ? 1 : 0.55,
                    transition: 'all 0.2s ease',
                    '&:last-child': { mb: 0 }
                  }}
                >
                  {/* Top info and status switch */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ minWidth: 0, mr: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {emp.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {emp.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                      <Switch
                        size="small"
                        checked={Boolean(emp.is_active)}
                        onChange={() => handleToggleActive(emp)}
                        color="success"
                      />
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, emp)} sx={{ color: '#cbd5e1' }}>
                        <MoreVertIcon sx={{ fontSize: '1.2rem' }} />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Reactivate button if deactivated */}
                  {!emp.is_active && (
                    <Button
                      variant="outlined"
                      color="success"
                      size="small"
                      onClick={() => handleReactivate(emp)}
                      sx={{ mt: 0.5, mb: 1.5, py: 0.25, px: 1.5, fontSize: '0.7rem' }}
                    >
                      Reactivate
                    </Button>
                  )}

                  {/* Status and capacity indicators for active users */}
                  {emp.is_active && (
                    <>
                      <Box sx={{ mb: 1.5 }}>
                        <Chip
                          label={statusMap[emp.availability_status]?.label || '🟢 Active'}
                          size="small"
                          sx={{
                            background: 'rgba(255,255,255,0.03)',
                            color: '#cbd5e1',
                            border: '1px solid rgba(255,255,255,0.05)',
                            fontSize: '0.7rem',
                            height: '22px'
                          }}
                        />
                      </Box>

                      {/* Workload Capacity Meter */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.7rem' }}>
                            Workload Capacity
                          </Typography>
                          <Typography variant="caption" sx={{ color: getWorkloadLevel(activeCount).color, fontWeight: 'bold', fontSize: '0.7rem' }}>
                            {getWorkloadLevel(activeCount).label} ({activeCount} active)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={getWorkloadLevel(activeCount).value}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: 'rgba(255,255,255,0.05)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: getWorkloadLevel(activeCount).color,
                              borderRadius: 3
                            }
                          }}
                        />
                      </Box>
                    </>
                  )}

                  {/* Task counts */}
                  <Box sx={{ display: 'flex', gap: 1, mb: emp.is_active && ipCount > 0 ? 1.5 : 2, flexWrap: 'wrap' }}>
                    <Typography variant="caption" sx={{ background: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b', px: 1.25, py: 0.25, borderRadius: '4px', fontWeight: 700, fontFamily: '"Fira Code", monospace', fontSize: '0.65rem' }}>
                      P: {pCount}
                    </Typography>
                    <Typography variant="caption" sx={{ background: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6', px: 1.25, py: 0.25, borderRadius: '4px', fontWeight: 700, fontFamily: '"Fira Code", monospace', fontSize: '0.65rem' }}>
                      IP: {ipCount}
                    </Typography>
                    <Typography variant="caption" sx={{ background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', px: 1.25, py: 0.25, borderRadius: '4px', fontWeight: 700, fontFamily: '"Fira Code", monospace', fontSize: '0.65rem' }}>
                      C: {cCount}
                    </Typography>
                  </Box>

                  {/* Active Task Links */}
                  {emp.is_active && ipCount > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                        Active Tasks:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {emp.tasks.filter(t => t.status === 'in_progress').map((t) => (
                          <Typography
                            key={t.id}
                            variant="caption"
                            onClick={() => handleCommentOnTask(t.id)}
                            sx={{
                              color: '#3b82f6',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              '&:hover': { color: '#60a5fa' },
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: '0.7rem'
                            }}
                          >
                            {t.title}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Skills Management */}
                  <Box sx={{ mt: 1.5 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                      Skills
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                      {(emp.skills || []).map((skill, sIdx) => (
                        <Chip
                          key={sIdx}
                          label={skill}
                          size="small"
                          onDelete={() => handleDeleteSkill(emp, skill)}
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.03)',
                            color: '#cbd5e1',
                            fontSize: '0.65rem',
                            height: '20px',
                            '& .MuiChip-deleteIcon': {
                              color: '#ef4444',
                              fontSize: '0.8rem',
                              '&:hover': { color: '#f87171' }
                            }
                          }}
                        />
                      ))}
                      {emp.is_active && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleAddSkillClick(e, emp)}
                          sx={{ p: 0.25, color: '#10b981', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                        >
                          <AddIcon sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </Box>

      {/* Global Popovers and Menus for Our Team Panel */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            background: '#0e1424',
            border: '1px solid #1c253d',
            color: '#f8fafc',
            boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
          }
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedEmployee) {
              window.location.href = `mailto:${selectedEmployee.email}`;
            }
            handleMenuClose();
          }}
          sx={{ fontSize: '0.8rem', color: '#cbd5e1', '&:hover': { color: '#f8fafc', bgcolor: 'rgba(255,255,255,0.02)' } }}
        >
          <MailOutlineIcon sx={{ mr: 1, fontSize: '0.95rem' }} /> Send Email
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedEmployee?.tasks) {
              const activeTasks = selectedEmployee.tasks.filter(t => t.status === 'in_progress');
              if (activeTasks.length > 0) {
                handleCommentOnTask(activeTasks[0].id);
              } else if (selectedEmployee.tasks.length > 0) {
                handleCommentOnTask(selectedEmployee.tasks[0].id);
              } else {
                addNotification('No Tasks', `${selectedEmployee.name} has no tasks to comment on.`);
              }
            }
            handleMenuClose();
          }}
          sx={{ fontSize: '0.8rem', color: '#cbd5e1', '&:hover': { color: '#f8fafc', bgcolor: 'rgba(255,255,255,0.02)' } }}
        >
          <ChatBubbleOutlineIcon sx={{ mr: 1, fontSize: '0.95rem' }} /> Comment on Task
        </MenuItem>
      </Menu>

      <Popover
        open={Boolean(skillPopoverAnchor)}
        anchorEl={skillPopoverAnchor}
        onClose={handleSkillPopoverClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            background: '#0e1424',
            border: '1px solid #1c253d',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }
        }}
      >
        <Box sx={{ p: 1.5, display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Add skill..."
            value={newSkillInput}
            onChange={(e) => setNewSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddSkillSubmit();
              }
            }}
            autoFocus
            sx={{
              width: '120px',
              '& input': { py: 0.75, fontSize: '0.75rem', color: '#f8fafc' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#1c253d' },
                '&:hover fieldset': { borderColor: '#2e3b5e' },
                '&.Mui-focused fieldset': { borderColor: '#10b981' }
              }
            }}
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleAddSkillSubmit}
            sx={{ py: 0.5, px: 1, minWidth: 0, fontSize: '0.75rem', height: '32px' }}
          >
            Add
          </Button>
        </Box>
      </Popover>

      {/* FILTER & SORT DROPDOWN POPOVER */}
      <Popover
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: isMobile ? 'center' : 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: isMobile ? 'center' : 'right' }}
        PaperProps={{
          sx: {
            width: { xs: 'calc(100% - 32px)', sm: '280px' },
            maxWidth: { xs: 'calc(100% - 32px)', sm: '280px' },
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
        fullScreen={isMobile}
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
            borderRadius: { xs: 0, sm: '16px' },
            width: { xs: '100%', sm: '460px' },
            maxWidth: { xs: '100%', sm: '460px' },
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            m: { xs: 0, sm: 2 },
            height: { xs: '100%', sm: 'auto' },
          }
        }}
      >
        {/* Inner Wrapper Box to enforce padding boundaries */}
        <Box sx={{ p: { xs: 2, sm: 4 }, pt: { xs: 1, sm: 4 }, overflowY: 'auto', flexGrow: 1 }}>
          {/* Header Title Section */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: { xs: 2, sm: 4 } }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', color: '#f8fafc', letterSpacing: '-0.02em', fontSize: { xs: '1.1rem', sm: '1.25rem' }, lineHeight: 1.2 }}>
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
            <FormControl fullWidth sx={{ mb: { xs: 3, sm: 4.5 } }}>
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

            {/* Priority Select */}
            <FormControl fullWidth size="small" sx={{ mb: { xs: 2, sm: 3 } }}>
              <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1, fontWeight: 'bold' }}>
                Priority Level
              </Typography>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                sx={{
                  background: '#0b0f19',
                  color: '#f8fafc',
                  '& fieldset': { borderColor: '#1c253d' },
                }}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>

            {/* Bottom Actions */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, pb: { xs: 2, sm: 0 } }}>
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
        fullScreen={isMobile}
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
            borderRadius: { xs: 0, sm: '16px' },
            width: { xs: '100%', sm: '460px' },
            maxWidth: { xs: '100%', sm: '460px' },
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            m: { xs: 0, sm: 2 },
            height: { xs: '100%', sm: 'auto' },
          }
        }}
      >
        {/* Inner Wrapper Box to enforce padding boundaries */}
        <Box sx={{ p: { xs: 2, sm: 4 }, pt: { xs: 1, sm: 4 }, overflowY: 'auto', flexGrow: 1 }}>
          {/* Header Title Section */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: { xs: 2, sm: 4 } }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', color: '#f8fafc', letterSpacing: '-0.02em', fontSize: { xs: '1.1rem', sm: '1.25rem' }, lineHeight: 1.2 }}>
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
            <FormControl fullWidth sx={{ mb: { xs: 3, sm: 4.5 } }}>
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

            {/* Edit Priority Select */}
            <FormControl fullWidth size="small" sx={{ mb: { xs: 2, sm: 3 } }}>
              <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1, fontWeight: 'bold' }}>
                Priority Level
              </Typography>
              <Select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                sx={{
                  background: '#0b0f19',
                  color: '#f8fafc',
                  '& fieldset': { borderColor: '#1c253d' },
                }}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, pb: { xs: 2, sm: 0 } }}>
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

      {/* ADD USER MODAL */}
      <Dialog
        open={openAddUser}
        onClose={handleCancelAddUser}
        fullScreen={isMobile}
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
            borderRadius: { xs: 0, sm: '16px' },
            width: { xs: '100%', sm: '460px' },
            maxWidth: { xs: '100%', sm: '460px' },
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            m: { xs: 0, sm: 2 },
            height: { xs: '100%', sm: 'auto' },
          }
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 4 }, pt: { xs: 1, sm: 4 }, overflowY: 'auto', flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: { xs: 2, sm: 4 } }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', color: '#f8fafc', letterSpacing: '-0.02em', fontSize: { xs: '1.1rem', sm: '1.25rem' }, lineHeight: 1.2 }}>
                Add Employee
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mt: 0.5, fontSize: '0.75rem' }}>
                Create a new user profile and assign their system role
              </Typography>
            </Box>
            <IconButton onClick={handleCancelAddUser} sx={{ color: '#cbd5e1', p: 0.5, '&:hover': { color: '#f8fafc', bgcolor: 'rgba(255,255,255,0.05)' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <form onSubmit={handleCreateUser}>
            {addUserError && (
              <Box sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', p: 1.5, mb: 3 }}>
                <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600 }}>
                  {addUserError}
                </Typography>
              </Box>
            )}

            <Typography variant="body2" sx={{ color: '#e2e8f0', display: 'block', mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
              Full Name
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g. John Doe"
              variant="outlined"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
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
              Email Address
            </Typography>
            <TextField
              fullWidth
              type="email"
              placeholder="e.g. john@company.com"
              variant="outlined"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
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
              System Role
            </Typography>
            <FormControl fullWidth size="small" sx={{ mb: 4.5 }}>
              <Select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                sx={{
                  background: '#0b0f19',
                  color: '#f8fafc',
                  '& fieldset': { borderColor: '#1c253d' },
                  '&:hover fieldset': { borderColor: '#2e3b5e' },
                  '&.Mui-focused fieldset': { borderColor: '#10b981' },
                  '& .MuiSelect-select': { py: 1.5, fontSize: '0.85rem' }
                }}
              >
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, pb: { xs: 2, sm: 0 } }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleCancelAddUser}
                sx={{ height: '44px' }}
                disabled={addingUser}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
                sx={{ height: '44px' }}
                disabled={addingUser}
              >
                {addingUser ? <CircularProgress size={24} color="inherit" /> : 'Create User'}
              </Button>
            </Box>
          </form>
        </Box>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
