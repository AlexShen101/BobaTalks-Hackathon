import { createTheme, duration } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    custom: {
      main: '#FFFFFF',
    },
    primary: {
      main: '#EDAB6F',
    },
    secondary: {
      main: '#021944',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 24px',
          minWidth: '120px',
          transition: 'font-size 0.2s ease-in-out',
        },
        outlined: {
          border: '2px solid black',
          color: 'black',
          '&:hover': {
            border: '2px solid black',
            fontSize: '1.02em',
          },
        }
      }
    }
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

export default theme;