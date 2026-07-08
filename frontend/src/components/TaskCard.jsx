import { Card, CardContent, Typography, Box, Chip, Avatar, Tooltip, Button, AvatarGroup, IconButton } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  in_progress: { label: 'In Progress', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  completed: { label: 'Completed', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
};

const TaskCard = ({ task, isEmployeeView, onStatusChange, onEditClick }) => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const currentStatus = statusColors[task.status] || { label: task.status, color: '#cbd5e1', bg: 'rgba(203, 213, 225, 0.1)' };
  const hasDescription = !!task.description && task.description.trim() !== '';

  const formattedDeadline = task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : 'No deadline';

  return (
    <Card 
      sx={{ 
        mb: 2, 
        background: '#1e293b', // Elevated task cards #1E293B
        border: '1px solid #2e3b5e',
        borderRadius: '16px', // rounded-xl
        boxShadow: 'none',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'rgba(16, 185, 129, 0.3)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}> {/* generous 24px padding */}
        {/* Top Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexGrow: 1, pr: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#f8fafc' }}>
              {task.title}
            </Typography>
            {isAdmin && onEditClick && (
              <IconButton 
                size="small" 
                onClick={() => onEditClick(task)} 
                sx={{ color: '#cbd5e1', ml: 0.5, p: 0.5, '&:hover': { color: '#10b981', bgcolor: 'rgba(255,255,255,0.05)' } }}
              >
                <EditIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            )}
          </Box>
          <Chip
            label={currentStatus.label}
            size="small"
            sx={{
              bgcolor: currentStatus.bg,
              color: currentStatus.color,
              fontWeight: 600,
              fontSize: '0.75rem',
              borderRadius: '20px',
              border: 'none',
              px: 1,
              flexShrink: 0
            }}
          />
        </Box>

        {/* Description (Always fully visible) */}
        {hasDescription && (
          <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 3, lineHeight: 1.6, fontSize: '0.85rem' }}>
            {task.description}
          </Typography>
        )}

        {/* Footer Area */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: hasDescription ? 0 : 2 }}>
          {/* Overlapping Avatar Stack (Bottom-Left) */}
          <AvatarGroup
            max={3}
            sx={{
              '& .MuiAvatar-root': {
                width: 28,
                height: 28,
                fontSize: '0.75rem',
                border: '2px solid #1e293b', // matches card background
                bgcolor: '#3b82f6',
                fontWeight: 'bold',
                marginLeft: '-6px !important',
              },
            }}
          >
            {task.users?.map((userObj) => (
              <Tooltip key={userObj.id} title={userObj.name} arrow>
                <Avatar>{userObj.name.charAt(0)}</Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>

          {/* Right Side: Action Buttons for Employees or Deadline */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isEmployeeView && task.status !== 'completed' ? (
              <Box>
                {task.status === 'pending' && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => onStatusChange(task.id, 'in_progress')}
                    sx={{
                      py: 0.5,
                      px: 2,
                      fontSize: '0.75rem',
                      bgcolor: '#3b82f6',
                      color: '#fff',
                      textTransform: 'none',
                      fontWeight: 'bold',
                      borderRadius: '8px',
                      '&:hover': { bgcolor: '#2563eb' }
                    }}
                  >
                    Start
                  </Button>
                )}
                {task.status === 'in_progress' && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => onStatusChange(task.id, 'completed')}
                    sx={{
                      py: 0.5,
                      px: 2,
                      fontSize: '0.75rem',
                      bgcolor: '#10b981',
                      color: '#fff',
                      textTransform: 'none',
                      fontWeight: 'bold',
                      borderRadius: '8px',
                      '&:hover': { bgcolor: '#059669' }
                    }}
                  >
                    Complete
                  </Button>
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#cbd5e1' }}>
                <CalendarMonthIcon sx={{ fontSize: '0.95rem', color: '#94a3b8' }} />
                <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.8rem' }}>
                  Deadline: {formattedDeadline}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
