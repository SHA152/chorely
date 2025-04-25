// src/pages/homes/HomeList.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';
import { 
  Add as AddIcon, 
  Home as HomeIcon, 
  Refresh as RefreshIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import HomeCard from '../../components/homes/HomeCard';
import { homeService, taskService } from '../../api/api';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../contexts/AuthContext';

const HomeList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Fetch homes with robust error handling
  const fetchHomes = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      const { data } = await homeService.getHomes();
      
      // Process homes data
      const processedHomes = await Promise.all(data.map(async (home) => {
        // Use task_count directly if provided by API, otherwise fetch tasks
        let taskCount = home.task_count;

        if (taskCount === undefined || taskCount === null) {
          try {
            const tasksResponse = await taskService.getHomeTasks(home.home_id);
            taskCount = tasksResponse.data.length;
          } catch (err) {
            console.error(`Failed to fetch tasks for home ${home.home_id}:`, err);
            taskCount = 0;
          }
        }

        return {
          ...home,
          member_count: home.members?.length || 0,
          task_count: taskCount
        };
      }));
      
      setHomes(processedHomes);
      
      // Show success snackbar if refreshing
      if (showRefreshIndicator) {
        setSnackbar({
          open: true,
          message: 'Homes updated successfully',
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Failed to fetch homes:', err);
      
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || 'Failed to load homes. Please check your connection.';
      
      setError(errorMessage);
      
      // Show error snackbar
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial homes fetch
  useEffect(() => {
    fetchHomes();
  }, [fetchHomes]);

  // Handle create home button click
  const handleCreateHome = () => {
    navigate('/homes/create');
  };
  
  // Handle join home button click
  const handleJoinHome = () => {
    navigate('/home-requests');
  };

  // Handle manual refresh
  const handleRefresh = () => {
    fetchHomes(true);
  };

  // Close snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Create action buttons for header
  const actionButtons = (
    <Box display="flex" alignItems="center">
      <Button
        variant="outlined"
        onClick={handleJoinHome}
        sx={{ mr: 1 }}
        disabled={loading || refreshing}
      >
        Join Home
      </Button>
      
      <Button
        variant="contained"
        color="primary"
        startIcon={refreshing ? null : <AddIcon />}
        onClick={handleCreateHome}
        disabled={loading || refreshing}
      >
        {refreshing ? <RefreshIcon sx={{ animate: 'spin' }} /> : 'Create Home'}
      </Button>
    </Box>
  );
  
  return (
    <MainLayout>
      <PageHeader 
        title={`My Homes ${user ? `(${user.name})` : ''}`} 
        actionButton={actionButtons}
      />
      
      {loading ? (
        <LoadingIndicator message="Loading homes..." />
      ) : error ? (
        <ErrorDisplay 
          error={error} 
          onRetry={handleRefresh}
        />
      ) : homes.length === 0 ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            border: '1px solid rgba(0, 0, 0, 0.12)'
          }}
        >
          <EmptyState
            title="Welcome to Chorely!"
            description="To get started, create a home for your household or join an existing one."
            icon={<HomeIcon fontSize="large" />}
            actionLabel="Create First Home"
            actionHandler={handleCreateHome}
          />
          
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              What is Chorely?
            </Typography>
            
            <Typography variant="body1" paragraph>
              Chorely makes household chores and shared responsibilities more engaging through points, 
              leaderboards, and social features. Track who's doing what, earn points for completed tasks, 
              and turn household management into a friendly competition!
            </Typography>
            
            <Grid2 container spacing={3} mt={2}>
              {[
                {
                  title: "Create a Home",
                  description: "Set up a new home for your household, dorm, or shared living space."
                },
                {
                  title: "Add Tasks",
                  description: "Create chores and assign them to members or leave them for anyone to claim."
                },
                {
                  title: "Track Progress",
                  description: "See who's contributing most with leaderboards and point tracking."
                }
              ].map((feature, index) => (
                <Grid2 item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid2>
              ))}
            </Grid2>
          </Box>
        </Paper>
      ) : (
        <Grid2 container spacing={3}>
          {homes.map((home) => (
            <Grid2 item xs={12} sm={6} md={4} key={home.home_id}>
              <HomeCard home={home} />
            </Grid2>
          ))}
          
          <Grid2 item xs={12} sm={6} md={4}>
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
              onClick={handleCreateHome}
              role="button"
              tabIndex={0}
              aria-label="Create new home"
            >
              <AddIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h6" color="primary" align="center">
                Create New Home
              </Typography>
            </Card>
          </Grid2>
        </Grid2>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default HomeList;