import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Replaces Grid
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material'; // Replaces Hidden

/**
 * AuthLayout provides consistent layout for authentication pages
 */
const AuthLayout = ({ children, title, illustration }) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md')); // Replaces Hidden

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', py: 4 }}>
        <Grid container spacing={3} alignItems="center" justifyContent="center">
          {isMdUp && ( // Replaces Hidden
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  p: 3, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                {illustration ? (
                  <Box sx={{ maxWidth: '400px', width: '100%', mb: 3 }}>
                    {illustration}
                  </Box>
                ) : (
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 5, 
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: 2,
                      width: '100%',
                      maxWidth: 400,
                      mb: 3
                    }}
                  >
                    <Typography variant="h3" component="h1" gutterBottom align="center" color="white">
                      Chorely
                    </Typography>
                    <Typography variant="h6" component="p" align="center" color="white">
                      Making chores fun through gamification
                    </Typography>
                  </Paper>
                )}
                
                <Typography variant="h5" component="h2" gutterBottom>
                  Gamify your household tasks
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Chorely turns household responsibilities into a fun competition.
                  Earn points, climb the leaderboard, and keep your home organized!
                </Typography>
              </Box>
            </Grid>
          )}
          
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center'
              }}
            >
              {children}
            </Box>
          </Grid>
        </Grid>
      </Container>
      
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          textAlign: 'center',
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Chorely. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default AuthLayout;