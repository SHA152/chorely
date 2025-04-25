// src/components/leaderboard/TaskCompletionStats.js
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  Grid, 
  Box, 
  Divider,
  LinearProgress
} from '@mui/material';

/**
 * TaskCompletionStats displays task completion statistics for a user or home
 */
const TaskCompletionStats = ({ stats, title = 'Task Completion Stats' }) => {
  // Calculate completion rate
  const completionRate = stats.total_tasks > 0 
    ? (stats.completed_tasks / stats.total_tasks) * 100 
    : 0;
  
  return (
    <Card>
      <CardHeader 
        title={title} 
        titleTypographyProps={{ variant: 'h6' }}
      />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary" fontWeight="bold">
                {stats.total_tasks || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Tasks
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {stats.completed_tasks || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="error.main" fontWeight="bold">
                {stats.overdue_tasks || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overdue
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="secondary.main" fontWeight="bold">
                {stats.total_points || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Points
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" gutterBottom>
              Completion Rate: {completionRate.toFixed(1)}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={completionRate} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TaskCompletionStats;