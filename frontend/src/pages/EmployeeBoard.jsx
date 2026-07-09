import { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, IconButton, useMediaQuery, useTheme } from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import { updateTaskStatus } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';

const EmployeeBoard = () => {
  const { 
    user, 
    searchQuery, 
    addNotification,
    tasks,
    tasksLoading,
    refreshCache
  } = useAuth();

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  const loading = tasks.length === 0 && tasksLoading;
  const [refreshKey, setRefreshKey] = useState(0);
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleSection = (status) => {
    setCollapsedSections(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  useEffect(() => {
    if (user?.id) {
      refreshCache(false); // background refresh
    }
  }, [user, refreshKey, refreshCache]);

  const handleStatusChange = async (taskId, newStatus) => {
    const taskObj = tasks.find(t => t.id === taskId);
    const taskTitle = taskObj ? taskObj.title : 'Task';
    const statusLabels = {
      pending: 'To Do',
      in_progress: 'In Progress',
      completed: 'Completed'
    };
    const statusLabel = statusLabels[newStatus] || newStatus;

    try {
      await updateTaskStatus(taskId, newStatus);
      addNotification('Task Progress', `${user.name} moved task "${taskTitle}" to "${statusLabel}"`);
      refreshCache(false);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to transition task status', err);
    }
  };

  // 1. Process tasks matching search query
  const filteredTasks = tasks.filter((task) => {
    const query = searchQuery.toLowerCase();
    const matchesTitle = task.title.toLowerCase().includes(query);
    const matchesDescription = task.description ? task.description.toLowerCase().includes(query) : false;
    const matchesEmployee = task.users ? task.users.some((user) => user.name.toLowerCase().includes(query)) : false;
    const matchesId = `tsk-${task.id}`.includes(query) || `tsk${task.id}`.includes(query) || task.id.toString() === query;
    return matchesTitle || matchesDescription || matchesEmployee || matchesId;
  });

  const tasksByStatus = {
    pending: filteredTasks.filter((t) => t.status === 'pending'),
    in_progress: filteredTasks.filter((t) => t.status === 'in_progress'),
    completed: filteredTasks.filter((t) => t.status === 'completed'),
  };

  const empTotalTasks = filteredTasks.length;
  const empCompleted = filteredTasks.filter(t => t.status === 'completed').length;
  const empInProgress = filteredTasks.filter(t => t.status === 'in_progress').length;
  const empPending = filteredTasks.filter(t => t.status === 'pending').length;
  const empCompletionRate = empTotalTasks > 0 ? Math.round((empCompleted / empTotalTasks) * 100) : 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 1, sm: 2, md: 4 }, width: '100%' }}>
      <Typography variant="h5" sx={{ mb: { xs: 2, md: 4 }, fontWeight: 'bold', color: '#f8fafc' }}>
        Active Workload
      </Typography>

      {/* Workload Metrics Row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 2, md: 3 }, mb: { xs: 2, md: 4 } }}>
        {[
          { label: 'My Total Tasks', value: empTotalTasks, highlight: '#3b82f6' },
          { label: 'My Completion Rate', value: `${empCompletionRate}%`, highlight: '#10b981' },
          { label: 'My Active Workload', value: empInProgress, highlight: '#3b82f6' },
          { label: 'My Open Tasks', value: empPending, highlight: '#f59e0b' }
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

      {/* CSS Grid layout sharing equal width, aligned to the far left */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gap: { xs: 2, md: 3 },
          width: '100%',
          justifyContent: 'start',
        }}
      >
        {['pending', 'in_progress', 'completed'].map((status) => {
          const title =
            status === 'pending'
              ? 'To Do'
              : status === 'in_progress'
              ? 'In Progress'
              : 'Completed';
          const columnTasks = tasksByStatus[status] || [];
          const isCollapsed = collapsedSections[status];

          return (
            <Paper
              key={status}
              sx={{
                p: { xs: 1.5, sm: 2, md: 2.5 },
                background: '#131b2e', // Column background #131B2E
                border: '1px solid #1c253d',
                minHeight: { xs: 'auto', md: '600px' },
                maxHeight: { xs: 'auto', md: '600px' },
                maxWidth: { xs: 'none', md: '500px' },
                width: '100%',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
              }}
            >
              {/* Column Header */}
              <Box
                onClick={() => isMobile && toggleSection(status)}
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1.5, md: 3 }, width: '100%', flexShrink: 0, cursor: { xs: 'pointer', md: 'default' } }}
              >
                <Typography variant="h6" sx={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 700 }}>
                  {title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {isMobile && (
                    <IconButton size="small" sx={{ color: '#94a3b8', p: 0.5 }}>
                      {isCollapsed ? <ExpandMore /> : <ExpandLess />}
                    </IconButton>
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: '"Fira Code", monospace',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '12px',
                      background: '#1e293b',
                      color: '#cbd5e1',
                      fontWeight: 600,
                    }}
                  >
                    {columnTasks.length}
                  </Typography>
                </Box>
              </Box>

              {/* Task Cards List */}
              {columnTasks.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: { xs: '120px', md: '180px' }, 
                  width: '100%',
                  border: '1px dashed rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.01)',
                }}>
                  <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 600 }}>
                    No tasks assigned
                  </Typography>
                </Box>
              ) : (!isCollapsed || !isMobile) ? (
                  <Box 
                    sx={{ 
                      overflowY: { xs: 'visible', md: 'auto' }, 
                      flexGrow: 1, 
                      minHeight: 0,
                      height: { xs: 'auto', md: 0 },
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      p: { xs: 0.5, sm: 1, md: 1.5 },
                      pr: { xs: 0.5, sm: 1, md: 1 },
                      '&::-webkit-scrollbar': { width: '6px' }, 
                      '&::-webkit-scrollbar-thumb': { background: '#1e293b', borderRadius: '3px' } 
                    }}
                  >
                    {columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        isEmployeeView={true}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </Box>
                ) : null
              }
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

export default EmployeeBoard;
