// src/components/homes/HomeInviteForm.js
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Divider,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Send as SendIcon
} from '@mui/icons-material';

/**
 * HomeInviteForm provides ways to invite users to a home
 */
const HomeInviteForm = ({ 
  homeId, 
  homeName, 
  onInviteByEmail 
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Generate invite link
  const inviteLink = `${window.location.origin}/join/${homeId}`;
  
  // Handle email input change
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };
  
  // Validate email
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  // Handle send invite
  const handleSendInvite = () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    onInviteByEmail(email);
    setEmail('');
  };
  
  // Handle copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setSnackbarMessage('Invite link copied to clipboard!');
    setSnackbarOpen(true);
  };
  
  // Close snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.12)' }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Invite to {homeName}
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Box mb={3}>
        <Typography variant="subtitle2" gutterBottom>
          Share invite link
        </Typography>
        <TextField
          fullWidth
          value={inviteLink}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  edge="end" 
                  onClick={handleCopyLink}
                  aria-label="copy invite link"
                >
                  <CopyIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          variant="outlined"
          size="small"
        />
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Invite by email
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            fullWidth
            label="Email Address"
            value={email}
            onChange={handleEmailChange}
            error={!!error}
            helperText={error}
            size="small"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendInvite}
            startIcon={<SendIcon />}
          >
            Send
          </Button>
        </Box>
      </Box>
      
      {/* Copy confirmation */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default HomeInviteForm;