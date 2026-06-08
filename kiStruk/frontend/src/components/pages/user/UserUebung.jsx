import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { TrainingApi } from "../../../services/api";
import { useAuth } from "../../context/AuthContext";
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
    Container,
    Card,
    CardContent,
    Typography,
    Chip,
    Stack,
    ThemeProvider,
    CssBaseline,
    Divider,
} from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import SaveIcon from "@mui/icons-material/Save";
import NavBar from "../../layout/NavBar";
import NavBarBot from "../../layout/NavBarBot";
import LoadingNavBarBot from "../../layout/LoadingNavBarBot";
import HeaderCard from "../../layout/HeaderCard";
import Notification from "../../util/notifications/Notification";
import { darkTheme } from "../../../theme/darkTheme";

const INITIAL_DATA = {
    name: "",
    beschreibung: "",
    zielmuskel: "",
    kategorie: "",
};

const ZIELMUSKEL_OPTIONS = [
    { value: "Brust", label: "Brust" },
    { value: "Ruecken", label: "Rücken" },
    { value: "Schultern", label: "Schultern" },
    { value: "Bizeps", label: "Bizeps" },
    { value: "Trizeps", label: "Trizeps" },
    { value: "Beine", label: "Beine" },
    { value: "Bauch", label: "Bauch" },
];

const KATEGORIE_OPTIONS = [
    { value: "Push", label: "Push" },
    { value: "Pull", label: "Pull" },
    { value: "Beine", label: "Beine" },
];

const ZIELMUSKEL_LABELS = Object.fromEntries(
    ZIELMUSKEL_OPTIONS.map(({ value, label }) => [value, label])
);

function NutzerEigeneUebungenPage() {
    const { nutzer, isLoggedIn, loading: authLoading } = useAuth();

    const [data, setData] = useState(INITIAL_DATA);
    const [uebungen, setUebungen] = useState([]);
    const [loading, setLoading] = useState(false);
    const [listLoading, setListLoading] = useState(true);
    const [submitError, setSubmitError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showNotification, setShowNotification] = useState(false);

    const loadUebungen = useCallback(async () => {
        if (!nutzer?.id) return;
        setListLoading(true);
        try {
            const response = await TrainingApi.getUebungenByUserId(nutzer.id);
            setUebungen(response.data ?? []);
        } catch (err) {
            console.error("Fehler beim Laden der Übungen:", err);
            setMessage({ type: "error", text: "Übungen konnten nicht geladen werden." });
            setShowNotification(true);
        } finally {
            setListLoading(false);
        }
    }, [nutzer?.id]);

    useEffect(() => {
        loadUebungen();
    }, [loadUebungen]);

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
            await TrainingApi.postCreateUserUebung({
                name: data.name.trim(),
                beschreibung: data.beschreibung.trim() || null,
                zielmuskel: data.zielmuskel || null,
                kategorie: data.kategorie,
            });
            setData(INITIAL_DATA);
            setFieldErrors({});
            setMessage({ type: "success", text: "Übung erfolgreich gespeichert!" });
            setShowNotification(true);
            await loadUebungen();
        } catch (err) {
            console.error("Fehler beim Speichern:", err);
            const apiMessage = err.response?.data?.error;
            setSubmitError(
                apiMessage || "Speichern fehlgeschlagen. Bitte erneut versuchen."
            );
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                    <CircularProgress />
                </Box>
            </ThemeProvider>
        );
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <NavBar />
            <Container maxWidth="md" sx={{ py: 2, pb: 10 }}>
                <HeaderCard
                    title="Eigene Übungen"
                    subtitle="Lege persönliche Übungen an, die nur in deinem Konto sichtbar sind."
                    icon={<FitnessCenterIcon />}
                />

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Neue Übung anlegen
                        </Typography>

                        <Box component="form" onSubmit={handleSave} noValidate>
                            {submitError && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {submitError}
                                </Alert>
                            )}

                            <TextField
                                sx={{ mb: 2 }}
                                label="Name"
                                fullWidth
                                required
                                value={data.name}
                                onChange={handleChange("name")}
                                error={!!fieldErrors.name}
                                helperText={fieldErrors.name}
                            />

                            <TextField
                                sx={{ mb: 2 }}
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
                                    label="Zielmuskel"
                                    value={data.zielmuskel}
                                    onChange={handleChange("zielmuskel")}
                                >
                                    <MenuItem value="">
                                        <em>Kein Zielmuskel</em>
                                    </MenuItem>
                                    {ZIELMUSKEL_OPTIONS.map(({ value, label }) => (
                                        <MenuItem key={value} value={value}>
                                            {label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl
                                fullWidth
                                sx={{ mb: 2 }}
                                required
                                error={!!fieldErrors.kategorie}
                            >
                                <InputLabel>Kategorie</InputLabel>
                                <Select
                                    label="Kategorie"
                                    value={data.kategorie}
                                    onChange={handleChange("kategorie")}
                                >
                                    <MenuItem value="">
                                        <em>Bitte wählen</em>
                                    </MenuItem>
                                    {KATEGORIE_OPTIONS.map(({ value, label }) => (
                                        <MenuItem key={value} value={value}>
                                            {label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {fieldErrors.kategorie && (
                                    <Typography
                                        variant="caption"
                                        color="error"
                                        sx={{ mt: 0.5, ml: 1.75, display: "block" }}
                                    >
                                        {fieldErrors.kategorie}
                                    </Typography>
                                )}
                            </FormControl>

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={loading}
                                startIcon={
                                    loading ? (
                                        <CircularProgress size={16} color="inherit" />
                                    ) : (
                                        <SaveIcon />
                                    )
                                }
                            >
                                {loading ? "Wird gespeichert…" : "Speichern"}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Deine Übungen ({uebungen.length})
                        </Typography>

                        {listLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                <CircularProgress size={32} />
                            </Box>
                        ) : uebungen.length === 0 ? (
                            <Typography color="text.secondary">
                                Noch keine eigenen Übungen angelegt.
                            </Typography>
                        ) : (
                            <Stack spacing={2} divider={<Divider />}>
                                {uebungen.map((uebung) => (
                                    <Box key={uebung.id}>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {uebung.uebung_name}
                                        </Typography>
                                        {uebung.uebung_beschreibung && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mt: 0.5 }}
                                            >
                                                {uebung.uebung_beschreibung}
                                            </Typography>
                                        )}
                                        <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                                            <Chip
                                                label={uebung.kategorie}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                            {uebung.zielmuskel && (
                                                <Chip
                                                    label={
                                                        ZIELMUSKEL_LABELS[uebung.zielmuskel] ||
                                                        uebung.zielmuskel
                                                    }
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </CardContent>
                </Card>
            </Container>

            {nutzer ? <NavBarBot /> : <LoadingNavBarBot />}

            {showNotification && message.text && (
                <Notification
                    type={message.type}
                    message={message.text}
                    onClose={() => {
                        setShowNotification(false);
                        setMessage({ type: "", text: "" });
                    }}
                />
            )}
        </ThemeProvider>
    );
}

export default NutzerEigeneUebungenPage;
