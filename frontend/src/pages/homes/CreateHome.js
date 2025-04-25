// src/pages/homes/CreateHome.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Info as InfoIcon, 
  CheckCircle as SuccessIcon 
} from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import { HomeCreationForm } from '../../components/homes';
import { homeService } from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';

const CreateHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Breadcrumb navigation
  const breadcrumbs = [
    { label: 'Homes', path: '/homes' },
    { label: 'Create New Home' }
  ];
  
  // Handle home creation with comprehensive error management
  const handleCreateHome = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Enrich form data with additional context
      const enrichedHomeData = {
        ...formData,
        created_by: user?.user_id,
        privacy_level: 'private' // Default privacy setting
      };
      
      // Validate home name unique constraints client-side
      if (formData.home_name.length < 3) {
        throw new Error('Home name must be at least 3 characters long');
      }
      
      const response = await homeService.createHome(enrichedHomeData);
      
      // Successful home creation
      setSuccessDialogOpen(true);
      
      // Trigger success notification
      setSnackbar({
        open: true,
        message: `Home "${formData.home_name}" created successfully!`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Failed to create home:', err);
      
      // Comprehensive error handling
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Failed to create home. Please try again.';
      
      // Different error handling for specific scenarios
      if (err.response?.status === 409) {
        setError('A home with this name already exists. Please choose a different name.');
      } else {
        setError(errorMessage);
      }
      
      // Trigger error notification
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle successful home creation dialog
  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    // Navigate to the newly created home or homes list
    navigate('/homes');
  };
  
  // Snackbar close handler
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <MainLayout>
      <PageHeader 
        title="Create New Home" 
        breadcrumbs={breadcrumbs}
      />
      
      <Container maxWidth="md">
        {error && (
          <Box mb={3}>
            <ErrorDisplay 
              error={error} 
              onRetry={() => setError(null)}
            />
          </Box>
        )}
        
        <HomeCreationForm 
          onSubmit={handleCreateHome}
          loading={loading}
        />
        
        {/* Home Creation Guidance */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mt: 3, 
            borderRadius: 2,
            border: '1px solid rgba(0, 0, 0, 0.12)',
            backgroundColor: 'rgba(0, 0, 0, 0.01)'
          }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <InfoIcon 
              color="primary" 
              sx={{ mr: 2 }} 
            />
            <Typography variant="h6" color="primary">
              What is a Home in Chorely?
            </Typography>
          </Box>
          
          <Typography variant="body1" paragraph>
            In Chorely, a "Home" is more than just a physical space. It's a collaborative 
            environment where you can manage shared responsibilities, track contributions, 
            and turn household management into an engaging experience.
          </Typography>
          
          <Typography variant="body1" gutterBottom>
            When you create a Home, you can:
          </Typography>
          
          <Box 
            component="ul" 
            sx={{ 
              pl: 2,
              '& > li': {
                mb: 1,
                pl: 1,
                borderLeft: '3px solid',
                borderColor: 'primary.light'
              }
            }}
          >
            <Typography component="li">
              Invite members to collaborate on household tasks
            </Typography>
            <Typography component="li">
              Create and assign tasks with points and difficulty levels
            </Typography>
            <Typography component="li">
              Track individual and group task completion
            </Typography>
            <Typography component="li">
              Visualize contributions through leaderboards
            </Typography>
            <Typography component="li">
              Communicate with home members through integrated chat
            </Typography>
          </Box>
        </Paper>
      </Container>
      
      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={handleSuccessDialogClose}
        aria-labelledby="home-creation-success"
      >
        <DialogTitle id="home-creation-success">
          <Box display="flex" alignItems="center">
            <SuccessIcon color="success" sx={{ mr: 2 }} />
            Home Created Successfully
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your new home has been set up. Start inviting members and creating tasks 
            to make household management fun and fair!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleSuccessDialogClose} 
            color="primary" 
            variant="contained"
          >
            Continue to Homes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification Snackbar */}
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

export default CreateHome;