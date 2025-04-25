// src/pages/tasks/TaskDetail.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Tooltip,
  Card,
  CardContent,
  CardMedia,
  Alert
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CompleteIcon,
  Assignment as TaskIcon,
  Person as PersonIcon,
  ArrowBack as BackIcon,
  MoreVert as MoreIcon,
  Home as HomeIcon,
  Autorenew as RepeatIcon,
  Star as PointsIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import TaskCompletionForm from '../../components/tasks/TaskCompletionForm';
import { taskService, homeService } from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';

/**
 * TaskDetail page displays detailed information about a specific task
 */
const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [home, setHome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    confirmAction: null
  });
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  
  // Fetch task details
  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        const { data } = await taskService.getTaskById(taskId);
        console.log("Fetched task details:", data);
        setTask(data);
        
        // Fetch home details
        if (data.home_id) {
          try {
            const homeData = await homeService.getHomeById(data.home_id);
            setHome(homeData.data);
          } catch (err) {
            console.error('Failed to fetch home details:', err);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch task details:', err);
        setError('Failed to load task details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTaskDetails();
  }, [taskId]);
  
  // Open menu
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  // Close menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle edit task
  const handleEditTask = () => {
    navigate(`/tasks/${taskId}/edit`);
    handleMenuClose();
  };
  
  // Handle delete task confirmation
  const handleDeleteTask = () => {
    setConfirmDialog({
      open: true,
      title: 'Delete Task',
      message: `Are you sure you want to delete "${task?.task_name}"? This action cannot be undone.`,
      confirmAction: deleteTask
    });
    handleMenuClose();
  };
  
  // Delete task
  const deleteTask = async () => {
    try {
      await taskService.deleteTask(taskId);
      navigate(`/homes/${task.home_id}`);
    } catch (error) {
      console.error('Failed to delete task:', error);
      setError('Failed to delete task. Please try again.');
    } finally {
      setConfirmDialog(prev => ({ ...prev, open: false }));
    }
  };
  
  // Handle claim task button click
  const handleClaimTaskClick = () => {
    setConfirmDialog({
      open: true,
      title: 'Claim Task',
      message: `Are you sure you want to claim "${task?.task_name}"? You will be responsible for completing this task.`,
      confirmAction: claimTask
    });
  };
  
  // Claim task
  const claimTask = async () => {
    try {
      console.log('Attempting to claim task:', taskId, 'for user:', user.user_id);
      
      // Use the assignTask method instead
      await taskService.claimTask(taskId, user.user_id);
      
      console.log('Task claimed successfully, refreshing data...');
      
      // Refresh task data
      const { data } = await taskService.getTaskById(taskId);
      setTask(data);
      setSuccessMessage('Task claimed successfully!');
      
      console.log('Task data refreshed:', data);
      
    } catch (error) {
      console.error('Failed to claim task:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
      
      setError('Failed to claim task. Please try again.');
    } finally {
      setConfirmDialog(prev => ({ ...prev, open: false }));
    }
  };
  
  // Handle complete task
  const handleCompleteTask = () => {
    setShowCompletionForm(true);
    setSuccessMessage(null);
  };
  
  // Handle task completion submission
  const handleTaskCompletionSubmit = async (completionData) => {
    try {
      console.log('Submitting task completion with data:', completionData);
      
      // Add task_id and user_id to the completion data
      const enhancedCompletionData = {
        ...completionData,
        task_id: taskId,
        completed_by: user.user_id
      };
      
      if (!enhancedCompletionData.assignment_id && task.assignment_id) {
        enhancedCompletionData.assignment_id = task.assignment_id;
      }
      
      console.log('Enhanced completion data:', enhancedCompletionData);
      
      // Call API to complete task
      await taskService.completeTask(enhancedCompletionData);
      
      // Refresh task data
      const { data } = await taskService.getTaskById(taskId);
      setTask(data);
      setShowCompletionForm(false);
      setSuccessMessage('Task completed successfully!');
      
      console.log('Task completed and data refreshed:', data);
    } catch (error) {
      console.error('Failed to complete task:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
      
      setError('Failed to complete task. Please try again.');
    }
  };
  
  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
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
  
  // Format repeat interval
  const formatRepeatInterval = (days) => {
    if (!days) return 'One-time task';
    
    if (days === 1) {
      return 'Daily';
    } else if (days === 7) {
      return 'Weekly';
    } else if (days === 14) {
      return 'Bi-weekly';
    } else if (days === 30 || days === 31) {
      return 'Monthly';
    } else {
      return `Every ${days} days`;
    }
  };
  
  // Check if current user is assigned to the task
  const isAssignedToCurrentUser = task?.assigned_user_id === user?.user_id;
  
  // Check if task is already completed
  const isTaskCompleted = task?.status === 'completed';
  
  // Create breadcrumbs
  const breadcrumbs = [
    { label: 'Homes', path: '/homes' },
    { label: home?.home_name || 'Home', path: `/homes/${task?.home_id}` },
    { label: 'Tasks', path: `/homes/${task?.home_id}/tasks` },
    { label: task?.task_name || 'Task Details' }
  ];
  
  // Create back button
  const backButton = (
    <Button
      startIcon={<BackIcon />}
      onClick={() => navigate(`/homes/${task?.home_id}`)}
    >
      Back to Home
    </Button>
  );
  
  if (loading) {
    return (
      <MainLayout>
        <LoadingIndicator message="Loading task details..." />
      </MainLayout>
    );
  }
  
  if (error && !task) {
    return (
      <MainLayout>
        <ErrorDisplay 
          error={error} 
          onRetry={() => window.location.reload()}
        />
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <PageHeader 
        title={task?.task_name || 'Task Details'} 
        breadcrumbs={breadcrumbs}
        actionButton={
          <Box>
            {backButton}
            <IconButton 
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <MoreIcon />
            </IconButton>
          </Box>
        }
      />
      
      {/* Success message */}
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}
      
      {/* Error message */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      {/* Task details card */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 0, 0.12)'
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <Chip 
                  label={task?.difficulty_level}
                  size="small"
                  color={getDifficultyColor(task?.difficulty_level)}
                  sx={{ mr: 1 }}
                />
                
                {task?.task_type === 'emergency' && (
                  <Chip 
                    label="Emergency"
                    size="small"
                    color="error"
                    sx={{ mr: 1 }}
                  />
                )}
                
                <Chip 
                  icon={<PointsIcon />}
                  label={`${task?.points} points`}
                  size="small"
                  color="secondary"
                />
              </Box>
              
              <Typography variant="body1" paragraph>
                {task?.description || 'No description provided.'}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={1}>
                  <HomeIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Home: {home?.home_name || 'Unknown'}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" mb={1}>
                  <TimeIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Created: {formatDate(task?.created_at)}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center">
                  <RepeatIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {formatRepeatInterval(task?.repeat_interval)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={1}>
                  <PersonIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Assigned to: {task?.assigned_user_name || 'Unassigned'}
                  </Typography>
                </Box>
                
                {task?.assigned_at && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <TimeIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Assigned: {formatDate(task?.assigned_at)}
                    </Typography>
                  </Box>
                )}
                
                {task?.status === 'completed' && task?.completed_at && (
                  <Box display="flex" alignItems="center">
                    <CompleteIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Completed: {formatDate(task?.completed_at)}
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%', 
                justifyContent: 'space-between'
              }}
            >
              <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  Task Status
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={isTaskCompleted ? 'Completed' : 'Pending'}
                    color={isTaskCompleted ? 'success' : 'warning'}
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                
                {!isTaskCompleted && task?.assigned_user_id && isAssignedToCurrentUser && (
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    startIcon={<CompleteIcon />}
                    onClick={handleCompleteTask}
                    sx={{ mb: 1 }}
                  >
                    Mark as Complete
                  </Button>
                )}
                
                {!isTaskCompleted && !task?.assigned_user_id && (
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<PersonIcon />}
                    onClick={handleClaimTaskClick}
                    sx={{ mb: 1 }}
                  >
                    Claim Task
                  </Button>
                )}
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEditTask}
                >
                  Edit Task
                </Button>
              </Box>
              
              {task?.assigned_user_id && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Assigned To
                  </Typography>
                  
                  <Box display="flex" alignItems="center">
                    <Avatar
                      alt={task.assigned_user_name}
                      src={task.assigned_user_avatar ? `/api/uploads/images/${task.assigned_user_avatar}` : ''}
                      sx={{ mr: 1 }}
                    >
                      {task.assigned_user_name?.charAt(0) || 'U'}
                    </Avatar>
                    
                    <Typography>
                      {task.assigned_user_name}
                      {isAssignedToCurrentUser && ' (You)'}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Completion evidence section */}
      {isTaskCompleted && task?.completion && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 2,
            border: '1px solid rgba(0, 0, 0, 0.12)'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Completion Evidence
          </Typography>
          
          <Grid container spacing={3}>
            {task.completion.before_image_url && (
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent sx={{ pb: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Before
                    </Typography>
                  </CardContent>
                  <CardMedia
                    component="img"
                    height="200"
                    image={`/api/uploads/images/${task.completion.before_image_url}`}
                    alt="Before task completion"
                    sx={{ objectFit: 'contain' }}
                  />
                </Card>
              </Grid>
            )}
            
            {task.completion.after_image_url && (
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent sx={{ pb: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      After
                    </Typography>
                  </CardContent>
                  <CardMedia
                    component="img"
                    height="200"
                    image={`/api/uploads/images/${task.completion.after_image_url}`}
                    alt="After task completion"
                    sx={{ objectFit: 'contain' }}
                  />
                </Card>
              </Grid>
            )}
          </Grid>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Completed by {task.completion.completed_by_name} on {formatDate(task.completion.completed_at)}
            </Typography>
          </Box>
        </Paper>
      )}
      
      {/* Task completion form */}
      {showCompletionForm && (
        <TaskCompletionForm 
          task={task}
          onSubmit={handleTaskCompletionSubmit}
          onCancel={() => setShowCompletionForm(false)}
        />
      )}
      
      {/* Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditTask}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit Task
        </MenuItem>
        
        <MenuItem onClick={handleDeleteTask} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete Task
        </MenuItem>
      </Menu>
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        onConfirm={confirmDialog.confirmAction}
        confirmLabel={confirmDialog.title === 'Delete Task' ? 'Delete' : 'Confirm'}
        confirmColor={confirmDialog.title === 'Delete Task' ? 'error' : 'primary'}
      />
    </MainLayout>
  );
};

export default TaskDetail;