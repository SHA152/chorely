// src/components/chat/ChatInput.js
import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  IconButton,
  InputAdornment,
  Tooltip
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

/**
 * ChatInput provides a text field for sending messages
 */
const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  
  // Handle input change
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };
  
  // Handle message submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  // Handle enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };
  
  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit}
      sx={{ 
        p: 2,
        backgroundColor: 'background.paper'
      }}
    >
      <TextField
        fullWidth
        placeholder="Type a message..."
        value={message}
        onChange={handleMessageChange}
        onKeyPress={handleKeyPress}
        multiline
        maxRows={4}
        variant="outlined"
        size="small"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="Send message">
                <IconButton 
                  color="primary" 
                  onClick={handleSubmit}
                  disabled={!message.trim()}
                >
                  <SendIcon />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

export default ChatInput;