import { ToggleButtonGroup, ToggleButton, Typography } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';

/**
 * ViewToggle – schaltet zwischen "gruppe" und "persoenlich".
 *
 * Props:
 *   ansicht        {string}   aktueller Wert ('gruppe' | 'persoenlich')
 *   onChange       {fn}       (event, newAnsicht) => void
 */
function ViewToggle({ ansicht, onChange }) {
  return (
    <ToggleButtonGroup
      value={ansicht}
      exclusive
      onChange={onChange}
      size="small"
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: '16px',
        '& .MuiToggleButton-root': {
          color: 'primary.main',
          '&.Mui-selected': {
            backgroundColor: 'primary.dark',
            color: '#fff',
          },
        },
      }}
    >
      <ToggleButton value="gruppe">
        <GroupIcon sx={{ mr: 0.5 }} fontSize="small" />
        <Typography variant="caption">Gruppe</Typography>
      </ToggleButton>
      <ToggleButton value="persoenlich">
        <PersonIcon sx={{ mr: 0.5 }} fontSize="small" />
        <Typography variant="caption">Persönlich</Typography>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

export default ViewToggle;