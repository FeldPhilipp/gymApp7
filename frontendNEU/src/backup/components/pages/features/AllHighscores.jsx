import React, { useEffect, useState } from 'react';
import {
    Container,
    Box,
    Paper,
    Typography,
    Chip,
    Avatar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    ThemeProvider,
    LinearProgress,
    useMediaQuery
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FilterListIcon from '@mui/icons-material/Filter';
import NavBar from '../../layout/NavBar';
import NavBarBot from '../../layout/NavBarBot';
import HeaderCard from '../../layout/HeaderCard';
import { TrainingApi } from '../../../services/api';
import { useAuth } from '../../context/AuthContext';
import { darkTheme } from '../../../theme/darkTheme';
import { Navigate } from 'react-router-dom';
import BackButton from '../../util/buttons/BackButton';
import LoadingNavBarBot from '../../layout/LoadingNavBarBot';

function AllHighscores() {
    const [message, setMessage] = useState({ type: "", text: "" });
    const isMobile = useMediaQuery(darkTheme.breakpoints.down('md'));
    const { gruppeId } = useParams();
    const navigate = useNavigate();
    const { nutzer, isLoggedIn, loading: authLoading } = useAuth();
    const [highscores, setHighscores] = useState([]);
    const [filteredHighscores, setFilteredHighscores] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [selectedZielmuskel, setSelectedZielmuskel] = useState('alle');
    const [selectedNutzer, setSelectedNutzer] = useState('alle');

    // Unique values for filters
    const [zielmuskeln, setZielmuskeln] = useState([]);
    const [nutzerListe, setNutzerListe] = useState([]);

    useEffect(() => {
        if (!isLoggedIn) {
            setLoading(false);
            return;
        }
        fetchHighscores();
    }, [isLoggedIn, gruppeId]); // gruppeId als Dependency

    useEffect(() => {
        applyFilters();
    }, [selectedZielmuskel, selectedNutzer, highscores]);

    const fetchHighscores = async () => {
        setLoading(true);
        try {
            const response = await TrainingApi.getDashboardStats(nutzer.id, gruppeId ? { gruppeId } : {});

            const data = response.data?.highscores || [];

            setHighscores(data);
            setFilteredHighscores(data);

            // Extrahiere unique Werte für Filter
            const uniqueZielmuskeln = [...new Set(data.map(h => h.zielmuskel).filter(Boolean))];
            const uniqueNutzer = [...new Set(data.map(h => `${h.vname} ${h.nname}`).filter(n => n.trim()))];

            setZielmuskeln(uniqueZielmuskeln.sort());
            setNutzerListe(uniqueNutzer.sort());

        } catch (err) {
            console.error('Fehler beim Laden der Highscores:', err);
            setMessage({ type: "error", text: err });
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...highscores];

        if (selectedZielmuskel !== 'alle') {
            filtered = filtered.filter(h => h.zielmuskel === selectedZielmuskel);
        }

        if (selectedNutzer !== 'alle') {
            filtered = filtered.filter(h => `${h.vname} ${h.nname}` === selectedNutzer);
        }

        setFilteredHighscores(filtered);
    };

    const handleResetFilters = () => {
        setSelectedZielmuskel('alle');
        setSelectedNutzer('alle');
    };

    if (authLoading) {
        return (
            <ThemeProvider theme={darkTheme}>
                <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
                    <NavBar />
                    <Container maxWidth="lg" sx={{ pt: 4 }}>
                        <LinearProgress />
                    </Container>
                    <LoadingNavBarBot />
                </Box>
            </ThemeProvider>
        );
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
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
                <Container
                    maxWidth="lg"
                    sx={{
                        pt: { xs: 2, md: 4 },
                        px: { xs: 1, sm: 2 },
                        flexGrow: 1,
                        pb: '64px',
                    }}
                >
                    {!isMobile && (
                        <BackButton />
                    )}
                    <HeaderCard
                        title="Alle Highscores"
                        icon={<EmojiEventsIcon />}
                    />

                    {/* Filter Section */}
                    <Paper
                        sx={{
                            p: 2,
                            mb: 3,
                            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                            border: "1px solid rgba(59, 130, 246, 0.2)",
                            borderRadius: "16px"
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <FilterListIcon sx={{ color: '#3b82f6', mr: 1 }} />
                            <Typography variant="h6" color="#e0f2fe" fontWeight={600}>
                                Filter
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid>
                                <FormControl fullWidth size="small">
                                    <InputLabel sx={{ color: '#93c5fd' }}>Zielmuskel</InputLabel>
                                    <Select
                                        value={selectedZielmuskel}
                                        label="Zielmuskel"
                                        onChange={(e) => setSelectedZielmuskel(e.target.value)}
                                        sx={{
                                            color: '#fff',
                                            '.MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'rgba(59, 130, 246, 0.3)',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'rgba(59, 130, 246, 0.5)',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#3b82f6',
                                            },
                                            '.MuiSvgIcon-root': {
                                                color: '#93c5fd',
                                            },
                                        }}
                                    >
                                        <MenuItem value="alle">Alle Muskeln</MenuItem>
                                        {zielmuskeln.map((muskel) => (
                                            <MenuItem key={muskel} value={muskel}>
                                                {muskel}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid>
                                <FormControl fullWidth size="small">
                                    <InputLabel sx={{ color: '#93c5fd' }}>Nutzer</InputLabel>
                                    <Select
                                        value={selectedNutzer}
                                        label="Nutzer"
                                        onChange={(e) => setSelectedNutzer(e.target.value)}
                                        sx={{
                                            color: '#fff',
                                            '.MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'rgba(59, 130, 246, 0.3)',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'rgba(59, 130, 246, 0.5)',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#3b82f6',
                                            },
                                            '.MuiSvgIcon-root': {
                                                color: '#93c5fd',
                                            },
                                        }}
                                    >
                                        <MenuItem value="alle">Alle Nutzer</MenuItem>
                                        {nutzerListe.map((nutzerName) => (
                                            <MenuItem key={nutzerName} value={nutzerName}>
                                                {nutzerName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid>
                                <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
                                    <Chip
                                        label="Filter zurücksetzen"
                                        onClick={handleResetFilters}
                                        sx={{
                                            backgroundColor: '#1e3a8a',
                                            color: '#e0f2fe',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: '#3b82f6',
                                            },
                                        }}
                                    />
                                    <Chip
                                        label={`${filteredHighscores.length} Ergebnisse`}
                                        sx={{
                                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                            color: '#3b82f6',
                                        }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Highscores Grid */}
                    {loading ? (
                        <LinearProgress />
                    ) : message.type === "error" ? (
                        <Typography color="error" align="center" sx={{ py: 4 }}>
                            {message.text}
                        </Typography>
                    ) : filteredHighscores.length === 0 ? (
                        <Paper
                            sx={{
                                p: 4,
                                backgroundColor: '#1f2937',
                                borderRadius: '16px',
                                textAlign: 'center',
                            }}
                        >
                            <Typography color="#93c5fd" variant="body1">
                                Keine Highscores gefunden
                            </Typography>
                            <Typography color="#93c5fd" variant="caption" sx={{ mt: 1, display: 'block' }}>
                                Trainiere mehr, um deine ersten Highscores zu erreichen! 💪
                            </Typography>
                        </Paper>
                    ) : (
                        <Grid container spacing={2} sx={{ display: !isMobile && ("flex"), justifyContent: !isMobile && ("space-evenly") }}>
                            {filteredHighscores.map((score, index) => (
                                <Grid key={index} sx={{ width: isMobile ? ("100%") : ("45%") }}>
                                    <Paper
                                        sx={{
                                            p: 2,
                                            width: "100%",
                                            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                                            border: "1px solid rgba(59, 130, 246, 0.2)",
                                            borderRadius: '16px',
                                            border: '1px solid rgba(59, 130, 246, 0.3)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)',
                                                borderColor: 'rgba(59, 130, 246, 0.5)',
                                            },
                                        }}
                                    >
                                        {/* Header mit Icon */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Avatar
                                                sx={{
                                                    bgcolor: '#1e3a8a',
                                                    mr: 1.5,
                                                    width: 40,
                                                    height: 40,
                                                }}
                                            >
                                                <EmojiEventsIcon sx={{ color: '#3b82f6' }} />
                                            </Avatar>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight={700}
                                                    color="#fff"
                                                    sx={{
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {score.uebung_name || 'Unbekannte Übung'}
                                                </Typography>
                                                <Typography variant="caption" color="#93c5fd">
                                                    {score.zielmuskel || 'Unbekannt'}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Gewicht */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                py: 3,
                                                px: 2,
                                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                borderRadius: '16px',
                                                mb: 2,
                                            }}
                                        >
                                            <FitnessCenterIcon
                                                sx={{ color: '#3b82f6', fontSize: 32, mr: 1.5 }}
                                            />
                                            <Typography
                                                variant="h4"
                                                fontWeight={700}
                                                color="#3b82f6"
                                            >
                                                {score.max_gewicht || 0}
                                            </Typography>
                                            <Typography
                                                variant="h6"
                                                color="#93c5fd"
                                                sx={{ ml: 0.5 }}
                                            >
                                                kg
                                            </Typography>
                                        </Box>

                                        {/* Nutzer Info */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Typography variant="body2" color="#93c5fd">
                                                Erreicht von
                                            </Typography>
                                            <Chip
                                                label={`${score.vname || ''} ${score.nname || ''}`.trim() || 'Unbekannt'}
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#1e3a8a',
                                                    color: '#e0f2fe',
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Container>
            </Box>
            <NavBarBot />
        </ThemeProvider >
    );
}

export default AllHighscores;