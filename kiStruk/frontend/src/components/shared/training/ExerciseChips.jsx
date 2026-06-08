import { Box, Chip } from "@mui/material";

function ExerciseChips({ zielmuskel, kategorie }) {
  return (
    <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
      {zielmuskel && (
        <Chip label={zielmuskel} size="small" color="primary" variant="outlined" />
      )}
      {kategorie && (
        <Chip label={kategorie} size="small" color="secondary" variant="outlined" />
      )}
    </Box>
  );
}

export default ExerciseChips;
