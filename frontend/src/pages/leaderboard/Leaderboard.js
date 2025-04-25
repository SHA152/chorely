// src/pages/leaderboard/Leaderboard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Divider,
  Button
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import LeaderboardCard from '../../components/leaderboard/LeaderboardCard';
import LeaderboardFilter from '../../components/leaderboard/LeaderboardFilter';
import PointsHistoryChart from '../../components/leaderboard/PointsHistoryChart';
import TaskCompletionStats from '../../components/leaderboard/TaskCompletionStats';
import { leaderboardService, homeService } from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Leaderboard page displays home leaderboard and stats
 */
const Leaderboard = () => {
  const { homeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [home, setHome] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [timeRange, setTimeRange] = useState('month');
  const [pointsHistoryData, setPointsHistoryData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState({
    home: true,
    leaderboard: true,
    history: true,
    stats: true
  });
  const [error, setError] = useState({
    home: null,
    leaderboard: null,
    history: null,
    stats: null
  });
  
  // Fetch home details
  useEffect(() => {
    const fetchHomeDetails = async () => {
      try {
        setLoading(prev => ({ ...prev, home: true }));
        const { data } = await homeService.getHomeById(homeId);
        setHome(data);
        setError(prev => ({ ...prev, home: null }));
      } catch (err) {
        console.error('Failed to fetch home details:', err);
        setError(prev => ({ 
          ...prev, 
          home: 'Failed to load home details. Please try again.' 
        }));
      } finally {
        setLoading(prev => ({ ...prev, home: false }));
      }
    };
    
    fetchHomeDetails();
  }, [homeId]);
  
  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(prev => ({ ...prev, leaderboard: true }));
        const { data } = await leaderboardService.getHomeLeaderboard(homeId);
        setLeaderboardData(data);
        setError(prev => ({ ...prev, leaderboard: null }));
      } catch (err) {
        console.error('Failed to fetch leaderboard data:', err);
        setError(prev => ({ 
          ...prev, 
          leaderboard: 'Failed to load leaderboard data. Please try again.' 
        }));
      } finally {
        setLoading(prev => ({ ...prev, leaderboard: false }));
      }
    };
    
    fetchLeaderboardData();
  }, [homeId, timeRange]);
  
  // Fetch points history data
  useEffect(() => {
    const fetchPointsHistoryData = async () => {
      try {
        setLoading(prev => ({ ...prev, history: true }));
        // In a real app, this would be fetched from the backend
        // For this example, we're generating mock data
        const mockData = generateMockPointsHistoryData();
        setPointsHistoryData(mockData);
        setError(prev => ({ ...prev, history: null }));
      } catch (err) {
        console.error('Failed to fetch points history data:', err);
        setError(prev => ({ 
          ...prev, 
          history: 'Failed to load points history data. Please try again.' 
        }));
      } finally {
        setLoading(prev => ({ ...prev, history: false }));
      }
    };
    
    fetchPointsHistoryData();
  }, [homeId, timeRange]);
  
  // Fetch home stats
  useEffect(() => {
    const fetchHomeStats = async () => {
      try {
        setLoading(prev => ({ ...prev, stats: true }));
        // In a real app, this would be fetched from the backend
        // For this example, we're generating mock data
        const mockStats = {
          total_tasks: 45,
          completed_tasks: 32,
          overdue_tasks: 5,
          total_points: 430
        };
        setStats(mockStats);
        setError(prev => ({ ...prev, stats: null }));
      } catch (err) {
        console.error('Failed to fetch home stats:', err);
        setError(prev => ({ 
          ...prev, 
          stats: 'Failed to load home statistics. Please try again.' 
        }));
      } finally {
        setLoading(prev => ({ ...prev, stats: false }));
      }
    };
    
    fetchHomeStats();
  }, [homeId, timeRange]);
  
  // Generate mock points history data for chart
  const generateMockPointsHistoryData = () => {
    const data = [];
    const now = new Date();
    const daysToGenerate = timeRange === 'week' ? 7 
                         : timeRange === 'month' ? 30
                         : 12; // year
    
    for (let i = 0; i < daysToGenerate; i++) {
      const date = new Date();
      
      if (timeRange === 'week' || timeRange === 'month') {
        date.setDate(now.getDate() - (daysToGenerate - i - 1));
        
        data.push({
          date: date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric'
          }),
          points: Math.floor(Math.random() * 50) + 10
        });
      } else {
        // Year
        date.setMonth(now.getMonth() - (daysToGenerate - i - 1));
        
        data.push({
          date: date.toLocaleDateString(undefined, {
            month: 'short',
            year: 'numeric'
          }),
          points: Math.floor(Math.random() * 200) + 50
        });
      }
    }
    
    return data;
  };
  
  // Find max points among users for progress calculation
  const maxPoints = leaderboardData.length > 0
    ? Math.max(...leaderboardData.map(user => user.total_points))
    : 100;
  
  // Create breadcrumbs
  const breadcrumbs = [
    { label: 'Homes', path: '/homes' },
    { label: home?.home_name || 'Home', path: `/homes/${homeId}` },
    { label: 'Leaderboard' }
  ];
  
  // Create back button
  const backButton = (
    <Button
      startIcon={<BackIcon />}
      onClick={() => navigate(`/homes/${homeId}`)}
    >
      Back to Home
    </Button>
  );
  
  if (loading.home && !home) {
    return (
      <MainLayout>
        <LoadingIndicator message="Loading home details..." />
      </MainLayout>
    );
  }
  
  if (error.home && !home) {
    return (
      <MainLayout>
        <ErrorDisplay 
          error={error.home} 
          onRetry={() => window.location.reload()}
        />
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <PageHeader 
        title={`${home?.home_name || 'Home'} Leaderboard`} 
        breadcrumbs={breadcrumbs}
        actionButton={backButton}
      />
      
      {/* Leaderboard Filter */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 0, 0.12)'
        }}
      >
        <LeaderboardFilter 
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          timeRangeOptions={['week', 'month', 'year']}
        />
      </Paper>
      
      <Grid container spacing={3}>
        {/* Leaderboard Cards */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom sx={{ ml: 1 }}>
            <TrophyIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Current Rankings
          </Typography>
          
          {loading.leaderboard ? (
            <LoadingIndicator message="Loading leaderboard..." />
          ) : error.leaderboard ? (
            <ErrorDisplay error={error.leaderboard} />
          ) : leaderboardData.length === 0 ? (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.12)',
                textAlign: 'center'
              }}
            >
              <Typography variant="body1" color="text.secondary">
                No data available for the selected time period.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {leaderboardData.map((userData, index) => (
                <Grid item xs={12} key={userData.user_id}>
                  <LeaderboardCard 
                    user={userData}
                    position={index + 1}
                    totalUsers={leaderboardData.length}
                    previousPosition={userData.previous_position}
                    maxPoints={maxPoints}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
        
        {/* Stats and Charts */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TaskCompletionStats 
                stats={stats}
                title="Home Statistics"
              />
            </Grid>
            
            <Grid item xs={12}>
              <PointsHistoryChart 
                data={pointsHistoryData}
                title={`Points History (${timeRange === 'week' ? 'Weekly' : timeRange === 'month' ? 'Monthly' : 'Yearly'})`}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default Leaderboard;