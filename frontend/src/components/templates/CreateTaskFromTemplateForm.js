// src/components/templates/CreateTaskFromTemplateForm.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Typography,
  Divider,
  Grid,
  Chip,
  FormHelperText
} from '@mui/material';
import { homeService } from '../../api/api';
import { CategoryIcon } from './CategoryIcon';

/**
 * CreateTaskFromTemplateForm allows creating a task based on a template
 */
const CreateTaskFromTemplateForm = ({ 
  template, 
  onSubmit, 
  loading = false,
  onCancel 
}) => {
  const [formValues, setFormValues] = useState({
    task_name: '',
    description: '',
    home_id: '',
    assigned_user_id: ''
  });
  const [errors, setErrors] = useState({});
  const [homes, setHomes] = useState([]);
  const [homeUsers, setHomeUsers] = useState([]);
  const [loadingHomes, setLoadingHomes] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Initialize form values from template
  useEffect(() => {
    if (template) {
      setFormValues(prev => ({
        ...prev,
        task_name: template.template_name,
        description: template.description || ''
      }));
    }
  }, [template]);
  
  // Fetch user's homes
  useEffect(() => {
    const fetchHomes = async () => {
      try {
        setLoadingHomes(true);
        const { data } = await homeService.getHomes();
        setHomes(data);
        
        // If only one home exists, auto-select it
        if (data.length === 1) {
          setFormValues(prev => ({
            ...prev,
            home_id: data[0].home_id
          }));
        }
      } catch (error) {
        console.error('Failed to fetch homes:', error);
      } finally {
        setLoadingHomes(false);
      }
    };
    
    fetchHomes();
  }, []);
  
  // Fetch home users when home is selected
  useEffect(() => {
    const fetchHomeUsers = async () => {
      if (!formValues.home_id) return;
      
      try {
        setLoadingUsers(true);
        const { data } = await homeService.getHomeUsers(formValues.home_id);
        setHomeUsers(data);
      } catch (error) {
        console.error('Failed to fetch home users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchHomeUsers();
  }, [formValues.home_id]);
  
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
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formValues.task_name.trim()) {
      newErrors.task_name = 'Task name is required';
    }
    
    if (!formValues.home_id) {
      newErrors.home_id = 'Home is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Format data to match API expectations
      const submissionData = {
        task_name: formValues.task_name.trim(),
        description: formValues.description.trim(),
        home_id: formValues.home_id,
        // Only include assigned_user_id if it has a value
        ...(formValues.assigned_user_id ? { assigned_user_id: formValues.assigned_user_id } : {})
      };
      
      onSubmit(submissionData);
    }
  };
  
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
  
  // Format repeat interval
  const formatRepeatInterval = (interval) => {
    if (!interval) return 'One-time task';
    
    if (interval === 'daily' || interval === 1) {
      return 'Daily';
    } else if (interval === 'weekly' || interval === 7) {
      return 'Weekly';
    } else if (interval === 'biweekly' || interval === 14) {
      return 'Bi-weekly';
    } else if (interval === 'monthly' || interval === 30 || interval === 31) {
      return 'Monthly';
    } else {
      return `Every ${interval} days`;
    }
  };
  
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.12)' }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Create Task from Template
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Template Information
        </Typography>
        
        <Box display="flex" alignItems="center" mb={1}>
          <CategoryIcon category={template.category} />
          <Typography 
            variant="subtitle2" 
            color="text.secondary" 
            sx={{ ml: 1 }}
          >
            {template.category}
          </Typography>
        </Box>
        
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          <Chip 
            label={template.difficulty_level}
            size="small"
            color={getDifficultyColor(template.difficulty_level)}
          />
          
          <Chip 
            label={`${template.points} points`}
            size="small"
            color="secondary"
          />
          
          {template.repeat_interval && (
            <Chip 
              label={`Repeats: ${formatRepeatInterval(template.repeat_interval)}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </Box>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Task Name"
              name="task_name"
              value={formValues.task_name}
              onChange={handleChange}
              error={!!errors.task_name}
              helperText={errors.task_name}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formValues.description}
              onChange={handleChange}
              multiline
              rows={3}
              placeholder="Describe what needs to be done..."
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl 
              fullWidth 
              error={!!errors.home_id} 
              required
              disabled={loadingHomes}
            >
              <InputLabel>Select Home</InputLabel>
              <Select
                name="home_id"
                value={formValues.home_id}
                onChange={handleChange}
                label="Select Home"
              >
                {homes.map((home) => (
                  <MenuItem key={home.home_id} value={home.home_id}>
                    {home.home_name}
                  </MenuItem>
                ))}
                {homes.length === 0 && !loadingHomes && (
                  <MenuItem disabled>
                    <em>No homes available</em>
                  </MenuItem>
                )}
              </Select>
              {errors.home_id && (
                <FormHelperText error>{errors.home_id}</FormHelperText>
              )}
              {loadingHomes && (
                <FormHelperText>Loading homes...</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControl 
              fullWidth 
              disabled={!formValues.home_id || loadingUsers}
            >
              <InputLabel>Assign To (Optional)</InputLabel>
              <Select
                name="assigned_user_id"
                value={formValues.assigned_user_id}
                onChange={handleChange}
                label="Assign To (Optional)"
                displayEmpty
              >
                <MenuItem value="">
                  <em>Unassigned</em>
                </MenuItem>
                {homeUsers.map((user) => (
                  <MenuItem key={user.user_id} value={user.user_id}>
                    {user.name}
                  </MenuItem>
                ))}
                {homeUsers.length === 0 && !loadingUsers && formValues.home_id && (
                  <MenuItem disabled>
                    <em>No members in this home</em>
                  </MenuItem>
                )}
              </Select>
              {loadingUsers && (
                <FormHelperText>Loading members...</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" mt={2} gap={2}>
              {onCancel && (
                <Button 
                  variant="outlined" 
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Task'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default CreateTaskFromTemplateForm;