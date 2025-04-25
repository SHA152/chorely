// src/components/homes/HomeCard.js
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Box, 
  Chip, 
  Avatar, 
  AvatarGroup, 
  Button,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Group as MembersIcon,
  Task as TaskIcon,
  ArrowForward as ArrowIcon,
  Lock as PrivacyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getRandomColor } from '../../utils/colors';
import PropTypes from 'prop-types';
import { taskService, homeService } from '../../api/api';

/**
 * HomeCard displays a home/group in a card format with comprehensive information
 */
const HomeCard = ({ 
  home, 
  showActions = true 
}) => {
  const navigate = useNavigate();
  const [taskCount, setTaskCount] = useState(home?.task_count || 0);
  const [memberCount, setMemberCount] = useState(home?.member_count || (home?.members?.length || 0));
  
  // Fetch task count directly when component mounts
  useEffect(() => {
    // Only fetch if home_id exists and either taskCount is 0 or undefined
    if (home?.home_id && !taskCount) {
      const fetchTaskCount = async () => {
        try {
          const response = await taskService.getHomeTasks(home.home_id);
          if (response && response.data) {
            setTaskCount(response.data.length);
            console.log(`Fetched ${response.data.length} tasks for home ${home.home_id}`);
          }
        } catch (err) {
          console.error(`Failed to fetch tasks for home ${home.home_id}:`, err);
        }
      };
      
      fetchTaskCount();
    }
  }, [home?.home_id, taskCount]);

  // Fetch member count directly when component mounts
  useEffect(() => {
    // Check if we need to fetch members (if count is 0 but we know admin exists)
    if (home?.home_id && memberCount === 0) {
      const fetchMembers = async () => {
        try {
          const response = await homeService.getHomeUsers(home.home_id);
          if (response && response.data) {
            setMemberCount(response.data.length);
            console.log(`Fetched ${response.data.length} members for home ${home.home_id}`);
          }
        } catch (err) {
          console.error(`Failed to fetch members for home ${home.home_id}:`, err);
        }
      };
      
      fetchMembers();
    }
  }, [home?.home_id, memberCount]);

  // Memoized color generation to prevent unnecessary re-renders
  const backgroundColor = useMemo(() => 
    getRandomColor(home?.home_name || 'Unnamed Home'), 
    [home?.home_name]
  );

  // Defensive home data processing
  const processedHome = useMemo(() => {
    // Ensure admin is counted even if members array is empty or not provided
    const calculatedMemberCount = memberCount > 0 ? 
      memberCount : 
      (home?.is_admin ? 1 : 0); // If user is admin, count at least 1 member
    
    return {
      id: home?.home_id || 'unknown',
      name: home?.home_name || 'Unnamed Home',
      memberCount: calculatedMemberCount,
      taskCount: taskCount,
      description: home?.description || 'No description provided',
      members: home?.members || [],
      isAdmin: !!home?.is_admin,
      privacyLevel: home?.privacy_level || 'private'
    };
  }, [home, taskCount, memberCount]);

  // Handle navigation to home details
  const handleHomeClick = () => {
    navigate(`/homes/${processedHome.id}`);
  };

  // Render member avatars with fallback
  const renderMemberAvatars = () => {
    if (processedHome.members.length === 0) {
      return (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ fontStyle: 'italic' }}
        >
          {processedHome.isAdmin ? 
            "You're the only member" : 
            "No members yet"}
        </Typography>
      );
    }

    return (
      <>
        <Typography variant="subtitle2" gutterBottom>
          Members:
        </Typography>
        <AvatarGroup 
          max={5} 
          sx={{ 
            justifyContent: 'flex-start', 
            mb: 2 
          }}
        >
          {processedHome.members.map((member) => (
            <Tooltip 
              key={member.user_id} 
              title={member.name || 'Unnamed Member'}
            >
              <Avatar 
                alt={member.name} 
                src={
                  member.avatar_id 
                    ? `/uploads/images/${member.avatar_id}` 
                    : undefined
                }
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: getRandomColor(member.name)
                }}
              >
                {member.name ? member.name.charAt(0).toUpperCase() : '?'}
              </Avatar>
            </Tooltip>
          ))}
        </AvatarGroup>
      </>
    );
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 3
        }
      }}
      onClick={handleHomeClick}
      role="button"
      tabIndex={0}
      aria-label={`View details for home ${processedHome.name}`}
      onKeyPress={(e) => e.key === 'Enter' && handleHomeClick()}
    >
      {/* Colorful Home Name Header */}
      <Box 
        sx={{ 
          height: 100, 
          backgroundColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          position: 'relative'
        }}
      >
        <Typography 
          variant="h4" 
          component="h2" 
          align="center"
          sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
            maxWidth: '90%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {processedHome.name}
        </Typography>

        {/* Privacy Indicator */}
        <Tooltip title={`${processedHome.privacyLevel} Home`}>
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 10, 
              right: 10,
              color: 'white'
            }}
          >
            <PrivacyIcon fontSize="small" />
          </Box>
        </Tooltip>
      </Box>
      
      {/* Home Details Content */}
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={2}
        >
          {/* Members Count */}
          <Box display="flex" alignItems="center">
            <MembersIcon 
              fontSize="small" 
              color="action" 
              sx={{ mr: 1 }} 
            />
            <Typography variant="body2" color="text.secondary">
              {processedHome.memberCount} member{processedHome.memberCount !== 1 ? 's' : ''}
            </Typography>
          </Box>
          
          {/* Tasks Count */}
          <Box display="flex" alignItems="center">
            <TaskIcon 
              fontSize="small" 
              color="action" 
              sx={{ mr: 1 }} 
            />
            <Typography variant="body2" color="text.secondary">
              {processedHome.taskCount} task{processedHome.taskCount !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>
        
        {/* Members List */}
        {renderMemberAvatars()}
        
        {/* Admin Chip */}
        {processedHome.isAdmin && (
          <Chip 
            icon={<MembersIcon />}
            label="Admin" 
            size="small" 
            color="primary"
            sx={{ mb: 1 }}
          />
        )}
        
        {/* Description */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          mt={1}
          sx={{
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {processedHome.description}
        </Typography>
      </CardContent>
      
      {/* Card Actions */}
      {showActions && (
        <>
          <Divider />
          <CardActions sx={{ p: 2 }}>
            <Button 
              size="small" 
              endIcon={<ArrowIcon />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/homes/${processedHome.id}`);
              }}
              fullWidth
              variant="outlined"
            >
              View Details
            </Button>
          </CardActions>
        </>
      )}
    </Card>
  );
};

// Prop type validation
HomeCard.propTypes = {
  home: PropTypes.shape({
    home_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    home_name: PropTypes.string.isRequired,
    members: PropTypes.arrayOf(PropTypes.shape({
      user_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      avatar_id: PropTypes.string
    })),
    tasks: PropTypes.array,
    is_admin: PropTypes.bool,
    description: PropTypes.string,
    privacy_level: PropTypes.oneOf(['public', 'private', 'restricted'])
  }).isRequired,
  showActions: PropTypes.bool
};

export default HomeCard;