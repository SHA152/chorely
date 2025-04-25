// src/components/tasks/TaskForm.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Button,
  Grid,
  Paper,
  Typography,
  Divider
} from '@mui/material';
import { homeService } from '../../api/api';

/**
 * TaskForm component for creating and editing tasks
 */
const TaskForm = ({ 
  initialValues = {}, 
  homeId,
  onSubmit, 
  isEditing = false 
}) => {
  const [formValues, setFormValues] = useState({
    task_name: '',
    description: '',
    difficulty_level: 'Medium',
    task_type: 'regular',
    repeat_interval: '',
    points: 10,
    assigned_user_id: '',
    home_id: homeId || '',
    ...initialValues
  });
  
  const [homeUsers, setHomeUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Fetch home users for assignment dropdown
  useEffect(() => {
    const fetchHomeUsers = async () => {
      if (!formValues.home_id) return;
      
      try {
        setLoading(true);
        const { data } = await homeService.getHomeUsers(formValues.home_id);
        setHomeUsers(data);
      } catch (error) {
        console.error('Failed to fetch home users:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomeUsers();
  }, [formValues.home_id]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update points based on difficulty level
    if (name === 'difficulty_level') {
      let points = 10;
      switch(value) {
        case 'Easy':
          points = 5;
          break;
        case 'Medium':
          points = 10;
          break;
        case 'Hard':
          points = 20;
          break;
        default:
          points = 10;
      }
      
      setFormValues(prev => ({
        ...prev,
        [name]: value,
        points
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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
    
    if (formValues.repeat_interval && isNaN(formValues.repeat_interval)) {
      newErrors.repeat_interval = 'Repeat interval must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formValues);
    }
  };
  
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.12)' }}>
      <Typography variant="h6" component="h2" gutterBottom>
        {isEditing ? 'Edit Task' : 'Create New Task'}
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
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
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.difficulty_level}>
              <InputLabel>Difficulty Level</InputLabel>
              <Select
                name="difficulty_level"
                value={formValues.difficulty_level}
                onChange={handleChange}
                label="Difficulty Level"
              >
                <MenuItem value="Easy">Easy (5 points)</MenuItem>
                <MenuItem value="Medium">Medium (10 points)</MenuItem>
                <MenuItem value="Hard">Hard (20 points)</MenuItem>
              </Select>
              {errors.difficulty_level && (
                <FormHelperText>{errors.difficulty_level}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.task_type}>
              <InputLabel>Task Type</InputLabel>
              <Select
                name="task_type"
                value={formValues.task_type}
                onChange={handleChange}
                label="Task Type"
              >
                <MenuItem value="regular">Regular</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
              </Select>
              {errors.task_type && (
                <FormHelperText>{errors.task_type}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Repeat Interval (days)"
              name="repeat_interval"
              type="number"
              value={formValues.repeat_interval}
              onChange={handleChange}
              error={!!errors.repeat_interval}
              helperText={errors.repeat_interval || 'Leave empty for one-time tasks'}
              inputProps={{ min: 0 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Points"
              name="points"
              type="number"
              value={formValues.points}
              onChange={handleChange}
              error={!!errors.points}
              helperText={errors.points}
              inputProps={{ min: 1 }}
              InputProps={{
                readOnly: true
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.assigned_user_id}>
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
              </Select>
              {errors.assigned_user_id && (
                <FormHelperText>{errors.assigned_user_id}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={loading}
              >
                {isEditing ? 'Update Task' : 'Create Task'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default TaskForm;