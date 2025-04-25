// src/components/leaderboard/LeaderboardFilter.js
import React from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Typography
} from '@mui/material';
import {
  CalendarViewMonth as MonthIcon,
  CalendarViewWeek as WeekIcon,
  Today as DayIcon
} from '@mui/icons-material';

/**
 * LeaderboardFilter component provides time range and category filters for leaderboard
 */
const LeaderboardFilter = ({ 
  timeRange, 
  setTimeRange, 
  timeRangeOptions = ['week', 'month', 'year'],
  showPeriodSelector = true
}) => {
  // Handle time range change
  const handleTimeRangeChange = (event, newTimeRange) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };
  
  return (
    <Box 
      display="flex" 
      alignItems="center" 
      justifyContent="space-between" 
      mb={3}
      sx={{
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2
      }}
    >
      <Typography variant="body1" fontWeight="medium">
        Viewing stats for:
      </Typography>
      
      {showPeriodSelector && (
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={handleTimeRangeChange}
          aria-label="time range"
          size="small"
        >
          {timeRangeOptions.includes('day') && (
            <ToggleButton value="day" aria-label="day">
              <DayIcon fontSize="small" sx={{ mr: 0.5 }} />
              Day
            </ToggleButton>
          )}
          
          {timeRangeOptions.includes('week') && (
            <ToggleButton value="week" aria-label="week">
              <WeekIcon fontSize="small" sx={{ mr: 0.5 }} />
              Week
            </ToggleButton>
          )}
          
          {timeRangeOptions.includes('month') && (
            <ToggleButton value="month" aria-label="month">
              <MonthIcon fontSize="small" sx={{ mr: 0.5 }} />
              Month
            </ToggleButton>
          )}
          
          {timeRangeOptions.includes('year') && (
            <ToggleButton value="year" aria-label="year">
              <MonthIcon fontSize="small" sx={{ mr: 0.5 }} />
              Year
            </ToggleButton>
          )}
        </ToggleButtonGroup>
      )}
    </Box>
  );
};

export default LeaderboardFilter;