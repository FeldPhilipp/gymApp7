import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
  ThemeProvider,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import HomeIcon from '@mui/icons-material/Home';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ScaleIcon from '@mui/icons-material/Scale';
import LoginIcon from '@mui/icons-material/Login';
import CloseIcon from '@mui/icons-material/Close';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { darkTheme } from '../../theme/darkTheme';
import BenachrichtigungenDropdown from './BenachrichtigungenDropdown';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FeedbackIcon from '@mui/icons-material/Feedback';
import CalculateIcon from '@mui/icons-material/Calculate';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import { UserApi } from '../../services/api';
import { useDrawer } from '../context/DrawerContext';

const NavBar = () => {
  const title = process.env.REACT_APP_TITLE;
  const version = process.env.REACT_APP_VERSION;
  const navigate = useNavigate();
  const { drawerOpen, setDrawerOpen } = useDrawer();
  const { isLoggedIn, logout, nutzer } = useAuth();
  const isMobile = useMediaQuery(darkTheme.breakpoints.down('md'));
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (nutzer && nutzer.id) {
        try {
          const response = await UserApi.getAdminStatus(nutzer.id);
          setIsAdmin(response.data.isAdmin);
        } catch (error) {
          if (error.status !== 401) {
            console.error("Fehler beim Abrufen des Admin-Status:", error);
          }
        }
      }
    };
    checkAdminStatus();
  }, [nutzer]);

  const handleNav = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDrawerOpen(false);
  };

  const navItems = isLoggedIn
    ? [
      { label: 'Home', path: '/dashboard', icon: <HomeIcon /> },
      { label: 'Training', path: '/addTraining', icon: <FitnessCenterIcon /> },
      { label: 'Cardio', path: '/cardio', icon: <DirectionsRunIcon /> },
      { label: 'Max Rep', path: '/maxRepCalc', icon: <CalculateIcon /> },
      { label: 'Tracker', path: '/tracker', icon: <ScaleIcon /> },
      { label: 'Gruppen', path: '/gruppen', icon: <GroupIcon /> },
      { label: 'Feedback', path: '/feedback', icon: <FeedbackIcon /> },
      ...(isAdmin ? [{ label: 'Admin', path: '/admin', icon: <AdminPanelSettingsIcon /> }] : []),
    ]
    : [
      { label: 'Login', path: '/login', icon: <LoginIcon /> },
      ...(isAdmin ? [{ label: 'Admin', path: '/admin', icon: <AdminPanelSettingsIcon /> }] : []),
    ];

  // Mobile Drawer
  const drawer = (
    <Box sx={{ width: 280, bgcolor: 'background.paper', height: '100%' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <IconButton onClick={() => setDrawerOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>

      {isLoggedIn && (
        <Box sx={{ px: 2, py: 1.5, bgcolor: 'background.default', mx: 2, borderRadius: 2, mb: 2, display: "flex", justifyContent: "space-between" }} onClick={() => handleNav(`/profil`)}>
          <Box>
            <Box display="flex" alignItems="center" gap={1}>
              <PersonIcon color="primary" />
              <Typography variant="body1" fontWeight={600}>
                {nutzer ? nutzer.vname || nutzer.email : 'Gast'}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {nutzer ? nutzer.email : 'Keine E-Mail'}
            </Typography>
          </Box>
        </Box>
      )}

      {isLoggedIn && (
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNav("/einladungen")} >
            <ListItemIcon><NotificationsIcon /></ListItemIcon>
            <ListItemText>Benachrichtigungen</ListItemText>
          </ListItemButton>
        </ListItem>
      )}
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton onClick={() => handleNav(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}

        {isLoggedIn && (
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{
            minHeight: { xs: 56, md: 64 }, display: "flex", justifyContent: isMobile ? 'space-between' : 'center',
          }}>
            {/* Logo */}
            <Typography
              variant="h6"
              sx={{
                flexGrow: 1,
                fontWeight: 700,
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                cursor: 'pointer',
                background: 'linear-gradient(45deg, #3b82f6 30%, #8b5cf6 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              onClick={() => handleNav('/dashboard')}
            >
              {title}
            </Typography>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {navItems.map((item, index) => (
                  <Button
                    key={index}
                    onClick={() => handleNav(item.path)}
                    color="inherit"
                    startIcon={item.icon}
                    sx={{
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: 'rgba(59, 130, 246, 0.1)',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}

                {isLoggedIn && (
                  <>
                    <BenachrichtigungenDropdown />
                    <Box
                      onClick={() => handleNav(`/profil`)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        ml: 1,
                        px: 2,
                        py: 0.75,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        cursor: "pointer"
                      }}
                    >
                      <PersonIcon sx={{ mr: 1, fontSize: '1.2rem', color: 'primary.main' }} />
                      <Typography variant="body2" fontWeight={600}>
                        {nutzer ? nutzer.vname || nutzer.email : 'Gast'}
                      </Typography>
                    </Box>
                    <Button
                      onClick={handleLogout}
                      color="inherit"
                      startIcon={<LogoutIcon />}
                      sx={{
                        fontWeight: 600,
                        color: 'error.main',
                        '&:hover': {
                          bgcolor: 'rgba(239, 68, 68, 0.1)',
                        },
                      }}
                    >
                      Logout
                    </Button>
                  </>
                )}
              </Box>
            )}
            {isMobile && (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                  cursor: 'pointer',
                  background: 'linear-gradient(45deg, #3b82f6 30%, #8b5cf6 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                onClick={() => handleNav('/dashboard')}
              >
                {version}
              </Typography>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { bgcolor: 'background.default' },
        }}
      >
        {drawer}
      </Drawer>
    </ThemeProvider>
  );
};

export default NavBar;