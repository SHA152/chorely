// src/pages/leaderboard/AchievementsList.js
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Box,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Lock as LockedIcon,
  CheckCircle as CompletedIcon
} from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';

const AchievementsList = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // In a real app, fetch achievements from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockAchievements = [
        {
          id: 1,
          title: 'First Steps',
          description: 'Complete your first task',
          icon: '🏆',
          progress: 100,
          completed: true,
          completedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          title: 'Task Master',
          description: 'Complete 10 tasks',
          icon: '🎯',
          progress: 70,
          completed: false,
          required: 10,
          current: 7
        },
        {
          id: 3,
          title: 'Cleaning Expert',
          description: 'Complete 20 cleaning tasks',
          icon: '🧹',
          progress: 45,
          completed: false,
          required: 20,
          current: 9
        },
        {
          id: 4,
          title: 'Team Player',
          description: 'Join 3 different homes',
          icon: '👪',
          progress: 66,
          completed: false,
          required: 3,
          current: 2
        },
        {
          id: 5,
          title: 'Point Collector',
          description: 'Earn 500 points total',
          icon: '⭐',
          progress: 62,
          completed: false,
          required: 500,
          current: 310
        },
        {
          id: 6,
          title: 'Champion',
          description: 'Be ranked #1 in a home for an entire month',
          icon: '🥇',
          progress: 0,
          completed: false,
        },
      ];
      
      setAchievements(mockAchievements);
      setLoading(false);
    }, 1000);
  }, []);
  
  if (loading) {
    return (
      <MainLayout>
        <LoadingIndicator message="Loading achievements..." />
      </MainLayout>
    );
  }
  
  if (error) {
    return (
      <MainLayout>
        <ErrorDisplay 
          error={error} 
          onRetry={() => window.location.reload()}
        />
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <PageHeader title="My Achievements" />
      
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 0, 0.12)'
        }}
      >
        <Typography variant="body1" paragraph>
          Complete tasks and earn achievements to showcase your dedication! Achievements are special 
          rewards for reaching milestones and contributing to your homes.
        </Typography>
        
        <Box display="flex" alignItems="center" mb={2}>
          <TrophyIcon color="secondary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            {achievements.filter(a => a.completed).length} of {achievements.length} Achievements Earned
          </Typography>
        </Box>
      </Paper>
      
      <Grid container spacing={3}>
        {achievements.map((achievement) => (
          <Grid item xs={12} sm={6} md={4} key={achievement.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                opacity: achievement.completed ? 1 : 0.8,
                position: 'relative',
                overflow: 'visible'
              }}
            >
              {achievement.completed && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    backgroundColor: 'success.main',
                    borderRadius: '50%',
                    width: 30,
                    height: 30,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    zIndex: 1
                  }}
                >
                  <CompletedIcon fontSize="small" />
                </Box>
              )}
              
              <Box
                sx={{
                  bgcolor: achievement.completed ? 'primary.main' : 'grey.300',
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 3,
                  fontSize: '2rem'
                }}
              >
                {achievement.icon}
              </Box>
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {achievement.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {achievement.description}
                </Typography>
                
                {achievement.completed ? (
                  <Chip 
                    label={`Completed on ${new Date(achievement.completedDate).toLocaleDateString()}`}
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                ) : (
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {achievement.current && achievement.required
                          ? `${achievement.current}/${achievement.required}`
                          : `${achievement.progress}%`}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={achievement.progress} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </MainLayout>
  );
};

export default AchievementsList;