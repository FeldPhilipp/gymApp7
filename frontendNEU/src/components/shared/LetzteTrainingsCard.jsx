import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import { useNavigate } from 'react-router-dom';

/**
 * LetzteTrainingsCard – listet die letzten Trainingseinheiten auf.
 *
 * Props:
 *   trainings   {Array}    Array von Training-Objekten
 *   ansicht     {string}   'gruppe' | 'persoenlich'
 *   nutzerId    {string}   ID des eingeloggten Nutzers
 */
function LetzteTrainingsCard({ trainings, ansicht, nutzerId }) {
  const navigate = useNavigate();

  if (!trainings || trainings.length === 0) {
    return (
      <Typography color="#93c5fd" align="center" variant="caption" sx={{ py: 2 }}>
        Noch keine Trainings vorhanden
      </Typography>
    );
  }

  const itemStyle = {
    width: '100%',
    p: 1,
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'space-between',
  };

  return (
    <>
      <List dense sx={{ overflow: 'auto', flex: 1, width: '100%' }}>
        {trainings.slice(0, 3).map((training) =>
          training && training.id ? (
            <ListItem key={training.id} sx={{ px: 0, py: 0.5, width: '100%' }}>
              <Box sx={itemStyle}>
                <ListItemText
                  primary={
                    <Box display="flex" flexDirection="column">
                      <Typography variant="body2" fontWeight={600} color="#fff">
                        {training.trainingsplan_name || 'Unbekannt'}
                      </Typography>
                      {ansicht === 'gruppe' && (
                        <Typography variant="caption" color="#93c5fd">
                          {training.vname || ''} {training.nname || ''}
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="#93c5fd">
                      {training.datum
                        ? new Date(training.datum).toLocaleDateString('de-DE', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                          })
                        : 'Kein Datum'}
                    </Typography>
                  }
                />
                <LaunchIcon
                  onClick={() => navigate(`/trainingdetails/${training.id}`)}
                  sx={{ cursor: 'pointer', color: '#3b82f6', alignSelf: 'center' }}
                />
              </Box>
            </ListItem>
          ) : null
        )}
      </List>

      {/* Link zur Historie */}
      <ListItem sx={{ px: 0, py: 0.5, width: '100%' }}>
        <Box sx={itemStyle}>
          <ListItemText
            primary={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" fontWeight={600} color="#fff">
                  Historie
                </Typography>
                <LaunchIcon
                  onClick={() => navigate(`/historie/${nutzerId}`)}
                  sx={{ cursor: 'pointer', color: '#3b82f6' }}
                />
              </Box>
            }
          />
        </Box>
      </ListItem>
    </>
  );
}

export default LetzteTrainingsCard;