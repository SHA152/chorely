// src/pages/leaderboard/UserStats.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Avatar
} from '@mui/material';
import {
  Star as PointsIcon,
  Home as HomeIcon,
  Task as TaskIcon,
  EmojiEvents as LeaderboardIcon,
  Assignment as CompletedIcon,
  DoNotDisturb as OverdueIcon
} from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import PointsHistoryChart from '../../components/leaderboard/PointsHistoryChart';
import TaskCompletionStats from '../../components/leaderboard/TaskCompletionStats';
import { leaderboardService } from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';

const UserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pointsHistoryData, setPointsHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch user stats
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        const { data } = await leaderboardService.getUserStats();
        setStats(data);
        
        // Generate points history data
        const history = generateMockPointsHistoryData();
        setPointsHistoryData(history);
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
        setError('Failed to load user statistics. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserStats();
  }, []);
  
  // Generate mock points history data for chart
  const generateMockPointsHistoryData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(now.getMonth() - (11 - i));
      
      data.push({
        date: date.toLocaleDateString(undefined, {
          month: 'short',
          year: 'numeric'
        }),
        points: Math.floor(Math.random() * 200) + 50
      });
    }
    
    return data;
  };
  
  if (loading) {
    return (
      <MainLayout>
        <LoadingIndicator message="Loading user statistics..." />
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
      <PageHeader title="My Statistics" />
      
      <Grid container spacing={3}>
        {/* User summary card */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid rgba(0, 0, 0, 0.12)'
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={2}>
                <Box display="flex" justifyContent="center">
                  <Avatar
                    alt={user.name}
                    src={user.avatar_id ? `/uploads/images/${user.avatar_id}` : ''}
                    sx={{ width: 100, height: 100 }}
                  >
                    {user.name.charAt(0)}
                  </Avatar>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={10}>
                <Typography variant="h5" gutterBottom>
                  {user.name}
                </Typography>
                
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </Typography>
                
                <Grid container spacing={2} mt={1}>
                  <Grid item xs={6} sm={3}>
                    <Box display="flex" alignItems="center">
                      <HomeIcon color="primary" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Homes
                        </Typography>
                        <Typography variant="h6">
                          {stats?.homes_count || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Box display="flex" alignItems="center">
                      <TaskIcon color="primary" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Tasks
                        </Typography>
                        <Typography variant="h6">
                          {stats?.total_tasks || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Box display="flex" alignItems="center">
                      <PointsIcon color="secondary" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Total Points
                        </Typography>
                        <Typography variant="h6">
                          {stats?.total_points || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Box display="flex" alignItems="center">
                      <LeaderboardIcon color="secondary" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Avg. Rank
                        </Typography>
                        <Typography variant="h6">
                          {stats?.average_rank ? `#${stats.average_rank}` : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Stats widgets */}
        <Grid item xs={12} md={6}>
          <TaskCompletionStats 
            stats={{
              total_tasks: stats?.total_tasks || 0,
              completed_tasks: stats?.completed_tasks || 0,
              overdue_tasks: stats?.overdue_tasks || 0,
              total_points: stats?.total_points || 0
            }}
            title="Overall Task Completion"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <PointsHistoryChart 
            data={pointsHistoryData}
            title="Points History (Yearly)"
          />
        </Grid>
        
        {/* Home performance cards */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Performance by Home
          </Typography>
          
          <Grid container spacing={2}>
            {stats?.home_stats?.map((homeStat) => (
              <Grid item xs={12} sm={6} md={4} key={homeStat.home_id}>
                <Card>
                  <CardHeader
                    title={homeStat.home_name}
                    subheader={`Rank: #${homeStat.rank || 'N/A'}`}
                  />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <PointsIcon color="secondary" sx={{ mr: 1 }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Points
                            </Typography>
                            <Typography variant="h6">
                              {homeStat.points || 0}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <CompletedIcon color="success" sx={{ mr: 1 }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Completed
                            </Typography>
                            <Typography variant="h6">
                              {homeStat.completed_tasks || 0}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <TaskIcon color="primary" sx={{ mr: 1 }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Total Tasks
                            </Typography>
                            <Typography variant="h6">
                              {homeStat.total_tasks || 0}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <OverdueIcon color="error" sx={{ mr: 1 }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Overdue
                            </Typography>
                            <Typography variant="h6">
                              {homeStat.overdue_tasks || 0}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default UserStats;