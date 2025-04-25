// src/pages/homes/HomeJoinRequests.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Check as AcceptIcon,
  Close as RejectIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import { EmptyState } from '../../components/common/EmptyState';
import { homeRequestService } from '../../api/api';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

const HomeJoinRequests = () => {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState({
    search: false,
    myRequests: true,
    pendingRequests: true
  });
  const [error, setError] = useState({
    search: null,
    myRequests: null,
    pendingRequests: null
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    confirmAction: null
  });
  
  // Fetch my join requests
  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        setLoading(prev => ({ ...prev, myRequests: true }));
        const { data } = await homeRequestService.getMyRequests();
        setMyRequests(Array.isArray(data) ? data : []);
        setError(prev => ({ ...prev, myRequests: null }));
      } catch (err) {
        console.error('Failed to fetch my requests:', err);
        setError(prev => ({ 
          ...prev, 
          myRequests: 'Failed to load your join requests. Please try again.' 
        }));
        setMyRequests([]);
      } finally {
        setLoading(prev => ({ ...prev, myRequests: false }));
      }
    };
    
    fetchMyRequests();
  }, []);
  
  // Fetch pending join requests (admin only)
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        setLoading(prev => ({ ...prev, pendingRequests: true }));
        const { data } = await homeRequestService.getPendingRequests();
        setPendingRequests(Array.isArray(data) ? data : []);
        setError(prev => ({ ...prev, pendingRequests: null }));
      } catch (err) {
        console.error('Failed to fetch pending requests:', err);
        setError(prev => ({ 
          ...prev, 
          pendingRequests: 'Failed to load pending join requests. Please try again.' 
        }));
        setPendingRequests([]);
      } finally {
        setLoading(prev => ({ ...prev, pendingRequests: false }));
      }
    };
    
    fetchPendingRequests();
  }, []);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle search submission
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(prev => ({ ...prev, search: true }));
      setError(prev => ({ ...prev, search: null }));
      
      const { data } = await homeRequestService.searchHomes({ query: searchQuery });
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to search homes:', err);
      setError(prev => ({ 
        ...prev, 
        search: 'Failed to search homes. Please try again.' 
      }));
      setSearchResults([]);
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
    }
  };
  
  // Handle request to join home
  const handleRequestToJoin = async (homeId) => {
    try {
      await homeRequestService.requestToJoin(homeId, {
        request_message: `Hello! I would like to join your home.`
      });
      
      // Update search results to show requested
      setSearchResults(prev => 
        prev.map(home => 
          home.home_id === homeId 
            ? { ...home, requested: true } 
            : home
        )
      );
    } catch (err) {
      console.error('Failed to send join request:', err);
      setError(prev => ({ 
        ...prev, 
        search: 'Failed to send join request. Please try again.' 
      }));
    }
  };
  
  // Handle cancel join request
  const handleCancelRequest = (requestId) => {
    setConfirmDialog({
      open: true,
      title: 'Cancel Join Request',
      message: 'Are you sure you want to cancel this join request?',
      confirmAction: () => cancelRequest(requestId)
    });
  };
  
  // Cancel request
  const cancelRequest = async (requestId) => {
    try {
      await homeRequestService.cancelRequest(requestId);
      
      // Remove from my requests list
      setMyRequests(prev => 
        prev.filter(request => request.request_id !== requestId)
      );
      
      setConfirmDialog(prev => ({ ...prev, open: false }));
    } catch (err) {
      console.error('Failed to cancel request:', err);
      setError(prev => ({ 
        ...prev, 
        myRequests: 'Failed to cancel request. Please try again.' 
      }));
    }
  };
  
  // Handle accept join request
  const handleAcceptRequest = (requestId) => {
    setConfirmDialog({
      open: true,
      title: 'Accept Join Request',
      message: 'Are you sure you want to accept this join request?',
      confirmAction: () => acceptRequest(requestId)
    });
  };
  
  // Accept request
  const acceptRequest = async (requestId) => {
    try {
      await homeRequestService.handleRequest(requestId, 'accepted');
      
      // Remove from pending requests list
      setPendingRequests(prev => 
        prev.filter(request => request.request_id !== requestId)
      );
      
      setConfirmDialog(prev => ({ ...prev, open: false }));
    } catch (err) {
      console.error('Failed to accept request:', err);
      setError(prev => ({ 
        ...prev, 
        pendingRequests: 'Failed to accept request. Please try again.' 
      }));
    }
  };
  
  // Handle reject join request
  const handleRejectRequest = (requestId) => {
    setConfirmDialog({
      open: true,
      title: 'Reject Join Request',
      message: 'Are you sure you want to reject this join request?',
      confirmAction: () => rejectRequest(requestId)
    });
  };
  
  // Reject request
  const rejectRequest = async (requestId) => {
    try {
      await homeRequestService.handleRequest(requestId, 'rejected');
      
      // Remove from pending requests list
      setPendingRequests(prev => 
        prev.filter(request => request.request_id !== requestId)
      );
      
      setConfirmDialog(prev => ({ ...prev, open: false }));
    } catch (err) {
      console.error('Failed to reject request:', err);
      setError(prev => ({ 
        ...prev, 
        pendingRequests: 'Failed to reject request. Please try again.' 
      }));
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
  
  const breadcrumbs = [
    { label: 'Homes', path: '/homes' },
    { label: 'Join Requests' }
  ];
  
  return (
    <MainLayout>
      <PageHeader 
        title="Home Join Requests" 
        breadcrumbs={breadcrumbs}
      />
      
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
              <Tab label="Find Homes" />
              <Tab label="My Requests" />
              <Tab label="Pending Requests" />
            </Tabs>
          </Box>
          
          {/* Find Homes Tab */}
          {activeTab === 0 && (
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Search for homes to join
              </Typography>
              
              <Box display="flex" alignItems="center" mb={3}>
                <TextField
                  fullWidth
                  label="Search by home name"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={handleSearch}
                          edge="end"
                        >
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
              </Box>
              
              {loading.search ? (
                <LoadingIndicator message="Searching homes..." />
              ) : error.search ? (
                <ErrorDisplay error={error.search} />
              ) : searchResults.length > 0 ? (
                <List>
                  {searchResults.map((home) => (
                    <React.Fragment key={home.home_id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <HomeIcon />
                          </Avatar>
                        </ListItemAvatar>
                        
                        <ListItemText 
                          primary={home.home_name}
                          secondary={`Admin: ${home.admin_name} • Members: ${home.member_count || 0}`}
                        />
                        
                        <ListItemSecondaryAction>
                          {home.is_member ? (
                            <Chip 
                              label="Member" 
                              color="success" 
                              size="small"
                            />
                          ) : home.requested ? (
                            <Chip 
                              label="Requested" 
                              color="primary" 
                              variant="outlined"
                              size="small"
                            />
                          ) : (
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={() => handleRequestToJoin(home.home_id)}
                            >
                              Request to Join
                            </Button>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : searchQuery ? (
                <EmptyState
                  title="No homes found"
                  description="Try searching with a different name or create your own home!"
                  icon={<HomeIcon fontSize="large" />}
                  actionLabel="Create Home"
                  actionHandler={() => navigate('/homes/create')}
                />
              ) : null}
            </Box>
          )}
          
          {/* My Requests Tab */}
          {activeTab === 1 && (
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                My Join Requests
              </Typography>
              
              {loading.myRequests ? (
                <LoadingIndicator message="Loading your requests..." />
              ) : error.myRequests ? (
                <ErrorDisplay error={error.myRequests} />
              ) : myRequests.length === 0 ? (
                <EmptyState
                  title="No pending requests"
                  description="You haven't requested to join any homes yet."
                  icon={<HomeIcon fontSize="large" />}
                />
              ) : (
                <List>
                  {myRequests.map((request) => (
                    <React.Fragment key={request.request_id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <HomeIcon />
                          </Avatar>
                        </ListItemAvatar>
                        
                        <ListItemText 
                          primary={request.home_name}
                          secondary={
                            <>
                              <Typography 
                                component="span" 
                                variant="body2" 
                                color="text.primary"
                              >
                                Status: {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </Typography>
                              <br />
                              <Typography 
                                component="span" 
                                variant="body2" 
                                color="text.secondary"
                              >
                                Requested on {formatDate(request.created_at)}
                              </Typography>
                            </>
                          }
                        />
                        
                        {request.status === 'pending' && (
                          <ListItemSecondaryAction>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleCancelRequest(request.request_id)}
                            >
                              Cancel
                            </Button>
                          </ListItemSecondaryAction>
                        )}
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}
          
          {/* Pending Requests Tab */}
          {activeTab === 2 && (
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Pending Join Requests
              </Typography>
              
              {loading.pendingRequests ? (
                <LoadingIndicator message="Loading pending requests..." />
              ) : error.pendingRequests ? (
                <ErrorDisplay error={error.pendingRequests} />
              ) : pendingRequests.length === 0 ? (
                <EmptyState
                  title="No pending requests"
                  description="There are no pending requests to your homes."
                  icon={<HomeIcon fontSize="large" />}
                />
              ) : (
                <List>
                  {(Array.isArray(pendingRequests) ? pendingRequests : []).map((request) => (
                    <React.Fragment key={request.request_id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar 
                            alt={request.user_name}
                            src={request.avatar_id ? `/uploads/images/${request.avatar_id}` : ''}
                          >
                            {request.user_name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        
                        <ListItemText 
                          primary={request.user_name}
                          secondary={
                            <>
                              <Typography 
                                component="span" 
                                variant="body2" 
                                color="text.primary"
                              >
                                Home: {request.home_name}
                              </Typography>
                              <br />
                              <Typography 
                                component="span" 
                                variant="body2" 
                                color="text.secondary"
                              >
                                Requested on {formatDate(request.created_at)}
                              </Typography>
                              <br />
                              {request.request_message && (
                                <Typography 
                                  component="span" 
                                  variant="body2" 
                                  color="text.secondary"
                                >
                                  Message: "{request.request_message}"
                                </Typography>
                              )}
                            </>
                          }
                        />
                        
                        <ListItemSecondaryAction>
                          <Box display="flex" gap={1}>
                            <IconButton
                              color="success"
                              onClick={() => handleAcceptRequest(request.request_id)}
                              title="Accept"
                            >
                              <AcceptIcon />
                            </IconButton>
                            
                            <IconButton
                              color="error"
                              onClick={() => handleRejectRequest(request.request_id)}
                              title="Reject"
                            >
                              <RejectIcon />
                            </IconButton>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
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
          confirmColor="primary"
        />
      </MainLayout>
    );
  };
  
  export default HomeJoinRequests;