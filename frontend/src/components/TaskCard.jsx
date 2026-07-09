import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip, Avatar, Tooltip, Button, AvatarGroup, IconButton, Drawer, Divider, TextField, CircularProgress, List, ListItem } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EditIcon from '@mui/icons-material/Edit';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';
import SynergyLogo from './SynergyLogo';
import { getComments, addComment } from '../services/apiService';

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

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (drawerOpen) {
      const fetchComments = async () => {
        setLoadingComments(true);
        try {
          const res = await getComments(task.id);
          setComments(res.data);
        } catch (err) {
          console.error('Failed to load comments', err);
        } finally {
          setLoadingComments(false);
        }
      };
      fetchComments();
    }
  }, [drawerOpen, task.id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await addComment(task.id, {
        user_id: currentUser.id,
        content: newComment
      });
      setComments((prev) => [...prev, res.data]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  const priorityStyles = {
    high: {
      bgcolor: 'rgba(239, 68, 68, 0.05)',
      color: '#ef4444',
      border: '1px solid rgba(239, 68, 68, 0.2)',
    },
    medium: {
      bgcolor: 'rgba(245, 158, 11, 0.05)',
      color: '#f59e0b',
      border: '1px solid rgba(245, 158, 11, 0.2)',
    },
    low: {
      bgcolor: 'rgba(59, 130, 246, 0.05)',
      color: '#3b82f6',
      border: '1px solid rgba(59, 130, 246, 0.2)',
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexGrow: 1, pr: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SynergyLogo size={14} sx={{ opacity: 0.85 }} />
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 'bold', fontFamily: '"Fira Code", monospace' }}>
                TSK-{task.id}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {isOverdue && (
              <Chip
                label="⚠️ Overdue"
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              />
            )}
            <Chip
              label={task.priority ? task.priority.toUpperCase() : 'MEDIUM'}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.7rem',
                borderRadius: '20px',
                px: 0.5,
                ...priorityStyles[task.priority || 'medium']
              }}
            />
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
            {/* Comments Icon Button Trigger */}
            <IconButton
              size="small"
              onClick={() => setDrawerOpen(true)}
              sx={{ color: '#cbd5e1', mr: 2, '&:hover': { color: '#10b981', bgcolor: 'rgba(255,255,255,0.05)' } }}
            >
              <ChatBubbleOutlineIcon sx={{ fontSize: '1.1rem' }} />
            </IconButton>

            {isEmployeeView && task.status !== 'completed' ? (
              <Box>
                {task.status === 'pending' && (
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={() => onStatusChange(task.id, 'in_progress')}
                    sx={{ py: 0.5, px: 2, fontSize: '0.75rem' }}
                  >
                    Start
                  </Button>
                )}
                {task.status === 'in_progress' && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => onStatusChange(task.id, 'completed')}
                    sx={{ py: 0.5, px: 2, fontSize: '0.75rem' }}
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

      {/* Comments & Task Details Slide-out Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: '420px' },
            background: '#090d16',
            borderLeft: '1px solid #141b2d',
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%'
          }
        }}
      >
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SynergyLogo size={20} />
              <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', color: '#f8fafc' }}>
                Task Details
              </Typography>
            </Box>
            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: '#94a3b8' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3, borderColor: '#141b2d' }} />

          {/* Details Body */}
          <Box sx={{ overflowY: 'auto', flexGrow: 1, pr: 1 }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: '"Fira Code", monospace', fontWeight: 'bold' }}>
              TSK-{task.id}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', mt: 0.5, mb: 2, fontFamily: '"Outfit", sans-serif' }}>
              {task.title}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              {isOverdue && <Chip label="⚠️ Overdue" color="error" size="small" />}
              <Chip label={task.priority ? task.priority.toUpperCase() : 'MEDIUM'} size="small" sx={{ ...priorityStyles[task.priority || 'medium'] }} />
              <Chip label={currentStatus.label} size="small" sx={{ bgcolor: currentStatus.bg, color: currentStatus.color }} />
            </Box>

            <Typography variant="body2" sx={{ color: '#cbd5e1', lineHeight: 1.6, mb: 4 }}>
              {task.description || 'No description provided.'}
            </Typography>

            <Divider sx={{ mb: 3, borderColor: '#141b2d' }} />

            {/* Comments Thread Section */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f8fafc', mb: 2, fontFamily: '"Outfit", sans-serif' }}>
              Comments & Updates
            </Typography>

            {loadingComments ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : comments.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#475569', fontStyle: 'italic', py: 2 }}>
                No updates or comments yet.
              </Typography>
            ) : (
              <List disablePadding>
                {comments.map((comment) => (
                  <ListItem
                    key={comment.id}
                    disablePadding
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 2,
                      mb: 2.5,
                      p: 1.5,
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.02)'
                    }}
                  >
                    <Avatar sx={{ bgcolor: '#3b82f6', width: 28, height: 28, fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {comment.user?.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#cbd5e1', fontSize: '0.8rem' }}>
                          {comment.user?.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.65rem' }}>
                          {new Date(comment.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#f8fafc', fontSize: '0.8rem', lineHeight: 1.5 }}>
                        {comment.content}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>

        {/* Post Comment Form */}
        <Box component="form" onSubmit={handleCommentSubmit} sx={{ pt: 2, borderTop: '1px solid #141b2d', background: '#090d16' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Post an update or comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.01)',
                '& fieldset': { borderColor: '#141b2d' },
                '&:hover fieldset': { borderColor: '#1e293b' },
              },
              input: { color: '#f8fafc', fontSize: '0.85rem' }
            }}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            disabled={!newComment.trim()}
            sx={{ height: '36px' }}
          >
            Post Comment
          </Button>
        </Box>
      </Drawer>
    </Card>

  );
};

export default TaskCard;
