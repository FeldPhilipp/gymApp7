import { Box } from '@mui/material';
import GymKalenderWidget from './GurppenKalenderWidget';

/**
 * GruppenKalenderSection – zeigt den Gruppenkalender auf dem Dashboard.
 *
 * Props:
 *   gruppeId   {string}   ID der Favoriten-Gruppe
 */
function GruppenKalenderSection({ gruppeId }) {
  if (!gruppeId) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          width: '100%',
          minHeight: { xs: '200px', sm: '400px' },
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <GymKalenderWidget
          gruppeId={gruppeId}
          showAddButton
          showTerminList
          compact={false}
          sx={{ width: '100%', height: '100%' }}
        />
      </Box>
    </Box>
  );
}

export default GruppenKalenderSection;