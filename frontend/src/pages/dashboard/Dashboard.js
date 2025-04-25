// src/pages/dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
  Divider,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Home as HomeIcon,
  Task as TaskIcon,
  Person as PersonIcon,
  EmojiEvents as LeaderboardIcon,
  AccessTime as TimeIcon,
  CheckCircle as CompleteIcon,
  Star as DifficultyIcon,
  History as HistoryIcon,
  Flag as ClaimIcon,
  Warning as WarningIcon,
  DateRange as DateIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import TaskCard from '../../components/tasks/TaskCard';
import TaskCompletionForm from '../../components/tasks/TaskCompletionForm';
import { homeService, taskService, leaderboardService } from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import { EmptyState } from '../../components/common/EmptyState';
import TaskCompletionStats from '../../components/leaderboard/TaskCompletionStats';

/**
 * Dashboard page displays tasks grouped by home and shows assigned tasks with due dates
 * and priority levels to promote transparency and gamification
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [homes, setHomes] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [unassignedTasks, setUnassignedTasks] = useState([]);
  const [groupedUnassignedTasks, setGroupedUnassignedTasks] = useState({});
  const [homeTaskCounts, setHomeTaskCounts] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState({
    homes: true,
    assignedTasks: true,
    unassignedTasks: true,
    stats: true
  });
  const [error, setError] = useState({
    homes: null,
    assignedTasks: null,
    unassignedTasks: null,
    stats: null
  });
  const [activeTab, setActiveTab] = useState(0);
  const [taskActionLoading, setTaskActionLoading] = useState(null);
  
  // Task completion dialog state
  const [completionDialog, setCompletionDialog] = useState({
    open: false,
    task: null
  });
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    task: null,
    title: '',
    message: ''
  });
  
  // Fetch homes
  useEffect(() => {
    const fetchHomes = async () => {
      try {
        setLoading(prev => ({ ...prev, homes: true }));
        console.log("Fetching homes...");
        const { data } = await homeService.getHomes();
        console.log("Fetched homes:", data);
        
        // Process homes with task counts and member counts
        const processedHomes = await Promise.all(data.map(async (home) => {
          // Get task count if not available
          let taskCount = home.task_count;
          let memberCount = home.members?.length || home.member_count || 0;

          // If user is admin but member count is 0, ensure it's at least 1
          if (home.is_admin && memberCount === 0) {
            memberCount = 1;
          }

          // Fetch task count if needed
          if (taskCount === undefined || taskCount === null) {
            try {
              console.log(`Fetching tasks for home ${home.home_id}: ${home.home_name}`);
              const tasksResponse = await taskService.getHomeTasks(home.home_id);
              taskCount = tasksResponse.data.length;
              console.log(`Home ${home.home_id} has ${taskCount} tasks total`);
            } catch (err) {
              console.error(`Failed to fetch tasks for home ${home.home_id}:`, err);
              taskCount = 0;
            }
          }

          // Store task count for this home
          setHomeTaskCounts(prev => ({
            ...prev,
            [home.home_id]: taskCount
          }));

          return {
            ...home,
            member_count: memberCount,
            task_count: taskCount
          };
        }));

        setHomes(processedHomes);
        setError(prev => ({ ...prev, homes: null }));
      } catch (err) {
        console.error('Failed to fetch homes:', err);
        setError(prev => ({ 
          ...prev, 
          homes: 'Failed to load homes. Please try again.' 
        }));
      } finally {
        setLoading(prev => ({ ...prev, homes: false }));
      }
    };
    
    fetchHomes();
  }, []);
  
  // Fetch assigned tasks with detailed info
  useEffect(() => {
    const fetchAssignedTasks = async () => {
      try {
        setLoading(prev => ({ ...prev, assignedTasks: true }));
        console.log("Fetching assigned tasks...");
        const { data } = await taskService.getAssignedTasks();
        console.log("Raw assigned tasks:", data);
        
        // Fix: Ensure all tasks have status field, defaulting to 'pending' if missing
        const enhancedTasks = data.map(task => {
          let homeName = task.home_name;
          
          // If home name is missing, fetch it from homes data
          if (!homeName && task.home_id) {
            const home = homes.find(h => h.home_id === task.home_id);
            if (home) {
              homeName = home.home_name;
            }
          }
          
          // Calculate days until due (if due date exists)
          let dueStatus = null;
          if (task.due_date) {
            const now = new Date();
            const dueDate = new Date(task.due_date);
            const diffTime = dueDate - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) {
              dueStatus = 'overdue';
            } else if (diffDays === 0) {
              dueStatus = 'today';
            } else if (diffDays === 1) {
              dueStatus = 'tomorrow';
            } else if (diffDays <= 3) {
              dueStatus = 'soon';
            }
          }
          
          // Fix: Default task status to 'pending' if missing
          return {
            ...task,
            home_name: homeName,
            due_status: dueStatus,
            status: task.status || 'pending'
          };
        });
        
        console.log("Enhanced assigned tasks:", enhancedTasks);
        console.log("Tasks with pending status:", enhancedTasks.filter(t => t.status === 'pending'));
        
        // Sort assigned tasks by priority and due date
        enhancedTasks.sort((a, b) => {
          // First by emergency status
          if (a.task_type === 'emergency' && b.task_type !== 'emergency') return -1;
          if (a.task_type !== 'emergency' && b.task_type === 'emergency') return 1;
          
          // Then by due status
          const dueOrder = { 'overdue': 0, 'today': 1, 'tomorrow': 2, 'soon': 3, null: 4 };
          return (dueOrder[a.due_status] || 4) - (dueOrder[b.due_status] || 4);
        });
        
        setAssignedTasks(enhancedTasks);
        setError(prev => ({ ...prev, assignedTasks: null }));
      } catch (err) {
        console.error('Failed to fetch assigned tasks:', err);
        setError(prev => ({ 
          ...prev, 
          assignedTasks: 'Failed to load your assigned tasks. Please try again.' 
        }));
      } finally {
        setLoading(prev => ({ ...prev, assignedTasks: false }));
      }
    };
    
    fetchAssignedTasks();
  }, [homes]);
  
  // Fetch unassigned tasks from all homes and group them
  useEffect(() => {
    const fetchUnassignedTasks = async () => {
      if (homes.length === 0) return;
      
      try {
        setLoading(prev => ({ ...prev, unassignedTasks: true }));
        
        // Fetch unassigned tasks for each home and merge them
        const allUnassignedTasks = [];
        const groupedTasks = {};
        
        for (const home of homes) {
          try {
            console.log(`Fetching unclaimed tasks for home ${home.home_id}: ${home.home_name}`);
            const { data } = await taskService.getUnclaimedTasks(home.home_id);
            console.log(`Found ${data.length} unclaimed tasks for home ${home.home_id}:`, data);
            
            // Add home information to each task
            const tasksWithHome = data.map(task => ({
              ...task,
              home_name: home.home_name,
              home_id: home.home_id
            }));
            allUnassignedTasks.push(...tasksWithHome);
            
            // Group tasks by home
            if (tasksWithHome.length > 0) {
              groupedTasks[home.home_id] = {
                home_id: home.home_id,
                home_name: home.home_name,
                tasks: tasksWithHome
              };
            }
          } catch (err) {
            console.error(`Failed to fetch unassigned tasks for home ${home.home_id}:`, err);
          }
        }
        
        console.log(`Total unclaimed tasks found: ${allUnassignedTasks.length}`);
        console.log("Unclaimed tasks:", allUnassignedTasks);
        setUnassignedTasks(allUnassignedTasks);
        setGroupedUnassignedTasks(groupedTasks);
        setError(prev => ({ ...prev, unassignedTasks: null }));
      } catch (err) {
        console.error('Failed to fetch unassigned tasks:', err);
        setError(prev => ({ 
          ...prev, 
          unassignedTasks: 'Failed to load unassigned tasks. Please try again.' 
        }));
      } finally {
        setLoading(prev => ({ ...prev, unassignedTasks: false }));
      }
    };
    
    fetchUnassignedTasks();
  }, [homes]);
  
  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(prev => ({ ...prev, stats: true }));
        const { data } = await leaderboardService.getUserStats();
        setStats(data);
        setError(prev => ({ ...prev, stats: null }));
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError(prev => ({ 
          ...prev, 
          stats: 'Failed to load statistics. Please try again.' 
        }));
      } finally {
        setLoading(prev => ({ ...prev, stats: false }));
      }
    };
    
    fetchStats();
  }, []);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Open task completion dialog
  const handleOpenCompletionForm = (task) => {
    setCompletionDialog({
      open: true,
      task: task
    });
  };
  
  // Close task completion dialog
  const handleCloseCompletionForm = () => {
    setCompletionDialog({
      open: false,
      task: null
    });
  };
  
  // Handle task completion form submission
  const handleTaskCompletionSubmit = async (completionData) => {
    try {
      await taskService.completeTask(completionData);
      
      // Remove completed task from assigned tasks
      setAssignedTasks(prev => 
        prev.filter(task => task.task_id !== completionDialog.task.task_id)
      );
      
      // Refresh user stats
      const statsResponse = await leaderboardService.getUserStats();
      setStats(statsResponse.data);
      
      // Close the form
      handleCloseCompletionForm();
      
      // Show success confirmation
      setConfirmDialog({
        open: true,
        title: 'Task Completed',
        message: `You've earned ${completionDialog.task.points || 10} points for completing "${completionDialog.task.task_name}"!`,
        task: null
      });
    } catch (error) {
      console.error('Failed to complete task:', error);
      alert('Failed to complete task. Please try again.');
    }
  };
  
  // Handle quick task completion (without photo evidence)
  const handleTaskCompletion = (task) => {
    setConfirmDialog({
      open: true,
      title: 'Complete Task',
      message: `Are you sure you want to complete "${task.task_name}"? This will earn you ${task.points || 10} points!`,
      task: task
    });
  };
  
  // Confirm quick task completion
  const confirmTaskCompletion = async () => {
    const task = confirmDialog.task;
    if (!task) return;
    
    setTaskActionLoading(task.task_id);
    
    try {
      // Call API to complete the task without images
      await taskService.completeTask({
        task_id: task.task_id,
        assignment_id: task.assignment_id
      });
      
      // Remove from assigned tasks
      setAssignedTasks(prev => prev.filter(t => t.task_id !== task.task_id));
      
      // Close confirmation dialog
      setConfirmDialog({
        open: true,
        title: 'Task Completed',
        message: `You've earned ${task.points || 10} points for completing "${task.task_name}"!`,
        task: null
      });
      
      // Refresh user stats
      const statsResponse = await leaderboardService.getUserStats();
      setStats(statsResponse.data);
    } catch (err) {
      console.error('Failed to complete task:', err);
      alert('Failed to complete task. Please try again.');
      
      // Close confirmation dialog
      setConfirmDialog({
        open: false,
        title: '',
        message: '',
        task: null
      });
    } finally {
      setTaskActionLoading(null);
    }
  };
  
  // Close confirmation dialog
  const handleCloseConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      title: '',
      message: '',
      task: null
    });
  };
  
  // Handle task detail view
  const handleTaskDetail = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };
  
  // Handle claim task
  const handleClaimTask = async (taskId) => {
    setTaskActionLoading(taskId);
    
    try {
      console.log(`Claiming task ${taskId} for user ${user.user_id}`);
      
      // Call API to assign task to current user
      await taskService.assignTask({
        task_id: taskId,
        assigned_user_id: user.user_id
      });
      
      console.log(`Successfully claimed task ${taskId}`);
      
      // Update task lists
      const claimedTask = unassignedTasks.find(task => task.task_id === taskId);
      
      if (claimedTask) {
        console.log("Moving task from unassigned to assigned:", claimedTask);
        
        // Remove from unassigned tasks
        setUnassignedTasks(prev => prev.filter(task => task.task_id !== taskId));
        
        // Update grouped unassigned tasks
        const homeId = claimedTask.home_id;
        setGroupedUnassignedTasks(prev => {
          const updatedGroups = { ...prev };
          if (updatedGroups[homeId]) {
            updatedGroups[homeId].tasks = updatedGroups[homeId].tasks.filter(
              task => task.task_id !== taskId
            );
            
            // Remove home group if no tasks left
            if (updatedGroups[homeId].tasks.length === 0) {
              delete updatedGroups[homeId];
            }
          }
          return updatedGroups;
        });
        
        // Add to assigned tasks with user information
        setAssignedTasks(prev => [...prev, {
          ...claimedTask,
          assigned_user_id: user.user_id,
          assigned_user_name: user.name,
          status: 'pending' // Ensure status is set to pending
        }]);
      }
    } catch (err) {
      console.error('Failed to claim task:', err);
      // Show error message
      alert('Failed to claim task. Please try again.');
    } finally {
      setTaskActionLoading(null);
    }
  };
  
  // Create action buttons for header
  const createHomeButton = (
    <Button
      variant="contained"
      color="primary"
      startIcon={<AddIcon />}
      onClick={() => navigate('/homes/create')}
    >
      Create Home
    </Button>
  );
  
  // Get difficulty color
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
  
  // Format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Never';
    
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
  
  // Format due date with status
  const formatDueDate = (dateString, status) => {
    if (!dateString) return 'No deadline';
    
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString();
    
    switch(status) {
      case 'overdue':
        return `Overdue: ${formattedDate}`;
      case 'today':
        return `Due today!`;
      case 'tomorrow':
        return `Due tomorrow`;
      case 'soon':
        return `Due soon: ${formattedDate}`;
      default:
        return `Due: ${formattedDate}`;
    }
  };
  
  // Get due date color based on status
  const getDueDateColor = (status) => {
    switch(status) {
      case 'overdue':
        return 'error';
      case 'today':
        return 'warning';
      case 'tomorrow':
        return 'warning';
      case 'soon':
        return 'info';
      default:
        return 'default';
    }
  };
  
  // Calculate total unassigned tasks count
  const totalUnassignedTasks = unassignedTasks.length;
  
  // Calculate total assigned pending tasks count
  // Fixed: Ensure we filter correctly for pending tasks
  const pendingAssignedTasks = assignedTasks.filter(task => task.status === 'pending');
  const totalAssignedPendingTasks = pendingAssignedTasks.length;
  
  // Render actionable task item
  const renderActionableTask = (task, isAssigned = true) => {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          border: '1px solid rgba(0, 0, 0, 0.12)',
          borderRadius: 2,
          '&:hover': {
            boxShadow: 2
          },
          borderLeft: task.task_type === 'emergency' ? '4px solid #f44336' : 'none'
        }}
        key={task.task_id}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center">
              {task.task_type === 'emergency' && (
                <WarningIcon 
                  color="error" 
                  sx={{ mr: 1 }} 
                  fontSize="small"
                />
              )}
              <Typography variant="h6" component="h3">
                {task.task_name}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" mt={1} flexWrap="wrap" gap={1}>
              <Chip
                icon={<DifficultyIcon />}
                label={task.difficulty_level || 'Medium'}
                size="small"
                color={getDifficultyColor(task.difficulty_level)}
              />
              {task.due_date && (
                <Chip
                  icon={<DateIcon />}
                  label={formatDueDate(task.due_date, task.due_status)}
                  size="small"
                  color={getDueDateColor(task.due_status)}
                />
              )}
              <Chip
                icon={<HomeIcon />}
                label={task.home_name}
                size="small"
                variant="outlined"
              />
              {task.repeat_interval && (
                <Chip
                  icon={<HistoryIcon />}
                  label={`Repeats: ${task.repeat_interval === 1 ? 'Daily' : 
                    task.repeat_interval === 7 ? 'Weekly' : 
                    task.repeat_interval === 30 ? 'Monthly' : 
                    `Every ${task.repeat_interval} days`}`}
                  size="small"
                  variant="outlined"
                />
              )}
              {task.task_type === 'emergency' && (
                <Chip
                  icon={<WarningIcon />}
                  label="Emergency"
                  size="small"
                  color="error"
                />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box>
              {task.last_completed_at && (
                <Typography variant="body2" color="text.secondary">
                  <HistoryIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  Last done: {formatRelativeTime(task.last_completed_at)}
                </Typography>
              )}
              {task.last_completed_by && (
                <Typography variant="body2" color="text.secondary">
                  <PersonIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  By: {task.last_completed_by}
                </Typography>
              )}
              {!task.last_completed_at && (
                <Typography variant="body2" color="text.secondary">
                  <HistoryIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  Never completed before
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={3} textAlign="right">
            {isAssigned ? (
              <Box display="flex" flexDirection="column" gap={1}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={taskActionLoading === task.task_id ? <CircularProgress size={20} color="inherit" /> : <CompleteIcon />}
                  onClick={() => handleTaskCompletion(task)}
                  disabled={taskActionLoading === task.task_id}
                  fullWidth
                >
                  {taskActionLoading === task.task_id ? 'Completing...' : 'Do it'}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => handleOpenCompletionForm(task)}
                  fullWidth
                >
                  Add Photos
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                startIcon={taskActionLoading === task.task_id ? <CircularProgress size={20} color="inherit" /> : <ClaimIcon />}
                onClick={() => handleClaimTask(task.task_id)}
                disabled={taskActionLoading === task.task_id}
                fullWidth
              >
                {taskActionLoading === task.task_id ? 'Claiming...' : 'Claim'}
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>
    );
  };
  
  // Debug info for task counts
  console.log("Debug Info:");
  console.log("- Homes:", homes);
  console.log("- Home Task Counts:", homeTaskCounts);
  console.log("- Assigned Tasks:", assignedTasks.length, assignedTasks);
  console.log("- Unassigned Tasks:", unassignedTasks.length, unassignedTasks);
  console.log("- Total Tasks:", totalAssignedPendingTasks + totalUnassignedTasks);
  
  return (
    <MainLayout>
      <PageHeader 
        title={`Welcome back, ${user?.name || 'User'}!`} 
        actionButton={createHomeButton}
      />
      
      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  height: '100%',
                  border: '1px solid rgba(0, 0, 0, 0.12)'
                }}
              >
                <Box display="flex" alignItems="center">
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      backgroundColor: 'primary.light', 
                      borderRadius: 2,
                      mr: 2
                    }}
                  >
                    <HomeIcon sx={{ color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {loading.homes ? '...' : homes.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your Homes
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  height: '100%',
                  border: '1px solid rgba(0, 0, 0, 0.12)'
                }}
              >
                <Box display="flex" alignItems="center">
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      backgroundColor: 'secondary.light', 
                      borderRadius: 2,
                      mr: 2
                    }}
                  >
                    <TaskIcon sx={{ color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {loading.assignedTasks || loading.unassignedTasks ? '...' : (totalAssignedPendingTasks + totalUnassignedTasks)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Tasks
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  height: '100%',
                  border: '1px solid rgba(0, 0, 0, 0.12)'
                }}
              >
                <Box display="flex" alignItems="center">
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      backgroundColor: 'success.light', 
                      borderRadius: 2,
                      mr: 2
                    }}
                  >
                    <PersonIcon sx={{ color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {loading.stats ? '...' : stats.total_points || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Points
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  height: '100%',
                  border: '1px solid rgba(0, 0, 0, 0.12)'
                }}
              >
                <Box display="flex" alignItems="center">
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      backgroundColor: 'error.light', 
                      borderRadius: 2,
                      mr: 2
                    }}
                  >
                    <LeaderboardIcon sx={{ color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {loading.stats ? '...' : stats.rank || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Global Rank
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        
        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                border: '1px solid rgba(255, 0, 0, 0.3)',
                backgroundColor: 'rgba(255, 0, 0, 0.05)'
              }}
            >
              <Typography variant="subtitle2" gutterBottom>Debug Information:</Typography>
              <Typography variant="body2">
                Homes: {homes.length} | 
                Assigned Tasks: {totalAssignedPendingTasks} | 
                Unassigned Tasks: {totalUnassignedTasks} | 
                Total Tasks: {totalAssignedPendingTasks + totalUnassignedTasks}
              </Typography>
              <Typography variant="body2">
                Task Counts by Home: {Object.entries(homeTaskCounts).map(([homeId, count]) => 
                  `Home ${homeId}: ${count}`).join(', ')}
              </Typography>
              <Typography variant="caption">
                (This debug panel is only visible in development mode)
              </Typography>
            </Paper>
          </Grid>
        )}
        
        {/* Tasks To Claim Section - Grouped by Home */}
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: '1px solid rgba(0, 0, 0, 0.12)'
            }}
          >
            <Typography variant="h5" component="h2" gutterBottom>
              Tasks To Claim
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              These tasks are available for anyone to claim. Claim them to earn points and help out your home!
            </Typography>
            
            {loading.unassignedTasks ? (
              <LoadingIndicator message="Loading available tasks..." />
            ) : error.unassignedTasks ? (
              <ErrorDisplay error={error.unassignedTasks} />
            ) : unassignedTasks.length === 0 ? (
              <EmptyState
                title="No tasks available to claim"
                description="There are no unassigned tasks available currently. You can create new tasks from templates."
                icon={<TaskIcon fontSize="large" />}
                actionLabel="Go to Templates"
                actionHandler={() => navigate('/templates')}
              />
            ) : (
              <Box>
                {/* Show unassigned tasks grouped by home */}
                {Object.values(groupedUnassignedTasks).map((group) => (
                  <Box key={group.home_id} sx={{ mb: 4 }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2,
                        pb: 1,
                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <HomeIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        {group.home_name}
                      </Typography>
                      <Chip 
                        label={`${group.tasks.length} ${group.tasks.length === 1 ? 'task' : 'tasks'}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ ml: 2 }}
                      />
                    </Box>
                    {group.tasks.map(task => renderActionableTask(task, false))}
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Tasks To Do Section - Your Assigned Tasks */}
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: '1px solid rgba(0, 0, 0, 0.12)'
            }}
          >
            <Typography variant="h5" component="h2" gutterBottom>
              Tasks To Do
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              These are your assigned tasks. Complete them to earn points and climb the leaderboard!
            </Typography>
            
            {loading.assignedTasks ? (
              <LoadingIndicator message="Loading your assigned tasks..." />
            ) : error.assignedTasks ? (
              <ErrorDisplay error={error.assignedTasks} />
            ) : pendingAssignedTasks.length === 0 ? (
              <EmptyState
                title="No tasks assigned to you"
                description="You don't have any tasks assigned currently. Check out tasks to claim above or create a task from templates."
                icon={<TaskIcon fontSize="large" />}
                actionLabel="Go to Templates"
                actionHandler={() => navigate('/templates')}
              />
            ) : (
              <Box>
                {pendingAssignedTasks.map(task => renderActionableTask(task, true))}
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Additional Info Tabs */}
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              overflow: 'hidden',
              border: '1px solid rgba(0, 0, 0, 0.12)'
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                variant="fullWidth"
              >
                <Tab label="Recent Activity" />
                <Tab label="Statistics" />
              </Tabs>
            </Box>
            
            {/* Recent Activity Tab */}
            {activeTab === 0 && (
              <Box p={3}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                
                {loading.stats ? (
                  <LoadingIndicator message="Loading activity..." />
                ) : error.stats ? (
                  <ErrorDisplay error={error.stats} />
                ) : stats.recent_activities?.length > 0 ? (
                  <Box>
                    {stats.recent_activities.map((activity, index) => (
                      <Box key={index} mb={2}>
                        <Typography variant="body1">
                          {activity.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(activity.timestamp).toLocaleString()}
                        </Typography>
                        {index < stats.recent_activities.length - 1 && (
                          <Divider sx={{ mt: 1 }} />
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No recent activity to display.
                  </Typography>
                )}
              </Box>
            )}
            
            {/* Statistics Tab */}
            {activeTab === 1 && (
              <Box p={3}>
                <Typography variant="h6" gutterBottom>
                  Your Statistics
                </Typography>
                
                {loading.stats ? (
                  <LoadingIndicator message="Loading statistics..." />
                ) : error.stats ? (
                  <ErrorDisplay error={error.stats} />
                ) : (
                  <TaskCompletionStats 
                    stats={{
                      total_tasks: stats.total_tasks || 0,
                      completed_tasks: stats.completed_tasks || 0,
                      overdue_tasks: stats.overdue_tasks || 0,
                      total_points: stats.total_points || 0
                    }} 
                    title="Your Task Completion"
                  />
                )}
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Homes Section */}
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: '1px solid rgba(0, 0, 0, 0.12)'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Your Homes</Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/homes')}
              >
                View All
              </Button>
            </Box>
            
            {loading.homes ? (
              <LoadingIndicator message="Loading your homes..." />
            ) : error.homes ? (
              <ErrorDisplay error={error.homes} />
            ) : homes.length === 0 ? (
              <EmptyState
                title="No homes yet"
                description="Create your first home to start managing tasks and invite members!"
                icon={<HomeIcon fontSize="large" />}
                actionLabel="Create Home"
                actionHandler={() => navigate('/homes/create')}
              />
            ) : (
              <Grid container spacing={3}>
                {homes.slice(0, 3).map(home => (
                  <Grid item xs={12} sm={6} md={4} key={home.home_id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-5px)'
                        }
                      }}
                      onClick={() => navigate(`/homes/${home.home_id}`)}
                    >
                      <Box 
                        sx={{ 
                          height: 80, 
                          backgroundColor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 2
                        }}
                      >
                        <Typography 
                          variant="h6" 
                          component="h3" 
                          align="center"
                          sx={{ 
                            color: 'white', 
                            fontWeight: 'bold'
                          }}
                        >
                          {home.home_name}
                        </Typography>
                      </Box>
                      
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            Members: {home.is_admin ? Math.max(1, home.member_count || 0) : (home.member_count || 0)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tasks: {home.task_count || 0}
                          </Typography>
                        </Box>
                        
                        {home.is_admin && (
                          <Typography variant="caption" color="primary">
                            You are the admin
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                
                {homes.length > 0 && homes.length < 3 && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: 3,
                        cursor: 'pointer',
                        border: '2px dashed rgba(0, 0, 0, 0.12)',
                        '&:hover': {
                          borderColor: 'primary.main',
                        }
                      }}
                      onClick={() => navigate('/homes/create')}
                    >
                      <AddIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                      <Typography variant="h6" color="primary" align="center">
                        Create New Home
                      </Typography>
                    </Card>
                  </Grid>
                )}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Task Completion Form Dialog */}
      <Dialog
        open={completionDialog.open}
        onClose={handleCloseCompletionForm}
        fullWidth
        maxWidth="md"
      >
        <DialogContent sx={{ p: 0 }}>
          {completionDialog.task && (
            <TaskCompletionForm
              task={completionDialog.task}
              onSubmit={handleTaskCompletionSubmit}
              onCancel={handleCloseCompletionForm}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          {confirmDialog.task ? (
            <>
              <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
              <Button 
                onClick={confirmTaskCompletion} 
                variant="contained" 
                color="success" 
                autoFocus
              >
                Complete
              </Button>
            </>
          ) : (
            <Button 
              onClick={handleCloseConfirmDialog} 
              variant="contained" 
              color="primary" 
              autoFocus
            >
              OK
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default Dashboard;