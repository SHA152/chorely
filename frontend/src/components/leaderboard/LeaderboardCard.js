// src/components/leaderboard/LeaderboardCard.js
import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Box, 
  LinearProgress,
  Chip
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Whatshot as FireIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon
} from '@mui/icons-material';

/**
 * LeaderboardCard displays a user's leaderboard position and stats
 */
const LeaderboardCard = ({ 
  user, 
  position, 
  totalUsers, 
  previousPosition,
  maxPoints 
}) => {
  // Calculate position change
  const positionChange = previousPosition ? previousPosition - position : 0;
  
  // Get position indicator color
  const getPositionColor = (pos) => {
    switch(pos) {
      case 1:
        return 'gold';
      case 2:
        return 'silver';
      case 3:
        return '#cd7f32'; // bronze
      default:
        return '#666';
    }
  };
  
  // Calculate percentage for progress bar
  const pointsPercentage = (user.total_points / maxPoints) * 100;
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
        border: position <= 3 ? `2px solid ${getPositionColor(position)}` : 'none',
        boxShadow: position <= 3 ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
      }}
    >
      {/* Position badge for top 3 */}
      {position <= 3 && (
        <Box 
          sx={{
            position: 'absolute',
            top: -15,
            right: 10,
            backgroundColor: getPositionColor(position),
            borderRadius: '50%',
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: position === 1 ? '#000' : '#fff',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 1
          }}
        >
          <TrophyIcon fontSize="small" />
        </Box>
      )}
      
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {/* Position indicator */}
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              width: 40, 
              fontWeight: 'bold', 
              color: getPositionColor(position)
            }}
          >
            {position}
          </Typography>
          
          {/* User avatar and info */}
          <Box display="flex" alignItems="center" flexGrow={1}>
            <Avatar
              alt={user.name}
              src={user.avatar_id ? `/uploads/images/${user.avatar_id}` : ''}
              sx={{ width: 50, height: 50, mr: 2 }}
            >
              {user.name.charAt(0)}
            </Avatar>
            
            <Box>
              <Typography variant="h6" component="div">
                {user.name}
              </Typography>
              
              <Box display="flex" alignItems="center" gap={1}>
                <Chip 
                  size="small" 
                  icon={<FireIcon fontSize="small" />} 
                  label={`${user.total_points} pts`}
                  color="secondary"
                  variant="outlined"
                />
                
                {positionChange !== 0 && (
                  <Chip 
                    size="small" 
                    icon={positionChange > 0 ? <UpIcon fontSize="small" /> : <DownIcon fontSize="small" />} 
                    label={`${Math.abs(positionChange)} ${positionChange > 0 ? 'up' : 'down'}`}
                    color={positionChange > 0 ? 'success' : 'error'}
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Box>
        
        {/* Points progress bar */}
        <Box sx={{ mb: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={pointsPercentage > 100 ? 100 : pointsPercentage} 
            color={position <= 3 ? "secondary" : "primary"}
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: '#e0e0e0'
            }}
          />
        </Box>
        
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Tasks completed: {user.tasks_completed || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.total_points}/{maxPoints} pts
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LeaderboardCard;





