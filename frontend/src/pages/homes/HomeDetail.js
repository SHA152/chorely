// src/pages/homes/HomeDetail.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  Divider,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExitToApp as LeaveIcon,
  Chat as ChatIcon,
  EmojiEvents as LeaderboardIcon,
  Task as TaskIcon,
  PersonAdd as InviteIcon,
  CalendarToday as CalendarIcon,
  PersonAdd
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import TaskCard from '../../components/tasks/TaskCard';
import MemberList from '../../components/homes/MemberList';
import HomeInviteForm from '../../components/homes/HomeInviteForm';
import { homeService, taskService } from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import { EmptyState } from '../../components/common/EmptyState';
import ChatContainer from '../../components/chat/ChatContainer';

const HomeDetail = () => {
  const { homeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [home, setHome] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState({
    home: true,
    tasks: true,
    members: true
  });
  const [error, setError] = useState({
    home: null,
    tasks: null,
    members: null
  });
  const [activeTab, setActiveTab] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    confirmAction: null
  });
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  
  // Fetch home details
  useEffect(() => {
    const fetchHomeDetails = async () => {
      try {
        setLoading(prev => ({ ...prev, home: true }));
        const { data } = await homeService.getHomeById(homeId);
        setHome(data);
        setError(prev => ({ ...prev, home: null }));
      } catch (err) {
        console.error('Failed to fetch home details:', err);
        setError(prev => ({ 
          ...prev, 
          home: 'Failed to load home details. Please try again.' 
        }));
      } finally {
        setLoading(prev => ({ ...prev, home: false }));
      }
    };
    
    fetchHomeDetails();
  }, [homeId]);
  
  // Fetch home tasks
  useEffect(() => {
    const fetchHomeTasks = async () => {
      try {
        setLoading(prev => ({ ...prev, tasks: true }));
        const { data } = await taskService.getHomeTasks(homeId);
        setTasks(data);
        setError(prev => ({ ...prev, tasks: null }));
      } catch (err) {
        console.error('Failed to fetch home tasks:', err);
        setError(prev => ({ 
          ...prev, 
          tasks: 'Failed to load tasks. Please try again.' 
        }));
      } finally {
        setLoading(prev => ({ ...prev, tasks: false }));
      }
    };
    
    fetchHomeTasks();
  }, [homeId]);
  
  // Fetch home members
  useEffect(() => {
    const fetchHomeMembers = async () => {
      try {
        setLoading(prev => ({ ...prev, members: true }));
        const { data } = await homeService.getHomeUsers(homeId);
        setMembers(data);
        setError(prev => ({ ...prev, members: null }));
      } catch (err) {
        console.error('Failed to fetch home members:', err);
        setError(prev => ({ 
          ...prev, 
          members: 'Failed to load members. Please try again.' 
        }));
      } finally {
        setLoading(prev => ({ ...prev, members: false }));
      }
    };
    
    fetchHomeMembers();
  }, [homeId]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Open menu
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  // Close menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle delete home confirmation
  const handleDeleteHome = () => {
    setConfirmDialog({
      open: true,
      title: 'Delete Home',
      message: `Are you sure you want to delete "${home?.home_name}"? This action cannot be undone.`,
      confirmAction: deleteHome
    });
    handleMenuClose();
  };
  
  // Delete home
  const deleteHome = async () => {
    try {
      await homeService.deleteHome(homeId);
      navigate('/homes');
    } catch (error) {
      console.error('Failed to delete home:', error);
      setError(prev => ({
        ...prev,
        home: 'Failed to delete home. Please try again.'
      }));
    } finally {
      setConfirmDialog(prev => ({ ...prev, open: false }));
    }
  };
  
  // Handle leave home confirmation
  const handleLeaveHome = () => {
    setConfirmDialog({
      open: true,
      title: 'Leave Home',
      message: `Are you sure you want to leave "${home?.home_name}"?`,
      confirmAction: leaveHome
    });
    handleMenuClose();
  };
  
  // Leave home
  const leaveHome = async () => {
    try {
      await homeService.removeUser(homeId, user.user_id);
      navigate('/homes');
    } catch (error) {
      console.error('Failed to leave home:', error);
      setError(prev => ({
        ...prev,
        home: 'Failed to leave home. Please try again.'
      }));
    } finally {
      setConfirmDialog(prev => ({ ...prev, open: false }));
    }
  };
  
  // Handle promote member
  const handlePromoteMember = async (member) => {
    try {
      await homeService.updateUserRole(homeId, member.user_id, { role: 'admin' });
      // Update members list
      setMembers(prev => 
        prev.map(m => 
          m.user_id === member.user_id 
            ? { ...m, role: 'admin' } 
            : m
        )
      );
    } catch (error) {
      console.error('Failed to promote member:', error);
    }
  };
  
  // Handle demote member
  const handleDemoteMember = async (member) => {
    try {
      await homeService.updateUserRole(homeId, member.user_id, { role: 'member' });
      // Update members list
      setMembers(prev => 
        prev.map(m => 
          m.user_id === member.user_id 
            ? { ...m, role: 'member' } 
            : m
        )
      );
    } catch (error) {
      console.error('Failed to demote member:', error);
    }
  };
  
  // Handle remove member
  const handleRemoveMember = async (member) => {
    try {
      await homeService.removeUser(homeId, member.user_id);
      // Update members list
      setMembers(prev => prev.filter(m => m.user_id !== member.user_id));
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };
  
  // Handle create task button click
  const handleCreateTask = () => {
    navigate(`/homes/${homeId}/create-task`);
  };
  
  // Handle task completion
  const handleCompleteTask = (task) => {
    navigate(`/tasks/${task.task_id}`);
  };
  
  // Check if current user is admin
  const isAdmin = home?.is_admin || false;
  
  // Create breadcrumbs
  const breadcrumbs = [
    { label: 'Homes', path: '/homes' },
    { label: home?.home_name || 'Home Details' }
  ];
  
  // Create action buttons for header
  const actionButtons = (
    <Box>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleCreateTask}
        sx={{ mr: 1 }}
      >
        Create Task
      </Button>
      
      <IconButton onClick={handleMenuOpen}>
        <MoreIcon />
      </IconButton>
      
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        {isAdmin && (
          <MenuItem onClick={() => {
            handleMenuClose();
            navigate(`/homes/${homeId}/edit`);
          }}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            Edit Home
          </MenuItem>
        )}
        
        <MenuItem onClick={() => {
          handleMenuClose();
          navigate(`/homes/${homeId}/chat`);
        }}>
          <ListItemIcon>
            <ChatIcon fontSize="small" />
          </ListItemIcon>
          Open Chat
        </MenuItem>
        
        <MenuItem onClick={() => {
          handleMenuClose();
          navigate(`/homes/${homeId}/leaderboard`);
        }}>
          <ListItemIcon>
            <LeaderboardIcon fontSize="small" />
          </ListItemIcon>
          View Leaderboard
        </MenuItem>
        
        <Divider />
        
        {isAdmin ? (
          <MenuItem onClick={handleDeleteHome} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            Delete Home
          </MenuItem>
        ) : (
          <MenuItem onClick={handleLeaveHome} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <LeaveIcon fontSize="small" color="error" />
            </ListItemIcon>
            Leave Home
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
  
  // Loading all data
  const isLoading = loading.home || loading.tasks || loading.members;
  
  // Error in any data
  const hasError = error.home || error.tasks || error.members;
  
  if (loading.home && !home) {
    return (
      <MainLayout>
        <LoadingIndicator message="Loading home details..." />
      </MainLayout>
    );
  }
  
  if (error.home && !home) {
    return (
      <MainLayout>
        <ErrorDisplay 
          error={error.home} 
          onRetry={() => window.location.reload()}
        />
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <PageHeader 
        title={home?.home_name || 'Home Details'} 
        breadcrumbs={breadcrumbs}
        actionButton={actionButtons}
      />
      
      {/* Home Info Card */}
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
            <Box>
              <Typography variant="h6" gutterBottom>
                About this Home
              </Typography>
              
              <Typography variant="body1" paragraph>
                {home?.description || 'No description provided.'}
              </Typography>
              
              <Box display="flex" alignItems="center" mt={2}>
                <Tooltip title="Total members">
                  <Chip 
                    icon={<PersonAdd />} 
                    label={`${members.length} members`}
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                </Tooltip>
                
                <Tooltip title="Total tasks">
                  <Chip 
                    icon={<TaskIcon />} 
                    label={`${tasks.length} tasks`}
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                </Tooltip>
                
                <Tooltip title="Created date">
                  <Chip 
                    icon={<CalendarIcon />} 
                    label={`Created ${new Date(home?.created_at).toLocaleDateString()}`}
                    variant="outlined"
                  />
                </Tooltip>
              </Box>
            </Box>
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
                <Typography variant="subtitle1" gutterBottom>
                  Quick Actions
                </Typography>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ChatIcon />}
                  sx={{ mb: 1 }}
                  onClick={() => navigate(`/homes/${homeId}/chat`)}
                >
                  Open Chat
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LeaderboardIcon />}
                  sx={{ mb: 1 }}
                  onClick={() => navigate(`/homes/${homeId}/leaderboard`)}
                >
                  View Leaderboard
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<InviteIcon />}
                  onClick={() => setActiveTab(2)}
                >
                  Invite Members
                </Button>
              </Box>
              
              {isAdmin && (
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label="You are the admin" 
                    color="primary" 
                    variant="outlined" 
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabs Section */}
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
            <Tab label="Tasks" />
            <Tab label="Members" />
            <Tab label="Invite" />
            <Tab label="Chat" />
          </Tabs>
        </Box>
        
        {/* Tasks Tab */}
        {activeTab === 0 && (
          <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">
                Home Tasks
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateTask}
              >
                Create Task
              </Button>
            </Box>
            
            {loading.tasks ? (
              <LoadingIndicator message="Loading tasks..." />
            ) : error.tasks ? (
              <ErrorDisplay error={error.tasks} />
            ) : tasks.length === 0 ? (
              <EmptyState
                title="No tasks yet"
                description="Create your first task for this home!"
                icon={<TaskIcon fontSize="large" />}
                actionLabel="Create Task"
                actionHandler={handleCreateTask}
              />
            ) : (
              <Grid container spacing={3}>
                {tasks.map(task => (
                  <Grid item xs={12} sm={6} md={4} key={task.task_id}>
                    <TaskCard 
                      task={task} 
                      onComplete={handleCompleteTask}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
        
        {/* Members Tab */}
        {activeTab === 1 && (
          <Box p={3}>
            {loading.members ? (
              <LoadingIndicator message="Loading members..." />
            ) : error.members ? (
              <ErrorDisplay error={error.members} />
            ) : (
              <MemberList 
                members={members}
                isAdmin={isAdmin}
                onPromote={handlePromoteMember}
                onDemote={handleDemoteMember}
                onRemove={handleRemoveMember}
              />
            )}
          </Box>
        )}
        
        {/* Invite Tab */}
        {activeTab === 2 && (
          <Box p={3}>
            <HomeInviteForm 
              homeId={homeId}
              homeName={home?.home_name}
              onInviteByEmail={(email) => {
                // Handle invite by email
                console.log('Invite sent to:', email);
              }}
            />
          </Box>
        )}
        
        {/* Chat Tab */}
        {activeTab === 3 && (
          <Box p={3}>
            <ChatContainer 
              homeId={homeId}
              homeName={home?.home_name}
            />
          </Box>
        )}
      </Paper>
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        onConfirm={confirmDialog.confirmAction}
        confirmLabel="Confirm"
        confirmColor="error"
      />
    </MainLayout>
  );
};

export default HomeDetail;