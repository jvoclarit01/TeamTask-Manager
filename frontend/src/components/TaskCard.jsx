import { useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, AvatarGroup, Avatar, Tooltip, IconButton, Collapse } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const statusColors = {
  pending: { label: 'Pending', color: 'warning' },
  in_progress: { label: 'In Progress', color: 'info' },
  completed: { label: 'Completed', color: 'success' },
};

const TaskCard = ({ task, isEmployeeView, onStatusChange }) => {
  const [expanded, setExpanded] = useState(false);
  const currentStatus = statusColors[task.status] || { label: task.status, color: 'default' };
  const hasDescription = !!task.description && task.description.trim() !== '';

  return (
    <Card sx={{ mb: 2.5 }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexGrow: 1, pr: 1 }}>
            {hasDescription && (
              <IconButton
                onClick={() => setExpanded(!expanded)}
                size="small"
                sx={{
                  color: '#94a3b8',
                  p: 0.5,
                  mr: 0.5,
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              >
                <ExpandMoreIcon fontSize="small" />
              </IconButton>
            )}
            <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1.3, color: '#f8fafc' }}>
              {task.title}
            </Typography>
          </Box>
          <Chip
            label={currentStatus.label}
            color={currentStatus.color}
            size="small"
            variant="outlined"
            sx={{ fontFamily: '"Fira Code", monospace', fontWeight: 600, fontSize: '0.7rem', flexShrink: 0 }}
          />
        </Box>

        {hasDescription && (
          <Collapse in={expanded} timeout="auto" unmountOnExit sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.5, pt: 0.5 }}>
              {task.description}
            </Typography>
          </Collapse>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: hasDescription && expanded ? 0 : 1 }}>
          {/* Assigned Avatars */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ mr: 1, color: '#64748b', fontWeight: 500 }}>
              Assigned:
            </Typography>
            <AvatarGroup
              max={3}
              sx={{
                '& .MuiAvatar-root': {
                  width: 24,
                  height: 24,
                  fontSize: '0.7rem',
                  border: '2px solid #0f172a',
                  bgcolor: '#3b82f6',
                  fontFamily: '"Fira Code", monospace',
                },
              }}
            >
              {task.users?.map((userObj) => (
                <Tooltip key={userObj.id} title={userObj.name} arrow>
                  <Avatar>{userObj.name.charAt(0)}</Avatar>
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
                  sx={{ py: 0.5, px: 1.5, fontSize: '0.75rem' }}
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
                  sx={{ py: 0.5, px: 1.5, fontSize: '0.75rem' }}
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
