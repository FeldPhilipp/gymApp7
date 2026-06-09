import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

function FeedbackFields({ formData, onChange, loading }) {
  return (
    <>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel sx={{ color: "text.secondary" }}>Feedback-Typ</InputLabel>
        <Select
          name="typ"
          value={formData.typ}
          onChange={onChange}
          label="Feedback-Typ"
          sx={{
            bgcolor: "background.default",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "divider",
            },
          }}
        >
          <MenuItem value="fehler">Fehler melden</MenuItem>
          <MenuItem value="verbesserung">Verbesserung vorschlagen</MenuItem>
          <MenuItem value="wunsch">Wunsch aeussern</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        name="titel"
        label="Titel"
        placeholder="Kurze Zusammenfassung deines Feedbacks"
        value={formData.titel}
        onChange={onChange}
        required
        sx={{
          mb: 3,
          "& .MuiOutlinedInput-root": {
            bgcolor: "background.default",
          },
        }}
      />

      <TextField
        fullWidth
        name="beschreibung"
        label="Beschreibung"
        placeholder="Beschreibe dein Feedback detailliert."
        value={formData.beschreibung}
        onChange={onChange}
        multiline
        rows={6}
        required
        sx={{
          mb: 3,
          "& .MuiOutlinedInput-root": {
            bgcolor: "background.default",
          },
        }}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={loading}
        endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
        sx={{
          py: 1.5,
          fontWeight: 600,
          fontSize: "1rem",
        }}
      >
        {loading ? "Wird gespeichert..." : "Feedback senden"}
      </Button>
    </>
  );
}

export default FeedbackFields;
