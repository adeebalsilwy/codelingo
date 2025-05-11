import { defaultTheme } from 'react-admin';

export const lightTheme = {
  ...defaultTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#1E88E5',
      light: '#42A5F5',
      dark: '#1565C0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0288D1',
      light: '#29B6F6',
      dark: '#0277BD',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F9FAFB',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.05)',
        },
      },
    },
    RaDatagrid: {
      styleOverrides: {
        root: {
          '& .RaDatagrid-headerCell': {
            backgroundColor: '#F9FAFB',
            fontWeight: 600,
          },
          '& .RaDatagrid-row': {
            '&:hover': {
              backgroundColor: 'rgba(43, 110, 253, 0.04)',
            },
          },
        },
      },
    },
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          padding: '8px 12px',
          '&.RaMenuItemLink-active': {
            backgroundColor: 'rgba(43, 110, 253, 0.08)',
          },
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
};

export const darkTheme = {
  ...defaultTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#90CAF9',
      light: '#E3F2FD',
      dark: '#42A5F5',
      contrastText: '#000000',
    },
    secondary: {
      main: '#81D4FA',
      light: '#E1F5FE',
      dark: '#29B6F6',
      contrastText: '#000000',
    },
    background: {
      default: '#1A202C',
      paper: '#2D3748',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CBD5E0',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.05)',
        },
      },
    },
    RaDatagrid: {
      styleOverrides: {
        root: {
          '& .RaDatagrid-headerCell': {
            backgroundColor: '#2D3748',
            fontWeight: 600,
          },
          '& .RaDatagrid-row': {
            '&:hover': {
              backgroundColor: 'rgba(144, 202, 249, 0.08)',
            },
          },
        },
      },
    },
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          padding: '8px 12px',
          '&.RaMenuItemLink-active': {
            backgroundColor: 'rgba(144, 202, 249, 0.16)',
          },
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
};