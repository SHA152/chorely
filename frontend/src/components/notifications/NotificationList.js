// src/components/notifications/NotificationList.js
import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Typography,
  Box,
  Divider,
  Paper,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DoneAll as MarkReadIcon,
  Notifications as NotificationIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Task as TaskIcon,
  CheckCircle as CompletedIcon,
  AccessTime as OverdueIcon,
  Add as AddIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { LoadingIndicator, EmptyState } from '../common/EmptyState';

/**
 * NotificationList displays a list of user notifications
 */
const NotificationList = ({
  notifications,
  loading,
  error,
  onMarkAsRead,
  onDelete,
  onMarkAllAsRead
}) => {
  // Format notification timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Within today - show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Get icon for notification type
  const getNotificationIcon = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('task') && lowerMessage.includes('complete')) {
      return <CompletedIcon color="success" />;
    } else if (lowerMessage.includes('task') && lowerMessage.includes('overdue')) {
      return <OverdueIcon color="error" />;
    } else if (lowerMessage.includes('task')) {
      return <TaskIcon color="primary" />;
    } else if (lowerMessage.includes('home') && (lowerMessage.includes('join') || lowerMessage.includes('added'))) {
      return <AddIcon color="primary" />;
    } else if (lowerMessage.includes('home')) {
      return <HomeIcon color="primary" />;
    } else if (lowerMessage.includes('user') || lowerMessage.includes('member')) {
      return <PersonIcon color="primary" />;
    } else {
      return <InfoIcon color="action" />;
    }
  };
  
  if (loading) {
    return <LoadingIndicator message="Loading notifications..." />;
  }
  
  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  
  if (!notifications || notifications.length === 0) {
    return (
      <EmptyState
        title="No notifications"
        description="You're all caught up! New notifications will appear here."
        icon={<NotificationIcon fontSize="large" />}
      />
    );
  }
  
  return (
    <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box 
        sx={{ 
          p: 2, 
          backgroundColor: '#f5f7fa', 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6" component="h2">
          Notifications
        </Typography>
        
        {notifications.some(n => !n.is_read) && (
          <Tooltip title="Mark all as read">
            <IconButton onClick={onMarkAllAsRead} size="small">
              <MarkReadIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Divider />
      
      <List sx={{ p: 0 }}>
        {notifications.map((notification) => (
          <React.Fragment key={notification.notification_id}>
            <ListItem 
              alignItems="flex-start"
              sx={{
                backgroundColor: !notification.is_read ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                py: 1.5
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: !notification.is_read ? 'primary.light' : 'grey.300' }}>
                  {getNotificationIcon(notification.message)}
                </Avatar>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography 
                      variant="subtitle1" 
                      component="span"
                      sx={{ fontWeight: !notification.is_read ? 'bold' : 'normal' }}
                    >
                      {notification.message}
                    </Typography>
                    
                    {!notification.is_read && (
                      <Chip 
                        label="New" 
                        size="small" 
                        color="primary" 
                        sx={{ height: 20 }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                  >
                    {formatTime(notification.created_at)}
                  </Typography>
                }
              />
              
              <ListItemSecondaryAction>
                <Box>
                  {!notification.is_read && (
                    <Tooltip title="Mark as read">
                      <IconButton 
                        edge="end" 
                        onClick={() => onMarkAsRead(notification.notification_id)}
                        size="small"
                      >
                        <MarkReadIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  <Tooltip title="Delete">
                    <IconButton 
                      edge="end" 
                      onClick={() => onDelete(notification.notification_id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default NotificationList;

