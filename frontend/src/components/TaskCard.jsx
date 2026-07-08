import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, AvatarGroup, Avatar, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const statusColors = {
  pending: { label: 'Pending', color: 'warning' },
  in_progress: { label: 'In Progress', color: 'info' },
  completed: { label: 'Completed', color: 'success' },
};

const TaskCard = ({ task, isEmployeeView, onStatusChange }) => {
  const currentStatus = statusColors[task.status] || { label: task.status, color: 'default' };

  return (
    <Card 
      sx={{ 
        mb: 2, 
        background: '#0f172a', // Slate 900 (as per dark theme specs)
        border: '1px solid #1e293b', // Slate 800 border
        color: '#f8fafc', // Slate 50 foreground
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: '#334155', // Slate 700
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 10px rgba(34, 197, 94, 0.1)', // Subtle accent glow
        }
      }}
    >
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography 
            variant="h6" 
            fontWeight="600" 
            sx={{ 
              fontFamily: '"Fira Sans", sans-serif',
              fontSize: '1.1rem',
              lineHeight: 1.3
            }}
          >
            {task.title}
          </Typography>
          <Chip 
            label={currentStatus.label} 
            color={currentStatus.color} 
            size="small" 
            variant="outlined" 
            sx={{ 
              fontFamily: '"Fira Code", monospace', 
              fontWeight: 500,
              fontSize: '0.75rem' 
            }}
          />
        </Box>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#94a3b8', // Slate 400
            fontFamily: '"Fira Sans", sans-serif',
            mb: 2.5,
            minHeight: '40px',
            lineHeight: 1.5
          }}
        >
          {task.description || 'No description provided.'}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Assigned Employees */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="caption" 
              sx={{ 
                mr: 1, 
                color: '#64748b', // Slate 500
                fontFamily: '"Fira Sans", sans-serif'
              }}
            >
              Assigned:
            </Typography>
            <AvatarGroup 
              max={4}
              sx={{
                '& .MuiAvatar-root': {
                  width: 26,
                  height: 26,
                  fontSize: '0.75rem',
                  border: '2px solid #0f172a',
                  fontFamily: '"Fira Code", monospace',
                }
              }}
            >
              {task.users?.map((user) => (
                <Tooltip key={user.id} title={user.name} arrow>
                  <Avatar sx={{ bgcolor: '#3b82f6' }}>
                    {user.name.charAt(0)}
                  </Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
          </Box>

          {/* Action Buttons for Employees */}
          {isEmployeeView && task.status !== 'completed' && (
            <Box>
              {task.status === 'pending' && (
                <Button
                  variant="contained"
                  color="info"
                  size="small"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => onStatusChange(task.id, 'in_progress')}
                  sx={{
                    fontFamily: '"Fira Sans", sans-serif',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '6px',
                    px: 1.5,
                    height: '30px',
                  }}
                >
                  Start
                </Button>
              )}
              {task.status === 'in_progress' && (
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => onStatusChange(task.id, 'completed')}
                  sx={{
                    fontFamily: '"Fira Sans", sans-serif',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '6px',
                    px: 1.5,
                    height: '30px',
                    bgcolor: '#22c55e', // Accent green
                    '&:hover': {
                      bgcolor: '#16a34a',
                    }
                  }}
                >
                  Complete
                </Button>
              )}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
