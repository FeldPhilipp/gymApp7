import { useState, useEffect } from "react";
import { TrainingApi } from "../../../services/api";
import { useAuth } from '../../context/AuthContext';
import {
    FormControl,
    MenuItem,
    Select,
    InputLabel,
    Box,
    Button,
    TextField,
    Alert,
    CircularProgress,
    Snackbar
} from '@mui/material';

const INITIAL_DATA = {
    name: "",
    beschreibung: "",
    zielmuskel: "",
    kategorie: ""
};

const ZIELMUSKEL_OPTIONS = [
    { value: "Brust", label: "Brust" },
    { value: "Ruecken", label: "Rücken" },
    { value: "Schultern", label: "Schultern" },
    { value: "Bizeps", label: "Bizeps" },
    { value: "Trizeps", label: "Trizeps" },
    { value: "Beine", label: "Beine" },
    { value: "Bauch", label: "Bauch" },
    { value: "Gesaess", label: "Gesäß" },
];

const KATEGORIE_OPTIONS = [
    { value: "Push", label: "Push" },
    { value: "Pull", label: "Pull" },
    { value: "Beine", label: "Beine" },
    { value: "Core", label: "Core" },
];

const UebungForm = () => {
    const { nutzer } = useAuth();

    const [data, setData] = useState(INITIAL_DATA);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [successOpen, setSuccessOpen] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        if (!nutzer) return;
        const getUebungen = async () => {
            try {
                await TrainingApi.getUebungenByUserId(nutzer.id);
            } catch (err) {
                console.error("Fehler beim Laden der Übungen:", err);
            }
        };
        getUebungen();
    }, [nutzer]);

    const validate = () => {
        const errors = {};
        if (!data.name.trim()) errors.name = "Name ist erforderlich.";
        if (!data.kategorie) errors.kategorie = "Kategorie ist erforderlich.";
        return errors;
    };

    const handleChange = (field) => (e) => {
        setData((prev) => ({ ...prev, [field]: e.target.value }));
        if (fieldErrors[field]) {
            setFieldErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSubmitError("");

        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setLoading(true);
        try {
            await TrainingApi.postCreateUserUebung(data, nutzer.id);
            setData(INITIAL_DATA);
            setSuccessOpen(true);
        } catch (err) {
            console.error("Fehler beim Speichern:", err);
            setSubmitError("Speichern fehlgeschlagen. Bitte erneut versuchen.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ m: 2 }}>
            <form onSubmit={handleSave} noValidate>

                {submitError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {submitError}
                    </Alert>
                )}

                <TextField
                    sx={{ bgcolor: "white", mb: 2 }}
                    label="Name"
                    fullWidth
                    required
                    value={data.name}
                    onChange={handleChange("name")}
                    error={!!fieldErrors.name}
                    helperText={fieldErrors.name}
                />

                <TextField
                    sx={{ bgcolor: "white", mb: 2 }}
                    label="Beschreibung"
                    fullWidth
                    multiline
                    rows={3}
                    value={data.beschreibung}
                    onChange={handleChange("beschreibung")}
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Zielmuskel</InputLabel>
                    <Select
                        sx={{ bgcolor: "white" }}
                        label="Zielmuskel"
                        value={data.zielmuskel}
                        onChange={handleChange("zielmuskel")}
                    >
                        <MenuItem value="">
                            <em>Kein Zielmuskel</em>
                        </MenuItem>
                        {ZIELMUSKEL_OPTIONS.map(({ value, label }) => (
                            <MenuItem key={value} value={value}>{label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }} required error={!!fieldErrors.kategorie}>
                    <InputLabel>Kategorie *</InputLabel>
                    <Select
                        sx={{ bgcolor: "white" }}
                        label="Kategorie *"
                        value={data.kategorie}
                        onChange={handleChange("kategorie")}
                    >
                        <MenuItem value="">
                            <em>Bitte wählen</em>
                        </MenuItem>
                        {KATEGORIE_OPTIONS.map(({ value, label }) => (
                            <MenuItem key={value} value={value}>{label}</MenuItem>
                        ))}
                    </Select>
                    {fieldErrors.kategorie && (
                        <Box sx={{ color: "error.main", fontSize: "0.75rem", mt: 0.5, ml: 1.75 }}>
                            {fieldErrors.kategorie}
                        </Box>
                    )}
                </FormControl>

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                    sx={{ mt: 1 }}
                >
                    {loading ? "Wird gespeichert…" : "Speichern"}
                </Button>
            </form>

            <Snackbar
                open={successOpen}
                autoHideDuration={3000}
                onClose={() => setSuccessOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity="success" onClose={() => setSuccessOpen(false)}>
                    Übung erfolgreich gespeichert!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default UebungForm;