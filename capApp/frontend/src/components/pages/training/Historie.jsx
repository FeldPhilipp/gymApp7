import NavBar from '../../layout/NavBar';
import { useParams, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { darkTheme } from '../../../theme/darkTheme';
import { useEffect, useState } from 'react';
import { TrainingApi } from '../../../services/api';
import {
    Box,
    Container,
    LinearProgress,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    Button,
    Avatar,
    useMediaQuery
} from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DateRangeIcon from '@mui/icons-material/DateRange';
import NavBarBot from '../../layout/NavBarBot';
import LoadingNavBarBot from '../../layout/LoadingNavBarBot';
import BackButton from '../../util/buttons/BackButton';
import HeaderCard from '../../layout/HeaderCard';
import LoadingPage from '../../layout/LoadingPage';

const Historie = () => {
    const isMobile = useMediaQuery(darkTheme.breakpoints.down('md'));
    const id = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [historie, setHistorie] = useState({ letzteTrainings: [] });
    const { isLoggedIn, loading: authLoading } = useAuth();

    useEffect(() => {
        const fetchDaten = async () => {
            setLoading(true);
            try {
                const response = await TrainingApi.getDashboardStats(id.id);
                setHistorie({
                    letzteTrainings: Array.isArray(response.data?.letzteTrainings)
                        ? response.data.letzteTrainings.filter((t) => t && t.id)
                        : [],
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDaten();
    }, [id.id]);

    if (authLoading) {
        return (
            <ThemeProvider theme={darkTheme}>
                <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
                    <NavBar />
                    <Container maxWidth="lg" sx={{ pt: 4 }}>
                        <LinearProgress />
                    </Container>
                </Box>
            </ThemeProvider>
        );
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    if (loading) {
            return (
                <LoadingPage />
            );
        }

    if (historie.letzteTrainings?.length <= 0) {
        return (
            <>
                <ThemeProvider theme={darkTheme}>
                    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
                        <NavBar />
                        <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
                            <Button
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate(-1)}
                                sx={{
                                    mb: 3,
                                    color: '#93c5fd',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    borderRadius: '16px',
                                    padding: '6px 12px',
                                }}
                            >
                                Zurück
                            </Button>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: '50vh',
                                    textAlign: 'center',
                                }}
                            >
                                <FitnessCenterIcon
                                    sx={{
                                        fontSize: 64,
                                        color: '#3b82f6',
                                        mb: 2,
                                        opacity: 0.5,
                                    }}
                                />
                                <Typography
                                    variant="h5"
                                    sx={{ color: '#93c5fd', fontWeight: 600, mb: 1 }}
                                >
                                    Noch keine Trainingseinträge
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ color: '#64748b' }}
                                >
                                    Starten Sie Ihr erstes Training, um Ihre Ergebnisse zu sehen
                                </Typography>
                            </Box>
                        </Container>
                    </Box>
                </ThemeProvider>
                <NavBarBot mainBtnF={null} />
            </>
        );
    }

    const formatDate = (date) => {
        if (!date) return 'Kein Datum';
        return new Date(date).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <>
            <ThemeProvider theme={darkTheme}>
                <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 4 }}>
                    <NavBar />
                    <Container maxWidth="lg" sx={{ pt: 4 }}>
                        {!isMobile && (
                            <BackButton />
                        )}
                        <HeaderCard title="Trainings Historie" subtitle={historie.letzteTrainings?.length + "Trainingseinträge"} />

                        <Grid container spacing={3}>
                            {historie.letzteTrainings.map((training, index) => (
                                <Grid key={index} sx={{ width: isMobile ? ("100%") : ("45%"), }}>
                                    <Card
                                        sx={{
                                            borderRadius: '16px',
                                            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                            border: '1px solid rgba(59, 130, 246, 0.2)',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            height: '100%',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 12px 24px rgba(59, 130, 246, 0.15)',
                                                borderColor: 'rgba(59, 130, 246, 0.4)',
                                            },
                                        }}
                                        onClick={() => navigate(`/trainingdetails/${training.id}`)}
                                    >
                                        <CardContent sx={{ p: 3 }}>
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mb={2}
                                            >
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        color: '#e0f2fe',
                                                        fontWeight: 700,
                                                        mb: 1,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                    title={training.trainingsplan_name}
                                                >
                                                    {training.trainingsplan_name || 'Training'}
                                                </Typography>
                                                <Chip
                                                    label={`${training.anzahl_uebungen || 0} Übungen`}
                                                    sx={{
                                                        bgcolor: 'rgba(34, 197, 94, 0.15)',
                                                        color: '#34d399',
                                                        fontWeight: 600,
                                                        borderRadius: '16px',
                                                    }}
                                                />
                                            </Box>
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                gap={1}
                                                sx={{ color: '#93c5fd', fontSize: '0.875rem' }}
                                            >
                                                <DateRangeIcon sx={{ fontSize: 18 }} />
                                                <Typography variant="caption" sx={{ color: '#93c5fd' }}>
                                                    {formatDate(training.datum)}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </Box>
            </ThemeProvider >
            <NavBarBot mainBtnF={null} />
        </>
    );
};

export default Historie;