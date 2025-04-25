// src/components/chat/ChatMessageList.js
import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import ChatMessage from './ChatMessage';
import { EmptyState } from '../common/EmptyState';
import { Chat as ChatIcon } from '@mui/icons-material';

/**
 * ChatMessageList displays all messages in the chat
 */
const ChatMessageList = ({ 
  messages, 
  loading, 
  error, 
  onDeleteMessage 
}) => {
  // Group messages by date for date separators
  const groupedMessages = () => {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };
  
  if (loading && messages.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress size={40} />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  
  if (messages.length === 0) {
    return (
      <EmptyState
        title="No messages yet"
        description="Start a conversation with your housemates!"
        icon={<ChatIcon fontSize="large" />}
      />
    );
  }
  
  const messageGroups = groupedMessages();
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {Object.entries(messageGroups).map(([date, dayMessages]) => (
        <Box key={date}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              my: 2
            }}
          >
            <Box sx={{ flex: 1, height: '1px', backgroundColor: 'divider' }} />
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                px: 2, 
                backgroundColor: 'background.default',
                borderRadius: 1,
                py: 0.5
              }}
            >
              {new Date(date).toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
            <Box sx={{ flex: 1, height: '1px', backgroundColor: 'divider' }} />
          </Box>
          
          {dayMessages.map(message => (
            <ChatMessage 
              key={message.message_id} 
              message={message} 
              onDelete={onDeleteMessage} 
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default ChatMessageList;