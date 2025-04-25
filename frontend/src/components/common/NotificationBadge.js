// src/components/common/NotificationBadge.js
import React from 'react';
import { Badge } from '@mui/material';

/**
 * NotificationBadge component displays a badge with notification count
 */
export const NotificationBadge = ({ count = 0, children }) => {
  return (
    <Badge 
      badgeContent={count} 
      color="error"
      max={99}
      overlap="circular"
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      {children}
    </Badge>
  );
};

export default NotificationBadge;