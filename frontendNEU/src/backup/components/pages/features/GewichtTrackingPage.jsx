import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Grid,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    useMediaQuery,
    ThemeProvider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ScaleIcon from "@mui/icons-material/Scale";
import { CssBaseline } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import NavBar from "../../layout/NavBar";
import { darkTheme } from "../../../theme/darkTheme";
import { GewichtApi } from "../../../services/api";
import { useAuth } from "../../context/AuthContext";
import GewichtStatistik from '../../shared/GewichtStatistik';
import GewichtWochenVerlauf from '../../shared/components/GewichtWochenVerlauf';
import NavBarBot from "../../layout/NavBarBot";
import LoadingNavBarBot from '../../layout/LoadingNavBarBot';
import BackButton from "../../util/buttons/BackButton";
import HeaderCard from "../../layout/HeaderCard";
import Notification from "../../util/notifications/Notification";

function GewichtTrackingPage() {
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showNotification, setShowNotification] = useState(false);
    const navigate = useNavigate();
    const isMobile = useMediaQuery(darkTheme.breakpoints.down("md"));
    const { nutzer } = useAuth();

    const [loading, setLoading] = useState(false);
    const [gewichtData, setGewichtData] = useState([]);
    const [stats, setStats] = useState(null);

    const [formData, setFormData] = useState({
        gewicht: "",
        datum: new Date().toISOString().split("T")[0],
        notiz: "",
    });

    const [editDialog, setEditDialog] = useState({ open: false, entry: null });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
    const [addDialogOpen, setAddDialogOpen] = useState(false);

    useEffect(() => {
        if (nutzer?.id) {
            fetchGewichtData();
            fetchStats();
        }
    }, [nutzer]);

    const fetchGewichtData = async () => {
        try {
            setLoading(true);
            const response = await GewichtApi.getGewichtByNutzer(nutzer.id, { limit: 30 });
            setGewichtData(response.data);
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: 'Fehler beim Laden der Daten' });
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await GewichtApi.getErweiterteStats(nutzer.id, { days: 30 });
            setStats(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.gewicht || !formData.datum) {
            setMessage({ type: "error", text: 'Gewicht und Datum sind erforderlich' });

            return;
        }

        try {
            setLoading(true);
            await GewichtApi.createGewicht({
                nutzer_id: nutzer.id,
                gewicht: parseFloat(formData.gewicht),
                datum: formData.datum,
                notiz: formData.notiz,
            });
            setMessage({ type: "success", text: 'Gewicht erfolgreich eingetragen' });
            setFormData({
                gewicht: "",
                datum: new Date().toISOString().split("T")[0],
                notiz: "",
            });
            fetchGewichtData();
            fetchStats();
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: err.response?.data?.error || "Fehler beim Speichern" });
        } finally {
            setLoading(false);
            // window.location.reload();
        }
    };

    const handleEdit = (entry) => {
        setEditDialog({
            open: true,
            entry: {
                ...entry,
                datum: entry.datum.split("T")[0]
            }
        });
    };

    const handleUpdate = async () => {
        try {
            setLoading(true);
            await GewichtApi.updateGewicht(editDialog.entry.id, {
                gewicht: parseFloat(editDialog.entry.gewicht),
                datum: editDialog.entry.datum,
                notiz: editDialog.entry.notiz,
            });
            setMessage({ type: "success", text: 'Gewicht aktualisiert' });
            setEditDialog({ open: false, entry: null });
            fetchGewichtData();
            fetchStats();
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: 'Fehler beim Aktualisieren' });
        } finally {
            setLoading(false);
            window.location.reload();
        }
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            await GewichtApi.deleteGewicht(deleteDialog.id);

            setMessage({ type: "success", text: 'Eintrag gelöscht' });
            setDeleteDialog({ open: false, id: null });
            fetchGewichtData();
            fetchStats();
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: 'Fehler beim Löschen' });

        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const getTrendIcon = (value) => {
        if (value < 0) return <TrendingDownIcon sx={{ color: "#22c55e" }} />;
        if (value > 0) return <TrendingUpIcon sx={{ color: "#ef4444" }} />;
        return null;
    };

    if (loading && !gewichtData.length) {
        return (
            <>
                <ThemeProvider theme={darkTheme}>
                    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
                        <NavBar />
                        <CircularProgress sx={{ position: "absolute", top: "45%", left: "45%", display: 'block', mx: 'auto', mb: 2 }} />
                    </Box>
                </ThemeProvider>
                <LoadingNavBarBot />
            </>
        );
    }

    return (
        <>
            <ThemeProvider theme={darkTheme}>
                <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: "54px" }}>
                    <NavBar />
                    <Container maxWidth="md" sx={{ pt: { xs: 2, md: 4 } }}>
                        {!isMobile && (
                            <BackButton />
                        )}
                        <HeaderCard title={"Gewicht Tracker"} />

                        {message.status === "error" || message.status === "success" && (
                            <Notification
                                type={message.type}
                                message={message.text}
                                onClose={() => {
                                    setShowNotification(true);
                                    setMessage({ type: "", text: "" });
                                }}
                            />
                        )}
                    </Container>

                    {/* Add Dialog (replaces inline 'Gewicht eintragen' card) */}
                    <Dialog
                        open={addDialogOpen}
                        onClose={() => setAddDialogOpen(false)}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle sx={{ bgcolor: '#1f2937', color: '#e0f2fe' }}>Gewicht eintragen</DialogTitle>
                        <DialogContent sx={{ bgcolor: '#1f2937', pt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid>
                                    <TextField
                                        fullWidth
                                        label="Gewicht (kg)"
                                        name="gewicht"
                                        type="number"
                                        value={formData.gewicht}
                                        onChange={handleInputChange}
                                        inputProps={{ step: 0.1, min: 0 }}
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid>
                                    <TextField
                                        fullWidth
                                        label="Datum"
                                        name="datum"
                                        type="date"
                                        value={formData.datum}
                                        onChange={handleInputChange}
                                        InputLabelProps={{ shrink: true }}
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid>
                                    <TextField
                                        fullWidth
                                        label="Notiz (optional)"
                                        name="notiz"
                                        value={formData.notiz}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ bgcolor: '#1f2937' }}>
                            <Button onClick={() => setAddDialogOpen(false)} sx={{ color: '#93c5fd' }} disabled={loading}>Abbrechen</Button>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                                onClick={async () => {
                                    await handleSubmit();
                                    setAddDialogOpen(false);
                                }}
                                disabled={loading}
                                sx={{
                                    background: "linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)",
                                    borderRadius: '16px',
                                    textTransform: 'none'
                                }}
                            >
                                {loading ? 'Wird gespeichert...' : 'Gewicht speichern'}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Edit Dialog */}
                    <Dialog
                        open={editDialog.open}
                        onClose={() => setEditDialog({ open: false, entry: null })}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle sx={{ bgcolor: '#1f2937', color: '#e0f2fe' }}>
                            Gewichtseintrag bearbeiten
                        </DialogTitle>
                        <DialogContent sx={{ bgcolor: '#1f2937', pt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid>
                                    <TextField
                                        fullWidth
                                        label="Gewicht (kg)"
                                        type="number"
                                        value={editDialog.entry?.gewicht || ''}
                                        onChange={(e) => setEditDialog(prev => ({
                                            ...prev,
                                            entry: { ...prev.entry, gewicht: e.target.value }
                                        }))}
                                        inputProps={{ step: 0.1, min: 0 }}
                                    />
                                </Grid>
                                <Grid>
                                    <TextField
                                        fullWidth
                                        label="Datum"
                                        type="date"
                                        value={editDialog.entry?.datum || ''}
                                        onChange={(e) => setEditDialog(prev => ({
                                            ...prev,
                                            entry: { ...prev.entry, datum: e.target.value }
                                        }))}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid>
                                    <TextField
                                        fullWidth
                                        label="Notiz"
                                        value={editDialog.entry?.notiz || ''}
                                        onChange={(e) => setEditDialog(prev => ({
                                            ...prev,
                                            entry: { ...prev.entry, notiz: e.target.value }
                                        }))}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ bgcolor: '#1f2937' }}>
                            <Button onClick={() => setEditDialog({ open: false, entry: null })} sx={{ color: '#93c5fd' }}>
                                Abbrechen
                            </Button>
                            <Button
                                onClick={handleUpdate}
                                variant="contained"
                                disabled={loading}
                                sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)' }}
                            >
                                Speichern
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Delete Dialog */}
                    <Dialog
                        open={deleteDialog.open}
                        onClose={() => setDeleteDialog({ open: false, id: null })}
                        maxWidth="xs"
                        fullWidth
                    >
                        <DialogTitle sx={{ bgcolor: '#1f2937', color: '#e0f2fe' }}>
                            Eintrag löschen?
                        </DialogTitle>
                        <DialogContent sx={{ bgcolor: '#1f2937', pt: 2 }}>
                            <Typography sx={{ color: '#93c5fd' }}>
                                Möchtest du diesen Gewichtseintrag wirklich löschen? Dies kann nicht rückgängig gemacht werden.
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{ bgcolor: '#1f2937' }}>
                            <Button onClick={() => setDeleteDialog({ open: false, id: null })} sx={{ color: '#93c5fd' }}>
                                Abbrechen
                            </Button>
                            <Button
                                onClick={handleDelete}
                                variant="contained"
                                disabled={loading}
                                sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
                            >
                                Löschen
                            </Button>
                        </DialogActions>
                    </Dialog>
                    {/* Erweiterte Statistik & Kalorien-Analyse */}
                    <Container maxWidth="lg" sx={{
                        paddingTop: "16px",
                        paddingLeft: "16px",
                        paddingRight: "16px",
                        minHeight: '400px'  // Mindesthöhe hinzufügen
                    }}>
                        <GewichtStatistik
                            nutzerId={nutzer?.id}
                            compact={false}
                            onError={(error) => setMessage({ type: "error", text: error })}
                        />

                        <GewichtWochenVerlauf
                            nutzerId={nutzer?.id}
                        />

                    </Container>
                </Box>
            </ThemeProvider>
            <NavBarBot mainBtnF={() => setAddDialogOpen(true)} mainBtnTxt={<AddIcon />} />
        </>
    );
}

export default GewichtTrackingPage;