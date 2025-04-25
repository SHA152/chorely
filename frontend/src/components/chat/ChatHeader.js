// src/components/chat/ChatHeader.js
import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { Group as GroupIcon, MoreVert as MoreIcon } from '@mui/icons-material';

/**
 * ChatHeader displays home/group name and options in the chat header
 */
const ChatHeader = ({ homeName }) => {
  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'background.paper'
      }}
    >
      <Box display="flex" alignItems="center">
        <GroupIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" component="div">
          {homeName}
        </Typography>
      </Box>
      
      <Tooltip title="Chat options">
        <IconButton>
          <MoreIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ChatHeader;