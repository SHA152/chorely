// src/components/notifications/NotificationBell.js
import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Button,
  Box
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon
} from '@mui/icons-material';
import { notificationService } from '../../api/api';
import { useNavigate } from 'react-router-dom';

/**
 * NotificationBell displays a notification bell with count and dropdown
 */
const NotificationBell = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { data } = await notificationService.getUnreadCount();
        setUnreadCount(data.count);
      } catch (error) {
        console.error('Failed to fetch unread notifications count:', error);
      }
    };
    
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Fetch recent notifications when menu is opened
  const fetchRecentNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await notificationService.getNotifications();
      // Get only the 5 most recent notifications
      setNotifications(data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle menu open
  const handleMenuOpen = async (event) => {
    setAnchorEl(event.currentTarget);
    await fetchRecentNotifications();
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
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
  
  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };
  
  // Handle view all notifications
  const handleViewAllNotifications = () => {
    handleMenuClose();
    navigate('/notifications');
  };
  
  return (
    <>
      <IconButton
        aria-label="notifications"
        color="inherit"
        onClick={handleMenuOpen}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? (
            <NotificationsActiveIcon />
          ) : (
            <NotificationsIcon />
          )}
        </Badge>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { width: 320, maxWidth: '100%' }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {loading ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">Loading...</Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          <>
            {notifications.map((notification) => (
              <MenuItem 
                key={notification.notification_id}
                sx={{ 
                  whiteSpace: 'normal', 
                  py: 1.5,
                  backgroundColor: !notification.is_read ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: !notification.is_read ? 'bold' : 'normal',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {notification.message}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(notification.created_at)}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
            
            <Divider />
            
            <Box sx={{ p: 1 }}>
              <Button 
                fullWidth 
                onClick={handleViewAllNotifications}
              >
                View All Notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;