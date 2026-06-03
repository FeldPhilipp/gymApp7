import NavBar from "../../layout/NavBar";
import NavBarBot from "../../layout/NavBarBot";
import { darkTheme } from "../../../theme/darkTheme";
import { ThemeProvider } from "@mui/material/styles";
import {
    Box,
    Container,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Paper,
    Typography,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EventIcon from '@mui/icons-material/Event';
import FeedbackIcon from '@mui/icons-material/Feedback';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { AdminApi } from "../../../services/api";
import { useState } from "react";
import LoadingPage from "../../layout/LoadingPage";
import HeaderCard from '../../layout/HeaderCard';
import Notification from "../../util/notifications/Notification";
import Logs from "./Logs";

const AdminPanel = () => {
    const [showNotification, setShowNotification] = useState(false);
    const [loading, setLoading] = useState(false);
    const [termine, setTermine] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        zielmuskel: '',
        kategorie: '',
        beschreibung: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [message, setMessage] = useState({ type: "", text: "" });

    const navigate = useNavigate();

    const fetchTermine = async () => {
        setLoading(true);
        try {
            const response = await AdminApi.getTermine();
            setTermine(response.data);
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: err });
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await AdminApi.getLogs();
            console.log(response.data);
            // Hier kannst du die Logs weiterverarbeiten oder anzeigen
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: err });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setOpenModal(true);
        setFormErrors({});
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setFormData({
            name: '',
            zielmuskel: '',
            kategorie: '',
            beschreibung: ''
        });
        setFormErrors({});
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Fehler für dieses Feld entfernen, wenn der Benutzer etwas eingibt
        if (formErrors[e.target.name]) {
            setFormErrors({
                ...formErrors,
                [e.target.name]: ''
            });
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Name ist erforderlich';
        if (!formData.zielmuskel.trim()) errors.zielmuskel = 'Zielmuskel ist erforderlich';
        if (!formData.kategorie.trim()) errors.kategorie = 'Kategorie ist erforderlich';
        if (!formData.beschreibung.trim()) errors.beschreibung = 'Beschreibung ist erforderlich';
        return errors;
    };

    const handleSubmit = async () => {
        const errors = validateForm();

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            console.log("Kategorie zu einem Select machen mit Push, Pull, Beine, Core")
            // const response = await AdminApi.addUebung(formData);
            // console.log(response);
        } catch (err) {
            setMessage({ type: "error", text: err });
            console.error(err);
        }

        handleCloseModal();
    };

    if (loading) {
        return <LoadingPage />;
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <Box
                sx={{
                    bgcolor: 'background.default',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    pb: 4,
                }}
            >
                <NavBar />

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

                <Container
                    maxWidth="lg"
                    sx={{
                        pt: { xs: 2, md: 4 },
                        px: { xs: 1, sm: 2 },
                        flexGrow: 1,
                        pb: '64px',
                    }}
                >
                    <HeaderCard title="Administration" subtitle="Daten verwalten" />

                    {/* Action Buttons Section */}
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            mt: 3,
                            bgcolor: 'background.paper',
                            borderRadius: 2
                        }}
                    >
                        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                            Aktionen
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 2,
                                flexWrap: 'wrap',
                                justifyContent: { xs: 'center', sm: 'flex-start' }
                            }}
                        >
                            <Button
                                variant="contained"
                                startIcon={<FeedbackIcon />}
                                onClick={() => navigate("/feedback-ubersicht")}
                                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                            >
                                Feedback Übersicht
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<EventIcon />}
                                onClick={fetchTermine}
                                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                            >
                                Alle Termine laden
                            </Button>
                            <Logs setLoading={setLoading} />
                            <Button
                                variant="outlined"
                                startIcon={<FitnessCenterIcon />}
                                onClick={handleOpenModal}
                                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                            >
                                Übung hinzufügen
                            </Button>
                        </Box>
                    </Paper>

                    {/* Termine List Section */}
                    {termine.length > 0 && (
                        <Paper
                            elevation={3}
                            sx={{
                                mt: 3,
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                overflow: 'hidden'
                            }}
                        >
                            <Box sx={{ p: 2, bgcolor: 'primary.main' }}>
                                <Typography variant="h6" sx={{ color: 'white' }}>
                                    Termine ({termine.length})
                                </Typography>
                            </Box>
                            <Divider />
                            <List sx={{ py: 0 }}>
                                {termine.map((item, index) => (
                                    <Box key={index}>
                                        <ListItem
                                            sx={{
                                                py: 2,
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                }
                                            }}
                                        >
                                            <ListItemIcon>
                                                <EventIcon color="primary" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body1" fontWeight="medium">
                                                        {item.datum}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography variant="body2" color="text.secondary">
                                                        um {item.startzeit}
                                                    </Typography>
                                                }
                                            />
                                        </ListItem>
                                        {index < termine.length - 1 && <Divider component="li" />}
                                    </Box>
                                ))}
                            </List>
                        </Paper>
                    )}

                </Container>
                {/* Modal für neue Übung */}
                <Dialog
                    open={openModal}
                    onClose={handleCloseModal}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        <Typography variant="h6" component="div">
                            Neue Übung hinzufügen
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                            <TextField
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange(e)}
                                error={!!formErrors.name}
                                helperText={formErrors.name}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Zielmuskel"
                                name="zielmuskel"
                                value={formData.zielmuskel}
                                onChange={(e) => handleInputChange(e)}
                                error={!!formErrors.zielmuskel}
                                helperText={formErrors.zielmuskel}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Kategorie"
                                name="kategorie"
                                value={formData.kategorie}
                                onChange={(e) => handleInputChange(e)}
                                error={!!formErrors.kategorie}
                                helperText={formErrors.kategorie}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Beschreibung"
                                name="beschreibung"
                                value={formData.beschreibung}
                                onChange={(e) => handleInputChange(e)}
                                error={!!formErrors.beschreibung}
                                helperText={formErrors.beschreibung}
                                fullWidth
                                required
                                multiline
                                rows={4}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={handleCloseModal} color="inherit">
                            Abbrechen
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            startIcon={<FitnessCenterIcon />}
                        >
                            Hinzufügen
                        </Button>
                    </DialogActions>
                </Dialog>
                <NavBarBot />
            </Box>
        </ThemeProvider>
    );
};

export default AdminPanel;