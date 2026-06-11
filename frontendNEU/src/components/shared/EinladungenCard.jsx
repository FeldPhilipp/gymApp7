import {
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  Button,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import LaunchIcon from '@mui/icons-material/Launch';
import { useNavigate } from 'react-router-dom';

/**
 * EinladungenCard – zeigt ausstehende Gruppeneinladungen an.
 *
 * Props:
 *   einladungen   {Array}   Liste der Einladungsobjekte ({ einlader_name, gruppen_name })
 */
function EinladungenCard({ einladungen }) {
  const navigate = useNavigate();

  if (!einladungen || einladungen.length === 0) return null;

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 0.4)',
        },
      }}
      onClick={() => navigate('/einladungen')}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: '#1e3a8a', mr: 2, width: 40, height: 40 }}>
            <GroupIcon />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: '#e0f2fe', fontWeight: 600 }}>
              Neue Einladungen
            </Typography>
            <Typography variant="caption" sx={{ color: '#93c5fd' }}>
              {einladungen.length}{' '}
              {einladungen.length === 1 ? 'Einladung' : 'Einladungen'} ausstehend
            </Typography>
          </Box>
          <Chip
            label={einladungen.length}
            size="small"
            sx={{ bgcolor: '#3b82f6', color: '#fff', fontWeight: 600, minWidth: '32px' }}
          />
        </Box>

        <Divider sx={{ mb: 2, borderColor: 'rgba(59, 130, 246, 0.2)' }} />

        <List sx={{ p: 0 }}>
          {einladungen.slice(0, 3).map((item, index) => (
            <ListItem
              key={index}
              sx={{
                px: 0,
                py: 1,
                borderBottom:
                  index < Math.min(2, einladungen.length - 1)
                    ? '1px solid rgba(59, 130, 246, 0.1)'
                    : 'none',
              }}
            >
              <Typography variant="body2" sx={{ color: '#fff' }}>
                <Box component="span" sx={{ fontWeight: 600, color: '#3b82f6' }}>
                  {item.einlader_name}
                </Box>
                {' '}hat dich eingeladen zu{' '}
                <Box component="span" sx={{ fontWeight: 600, color: '#3b82f6' }}>
                  {item.gruppen_name}
                </Box>
              </Typography>
            </ListItem>
          ))}
        </List>

        {einladungen.length > 3 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#93c5fd' }}>
              +{einladungen.length - 3} weitere{' '}
              {einladungen.length - 3 === 1 ? 'Einladung' : 'Einladungen'}
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            endIcon={<LaunchIcon />}
            sx={{
              color: '#3b82f6',
              textTransform: 'none',
              fontSize: '0.875rem',
              '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' },
            }}
          >
            Alle ansehen
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default EinladungenCard;