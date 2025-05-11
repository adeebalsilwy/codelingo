'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

interface AdminThemeProviderProps {
  children: ReactNode;
}

export const AdminThemeProvider = ({ children }: AdminThemeProviderProps) => {
  const { resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // Create a simpler theme object that's compatible with MUI
  const theme = createTheme({
    palette: {
      mode: (resolvedTheme === 'dark') ? 'dark' : 'light',
      primary: {
        main: resolvedTheme === 'dark' ? '#90CAF9' : '#1E88E5',
      },
      secondary: {
        main: resolvedTheme === 'dark' ? '#81D4FA' : '#0288D1',
      },
      background: {
        default: resolvedTheme === 'dark' ? '#1A202C' : '#F9FAFB',
        paper: resolvedTheme === 'dark' ? '#2D3748' : '#ffffff',
      }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            textTransform: 'none',
          },
        },
      },
    },
  });

  // After mounting, we can show the UI safely
  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid rendering with wrong theme on initial load
  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}; 