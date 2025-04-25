
// src/components/templates/TemplateDetailModal.js
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Autorenew as RepeatIcon,
  Star as PointsIcon,
  CalendarToday as DateIcon,
  ContentCopy as UseTemplateIcon
} from '@mui/icons-material';
import { CategoryIcon } from './CategoryIcon';

/**
 * TemplateDetailModal shows detailed information about a template
 */
const TemplateDetailModal = ({ 
  open, 
  onClose, 
  template, 
  onUseTemplate 
}) => {
  if (!template) return null;
  
  // Format difficulty and determine color
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
  
  // Format estimated time
  const formatEstimatedTime = (minutes) => {
    if (!minutes) return 'N/A';
    
    if (minutes < 60) {
      return `${minutes} mins`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMins = minutes % 60;
      
      if (remainingMins === 0) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      } else {
        return `${hours}h ${remainingMins}m`;
      }
    }
  };
  
  // Format repeat interval
  const formatRepeatInterval = (interval) => {
    if (!interval) return 'One-time';
    
    switch(interval) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'biweekly':
        return 'Bi-weekly';
      case 'monthly':
        return 'Monthly';
      default:
        if (interval.includes('days')) {
          return interval;
        }
        return `Every ${interval}`;
    }
  };
  
  // Format creation date
  const formatCreationDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Template Details
        </Typography>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h5" component="h2">
              {template.template_name}
            </Typography>
            
            <Chip 
              label={`${template.points} pts`}
              color="secondary"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          
          <Box display="flex" alignItems="center" mb={2}>
            <CategoryIcon category={template.category} />
            <Typography 
              variant="subtitle1" 
              color="text.secondary" 
              sx={{ ml: 1 }}
            >
              {template.category}
            </Typography>
          </Box>
          
          <Chip 
            label={template.difficulty_level}
            color={getDifficultyColor(template.difficulty_level)}
            sx={{ mr: 1 }}
          />
        </Box>
        
        <Typography variant="body1" paragraph>
          {template.description || 'No description provided.'}
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <TimeIcon color="action" />
                </ListItemIcon>
                <ListItemText 
                  primary="Estimated Time" 
                  secondary={formatEstimatedTime(template.estimated_time)} 
                />
              </ListItem>
              
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <RepeatIcon color="action" />
                </ListItemIcon>
                <ListItemText 
                  primary="Repeat Interval" 
                  secondary={formatRepeatInterval(template.repeat_interval)} 
                />
              </ListItem>
            </List>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <PointsIcon color="action" />
                </ListItemIcon>
                <ListItemText 
                  primary="Points" 
                  secondary={template.points} 
                />
              </ListItem>
              
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <DateIcon color="action" />
                </ListItemIcon>
                <ListItemText 
                  primary="Created" 
                  secondary={formatCreationDate(template.created_at)} 
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<UseTemplateIcon />}
          onClick={() => {
            onUseTemplate(template);
            onClose();
          }}
        >
          Use Template
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TemplateDetailModal;