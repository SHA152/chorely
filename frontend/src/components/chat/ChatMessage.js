// src/components/chat/ChatMessage.js
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  Paper, 
  IconButton, 
  Menu, 
  MenuItem,
  Tooltip
} from '@mui/material';
import { 
  MoreVert as MoreIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ChatMessage displays a single message in the chat
 */
const ChatMessage = ({ message, onDelete }) => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Check if current user is the message author
  const isCurrentUser = user && user.user_id === message.user_id;
  
  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Open message menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Close message menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle message deletion
  const handleDelete = () => {
    onDelete(message.message_id);
    handleMenuClose();
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isCurrentUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        mb: 2,
      }}
    >
      {!isCurrentUser && (
        <Avatar
          alt={message.name}
          src={message.avatar_id ? `/uploads/images/${message.avatar_id}` : ''}
          sx={{ mr: 1 }}
        >
          {message.name?.charAt(0) || 'U'}
        </Avatar>
      )}
      
      <Box
        sx={{
          maxWidth: '70%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
        }}
      >
        {!isCurrentUser && (
          <Typography variant="subtitle2" sx={{ ml: 1 }}>
            {message.name}
          </Typography>
        )}
        
        <Box display="flex" alignItems="center">
          {isCurrentUser && (
            <Box position="relative">
              <IconButton 
                size="small" 
                onClick={handleMenuOpen}
                sx={{ 
                  opacity: anchorEl ? 1 : 0,
                  transition: 'opacity 0.2s',
                  '&:hover': { opacity: 1 },
                  position: 'absolute',
                  right: '100%',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              >
                <MoreIcon fontSize="small" />
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                  Delete
                </MenuItem>
              </Menu>
            </Box>
          )}
          
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: isCurrentUser ? 'primary.light' : 'grey.100',
              color: isCurrentUser ? 'white' : 'inherit',
              ml: isCurrentUser ? 1 : 0,
              mr: isCurrentUser ? 0 : 1,
              border: isCurrentUser ? 'none' : '1px solid rgba(0, 0, 0, 0.05)',
            }}
          >
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {message.message_text}
            </Typography>
          </Paper>
        </Box>
        
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ mx: 1, mt: 0.5 }}
        >
          {formatTime(message.created_at)}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatMessage;