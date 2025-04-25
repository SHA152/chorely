// src/components/auth/ForgotPasswordForm.js
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Link as MuiLink,
  Alert
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ForgotPasswordForm component provides form for requesting password reset
 */
const ForgotPasswordForm = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Handle email input change
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };
  
  // Validate form
  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setLoading(true);
        setError('');
        await forgotPassword(email);
        setSubmitted(true);
      } catch (error) {
        console.error('Password reset request failed:', error);
        setError(
          error.response?.data?.message || 'Failed to request password reset. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%', borderRadius: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom align="center" fontWeight="bold">
        Forgot Password
      </Typography>
      
      <Typography variant="body2" color="text.secondary" align="center" mb={3}>
        Enter your email address and we'll send you a link to reset your password.
      </Typography>
      
      {submitted ? (
        <Box>
          <Alert severity="success" sx={{ mb: 3 }}>
            Password reset instructions have been sent to your email.
          </Alert>
          <Typography variant="body2" align="center" mt={2}>
            Please check your inbox and follow the instructions in the email.
          </Typography>
          <Box mt={3} textAlign="center">
            <MuiLink 
              component={Link} 
              to="/login" 
              variant="body2"
              underline="hover"
            >
              Return to Login
            </MuiLink>
          </Box>
        </Box>
      ) : (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={handleEmailChange}
                  error={!!error}
                  helperText={error}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 1 }}
                >
                  {loading ? 'Submitting...' : 'Reset Password'}
                </Button>
              </Grid>
            </Grid>
          </form>
          
          <Box mt={3} textAlign="center">
            <Typography variant="body2">
              Remembered your password?{' '}
              <MuiLink 
                component={Link} 
                to="/login" 
                variant="body2"
                underline="hover"
              >
                Login
              </MuiLink>
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default ForgotPasswordForm;