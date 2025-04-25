// src/components/tasks/TaskCompletionForm.js
import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Divider,
  Grid,
  IconButton,
  Stack,
  Alert
} from '@mui/material';
import {
  PhotoCamera as CameraIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { uploadService } from '../../api/api';

/**
 * TaskCompletionForm component for submitting task completion with photo evidence
 */
const TaskCompletionForm = ({ task, onSubmit, onCancel }) => {
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [beforeImagePreview, setBeforeImagePreview] = useState(null);
  const [afterImagePreview, setAfterImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle image selection
  const handleImageChange = (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    // Generate preview
    const reader = new FileReader();
    reader.onload = () => {
      if (imageType === 'before') {
        setBeforeImage(file);
        setBeforeImagePreview(reader.result);
      } else {
        setAfterImage(file);
        setAfterImagePreview(reader.result);
      }
      setError(null);
    };
    reader.readAsDataURL(file);
  };
  
  // Remove image
  const removeImage = (imageType) => {
    if (imageType === 'before') {
      setBeforeImage(null);
      setBeforeImagePreview(null);
    } else {
      setAfterImage(null);
      setAfterImagePreview(null);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log("Starting task completion process for task:", task);
      
      // Create a form data object for uploading images
      const formData = new FormData();
      
      // Add task_id as we might need it for backend processing
      formData.append('task_id', task.task_id);
      
      // Add assignment_id if it exists
      if (task.assignment_id) {
        formData.append('assignment_id', task.assignment_id);
      }
      
      // Add images if available
      if (beforeImage) {
        formData.append('before_image', beforeImage);
      }
      
      if (afterImage) {
        formData.append('after_image', afterImage);
      }
      
      console.log("Uploading task completion images...");
      
      // Upload images
      const { data } = await uploadService.uploadTaskImages(formData);
      
      console.log("Upload successful, response:", data);
      
      // Prepare completion data
      const completionData = {
        task_id: task.task_id,
        before_image_url: data.before_image_url,
        after_image_url: data.after_image_url
      };
      
      // Add assignment_id if available
      if (task.assignment_id) {
        completionData.assignment_id = task.assignment_id;
      }
      
      console.log("Submitting completion data:", completionData);
      
      // Call the parent's onSubmit callback with completion data
      onSubmit(completionData);
    } catch (error) {
      console.error('Failed to upload images:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
      
      setError('Failed to upload images. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.12)' }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Complete Task: {task.task_name}
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Before (Optional)
            </Typography>
            
            <Box 
              sx={{ 
                height: 200, 
                border: '1px dashed #ccc', 
                borderRadius: 1, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#f5f5f5'
              }}
            >
              {beforeImagePreview ? (
                <>
                  <img 
                    src={beforeImagePreview} 
                    alt="Before" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%', 
                      objectFit: 'contain' 
                    }} 
                  />
                  <IconButton 
                    size="small" 
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8, 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)' 
                    }}
                    onClick={() => removeImage('before')}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              ) : (
                <Stack direction="column" alignItems="center" spacing={1}>
                  <input
                    accept="image/*"
                    id="before-image-upload"
                    type="file"
                    hidden
                    onChange={(e) => handleImageChange(e, 'before')}
                  />
                  <label htmlFor="before-image-upload">
                    <Button 
                      variant="outlined" 
                      component="span" 
                      startIcon={<CameraIcon />}
                    >
                      Upload Before Photo
                    </Button>
                  </label>
                  <Typography variant="caption" color="text.secondary">
                    Show the area before cleaning/fixing
                  </Typography>
                </Stack>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              After (Required)
            </Typography>
            
            <Box 
              sx={{ 
                height: 200, 
                border: '1px dashed #ccc', 
                borderRadius: 1, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#f5f5f5'
              }}
            >
              {afterImagePreview ? (
                <>
                  <img 
                    src={afterImagePreview} 
                    alt="After" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%', 
                      objectFit: 'contain' 
                    }} 
                  />
                  <IconButton 
                    size="small" 
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8, 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)' 
                    }}
                    onClick={() => removeImage('after')}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              ) : (
                <Stack direction="column" alignItems="center" spacing={1}>
                  <input
                    accept="image/*"
                    id="after-image-upload"
                    type="file"
                    hidden
                    onChange={(e) => handleImageChange(e, 'after')}
                    required
                  />
                  <label htmlFor="after-image-upload">
                    <Button 
                      variant="outlined" 
                      component="span" 
                      startIcon={<CameraIcon />}
                    >
                      Upload After Photo
                    </Button>
                  </label>
                  <Typography variant="caption" color="text.secondary">
                    Show the completed task
                  </Typography>
                </Stack>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button 
                variant="outlined" 
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="success"
                disabled={loading || !afterImage}
              >
                {loading ? 'Uploading...' : 'Complete Task'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default TaskCompletionForm;