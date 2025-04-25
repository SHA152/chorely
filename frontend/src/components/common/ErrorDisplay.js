import React from 'react';
import { Alert, AlertTitle, Box, Button } from '@mui/material';

/**
 * ErrorDisplay component displays error messages
 */
export const ErrorDisplay = ({ error, onRetry = null }) => {
  if (!error) return null;
  
  return (
    <Box my={2}>
      <Alert 
        severity="error" 
        action={
          onRetry && (
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          )
        }
      >
        <AlertTitle>Error</AlertTitle>
        {typeof error === 'string' ? error : error.message || 'An error occurred'}
      </Alert>
    </Box>
  );
};

// Add default export that references the named export
export default ErrorDisplay;