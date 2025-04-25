// src/components/tasks/TaskCard.js
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Box, 
  Chip, 
  IconButton, 
  Avatar, 
  Tooltip,
  Button
} from '@mui/material';
import { 
  AccessTime as ClockIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CompleteIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * TaskCard component displays a task in a card format
 */
const TaskCard = ({ 
  task, 
  onComplete, 
  onEdit, 
  onDelete, 
  onAssign,
  showActions = true
}) => {
  const navigate = useNavigate();
  
  // Determine task difficulty color
  const getDifficultyColor = (level) => {
    switch(level) {
      case 'Easy':
        return 'success';
      case 'Medium':
        return 'primary';
      case 'Hard':
        return 'error';
      default:
        return 'primary';
    }
  };
  
  // Format date to relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  const handleCardClick = () => {
    navigate(`/tasks/${task.task_id}`);
  };
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)'
        }
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="h6" component="h2" gutterBottom>
            {task.task_name}
          </Typography>
          
          <Chip 
            label={`${task.points} pts`}
            size="small"
            color="secondary"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        
        <Box display="flex" alignItems="center" mb={1}>
          <Chip 
            label={task.difficulty_level}
            size="small"
            color={getDifficultyColor(task.difficulty_level)}
            sx={{ mr: 1 }}
          />
          
          {task.task_type === 'emergency' && (
            <Chip 
              icon={<FlagIcon />}
              label="Emergency"
              size="small"
              color="error"
            />
          )}
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {task.description || 'No description'}
        </Typography>
        
        {task.assigned_user_id && (
          <Box display="flex" alignItems="center" mb={1}>
            <Typography variant="body2" color="text.secondary" mr={1}>
              Assigned to:
            </Typography>
            <Avatar 
              sx={{ width: 24, height: 24, mr: 1 }}
              alt={task.assigned_user_name || ''}
              src={task.assigned_user_avatar ? `/api/uploads/images/${task.assigned_user_avatar}` : ''}
            >
              {task.assigned_user_name ? task.assigned_user_name.charAt(0) : 'U'}
            </Avatar>
            <Typography variant="body2" fontWeight="medium">
              {task.assigned_user_name || 'Unknown'}
            </Typography>
          </Box>
        )}
        
        <Box display="flex" alignItems="center">
          <ClockIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            {formatRelativeTime(task.created_at)}
          </Typography>
        </Box>
      </CardContent>
      
      {showActions && (
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Box display="flex" justifyContent="space-between" width="100%">
            <Box>
              {onEdit && (
                <Tooltip title="Edit task">
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(task);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              
              {onDelete && (
                <Tooltip title="Delete task">
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(task);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            
            <Box>
              {!task.assigned_user_id && onAssign && (
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssign(task);
                  }}
                >
                  Claim
                </Button>
              )}
              
              {task.assigned_user_id && task.status !== 'completed' && onComplete && (
                <Button 
                  size="small" 
                  variant="contained"
                  color="success"
                  startIcon={<CompleteIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete(task);
                  }}
                >
                  Complete
                </Button>
              )}
            </Box>
          </Box>
        </CardActions>
      )}
    </Card>
  );
};

export default TaskCard;
