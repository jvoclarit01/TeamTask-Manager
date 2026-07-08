import { Card, CardContent, Typography, Box, Chip, Avatar, Tooltip, Button } from '@mui/material';

const statusColors = {
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  in_progress: { label: 'In Progress', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  completed: { label: 'Completed', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
};

const TaskCard = ({ task, isEmployeeView, onStatusChange }) => {
  const currentStatus = statusColors[task.status] || { label: task.status, color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' };
  const hasDescription = !!task.description && task.description.trim() !== '';

  // Calculate mock deadline based on created date + 7 days
  const createdDate = task.created_at ? new Date(task.created_at) : new Date();
  const deadlineDate = new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Card 
      sx={{ 
        mb: 2, 
        background: '#0e1424', 
        border: '1px solid #1c253d',
        borderRadius: '12px',
        boxShadow: 'none',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'rgba(59, 130, 246, 0.3)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        {/* Top Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexGrow: 1, pr: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#f8fafc' }}>
              {task.title}
            </Typography>
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
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3, lineHeight: 1.6, fontSize: '0.85rem' }}>
            {task.description}
          </Typography>
        )}

        {/* Footer Area */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: hasDescription ? 0 : 2 }}>
          {/* Assigned Avatars List with Names */}
          <Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {task.users?.map((userObj) => (
                <Box key={userObj.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 48 }}>
                  <Tooltip title={userObj.name} arrow>
                    <Avatar 
                      sx={{ 
                        width: 28, 
                        height: 28, 
                        bgcolor: '#3b82f6', 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold',
                        mb: 0.5 
                      }}
                    >
                      {userObj.name.charAt(0)}
                    </Avatar>
                  </Tooltip>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {userObj.name.split(' ')[0]}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right Side: Action Buttons for Employees or Deadline */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
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
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 0.5, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  Deadline
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.8rem' }}>
                  {formattedDeadline}
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
