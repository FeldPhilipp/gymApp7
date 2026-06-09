import { Box, Grid, IconButton, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

function DropSetInputs({ exerciseId, dropsaetze = [], onAdd, onChange, onRemove }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">
          Dropsaetze {dropsaetze.length > 0 ? `(${dropsaetze.length})` : ""}
        </Typography>
        <IconButton
          onClick={() => onAdd(exerciseId)}
          size="small"
          color="primary"
          title="Dropsatz hinzufuegen"
        >
          <AddIcon />
        </IconButton>
      </Box>

      {dropsaetze.map((dropsatz, dropsatzIdx) => (
        <Box key={dropsatzIdx}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Typography variant="body2" color="warning.main">
              Dropsatz {dropsatzIdx + 1}
            </Typography>
            <IconButton
              size="small"
              color="error"
              onClick={() => onRemove(exerciseId, dropsatzIdx)}
              title="Dropsatz entfernen"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Gewicht (kg)"
                type="number"
                slotProps={{ htmlInput: { inputMode: "decimal", pattern: "[0-9.]*" } }}
                size="small"
                fullWidth
                value={dropsatz.gewicht}
                onChange={(event) =>
                  onChange(exerciseId, dropsatzIdx, "gewicht", event.target.value)
                }
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
                value={dropsatz.wiederholungen}
                onChange={(event) =>
                  onChange(exerciseId, dropsatzIdx, "wiederholungen", event.target.value)
                }
              />
            </Grid>
          </Grid>
        </Box>
      ))}
    </Box>
  );
}

export default DropSetInputs;
