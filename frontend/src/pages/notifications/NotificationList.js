import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, Divider, Button } from '@mui/material';
import { notificationService } from '../../api/api';
// Import from the index file, not directly from component files
import { ErrorDisplay, LoadingIndicator, EmptyState } from '../../components/common';

// Import the notification component if it exists, otherwise use a simple component
const NotificationItem = ({ notification, onMarkAsRead }) => {
  return (
    <Box sx={{ p: 2, bgcolor: notification.is_read ? 'inherit' : 'action.hover' }}>
      <Typography variant="body1" fontWeight={notification.is_read ? 'normal' : 'bold'}>
        {notification.message || 'Notification message'}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {new Date(notification.created_at).toLocaleString()}
      </Typography>
      {!notification.is_read && (
        <Button size="small" onClick={onMarkAsRead}>
          Mark as read
        </Button>
      )}
    </Box>
  );
};

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await notificationService.getNotifications();
      setNotifications(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (err) {
      console.error(`Failed to mark notification ${notificationId} as read:`, err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({
          ...notification,
          is_read: true
        }))
      );
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchNotifications} />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Notifications</Typography>
        {notifications.some(notification => !notification.is_read) && (
          <Button variant="outlined" onClick={handleMarkAllAsRead}>
            Mark All as Read
          </Button>
        )}
      </Box>

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You don't have any notifications yet."
        />
      ) : (
        <Paper elevation={1} sx={{ borderRadius: 2 }}>
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id || index}>
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={() => handleMarkAsRead(notification.id)}
                />
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default NotificationList;