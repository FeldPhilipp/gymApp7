import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Container,
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Grid,
    Chip,
    CircularProgress,
    Button,
    Divider,
    ThemeProvider,
    TextField,
    MenuItem,
    useMediaQuery,
    Switch,
    FormControlLabel,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tabs,
    Tab,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import CakeIcon from "@mui/icons-material/Cake";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import HeightIcon from "@mui/icons-material/Height";
import ScaleIcon from "@mui/icons-material/Scale";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LockIcon from '@mui/icons-material/Lock';
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import StorageIcon from "@mui/icons-material/Storage";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NavBar from "../../layout/NavBar";
import { darkTheme } from "../../../theme/darkTheme";
import { UserApi } from "../../../services/api";
import { register, unregister } from '../../../serviceWorkerRegistration';
import { NotificationService } from '../../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import Notification from "../../util/notifications/Notification";
import NavBarBot from "../../layout/NavBarBot";
import LoadingPage from "../../layout/LoadingPage";

function ProfilePage() {
    const isMobile = useMediaQuery(darkTheme.breakpoints.down("md"));
    const { nutzer } = useAuth();
    const [showNotification, setShowNotification] = useState(false);
    const [currentTab, setCurrentTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        vname: "",
        nname: "",
        email: "",
        geb_datum: "",
        geschlecht: "",
        gewicht: "",
        start_gewicht: "",
        ziel_gewicht: "",
        groesse: "",
    });

    const [changePasswordDialog, setChangePasswordDialog] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Settings States
    const [swEnabled, setSwEnabled] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [pushSubscribed, setPushSubscribed] = useState(false);
    const [swStatus, setSwStatus] = useState('unknown');
    const [cacheSize, setCacheSize] = useState(0);
    const [swInfo, setSwInfo] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null });
    const [message, setMessage] = useState({ type: null, text: '' });

    const id = nutzer?.id;

    useEffect(() => {
        fetchUserData();
        checkSWStatus();
        checkNotificationPermission();
        checkPushSubscription();
        getCacheSize();
    }, [id]);

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ type: null, text: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const response = await UserApi.getNutzerById(id);
            setUserData(response.data);
            const gebDatum = response.data.geb_datum ? response.data.geb_datum.split("T")[0] : "";
            setFormData({
                vname: response.data.vname || "",
                nname: response.data.nname || "",
                email: response.data.email || "",
                geb_datum: gebDatum,
                geschlecht: response.data.geschlecht || "",
                gewicht: response.data.gewicht || "",
                start_gewicht: response.data.start_gewicht || "",
                ziel_gewicht: response.data.ziel_gewicht || "",
                groesse: response.data.groesse || "",
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Settings Functions
    const checkSWStatus = async () => {
        try {
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                if (registrations.length > 0) {
                    setSwEnabled(true);
                    setSwStatus('registered');
                    const reg = registrations[0];
                    setSwInfo({
                        scope: reg.scope,
                        active: !!reg.active,
                        installing: !!reg.installing,
                        waiting: !!reg.waiting,
                    });
                } else {
                    setSwEnabled(false);
                    setSwStatus('unregistered');
                }
            } else {
                setSwStatus('error');
            }
        } catch (error) {
            console.error('Fehler beim Prüfen des Service Workers:', error);
            setSwStatus('error');
        }
    };

    const checkNotificationPermission = async () => {
        if ('Notification' in window) {
            setNotificationsEnabled(Notification.permission === 'granted');
        }
    };

    const checkPushSubscription = async () => {
        const isSubscribed = await NotificationService.isPushSubscribed();
        setPushSubscribed(isSubscribed);
    };

    const getCacheSize = async () => {
        try {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                setCacheSize(estimate.usage);
            }
        } catch (error) {
            console.error('Fehler beim Abrufen der Cache-Größe:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        const dataToSave = {
            ...formData,
            geb_datum: formData.geb_datum ? formData.geb_datum.split("T")[0] : null,
        };
        console.log(dataToSave)
        try {
            setLoading(true);
            await UserApi.updateNutzer(id, dataToSave);
            setEditMode(false);
            setUserData(formData);
            setMessage({ type: 'success', text: 'Profil erfolgreich aktualisiert' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Fehler beim Aktualisieren des Profils' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        const gebDatum = userData.geb_datum ? userData.geb_datum.split("T")[0] : "";
        setFormData({
            vname: userData.vname || "",
            nname: userData.nname || "",
            email: userData.email || "",
            geb_datum: gebDatum,
            geschlecht: userData.geschlecht || "",
            gewicht: userData.gewicht || "",
            start_gewicht: userData.start_gewicht || "",
            ziel_gewicht: userData.ziel_gewicht || "",
            groesse: userData.groesse || "",
        });
        setEditMode(false);
    };

    const handleSWToggle = (event) => {
        const isChecked = event.target.checked;
        if (event.target) event.target.blur();
        setTimeout(() => {
            if (isChecked && !swEnabled) {
                setConfirmDialog({ open: true, type: 'enable' });
            } else if (!isChecked && swEnabled) {
                setConfirmDialog({ open: true, type: 'disable' });
            }
        }, 50);
    };

    const handleNotificationToggle = (event) => {
        if (event.target) event.target.blur();
        setTimeout(() => {
            if (!notificationsEnabled) {
                setConfirmDialog({ open: true, type: 'notifications' });
            }
        }, 50);
    };

    const handlePushToggle = (event) => {
        if (event.target) event.target.blur();
        setTimeout(() => {
            if (pushSubscribed) {
                setConfirmDialog({ open: true, type: 'pushUnsubscribe' });
            } else {
                setConfirmDialog({ open: true, type: 'pushSubscribe' });
            }
        }, 50);
    };

    const confirmAction = async () => {
        const { type } = confirmDialog;
        setConfirmDialog({ open: false, type: null });
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            if (type === 'enable') {
                register({
                    onSuccess: () => {
                        setSwEnabled(true);
                        setSwStatus('registered');
                        setMessage({ type: 'success', text: 'Service Worker erfolgreich aktiviert' });
                        checkSWStatus();
                    },
                    onUpdate: () => {
                        setMessage({ type: 'info', text: 'Service Worker Update verfügbar' });
                    },
                });
            } else if (type === 'disable') {
                unregister();
                setSwEnabled(false);
                setSwStatus('unregistered');
                setSwInfo(null);
                setMessage({ type: 'success', text: 'Service Worker deaktiviert' });
            } else if (type === 'clearCache') {
                await clearAllCaches();
                setMessage({ type: 'success', text: 'Cache geleert' });
                getCacheSize();
            } else if (type === 'notifications') {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    setNotificationsEnabled(true);
                    setMessage({ type: 'success', text: 'Benachrichtigungen aktiviert' });
                } else {
                    setMessage({ type: 'error', text: 'Benachrichtigungen wurden abgelehnt' });
                }
            } else if (type === 'pushSubscribe') {
                if (!nutzer?.id) {
                    setMessage({ type: 'error', text: 'Bitte melde dich an' });
                    return;
                }
                const hasPermission = await NotificationService.requestPermission();
                if (!hasPermission) {
                    setMessage({ type: 'error', text: 'Benachrichtigungs-Berechtigung erforderlich' });
                    return;
                }
                const success = await NotificationService.initialize(nutzer.id);
                if (success) {
                    setPushSubscribed(true);
                    setMessage({ type: 'success', text: 'Push-Benachrichtigungen aktiviert' });
                } else {
                    setMessage({ type: 'error', text: 'Fehler beim Aktivieren der Push-Benachrichtigungen' });
                }
            } else if (type === 'pushUnsubscribe') {
                if (!nutzer?.id) {
                    setMessage({ type: 'error', text: 'Bitte melde dich an' });
                    return;
                }
                const success = await NotificationService.unsubscribeFromPush(nutzer.id);
                if (success) {
                    setPushSubscribed(false);
                    setMessage({ type: 'success', text: 'Push-Benachrichtigungen deaktiviert' });
                } else {
                    setMessage({ type: 'error', text: 'Fehler beim Deaktivieren der Push-Benachrichtigungen' });
                }
            }
        } catch (error) {
            console.error('Fehler bei Aktion:', error);
            setMessage({ type: 'error', text: `Fehler: ${error.message}` });
        }
    };

    const clearAllCaches = async () => {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map((name) => caches.delete(name)));
        }
    };

    const handleUpdateSW = async () => {
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            registrations.forEach((reg) => reg.update());
            setMessage({ type: 'info', text: 'Prüfe auf Updates...' });
        }
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const formatDate = (date) => {
        if (!date) return "Nicht angegeben";
        return new Date(date).toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const getGeschlechtLabel = (geschlecht) => {
        const labels = { m: "Männlich", w: "Weiblich", d: "Divers" };
        return labels[geschlecht] || "Nicht angegeben";
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const getStatusColor = () => {
        if (swStatus === 'registered') return '#34d399';
        if (swStatus === 'error') return '#f87171';
        return '#93c5fd';
    };

    const getStatusIcon = () => {
        if (swStatus === 'registered') return <CheckCircleIcon sx={{ color: '#34d399' }} />;
        if (swStatus === 'error') return <ErrorIcon sx={{ color: '#f87171' }} />;
        return null;
    };

    const handleChangePassword = async () => {
        if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Alle Felder müssen ausgefüllt sein' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Passwort muss mindestens 6 Zeichen lang sein' });
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Neue Passwörter stimmen nicht überein' });
            return;
        }

        setPasswordLoading(true);

        try {
            await UserApi.changePassword(id, {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: 'success', text: 'Passwort erfolgreich geändert' });
            setChangePasswordDialog(false);
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            if (err.response?.data?.error) {
                setMessage({ type: 'error', text: err.response.data.error });
            } else {
                setMessage({ type: 'error', text: 'Fehler beim Ändern des Passworts' });
            }
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading && !userData) {
        return (
            <LoadingPage />
        );
    }

    return (
        <>
            <ThemeProvider theme={darkTheme}>
                <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: { xs: 2, md: 4 }, mb: "54px" }}>
                    <NavBar />
                    <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
                        {message.text && (
                            <Notification
                                type={message.type}
                                message={message.text}
                                onClose={() => {
                                    setShowNotification(false);
                                    setMessage({ type: null, text: '' });
                                }}
                            />
                        )}

                        {/* Profil Header Card */}
                        <Card sx={{ mb: { xs: 2, md: 4 }, borderRadius: '16px', boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)" }}>
                            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                <Box display="flex" flexDirection={{ xs: "column", md: "row" }} alignItems={{ xs: "center", md: "flex-start" }} gap={{ xs: 2, md: 3 }}>
                                    <Avatar sx={{ width: { xs: 100, md: 140 }, height: { xs: 100, md: 140 }, bgcolor: "linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)", fontSize: { xs: "2.5rem", md: "3.5rem" }, border: "3px solid #1e293b" }}>
                                        {formData?.vname?.charAt(0)}{formData?.nname?.charAt(0)}
                                    </Avatar>
                                    <Box flex={1} textAlign={{ xs: "center", md: "left" }}>
                                        {editMode ? (
                                            <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={{ xs: 1, md: 2 }} mb={{ xs: 1, md: 2 }}>
                                                <TextField name="vname" label="Vorname" value={formData.vname} onChange={handleInputChange} size="small" fullWidth />
                                                <TextField name="nname" label="Nachname" value={formData.nname} onChange={handleInputChange} size="small" fullWidth />
                                            </Box>
                                        ) : (
                                            <Typography variant={{ xs: "h5", md: "h3" }} fontWeight={700} gutterBottom sx={{ color: "#e0f2fe" }}>
                                                {formData?.vname} {formData?.nname}
                                            </Typography>
                                        )}
                                        <Box display="flex" gap={{ xs: 1, md: 1.5 }} flexWrap="wrap" justifyContent={{ xs: "center", md: "flex-start" }} sx={{ mt: { xs: 1, md: 1 } }}>
                                            {formData?.geschlecht && (
                                                <Chip label={getGeschlechtLabel(formData.geschlecht)} size="medium" sx={{ bgcolor: "rgba(59, 130, 246, 0.2)", color: "#93c5fd", fontWeight: 500, borderRadius: "16px" }} />
                                            )}
                                            {formData?.geb_datum && (
                                                <Chip label={`${calculateAge(formData.geb_datum)} Jahre`} size="medium" variant="outlined" sx={{ color: "#93c5fd", borderColor: "#3b82f6", fontWeight: 500, borderRadius: "16px" }} />
                                            )}
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 1 }, mt: { xs: 2, md: 0 }, width: { xs: "100%", md: "auto" } }}>
                                        {editMode ? (
                                            <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={1} width="100%">
                                                <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} sx={{ background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", borderRadius: '16px', padding: "8px 16px", textTransform: "none", width: { xs: "100%", md: "auto" } }}>
                                                    Speichern
                                                </Button>
                                                <Button variant="outlined" color="error" startIcon={<CancelIcon />} onClick={handleCancel} sx={{ color: "#f87171", borderColor: "#f87171", borderRadius: '16px', padding: "8px 16px", textTransform: "none", width: { xs: "100%", md: "auto" } }}>
                                                    Abbrechen
                                                </Button>
                                            </Box>
                                        ) : (
                                            <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditMode(true)} sx={{ background: "linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)", borderRadius: '16px', padding: "8px 16px", textTransform: "none", width: { xs: "100%", md: "auto" } }}>
                                                Bearbeiten
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Tabs */}
                        <Card sx={{ mb: 3, borderRadius: '16px' }}>
                            <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tab icon={<PersonIcon />} label="Profil" iconPosition="start" />
                                <Tab icon={<SettingsIcon />} label="Einstellungen" iconPosition="start" />
                                {/* <Tab icon={<ScaleIcon />} label="Tracker" iconPosition="start" /> */}
                            </Tabs>
                        </Card>

                        {/* Profil Tab */}
                        {currentTab === 0 && (
                            <Grid container sx={{ width: "100%", display: "flex", justifyContent: "space-between", flexDirection: isMobile ? "column" : "row", gap: { xs: 2, md: 3 } }}>
                                {/* Persönliche Daten, Körperdaten, BMI/Kalorien - DEIN BESTEHENDER CODE */}
                                <Grid sx={{ flex: isMobile ? "none" : "1 1 auto" }}>
                                    <Card sx={{ borderRadius: "16px", height: "100%", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                                        <CardContent sx={{ p: { xs: 2.5, md: 3.5 }, height: "100%" }}>
                                            <Box display="flex" alignItems="center" mb={{ xs: 2.5, md: 3.5 }}>
                                                <Avatar sx={{ bgcolor: "linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)", mr: { xs: 2, md: 2.5 }, width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 } }}>
                                                    <PersonIcon sx={{ fontSize: { xs: 24, md: 28 } }} />
                                                </Avatar>
                                                <Typography variant={{ xs: "h6", md: "h5" }} fontWeight={700} sx={{ color: "#e0f2fe" }}>
                                                    Persönliche Daten
                                                </Typography>
                                            </Box>
                                            <Divider sx={{ mb: { xs: 2.5, md: 3.5 }, borderColor: "rgba(59, 130, 246, 0.15)" }} />
                                            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2.5, md: 3 } }}>
                                                <Box>
                                                    <Box display="flex" alignItems="center" gap={{ xs: 1, md: 1.5 }} mb={{ xs: 1, md: 1.25 }} sx={{ color: "#93c5fd" }}>
                                                        <EmailIcon sx={{ fontSize: { xs: 22, md: 24 } }} />
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>E-Mail</Typography>
                                                    </Box>
                                                    {editMode ? (
                                                        <TextField name="email" type="email" value={formData.email} onChange={handleInputChange} fullWidth size="small" />
                                                    ) : (
                                                        <Typography variant="body2" sx={{ color: "#cbd5e1" }}>{formData?.email || "Nicht angegeben"}</Typography>
                                                    )}
                                                </Box>
                                                <Box>
                                                    <Box display="flex" alignItems="center" gap={{ xs: 1, md: 1.5 }} mb={{ xs: 1, md: 1.25 }} sx={{ color: "#93c5fd" }}>
                                                        <CakeIcon sx={{ fontSize: { xs: 22, md: 24 } }} />
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Geburtsdatum</Typography>
                                                    </Box>
                                                    {editMode ? (
                                                        <TextField name="geb_datum" type="date" value={formData.geb_datum} onChange={handleInputChange} fullWidth size="small" InputLabelProps={{ shrink: true }} />
                                                    ) : (
                                                        <Typography variant="body2" sx={{ color: "#cbd5e1" }}>{formatDate(formData?.geb_datum)}</Typography>
                                                    )}
                                                </Box>
                                                <Box>
                                                    <Box display="flex" alignItems="center" gap={{ xs: 1, md: 1.5 }} mb={{ xs: 1, md: 1.25 }} sx={{ color: "#93c5fd" }}>
                                                        <PersonIcon sx={{ fontSize: { xs: 22, md: 24 } }} />
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Geschlecht</Typography>
                                                    </Box>
                                                    {editMode ? (
                                                        <TextField name="geschlecht" select value={formData.geschlecht} onChange={handleInputChange} fullWidth size="small">
                                                            <MenuItem value="m">Männlich</MenuItem>
                                                            <MenuItem value="w">Weiblich</MenuItem>
                                                            <MenuItem value="d">Divers</MenuItem>
                                                        </TextField>
                                                    ) : (
                                                        <Typography variant="body2" sx={{ color: "#cbd5e1" }}>{getGeschlechtLabel(formData?.geschlecht)}</Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Körperdaten - gekürzt für Übersichtlichkeit */}
                                <Grid sx={{ flex: isMobile ? "none" : "1 1 auto" }}>
                                    <Card sx={{ borderRadius: "16px", height: "100%", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
                                        <CardContent sx={{ p: { xs: 2.5, md: 3.5 }, height: "100%" }}>
                                            <Box display="flex" alignItems="center" mb={{ xs: 2.5, md: 3.5 }}>
                                                <Avatar sx={{ bgcolor: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", mr: { xs: 2, md: 2.5 }, width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 } }}>
                                                    <FitnessCenterIcon sx={{ fontSize: { xs: 24, md: 28 } }} />
                                                </Avatar>
                                                <Typography variant={{ xs: "h6", md: "h5" }} fontWeight={700} sx={{ color: "#e0f2fe" }}>Körperdaten</Typography>
                                            </Box>
                                            <Divider sx={{ mb: { xs: 2.5, md: 3.5 }, borderColor: "rgba(34, 197, 94, 0.15)" }} />
                                            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2.5, md: 3 } }}>
                                                <Box>
                                                    <Box display="flex" alignItems="center" gap={{ xs: 1, md: 1.5 }} mb={{ xs: 1, md: 1.25 }} sx={{ color: "#6ee7b7" }}>
                                                        <HeightIcon sx={{ fontSize: { xs: 22, md: 24 } }} />
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Größe (cm)</Typography>
                                                    </Box>
                                                    {editMode ? (
                                                        <TextField name="groesse" type="number" value={formData.groesse} onChange={handleInputChange} fullWidth size="small" inputProps={{ min: 0, step: 1 }} />
                                                    ) : (
                                                        <Typography variant="body2" sx={{ color: "#cbd5e1" }}>{formData?.groesse ? `${formData.groesse} cm` : "Nicht angegeben"}</Typography>
                                                    )}
                                                </Box>
                                                <Box>
                                                    <Box display="flex" alignItems="center" gap={{ xs: 1, md: 1.5 }} mb={{ xs: 1, md: 1.25 }} sx={{ color: "#6ee7b7" }}>
                                                        <ScaleIcon sx={{ fontSize: { xs: 22, md: 24 } }} />
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Aktuelles Gewicht (kg)</Typography>
                                                    </Box>
                                                    {editMode ? (
                                                        <TextField name="gewicht" type="number" value={formData.gewicht} onChange={handleInputChange} fullWidth size="small" inputProps={{ min: 0, step: 0.1 }} />
                                                    ) : (
                                                        <Typography variant="body2" sx={{ color: "#cbd5e1" }}>{formData?.gewicht ? `${formData.gewicht} kg` : "Nicht angegeben"}</Typography>
                                                    )}
                                                </Box>
                                                <Box>
                                                    <Box display="flex" alignItems="center" gap={{ xs: 1, md: 1.5 }} mb={{ xs: 1, md: 1.25 }} sx={{ color: "#6ee7b7" }}>
                                                        <ScaleIcon sx={{ fontSize: { xs: 22, md: 24 } }} />
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Startgewicht (kg)</Typography>
                                                    </Box>
                                                    {editMode ? (
                                                        <TextField name="start_gewicht" type="number" value={formData.start_gewicht} onChange={handleInputChange} fullWidth size="small" inputProps={{ min: 0, step: 0.1 }} />
                                                    ) : (
                                                        <Typography variant="body2" sx={{ color: "#cbd5e1" }}>{formData?.start_gewicht ? `${formData.start_gewicht} kg` : "Nicht angegeben"}</Typography>
                                                    )}
                                                </Box>
                                                <Box>
                                                    <Box display="flex" alignItems="center" gap={{ xs: 1, md: 1.5 }} mb={{ xs: 1, md: 1.25 }} sx={{ color: "#6ee7b7" }}>
                                                        <ScaleIcon sx={{ fontSize: { xs: 22, md: 24 } }} />
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Zielgewicht (kg)</Typography>
                                                    </Box>
                                                    {editMode ? (
                                                        <TextField name="ziel_gewicht" type="number" value={formData.ziel_gewicht} onChange={handleInputChange} fullWidth size="small" inputProps={{ min: 0, step: 0.1 }} />
                                                    ) : (
                                                        <Typography variant="body2" sx={{ color: "#cbd5e1" }}>{formData?.ziel_gewicht ? `${formData.ziel_gewicht} kg` : "Nicht angegeben"}</Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* BMI und Kalorien */}
                                {formData?.gewicht && formData?.groesse && (
                                    <Grid sx={{ flex: isMobile ? "none" : "1 1 auto", display: "flex", flexDirection: "column", gap: { xs: 2, md: 3 } }}>
                                        <Card sx={{ borderRadius: "16px", height: "100%", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", border: "1px solid rgba(234, 179, 8, 0.2)" }}>
                                            <CardContent sx={{ p: { xs: 2.5, md: 3 }, display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                                                <Box>
                                                    <Typography variant={{ xs: "subtitle2", md: "subtitle1" }} fontWeight={700} sx={{ color: "#e0f2fe" }}>Body Mass Index</Typography>
                                                    <Divider sx={{ mt: 1, mb: 1.5, borderColor: "rgba(234, 179, 8, 0.15)" }} />
                                                </Box>
                                                <Box display="flex" alignItems="center" gap={1.5} flexGrow={1}>
                                                    <Box sx={{ background: "linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)", borderRadius: '16px', padding: "12px 16px", border: "1px solid rgba(234, 179, 8, 0.3)", textAlign: "center" }}>
                                                        <Typography variant="h4" sx={{ color: "#eab308", fontWeight: 700, fontSize: "1.875rem" }}>
                                                            {(formData.gewicht / ((formData.groesse / 100) ** 2)).toFixed(1)}
                                                        </Typography>
                                                    </Box>
                                                    <Box flexGrow={1}>
                                                        <Typography variant="caption" sx={{ color: "#93c5fd", fontSize: "0.75rem", display: "block" }}>BMI Wert</Typography>
                                                        <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>{formData.gewicht} kg / {formData.groesse} cm</Typography>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>

                                        <Card sx={{ borderRadius: "16px", height: "100%", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                                            <CardContent sx={{ p: { xs: 2.5, md: 3 }, display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                                                <Box>
                                                    <Typography variant={{ xs: "subtitle2", md: "subtitle1" }} fontWeight={700} sx={{ color: "#e0f2fe" }}>Kalorienverbrauch</Typography>
                                                    <Divider sx={{ mt: 1, mb: 1.5, borderColor: "rgba(239, 68, 68, 0.15)" }} />
                                                </Box>
                                                <Box flexGrow={1}>
                                                    <Box mb={2}>
                                                        <Typography variant="caption" sx={{ color: "#93c5fd", fontSize: "0.75rem", display: "block", mb: 0.5 }}>Täglicher Verbrauch (BMR)</Typography>
                                                        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                                                            <Typography variant="h5" sx={{ color: "#ef4444", fontWeight: 700, fontSize: "1.5rem" }}>
                                                                {formData.gewicht && formData.groesse && formData.geb_datum
                                                                    ? Math.round(formData.geschlecht === "m"
                                                                        ? 88.362 + 13.397 * formData.gewicht + 4.799 * formData.groesse - 5.677 * (new Date().getFullYear() - new Date(formData.geb_datum).getFullYear())
                                                                        : 447.593 + 9.247 * formData.gewicht + 3.098 * formData.groesse - 4.33 * (new Date().getFullYear() - new Date(formData.geb_datum).getFullYear()))
                                                                    : "—"}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: "#cbd5e1", fontSize: "0.75rem" }}>kcal</Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: "#93c5fd", fontSize: "0.75rem", display: "block", mb: 0.5 }}>Mit moderater Aktivität</Typography>
                                                        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                                                            <Typography variant="h5" sx={{ color: "#fbbf24", fontWeight: 700, fontSize: "1.5rem" }}>
                                                                {formData.gewicht && formData.groesse && formData.geb_datum
                                                                    ? Math.round((formData.geschlecht === "m"
                                                                        ? 88.362 + 13.397 * formData.gewicht + 4.799 * formData.groesse - 5.677 * (new Date().getFullYear() - new Date(formData.geb_datum).getFullYear())
                                                                        : 447.593 + 9.247 * formData.gewicht + 3.098 * formData.groesse - 4.33 * (new Date().getFullYear() - new Date(formData.geb_datum).getFullYear())) * 1.55)
                                                                    : "—"}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: "#cbd5e1", fontSize: "0.75rem" }}>kcal</Typography>
                                                        </Box>
                                                        <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.65rem", mt: 0.5, display: "block" }}>BMR × 1.55 (Sport 3-4x/Woche)</Typography>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                )}
                            </Grid>
                        )}

                        {/* Settings Tab */}
                        {currentTab === 1 && (
                            <Box>

                                <Card sx={{ mb: 3, backgroundColor: '#1f2937', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                                            <LockIcon sx={{ color: '#f87171', fontSize: 28 }} />
                                            <Typography variant="h6" sx={{ color: '#e0f2fe', fontWeight: 600 }}>Passwort ändern</Typography>
                                        </Box>
                                        <Divider sx={{ mb: 2, borderColor: 'rgba(239, 68, 68, 0.2)' }} />
                                        <Typography variant="body2" sx={{ color: '#93c5fd', mb: 2 }}>
                                            Ändere dein Passwort, um dein Konto sicherer zu machen
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            startIcon={<LockIcon />}
                                            onClick={() => setChangePasswordDialog(true)}
                                            sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', borderRadius: '16px', textTransform: 'none' }}
                                        >
                                            Passwort ändern
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Service Worker */}
                                <Card sx={{ mb: 3, backgroundColor: '#1f2937', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                                            <CloudDownloadIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
                                            <Typography variant="h6" sx={{ color: '#e0f2fe', fontWeight: 600 }}>Service Worker</Typography>
                                        </Box>
                                        <Divider sx={{ mb: 2, borderColor: 'rgba(59, 130, 246, 0.2)' }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Box>
                                                <Typography variant="body2" sx={{ color: '#93c5fd', mb: 0.5 }}>Status</Typography>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {getStatusIcon()}
                                                    <Typography variant="body1" sx={{ color: getStatusColor() }}>
                                                        {swStatus === 'registered' && 'Aktiv'}
                                                        {swStatus === 'unregistered' && 'Inaktiv'}
                                                        {swStatus === 'error' && 'Fehler'}
                                                        {swStatus === 'unknown' && 'Wird geladen...'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <FormControlLabel control={<Switch checked={swEnabled} onChange={handleSWToggle} />} label="" />
                                        </Box>
                                        {swInfo && (
                                            <Box sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', p: 1.5, borderRadius: '16px', mb: 2 }}>
                                                <Typography variant="caption" sx={{ color: '#93c5fd' }}><strong>Scope:</strong> {swInfo.scope}</Typography>
                                            </Box>
                                        )}
                                        <Box display="flex" gap={1} flexWrap="wrap">
                                            {swEnabled && (
                                                <>
                                                    <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={handleUpdateSW} sx={{ color: '#3b82f6', borderColor: '#3b82f6', borderRadius: '16px' }}>Update prüfen</Button>
                                                    <Button variant="outlined" size="small" startIcon={<DeleteIcon />} onClick={() => setConfirmDialog({ open: true, type: 'disable' })} sx={{ color: '#f87171', borderColor: '#f87171', borderRadius: '16px' }}>Deaktivieren</Button>
                                                </>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>


                                {/* Benachrichtigungen */}
                                <Card sx={{ mb: 3, backgroundColor: '#1f2937', borderRadius: '16px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                                            <NotificationsIcon sx={{ color: '#34d399', fontSize: 28 }} />
                                            <Typography variant="h6" sx={{ color: '#e0f2fe', fontWeight: 600 }}>Benachrichtigungen</Typography>
                                        </Box>
                                        <Divider sx={{ mb: 2, borderColor: 'rgba(34, 197, 94, 0.2)' }} />

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Box>
                                                <Typography variant="body2" sx={{ color: '#93c5fd', mb: 0.5 }}>Browser-Berechtigung</Typography>
                                                <Typography variant="caption" sx={{ color: '#64748b' }}>Grundlegende Berechtigung für Benachrichtigungen</Typography>
                                            </Box>
                                            <FormControlLabel control={<Switch checked={notificationsEnabled} onChange={handleNotificationToggle} />} label="" />
                                        </Box>

                                        <Divider sx={{ my: 2, borderColor: 'rgba(34, 197, 94, 0.1)' }} />

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                                    <Typography variant="body2" sx={{ color: '#93c5fd' }}>Push-Benachrichtigungen</Typography>
                                                    <Chip label={pushSubscribed ? 'Aktiv' : 'Inaktiv'} size="small" sx={{ bgcolor: pushSubscribed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(100, 116, 139, 0.2)', color: pushSubscribed ? '#34d399' : '#64748b', height: '20px', fontSize: '0.7rem' }} />
                                                </Box>
                                                <Typography variant="caption" sx={{ color: '#64748b' }}>Erhalte Einladungen und wichtige Updates</Typography>
                                            </Box>
                                            <FormControlLabel control={<Switch checked={pushSubscribed} onChange={handlePushToggle} disabled={!swEnabled} />} label="" />
                                        </Box>

                                        {!swEnabled && (
                                            <Alert severity="warning" sx={{ mt: 2, bgcolor: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }}>
                                                Service Worker muss aktiviert sein für Push-Benachrichtigungen
                                            </Alert>
                                        )}

                                        {swEnabled && pushSubscribed && (
                                            <Box sx={{ bgcolor: 'rgba(34, 197, 94, 0.1)', p: 2, borderRadius: '16px', mt: 2 }}>
                                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                                    <NotificationsActiveIcon sx={{ color: '#34d399', fontSize: 20 }} />
                                                    <Typography variant="body2" sx={{ color: '#34d399', fontWeight: 600 }}>Push-Benachrichtigungen sind aktiv</Typography>
                                                </Box>
                                                <Typography variant="caption" sx={{ color: '#64748b' }}>Du erhältst Benachrichtigungen über Gruppeneinladungen, Termine und wichtige Updates</Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Speicher */}
                                <Card sx={{ backgroundColor: '#1f2937', borderRadius: '16px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                                            <StorageIcon sx={{ color: '#a78bfa', fontSize: 28 }} />
                                            <Typography variant="h6" sx={{ color: '#e0f2fe', fontWeight: 600 }}>Speicher</Typography>
                                        </Box>
                                        <Divider sx={{ mb: 2, borderColor: 'rgba(168, 85, 247, 0.2)' }} />
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" sx={{ color: '#93c5fd', mb: 1 }}>Belegter Speicher</Typography>
                                            <Chip label={formatBytes(cacheSize)} sx={{ bgcolor: '#1e3a8a', color: '#e0f2fe' }} />
                                        </Box>
                                        <Button variant="outlined" size="small" startIcon={<DeleteIcon />} onClick={() => setConfirmDialog({ open: true, type: 'clearCache' })} sx={{ color: '#f87171', borderColor: '#f87171', borderRadius: '16px' }}>
                                            Cache leeren
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Box>
                        )}
                    </Container>

                    {/* Confirmation Dialog */}
                    <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, type: null })} maxWidth="sm" fullWidth disableEnforceFocus disableRestoreFocus>
                        <DialogTitle sx={{ bgcolor: '#1f2937', color: '#e0f2fe' }}>
                            {confirmDialog.type === 'enable' && 'Service Worker aktivieren?'}
                            {confirmDialog.type === 'disable' && 'Service Worker deaktivieren?'}
                            {confirmDialog.type === 'clearCache' && 'Cache wirklich leeren?'}
                            {confirmDialog.type === 'notifications' && 'Benachrichtigungen aktivieren?'}
                            {confirmDialog.type === 'pushSubscribe' && 'Push-Benachrichtigungen aktivieren?'}
                            {confirmDialog.type === 'pushUnsubscribe' && 'Push-Benachrichtigungen deaktivieren?'}
                        </DialogTitle>
                        <DialogContent sx={{ bgcolor: '#1f2937' }}>
                            <Typography sx={{ color: '#93c5fd', mt: 1 }}>
                                {confirmDialog.type === 'enable' && 'Dies ermöglicht Offline-Unterstützung und schnellere Ladezeiten.'}
                                {confirmDialog.type === 'disable' && 'Die App funktioniert weiterhin, hat aber keine Offline-Unterstützung.'}
                                {confirmDialog.type === 'clearCache' && 'Der gecachte Speicher wird gelöscht. Dies kann nicht rückgängig gemacht werden.'}
                                {confirmDialog.type === 'notifications' && 'Du erhältst Benachrichtigungen über wichtige Ereignisse.'}
                                {confirmDialog.type === 'pushSubscribe' && 'Du erhältst Push-Benachrichtigungen über Gruppeneinladungen, Termine und wichtige Updates.'}
                                {confirmDialog.type === 'pushUnsubscribe' && 'Du erhältst keine Push-Benachrichtigungen mehr. Du kannst sie jederzeit wieder aktivieren.'}
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{ bgcolor: '#1f2937' }}>
                            <Button onClick={() => setConfirmDialog({ open: false, type: null })} sx={{ color: '#93c5fd' }}>Abbrechen</Button>
                            <Button onClick={confirmAction} variant="contained" sx={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: '#fff', borderRadius: '16px' }}>Bestätigen</Button>
                        </DialogActions>
                    </Dialog>

                    {/* Change Password Dialog */}
                    <Dialog
                        open={changePasswordDialog}
                        onClose={() => setChangePasswordDialog(false)}
                        maxWidth="sm"
                        fullWidth
                        disableEnforceFocus
                        disableRestoreFocus
                    >
                        <DialogTitle sx={{ bgcolor: '#1f2937', color: '#e0f2fe' }}>
                            Passwort ändern
                        </DialogTitle>
                        <DialogContent sx={{ bgcolor: '#1f2937', pt: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    label="Altes Passwort"
                                    type="password"
                                    value={passwordData.oldPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                    fullWidth
                                    disabled={passwordLoading}
                                    autoComplete="current-password"
                                />
                                <TextField
                                    label="Neues Passwort"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    fullWidth
                                    disabled={passwordLoading}
                                    autoComplete="new-password"
                                />
                                <TextField
                                    label="Passwort bestätigen"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    fullWidth
                                    disabled={passwordLoading}
                                    autoComplete="new-password"
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ bgcolor: '#1f2937' }}>
                            <Button
                                onClick={() => setChangePasswordDialog(false)}
                                sx={{ color: '#93c5fd' }}
                                disabled={passwordLoading}
                            >
                                Abbrechen
                            </Button>
                            <Button
                                onClick={handleChangePassword}
                                variant="contained"
                                sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', borderRadius: '16px' }}
                                disabled={passwordLoading}
                            >
                                {passwordLoading ? 'Wird geändert...' : 'Passwort ändern'}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </ThemeProvider>
            <NavBarBot />
        </>
    );
}

export default ProfilePage;