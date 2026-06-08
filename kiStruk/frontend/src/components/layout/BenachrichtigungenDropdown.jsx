import { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Divider,
  Button,
  ThemeProvider,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GruppenApi } from '../../services/api';
import { darkTheme } from '../../theme/darkTheme';

function BenachrichtigungenDropdown() {
  const { nutzer } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [benachrichtigungen, setBenachrichtigungen] = useState([]);
  const [ungelesen, setUngelesen] = useState(0);

  useEffect(() => {
    if (nutzer?.id) {
      fetchBenachrichtigungen();
      const interval = setInterval(fetchBenachrichtigungen, 30000);
      return () => clearInterval(interval);
    }
  }, [nutzer]);

  const fetchBenachrichtigungen = async () => {
    if (!nutzer?.id) return;

    try {
      const response = await GruppenApi.getBenachrichtigungen(nutzer.id);
      setBenachrichtigungen(response.data);
      setUngelesen(response.data.filter((b) => !b.gelesen).length);
    } catch (err) {
      console.error('Fehler beim Laden der Benachrichtigungen:', err);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleBenachrichtigungClick = async (benachrichtigung) => {
    if (!benachrichtigung.gelesen) {
      try {
        await GruppenApi.markAsRead({ benachrichtigungId: benachrichtigung.id });
        fetchBenachrichtigungen();
      } catch (err) {
        console.error('Fehler beim Markieren:', err);
      }
    }

    if (benachrichtigung.link) {
      navigate('/einladungen');
    } else if (benachrichtigung.typ === 'einladung') {
      navigate('/einladungen');
    }

    handleClose();
  };

  const handleAlleGelesen = async () => {
    try {
      const ungelesene = benachrichtigungen.filter((b) => !b.gelesen);
      for (const b of ungelesene) {
        await GruppenApi.markAsRead({ benachrichtigungId: b.id });
      }
      fetchBenachrichtigungen();
    } catch (err) {
      console.error('Fehler beim Markieren:', err);
    }
  };

  const open = Boolean(anchorEl);

  return (
    <ThemeProvider theme={darkTheme}>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={ungelesen} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            bgcolor: 'background.paper',
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Benachrichtigungen</Typography>
            {ungelesen > 0 && (
              <Button
                size="small"
                startIcon={<CheckIcon />}
                onClick={handleAlleGelesen}
              >
                Alle gelesen
              </Button>
            )}
          </Box>
        </Box>

        <Divider />

        {benachrichtigungen.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Keine Benachrichtigungen
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {benachrichtigungen.slice(0, 10).map((b, index) => [
              index > 0 && <Divider key={`divider-${b.id}`} />,
              <ListItem
                key={b.id}
                onClick={() => handleBenachrichtigungClick(b)}
                sx={{
                  bgcolor: b.gelesen ? 'transparent' : 'action.hover',
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      fontWeight={b.gelesen ? 400 : 600}
                    >
                      {b.titel}
                    </Typography>
                  }
                  secondary={[
                    <Typography
                      key="nachricht"
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      display="block"
                    >
                      {b.nachricht}
                    </Typography>,
                    <Typography
                      key="datum"
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {new Date(b.erstellt_am).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>,
                  ]}
                />
              </ListItem>,
            ])}
          </List>
        )}

        {benachrichtigungen.length > 10 && [
          <Divider key="divider-show-all" />,
          <Box key="show-all" sx={{ p: 1, textAlign: 'center' }}>
            <Button
              size="small"
              onClick={() => {
                navigate('/benachrichtigungen');
                handleClose();
              }}
            >
              Alle anzeigen
            </Button>
          </Box>,
        ]}
      </Menu>
    </ThemeProvider>
  );
}

export default BenachrichtigungenDropdown;