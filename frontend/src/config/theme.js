import { createTheme } from '@mui/material/styles';

const drawerWidth = 240;

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  drawerWidth,
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          width: `calc(100% - ${drawerWidth}px)`,
          marginLeft: drawerWidth,
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  drawerWidth,
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          width: `calc(100% - ${drawerWidth}px)`,
          marginLeft: drawerWidth,
          backgroundColor: '#1e1e1e',
        },
      },
    },
  },
});

export { lightTheme, darkTheme, drawerWidth };