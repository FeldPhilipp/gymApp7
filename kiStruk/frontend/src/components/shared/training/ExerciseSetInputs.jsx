import { Box, Grid, TextField, Typography } from "@mui/material";

function ExerciseSetInputs({
  exerciseId,
  sets = [],
  onChange,
  emptyText = "Keine Saetze zum Eintragen verfuegbar.",
}) {
  if (!sets.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        {emptyText}
      </Typography>
    );
  }

  return sets.map((satz, satzIdx) => (
    <Box key={satzIdx}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Satz {satzIdx + 1}
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <TextField
            label="Gewicht (kg)"
            type="number"
            slotProps={{ htmlInput: { inputMode: "decimal", pattern: "[0-9.]*" } }}
            size="small"
            fullWidth
            value={satz.gewicht}
            onChange={(event) => onChange(exerciseId, satzIdx, "gewicht", event.target.value)}
            inputProps={{ step: "0.5" }}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            label="Wiederholungen"
            type="number"
            slotProps={{ htmlInput: { inputMode: "decimal", pattern: "[0-9.]*" } }}
            size="small"
            fullWidth
            value={satz.wiederholungen}
            onChange={(event) => onChange(exerciseId, satzIdx, "wiederholungen", event.target.value)}
          />
        </Grid>
      </Grid>
    </Box>
  ));
}

export default ExerciseSetInputs;
