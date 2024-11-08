import React from 'react';

import { Link, useNavigate } from 'react-router-dom';

import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { useTheme } from '@mui/material/styles';

const navLinks = [
  {
    title: 'All Events', path: '/EventsPage',
    allowedRoles: ['organizer', 'donator', 'admin']
  },
  {
    title: 'Create Event', path: '/CreateEventPage',
    allowedRoles: ['organizer']
  },
  {
    title: 'Manage Event', path: '/ManageEventPage',
    allowedRoles: ['organizer']
  },
  {
    title: 'See Boba Vendors', path: '/BobaVendorsPage',
    allowedRoles: ['organizer', 'donator', 'admin']
  },
  {
    title: 'Become an Organizer', path: '/Organizer-Signup',
    allowedRoles: ['donator']
  }
]

function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Adjust breakpoint as needed
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { showAlert } = useAlert();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      handleCloseMenu();
      navigate('/');
      showAlert('Successfully logged out', 'success');
    } catch (error) {
      console.error('Logout failed:', error);
      showAlert('Failed to log out', 'error');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDrawerToggle = () => {
    setDrawerOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{ width: 250 }}
      role="presentation"
    >
      <List>
        {user
          ? navLinks.map((item) => {

            if (user.role != 'admin' && !item.allowedRoles.includes(user.role)) {
              return null;
            }

            return (
              <ListItem key={item.title} component={Link} to={item.path}>
                <ListItemText primary={item.title} />
              </ListItem>
            )
          })
          : [
            <ListItem key="Sign In" component={Link} to="/signin">
              <ListItemText primary="Sign In" />
            </ListItem>,
            <ListItem key="Sign Up" component={Link} to="/signup">
              <ListItemText primary="Sign Up" />
            </ListItem>,
          ]}
      </List>
    </Box>
  );

  return (
    <>
      {/* overlay the full screen when logging out */}
      {isLoggingOut && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // semi-transparent white
            zIndex: 9999, // ensure it's above everything
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress size={60} />
          <Typography
            variant="h6"
            sx={{ mt: 2, fontFamily: 'Poppins, sans-serif' }}
          >
            Logging out...
          </Typography>
        </Box>
      )}


      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" color="primary"> {/* Uses primary color from theme */}
          <Toolbar>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                flexGrow: 1,
                fontFamily: 'Poppins, sans-serif', // Ensures typography uses Poppins
              }}
            >
              BobaShare
            </Typography>

            {isMobile ? (
              // Mobile View: Hamburger Menu
              <>
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleDrawerToggle}
                >
                  <MenuIcon />
                </IconButton>
                <Drawer
                  anchor="right"
                  open={drawerOpen}
                  onClose={handleDrawerToggle}
                >
                  {drawer}
                </Drawer>
              </>
            ) : (
              // Desktop View: Inline Links
              user ? (
                navLinks.map((item) => {

                  if (user.role != 'admin' && !item.allowedRoles.includes(user.role)) {
                    return null;
                  }

                  return (
                    <Button
                      key={item.title}
                      color="inherit"
                      component={Link}
                      to={item.path}
                      sx={{
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    >
                      {item.title}
                    </Button>
                  )
                })
              ) : (
                <>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/signin"
                    sx={{
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/signup"
                    sx={{
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )
            )}

            {user && (
              <div>
                <IconButton
                  size="large"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                >
                  <MenuItem disabled>
                    <Typography variant="body1">{user.fullName}</Typography>
                  </MenuItem>
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </MenuItem>
                  <MenuItem component={Link} to="/account-settings">
                    Account Settings
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </Menu>
              </div>
            )}
          </Toolbar>
        </AppBar>
      </Box>
    </>
  );
}

export default Navbar;
