// src/components/homes/HomeCreationForm.js
import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Divider,
  Grid,
  FormHelperText,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Home as HomeIcon,
  Info as InfoIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

/**
 * HomeCreationForm component for creating new homes/groups
 * 
 * This form provides a comprehensive and user-friendly interface
 * for creating a new home with robust validation and user guidance.
 */
const HomeCreationForm = ({ 
  onSubmit, 
  loading = false,
  initialData = {} 
}) => {
  // Initial form state with spread of initial data
  const [formValues, setFormValues] = useState({
    home_name: initialData.home_name || '',
    description: initialData.description || ''
  });

  // Validation state to track field-specific errors
  const [errors, setErrors] = useState({
    home_name: '',
    description: ''
  });

  // Comprehensive form validation
  const validateForm = useCallback(() => {
    const newErrors = {
      home_name: '',
      description: ''
    };

    // Home name validations
    if (!formValues.home_name.trim()) {
      newErrors.home_name = 'Home name is required';
    } else if (formValues.home_name.length < 3) {
      newErrors.home_name = 'Home name must be at least 3 characters';
    } else if (formValues.home_name.length > 50) {
      newErrors.home_name = 'Home name cannot exceed 50 characters';
    }

    // Description validations (optional)
    if (formValues.description && formValues.description.length > 200) {
      newErrors.description = 'Description cannot exceed 200 characters';
    }

    setErrors(newErrors);
    
    // Form is valid if no errors exist
    return Object.values(newErrors).every(error => error === '');
  }, [formValues]);

  // Handle input changes with real-time validation
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific field error on typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  // Clear input field
  const handleClearField = useCallback((field) => {
    setFormValues(prev => ({
      ...prev,
      [field]: ''
    }));
    
    // Clear any associated errors
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (validateForm()) {
      // Trim whitespace from inputs
      const sanitizedData = {
        home_name: formValues.home_name.trim(),
        description: formValues.description.trim() || undefined
      };
      
      onSubmit(sanitizedData);
    }
  }, [validateForm, formValues, onSubmit]);

  // Memoized character count helpers
  const charCounts = useMemo(() => ({
    home_name: formValues.home_name.trim().length,
    description: formValues.description.trim().length
  }), [formValues]);

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        borderRadius: 2, 
        border: '1px solid rgba(0, 0, 0, 0.12)' 
      }}
    >
      <Box display="flex" alignItems="center" mb={2}>
        <HomeIcon color="primary" sx={{ mr: 2 }} />
        <Typography variant="h6" component="h2" color="primary">
          Create New Home
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />
      
      <form onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          {/* Home Name Input */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Home Name"
              name="home_name"
              value={formValues.home_name}
              onChange={handleChange}
              error={!!errors.home_name}
              helperText={errors.home_name || `${charCounts.home_name}/50 characters`}
              required
              InputProps={{
                endAdornment: formValues.home_name && (
                  <InputAdornment position="end">
                    <Tooltip title="Clear home name">
                      <IconButton
                        aria-label="clear home name"
                        onClick={() => handleClearField('home_name')}
                        edge="end"
                        size="small"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
              inputProps={{
                maxLength: 50
              }}
            />
          </Grid>
          
          {/* Description Input */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description (Optional)"
              name="description"
              value={formValues.description}
              onChange={handleChange}
              multiline
              rows={3}
              placeholder="Add a brief description of your home, like 'Awesome Roommates' or 'Family Home'"
              error={!!errors.description}
              helperText={
                errors.description || 
                `${charCounts.description}/200 characters`
              }
              InputProps={{
                endAdornment: formValues.description && (
                  <InputAdornment position="end">
                    <Tooltip title="Clear description">
                      <IconButton
                        aria-label="clear description"
                        onClick={() => handleClearField('description')}
                        edge="end"
                        size="small"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
              inputProps={{
                maxLength: 200
              }}
            />
          </Grid>
          
          {/* Guidance Note */}
          <Grid item xs={12}>
            <Box 
              display="flex" 
              alignItems="center" 
              bgcolor="background.default" 
              p={2} 
              borderRadius={2}
            >
              <InfoIcon 
                color="info" 
                sx={{ mr: 2, fontSize: 24 }} 
              />
              <Typography variant="body2" color="text.secondary">
                Choose a name that helps identify your home or group. 
                This could be a family name, apartment number, or any 
                meaningful identifier.
              </Typography>
            </Box>
          </Grid>
          
          {/* Submit Button */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={loading}
                startIcon={loading ? null : <HomeIcon />}
              >
                {loading ? 'Creating...' : 'Create Home'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

// Prop type validation
HomeCreationForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  initialData: PropTypes.shape({
    home_name: PropTypes.string,
    description: PropTypes.string
  })
};

export default HomeCreationForm;