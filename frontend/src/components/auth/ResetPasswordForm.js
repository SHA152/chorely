// src/components/auth/ResetPasswordForm.js
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  Alert
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ResetPasswordForm component provides form for setting a new password with reset token
 */
const ResetPasswordForm = () => {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for the field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error
    if (generalError) {
      setGeneralError('');
    }
  };
  
  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formValues.password) {
      newErrors.password = 'Password is required';
    } else if (formValues.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formValues.password !== formValues.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setLoading(true);
        setGeneralError('');
        await resetPassword(token, formValues.password);
        setSuccess(true);
      } catch (error) {
        console.error('Password reset failed:', error);
        setGeneralError(
          error.response?.data?.message || 'Password reset failed. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Navigate to login after delay if successful
  React.useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);
  
  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%', borderRadius: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom align="center" fontWeight="bold">
        Reset Password
      </Typography>
      
      <Typography variant="body2" color="text.secondary" align="center" mb={3}>
        Enter your new password below.
      </Typography>
      
      {success ? (
        <Box>
          <Alert severity="success" sx={{ mb: 3 }}>
            Your password has been reset successfully.
          </Alert>
          <Typography variant="body2" align="center" mt={2}>
            You will be redirected to the login page in a few seconds...
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
          {generalError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {generalError}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formValues.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password || 'Minimum 6 characters'}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formValues.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
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
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </Button>
              </Grid>
            </Grid>
          </form>
          
          <Box mt={3} textAlign="center">
            <Typography variant="body2">
              Remember your password?{' '}
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

export default ResetPasswordForm;