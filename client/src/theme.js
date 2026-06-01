import { createTheme, alpha } from '@mui/material/styles';

export const getTheme = (mode) => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary:   { main: '#4F6EF7', light: '#7B93FF', dark: '#3451D1', contrastText: '#fff' },
      secondary: { main: isDark ? '#94A3B8' : '#64748B' },
      success:   { main: '#10B981', light: '#34D399', dark: '#059669' },
      error:     { main: '#F43F5E', light: '#FB7185', dark: '#E11D48' },
      warning:   { main: '#F59E0B', light: '#FCD34D', dark: '#D97706' },
      info:      { main: '#06B6D4', light: '#22D3EE', dark: '#0891B2' },
      background: {
        default: isDark ? '#0D1117' : '#F0F4FF',
        paper:   isDark ? '#161B27' : '#FFFFFF',
      },
      text: {
        primary:   isDark ? '#F1F5F9' : '#0F172A',
        secondary: isDark ? '#94A3B8' : '#475569',
        disabled:  isDark ? '#475569' : '#CBD5E1',
      },
      divider: isDark ? '#1E2A3B' : '#E2E8F0',
    },

    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 800, letterSpacing: '-0.03em' },
      h5: { fontWeight: 700, letterSpacing: '-0.02em' },
      h6: { fontWeight: 700, letterSpacing: '-0.015em' },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      body2: { fontSize: '0.875rem' },
      button: { textTransform: 'none', fontWeight: 600 },
    },

    shape: { borderRadius: 10 },

    shadows: [
      'none',
      isDark
        ? '0 1px 3px rgba(0,0,0,0.4)'
        : '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      isDark
        ? '0 4px 12px rgba(0,0,0,0.5)'
        : '0 4px 12px rgba(0,0,0,0.08)',
      isDark
        ? '0 8px 24px rgba(0,0,0,0.6)'
        : '0 8px 24px rgba(0,0,0,0.1)',
      ...Array(21).fill('none'),
    ],

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': { boxSizing: 'border-box' },
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: isDark ? '#334155 transparent' : '#CBD5E1 transparent',
          },
          '::-webkit-scrollbar': { width: 6, height: 6 },
          '::-webkit-scrollbar-track': { background: 'transparent' },
          '::-webkit-scrollbar-thumb': {
            background: isDark ? '#334155' : '#CBD5E1',
            borderRadius: 3,
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: 'none',
            fontWeight: 600,
            '&:hover': { boxShadow: 'none' },
          },
          contained: {
            background: isDark
              ? 'linear-gradient(135deg, #4F6EF7 0%, #7B93FF 100%)'
              : 'linear-gradient(135deg, #4F6EF7 0%, #3451D1 100%)',
            '&:hover': {
              background: isDark
                ? 'linear-gradient(135deg, #3451D1 0%, #4F6EF7 100%)'
                : 'linear-gradient(135deg, #3451D1 0%, #2a3fa8 100%)',
            },
          },
          containedSuccess: {
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            '&:hover': { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' },
          },
          containedError: {
            background: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)',
            '&:hover': { background: 'linear-gradient(135deg, #E11D48 0%, #be123c 100%)' },
          },
          outlined: {
            borderWidth: '1.5px',
            '&:hover': { borderWidth: '1.5px' },
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundImage: 'none',
            border: `1px solid ${isDark ? '#1E2A3B' : '#E8EEFF'}`,
            boxShadow: isDark
              ? '0 1px 3px rgba(0,0,0,0.3)'
              : '0 1px 3px rgba(79,110,247,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            backgroundColor: isDark ? '#1A2235' : '#F5F7FF',
            color: isDark ? '#94A3B8' : '#64748B',
            borderBottom: `1px solid ${isDark ? '#1E2A3B' : '#E8EEFF'}`,
          },
          body: {
            borderBottom: `1px solid ${isDark ? '#1A2235' : '#F1F5F9'}`,
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:last-child td': { borderBottom: 0 },
            '&:hover td': {
              backgroundColor: isDark ? alpha('#4F6EF7', 0.06) : alpha('#4F6EF7', 0.03),
            },
            transition: 'background-color 0.12s',
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 18,
            backgroundImage: 'none',
            border: `1px solid ${isDark ? '#1E2A3B' : '#E8EEFF'}`,
            boxShadow: isDark
              ? '0 25px 60px rgba(0,0,0,0.7)'
              : '0 25px 60px rgba(79,110,247,0.15)',
          },
        },
      },

      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '& fieldset': { borderColor: isDark ? '#1E2A3B' : '#E2E8F0', borderWidth: '1.5px' },
              '&:hover fieldset': { borderColor: isDark ? '#4F6EF7' : '#4F6EF7' },
              '&.Mui-focused fieldset': { borderColor: '#4F6EF7', borderWidth: '2px' },
            },
          },
        },
      },

      MuiSelect: {
        styleOverrides: {
          outlined: { borderRadius: 8 },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, borderRadius: 6 },
        },
      },

      MuiAvatar: {
        styleOverrides: {
          root: { fontWeight: 700 },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 6,
            fontSize: '0.75rem',
            fontWeight: 500,
            backgroundColor: isDark ? '#1E2A3B' : '#0F172A',
          },
        },
      },
    },
  });
};

export default getTheme;
