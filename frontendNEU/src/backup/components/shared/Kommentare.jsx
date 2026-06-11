import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Container,
    Typography,
    TextField,
    IconButton,
    Paper,
    Avatar,
    ThemeProvider,
    CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { GruppenApi } from "../../services/api";
import Notification from "../util/notifications/Notification";
import NavBar from "../layout/NavBar";
import { darkTheme } from "../../theme/darkTheme";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../../services/socket"; // ⭐ NEU

const Kommentare = () => {
    const [showNotification, setShowNotification] = useState(false);
    const { nutzer } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [kommentare, setKommentare] = useState([]);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [newKommentar, setNewKommentar] = useState("");
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null); // ⭐ NEU: Socket Referenz

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (kommentare.length > 0) {
            scrollToBottom();
        }
    }, [kommentare]);

    const fetchKommentare = async () => {
        setLoading(true);
        try {
            const response = await GruppenApi.getKommentare(id);
            setKommentare(response.data);
        } catch (err) {
            console.error("Error fetching comments:", err);
            setMessage({ type: "error", text: "Fehler beim Laden der Kommentare." });
        } finally {
            setLoading(false);
        }
    };

    // ⭐ NEU: Socket.io Setup und Cleanup
    useEffect(() => {
        if (!nutzer || !id) return;

        // Socket initialisieren
        socketRef.current = getSocket();
        const socket = socketRef.current;

        // Termin-Room betreten
        socket.emit('join-termin', id);
        console.log(`[Socket.io Client] Joined termin-${id}`);

        // Listener für neue Kommentare
        const handleNeuerKommentar = (kommentar) => {
            console.log('[Socket.io Client] 📨 Neuer Kommentar empfangen:', kommentar);
            
            // Nur hinzufügen, wenn nicht vom aktuellen Nutzer
            if (kommentar.user_id !== nutzer.id) {
                setKommentare(prev => [...prev, kommentar]);
            }
        };

        socket.on('neuer-kommentar', handleNeuerKommentar);

        // Initiales Laden
        fetchKommentare();

        // Cleanup beim Verlassen
        return () => {
            socket.off('neuer-kommentar', handleNeuerKommentar);
            socket.emit('leave-termin', id);
            console.log(`[Socket.io Client] Left termin-${id}`);
        };
    }, [id, nutzer]);

    const handleChange = (e) => {
        setNewKommentar(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newKommentar.trim()) return;

        try {
            const userId = nutzer.id;
            const response = await GruppenApi.addKommentar(id, {
                user_id: userId,
                kommentar: newKommentar,
            });
            
            if (response.status === 201) {
                // ⭐ NEU: Optimistisches Update - Kommentar sofort anzeigen
                const neuesKommentar = response.data.kommentar || {
                    id: response.data.id,
                    termin_id: id,
                    user_id: userId,
                    text: newKommentar,
                    erstellt_am: new Date().toISOString(),
                    nutzer_info: {
                        vname: nutzer.vname,
                        nname: nutzer.nname
                    }
                };
                
                setKommentare(prev => [...prev, neuesKommentar]);
                setNewKommentar("");
                
                // Server sendet automatisch via Socket.io an andere Clients
            }
        } catch (err) {
            console.error("Error submitting comment:", err);
            setMessage({ type: "error", text: "Fehler beim Senden des Kommentars." });
        }
    };

    const getInitials = (vname, nname) => {
        return `${vname?.charAt(0) || ""}${nname?.charAt(0) || ""}`.toUpperCase();
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return "Gerade eben";
        if (diffMins < 60) return `vor ${diffMins} Min`;
        if (diffMins < 1440) return `vor ${Math.floor(diffMins / 60)} Std`;
        return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <Box
                sx={{
                    bgcolor: "background.default",
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <NavBar />

                {message.status === "error" || message.status === "success" && (
                    <Notification
                        type={message.type}
                        message={message.text}
                        onClose={() => {
                            setShowNotification(true);
                            setMessage("");
                        }}
                    />
                )}

                <Container
                    maxWidth="sm"
                    sx={{
                        pt: 2,
                        px: { xs: 1, sm: 2 },
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        pb: { xs: "54px", md: 2 },
                    }}
                >
                    {/* Messages Container */}
                    <Box
                        sx={{
                            flex: 1,
                            overflowY: "auto",
                            mb: 2,
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.5,
                        }}
                    >
                        {loading ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    py: 4,
                                }}
                            >
                                <CircularProgress sx={{ color: "#3b82f6" }} />
                            </Box>
                        ) : kommentare.length === 0 ? (
                            <Paper
                                sx={{
                                    p: 3,
                                    bgcolor: "#1e293b",
                                    textAlign: "center",
                                    borderRadius: "16px",
                                    border: "1px solid rgba(59, 130, 246, 0.3)",
                                }}
                            >
                                <Typography color="#93c5fd">
                                    Noch keine Kommentare vorhanden
                                </Typography>
                            </Paper>
                        ) : (
                            kommentare.map((k, i) => {
                                const kommentarUserId = k.nutzer_id || k.user_id;
                                const isOwnMessage = nutzer && kommentarUserId === nutzer.id;

                                return (
                                    <Box
                                        key={k.id || i}
                                        sx={{
                                            display: "flex",
                                            justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                                            alignItems: "flex-end",
                                            gap: 1,
                                        }}
                                    >
                                        {!isOwnMessage && (
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    bgcolor: "#3b82f6",
                                                    fontSize: "0.75rem",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {getInitials(
                                                    k.nutzer_info?.vname,
                                                    k.nutzer_info?.nname
                                                )}
                                            </Avatar>
                                        )}

                                        <Box
                                            sx={{
                                                maxWidth: "75%",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: isOwnMessage ? "flex-end" : "flex-start",
                                            }}
                                        >
                                            {!isOwnMessage && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: "#93c5fd",
                                                        mb: 0.5,
                                                        px: 1,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {k.nutzer_info?.vname} {k.nutzer_info?.nname}
                                                </Typography>
                                            )}

                                            <Paper
                                                elevation={2}
                                                sx={{
                                                    px: 2,
                                                    py: 1.5,
                                                    background: isOwnMessage
                                                        ? "linear-gradient(145deg, #3b82f6 0%, #2563eb 100%)"
                                                        : "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                                                    border: isOwnMessage
                                                        ? "none"
                                                        : "1px solid rgba(59, 130, 246, 0.3)",
                                                    borderRadius: isOwnMessage
                                                        ? "16px 16px 4px 16px"
                                                        : "16px 16px 16px 4px",
                                                }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: isOwnMessage ? "#fff" : "#e0f2fe",
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    {k.text}
                                                </Typography>
                                            </Paper>

                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: "#64748b",
                                                    mt: 0.5,
                                                    px: 1,
                                                    fontSize: "0.7rem",
                                                }}
                                            >
                                                {formatTime(k.erstellt_am)}
                                            </Typography>
                                        </Box>

                                        {isOwnMessage && (
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    bgcolor: "#8b5cf6",
                                                    fontSize: "0.75rem",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {getInitials(nutzer.vname, nutzer.nname)}
                                            </Avatar>
                                        )}
                                    </Box>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </Box>
                </Container>

                {/* Input Area - Fixed above NavBarBot */}
                <Box sx={{
                    position: "fixed",
                    bottom: 0,
                    width: "100%",
                    height: "75px",
                    bgcolor: "background.default",
                }}>
                    <Paper
                        component="form"
                        onSubmit={handleSubmit}
                        elevation={3}
                        sx={{
                            position: "fixed",
                            bottom: { xs: 12, md: 0 },
                            left: 0,
                            right: 0,
                            p: 1.5,
                            mx: { xs: 1, sm: "auto" },
                            maxWidth: { xs: "calc(100% - 16px)", sm: 600 },
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                            borderRadius: "24px",
                            zIndex: 999,
                        }}
                    >
                        <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
                        <TextField
                            fullWidth
                            variant="standard"
                            placeholder="Nachricht schreiben..."
                            value={newKommentar}
                            onChange={handleChange}
                            multiline
                            maxRows={4}
                            slotProps={{ htmlInput: { maxLength: 1000 } }}
                            InputProps={{
                                disableUnderline: true,
                                sx: {
                                    color: "#e0f2fe",
                                    fontSize: "0.95rem",
                                    px: 1,
                                },
                            }}
                            sx={{
                                "& .MuiInputBase-input::placeholder": {
                                    color: "#64748b",
                                    opacity: 1,
                                },
                            }}
                        />
                        <IconButton
                            type="submit"
                            disabled={!newKommentar.trim()}
                            sx={{
                                bgcolor: "#3b82f6",
                                color: "#fff",
                                width: 40,
                                height: 40,
                                "&:hover": {
                                    bgcolor: "#2563eb",
                                },
                                "&:disabled": {
                                    bgcolor: "#334155",
                                    color: "#64748b",
                                },
                            }}
                        >
                            <SendIcon sx={{ fontSize: "1.2rem" }} />
                        </IconButton>
                    </Paper>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default Kommentare;