import React from 'react';
import { Box, Typography, Button } from '@mui/material';

/**
 * EmptyState component displays a message when there's no data to show, with an optional action
 */
export const EmptyState = ({ 
  title, 
  description, 
  actionLabel = null, 
  actionHandler = null,
  icon = null 
}) => {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      textAlign="center"
      py={6}
      px={2}
    >
      {icon && (
        <Box mb={2} color="text.secondary">
          {icon}
        </Box>
      )}
      
      <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
        {title}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" mb={3} maxWidth="md">
        {description}
      </Typography>
      
      {actionLabel && actionHandler && (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={actionHandler}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

// Add default export that references the named export
export default EmptyState;