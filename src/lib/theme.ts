'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2'
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828'
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    },
    text: {
      primary: '#212121',
      secondary: '#757575'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2.125rem'
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem'
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem'
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43
    },
    button: {
      fontWeight: 600,
      textTransform: 'none'
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.9375rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.39)'
          }
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 16px 0 rgba(25, 118, 210, 0.39)'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1976d2'
            }
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16
        },
        elevation1: {
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)'
        },
        elevation2: {
          boxShadow: '0 4px 16px 0 rgba(0,0,0,0.1)'
        },
        elevation3: {
          boxShadow: '0 8px 24px 0 rgba(0,0,0,0.12)'
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8
        },
        standardSuccess: {
          backgroundColor: '#e8f5e9',
          color: '#1b5e20'
        },
        standardError: {
          backgroundColor: '#ffebee',
          color: '#c62828'
        },
        standardWarning: {
          backgroundColor: '#fff3e0',
          color: '#e65100'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6
        }
      }
    }
  }
});

export default theme;
