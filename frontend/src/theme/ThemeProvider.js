// src/theme/ThemeProvider.js
import React from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Define color palette
const palette = {
  primary: {
    main: '#4a6da7', // Blue - Primary brand color
    light: '#6e8fd0',
    dark: '#2a4e80',
    contrastText: '#fff',
  },
  secondary: {
    main: '#ff9e43', // Orange - For calls to action
    light: '#ffbd60',
    dark: '#d98029',
    contrastText: '#000',
  },
  success: {
    main: '#4caf50', // Green - Task completed
    light: '#80e27e',
    dark: '#087f23',
  },
  warning: {
    main: '#ff9800', // Amber - Task close to deadline
    light: '#ffc947',
    dark: '#c66900',
  },
  error: {
    main: '#f44336', // Red - Overdue or errors
    light: '#ff7961',
    dark: '#ba000d',
  },
  info: {
    main: '#2196f3', // Light blue - Informational
    light: '#6ec6ff',
    dark: '#0069c0',
  },
  background: {
    default: '#f5f7fa',
    paper: '#ffffff',
  },
  text: {
    primary: '#172b4d',
    secondary: '#6b7c93',
  },
};

// Create theme with responsive typography and spacing
const theme = createTheme({
  palette,
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '1.1rem',
      },
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '1rem',
      },
    },
    body1: {
      fontSize: '1rem',
      '@media (max-width:600px)': {
        fontSize: '0.95rem',
      },
    },
    body2: {
      fontSize: '0.875rem',
      '@media (max-width:600px)': {
        fontSize: '0.85rem',
      },
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  // Custom components styling
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: palette.primary.dark,
          },
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: palette.secondary.dark,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 5px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

// Theme provider component
export const ThemeProvider = ({ children }) => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;