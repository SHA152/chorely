// src/components/homes/MemberList.js
import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Chip,
  Divider,
  Paper,
  Box
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  AdminPanelSettings as AdminIcon,
  Person as MemberIcon,
  ArrowUpward as PromoteIcon,
  ArrowDownward as DemoteIcon,
  ExitToApp as RemoveIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

/**
 * MemberList displays a list of members in a home/group with admin actions
 */
const MemberList = ({ 
  members, 
  isAdmin = false, 
  onPromote, 
  onDemote, 
  onRemove 
}) => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Open action menu
  const handleMenuOpen = (event, member) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };
  
  // Close action menu
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };
  
  // Handle promote member
  const handlePromote = () => {
    if (onPromote && selectedMember) {
      onPromote(selectedMember);
      handleMenuClose();
    }
  };
  
  // Handle demote member
  const handleDemote = () => {
    if (onDemote && selectedMember) {
      onDemote(selectedMember);
      handleMenuClose();
    }
  };
  
  // Handle remove member
  const handleRemove = () => {
    if (onRemove && selectedMember) {
      onRemove(selectedMember);
      handleMenuClose();
    }
  };
  
  return (
    <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ p: 2, backgroundColor: '#f5f7fa' }}>
        <Typography variant="h6" component="h2">
          Members ({members.length})
        </Typography>
      </Box>
      <Divider />
      
      <List sx={{ p: 0 }}>
        {members.map((member, index) => (
          <React.Fragment key={member.user_id}>
            {index > 0 && <Divider component="li" />}
            <ListItem>
              <ListItemAvatar>
                <Avatar 
                  alt={member.name} 
                  src={member.avatar_id ? `/uploads/images/${member.avatar_id}` : ''}
                >
                  {member.name.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              
              <ListItemText 
                primary={
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle1" component="span">
                      {member.name}
                    </Typography>
                    {member.user_id === user?.user_id && (
                      <Chip 
                        label="You" 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box display="flex" alignItems="center">
                    {member.role === 'admin' ? (
                      <>
                        <AdminIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="primary" component="span">
                          Admin
                        </Typography>
                      </>
                    ) : (
                      <>
                        <MemberIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary" component="span">
                          Member
                        </Typography>
                      </>
                    )}
                    
                    {member.status === 'paused' && (
                      <Chip 
                        label="On Break" 
                        size="small" 
                        color="warning" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                }
              />
              
              {isAdmin && member.user_id !== user?.user_id && (
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    onClick={(event) => handleMenuOpen(event, member)}
                  >
                    <MoreIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          </React.Fragment>
        ))}
        
        {members.length === 0 && (
          <ListItem>
            <ListItemText 
              primary="No members found" 
              secondary="Invite people to join your home"
            />
          </ListItem>
        )}
      </List>
      
      {/* Action menu for admins */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedMember && selectedMember.role !== 'admin' && (
          <MenuItem onClick={handlePromote}>
            <PromoteIcon fontSize="small" sx={{ mr: 1 }} />
            Promote to Admin
          </MenuItem>
        )}
        
        {selectedMember && selectedMember.role === 'admin' && (
          <MenuItem onClick={handleDemote}>
            <DemoteIcon fontSize="small" sx={{ mr: 1 }} />
            Demote to Member
          </MenuItem>
        )}
        
        <Divider />
        
        <MenuItem onClick={handleRemove} sx={{ color: 'error.main' }}>
          <RemoveIcon fontSize="small" sx={{ mr: 1 }} />
          Remove from Home
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default MemberList;