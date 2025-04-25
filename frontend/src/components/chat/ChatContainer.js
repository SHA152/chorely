// src/components/chat/ChatContainer.js
import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Divider } from '@mui/material';
import ChatHeader from './ChatHeader';
import ChatMessageList from './ChatMessageList';
import ChatInput from './ChatInput';
import { chatService } from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ChatContainer is the main chat component that combines header, message list, and input
 */
const ChatContainer = ({ 
  homeId, 
  homeName,
  initialMessages = []
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState(initialMessages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Fetch messages on mount and when homeId changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!homeId) return;
      
      try {
        setLoading(true);
        setError(null);
        const { data } = await chatService.getHomeMessages(homeId);
        setMessages(data);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
        setError('Failed to load messages. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [homeId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Send a new message
  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || !homeId || !user) return;
    
    try {
      // Optimistically add message to UI
      const tempMessage = {
        message_id: `temp-${Date.now()}`,
        home_id: homeId,
        user_id: user.user_id,
        message_text: messageText,
        created_at: new Date().toISOString(),
        name: user.name,
        avatar_id: user.avatar_id
      };
      
      setMessages(prev => [...prev, tempMessage]);
      
      // Send message to server
      const { data } = await chatService.sendMessage(homeId, { message_text: messageText });
      
      // Replace temp message with real one from server
      setMessages(prev => 
        prev.map(msg => 
          msg.message_id === tempMessage.message_id ? data : msg
        )
      );
    } catch (err) {
      console.error('Failed to send message:', err);
      // Remove the temp message if sending failed
      setMessages(prev => 
        prev.filter(msg => msg.message_id !== `temp-${Date.now()}`)
      );
      setError('Failed to send message. Please try again.');
    }
  };
  
  // Delete a message
  const handleDeleteMessage = async (messageId) => {
    try {
      await chatService.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.message_id !== messageId));
    } catch (err) {
      console.error('Failed to delete message:', err);
      setError('Failed to delete message. Please try again.');
    }
  };
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        height: '70vh', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        border: '1px solid rgba(0, 0, 0, 0.12)'
      }}
    >
      <ChatHeader homeName={homeName} />
      <Divider />
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <ChatMessageList 
          messages={messages}
          loading={loading}
          error={error}
          onDeleteMessage={handleDeleteMessage}
        />
        <div ref={messagesEndRef} />
      </Box>
      
      <Divider />
      <ChatInput onSendMessage={handleSendMessage} />
    </Paper>
  );
};

export default ChatContainer;