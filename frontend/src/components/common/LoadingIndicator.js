import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * LoadingIndicator component shows a loading spinner with optional message
 */
export const LoadingIndicator = ({ message = 'Loading...' }) => {
  return (
    <Box 
      display="flex" 
      flexDirection="column"
      alignItems="center" 
      justifyContent="center" 
      minHeight="200px"
    >
      <CircularProgress size={40} />
      {message && (
        <Typography variant="body1" color="text.secondary" mt={2}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

// Add default export that references the named export
export default LoadingIndicator;