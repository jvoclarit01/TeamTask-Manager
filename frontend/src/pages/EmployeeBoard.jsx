import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getMyTasks, updateTaskStatus } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';

const EmployeeBoard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedColumns, setExpandedColumns] = useState({});

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

  const toggleColumn = (status) => {
    setExpandedColumns((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  const tasksByStatus = {
    pending: tasks.filter((t) => t.status === 'pending'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    completed: tasks.filter((t) => t.status === 'completed'),
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold' }}>
        My Work Board
      </Typography>

      <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
        {['pending', 'in_progress', 'completed'].map((status) => {
          const title =
            status === 'pending'
              ? 'To Do'
              : status === 'in_progress'
              ? 'In Progress'
              : 'Completed';
          const columnTasks = tasksByStatus[status] || [];
          const isExpanded = columnTasks.length > 0 || !!expandedColumns[status];

          return (
            <Grid item xs={12} md={4} key={status}>
              <Paper
                sx={{
                  p: 2.5,
                  background: 'rgba(15, 23, 42, 0.45)',
                  border: '1px solid #1e293b',
                  minHeight: isExpanded ? '400px' : 'auto',
                  maxHeight: isExpanded ? '600px' : 'auto',
                  maxWidth: '380px',
                  margin: '0 auto',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: isExpanded ? 3 : 0, flexShrink: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {columnTasks.length === 0 && (
                      <IconButton
                        onClick={() => toggleColumn(status)}
                        size="small"
                        sx={{
                          color: '#94a3b8',
                          p: 0.5,
                          mr: 0.5,
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                        }}
                      >
                        <ExpandMoreIcon fontSize="small" />
                      </IconButton>
                    )}
                    <Typography variant="h6" sx={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 700 }}>
                      {title}
                    </Typography>
                  </Box>
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

                {isExpanded && (
                  columnTasks.length === 0 ? (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: '180px', 
                      border: '1px dashed rgba(255,255,255,0.03)', 
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.01)',
                      flexShrink: 0,
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
                        pr: 0.5,
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
                  )
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
