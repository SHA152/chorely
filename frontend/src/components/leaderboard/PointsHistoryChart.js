// src/components/leaderboard/PointsHistoryChart.js
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  Box, 
  useTheme 
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * PointsHistoryChart displays a user's or home's points over time
 */
const PointsHistoryChart = ({ data, title = 'Points History' }) => {
  const theme = useTheme();
  const [chartData, setChartData] = useState([]);
  
  // Process chart data
  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data);
    }
  }, [data]);
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'white',
            padding: 1.5,
            border: '1px solid #ccc',
            borderRadius: 1,
          }}
        >
          <p style={{ margin: 0, fontWeight: 'bold' }}>{`${label}`}</p>
          <p style={{ margin: 0, color: payload[0].color }}>
            {`Points: ${payload[0].value}`}
          </p>
        </Box>
      );
    }
  
    return null;
  };
  
  return (
    <Card>
      <CardHeader 
        title={title} 
        titleTypographyProps={{ variant: 'h6' }}
      />
      <Divider />
      <CardContent>
        <Box height={300}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 20,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickMargin={10}
                />
                <YAxis 
                  tickMargin={10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="points"
                  stroke={theme.palette.primary.main}
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              height="100%"
            >
              Not enough data to display chart
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PointsHistoryChart;