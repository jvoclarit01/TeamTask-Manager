import { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { getMyTasks, updateTaskStatus } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';

const EmployeeBoard = () => {
  const { user, searchQuery } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    const loadMyTasks = async () => {
      if (!user?.id) return;
      try {
        const res = await getMyTasks(user.id);
        if (active) {
          setTasks(res.data);
        }
      } catch (err) {
        console.error('Failed to load employee tasks', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadMyTasks();
    return () => {
      active = false;
    };
  }, [user, refreshKey]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to transition task status', err);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const query = searchQuery.toLowerCase();
    const matchesTitle = task.title.toLowerCase().includes(query);
    const matchesDescription = task.description ? task.description.toLowerCase().includes(query) : false;
    const matchesEmployee = task.users ? task.users.some((user) => user.name.toLowerCase().includes(query)) : false;
    return matchesTitle || matchesDescription || matchesEmployee;
  });

  const tasksByStatus = {
    pending: filteredTasks.filter((t) => t.status === 'pending'),
    in_progress: filteredTasks.filter((t) => t.status === 'in_progress'),
    completed: filteredTasks.filter((t) => t.status === 'completed'),
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', color: '#f8fafc' }}>
        My Work Board
      </Typography>

      {/* CSS Grid layout sharing equal width, aligned to the far left */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gap: 3,
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

          return (
            <Paper
              key={status}
              sx={{
                p: 2.5,
                background: '#131b2e', // Column background #131B2E
                border: '1px solid #1c253d',
                minHeight: '600px',
                maxHeight: '600px', // Maximum height constraint
                maxWidth: '500px', // Maximum width constraint
                width: '100%',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch', // Ensure children stretch to fill full column width
              }}
            >
              {/* Column Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, width: '100%', flexShrink: 0 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 700 }}>
                  {title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Fira Code", monospace',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '12px',
                    background: '#1e293b',
                    color: '#94a3b8',
                    fontWeight: 600,
                  }}
                >
                  {columnTasks.length}
                </Typography>
              </Box>

              {/* Task Cards List (Flex container stretching items to full width) */}
              {columnTasks.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '180px', 
                  width: '100%',
                  border: '1px dashed rgba(255,255,255,0.03)', 
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.01)',
                }}>
                  <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                    No tasks assigned
                  </Typography>
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    overflowY: 'auto', 
                    flexGrow: 1, 
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch', // Ensure cards stretch to fill full box width
                    p: 1.5,                 // Padding on all sides
                    pr: 1,                  // Extra right padding for scrollbar
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
              )}
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

export default EmployeeBoard;
