import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Box,
    Typography,
    Grid,
    LinearProgress,
    Chip,
    Divider,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    LocalFireDepartment,
    FitnessCenter,
    CalendarToday,
    Timeline,
} from '@mui/icons-material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Area,
    ComposedChart,
} from 'recharts';
import { GewichtApi } from '../../services/api';
import Notification from '../util/notifications/Notification';

function GewichtStatistik({ nutzerId, compact = false }) {
    const [showNotification, setShowNotification] = useState(false);
    const [loading, setLoading] = useState(true);
    const [statistik, setStatistik] = useState(null);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [chartReady, setChartReady] = useState(false);

    useEffect(() => {
        if (nutzerId) {
            fetchStatistik();
        }
    }, [nutzerId]);

    useEffect(() => {
        if (statistik && !loading) {
            const timer = setTimeout(() => setChartReady(true), 100);
            return () => clearTimeout(timer);
        }
    }, [statistik, loading]);

    const fetchStatistik = async () => {
        try {
            setLoading(true);
            setChartReady(false);
            const response = await GewichtApi.getErweiterteStats(nutzerId);
            setStatistik(response.data);
            setMessage({ type: "success", text: "Statistik erfolgreich geladen" });
        } catch (err) {
            console.error('Fehler beim Laden der Statistik:', err);
            setMessage({ type: "error", text: "Fehler beim Laden der Statistik" });
        } finally {
            setLoading(false);
        }
    };

    const berechneKalorien = () => {
        if (!statistik) return null;

        const { nutzer, kalorienBedarf } = statistik;

        // Use current weight if available, fallback to start weight
        const currentWeight = Number(statistik.aktuelles_gewicht ?? statistik.start_gewicht ?? 0);
        const height = Number(nutzer?.groesse ?? 0);

        // Accurate age calculation (consider month/day)
        let alter = 0;
        try {
            if (nutzer?.geb_datum) {
                const bd = new Date(nutzer.geb_datum);
                const today = new Date();
                alter = today.getFullYear() - bd.getFullYear();
                const m = today.getMonth() - bd.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) alter--;
            }
        } catch (e) {
            alter = new Date().getFullYear() - new Date().getFullYear();
        }

        // Mifflin-St Jeor BMR
        let bmr = 0;
        if (nutzer?.geschlecht === 'm') {
            bmr = 10 * currentWeight + 6.25 * height - 5 * alter + 5;
        } else if (nutzer?.geschlecht === 'w') {
            bmr = 10 * currentWeight + 6.25 * height - 5 * alter - 161;
        } else {
            // approximate average for 'divers' if gender not specified
            bmr = 10 * currentWeight + 6.25 * height - 5 * alter - 78;
        }

        // Aktivitätslevel-Multiplikatoren (defaults)
        const aktivitaetsMultiplikator = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            very_active: 1.9,
        };

        const activityKey = nutzer?.aktivitaetslevel || 'moderate';
        const multiplier = aktivitaetsMultiplikator[activityKey] || aktivitaetsMultiplikator['moderate'];

        const erhaltungskalorien = Math.round(bmr * multiplier);

        // Determine recommended deficit/surplus: use API value if provided, otherwise sensible defaults based on recommendation
        const apiDefizit = Number(kalorienBedarf?.defizit ?? NaN);
        const emp = kalorienBedarf?.empfehlung || 'moderate';
        const defaultDefizitByEmp = {
            aggressive: 800,
            moderate: 500,
            slow: 250,
        };

        const defaultDefizit = defaultDefizitByEmp[emp] ?? 500;
        const defizit = Number.isFinite(apiDefizit) ? Math.abs(apiDefizit) : defaultDefizit;

        // Decide if user needs deficit (ziel < aktuell) or surplus (ziel > aktuell)
        const ziel = Number(statistik.ziel_gewicht ?? NaN);
        const weightDiff = Number.isFinite(ziel) && Number.isFinite(currentWeight) ? ziel - currentWeight : 0;

        let zielKalorien = erhaltungskalorien;
        let mode = 'maintain';
        if (Number.isFinite(weightDiff) && weightDiff < 0) {
            // need to lose weight => deficit
            zielKalorien = Math.round(erhaltungskalorien - Math.abs(defizit));
            mode = 'deficit';
        } else if (Number.isFinite(weightDiff) && weightDiff > 0) {
            // need to gain weight => surplus
            zielKalorien = Math.round(erhaltungskalorien + Math.abs(defizit));
            mode = 'surplus';
        }

        return {
            erhaltung: erhaltungskalorien,
            zielKalorien,
            defizit: defizit,
            empfehlung: emp,
            mode,
        };
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'short',
        });
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <Box
                    sx={{
                        bgcolor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '16px',
                        p: 1.5,
                    }}
                >
                    <Typography variant="caption" sx={{ color: '#93c5fd', display: 'block', mb: 0.5 }}>
                        {formatDate(payload[0].payload.datum)}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#e0f2fe' }}>
                        {payload[0].value} kg
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <Card sx={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
                <CircularProgress sx={{ position: "absolute", top: "45%", left: "45%", display: 'block', mx: 'auto', mb: 2 }} />
            </Card>
        );
    }

    if (!statistik) return null;

    const kalorien = berechneKalorien();
    const fortschritt = statistik.fortschritt || 0;
    const verlauf = statistik.gewichtsverlauf || [];

    // Ensure the chart data always starts with the provided start weight (if available).
    // If start_gewicht exists and is not already the first point in the verlauf, prepend it.
    const chartData = (() => {
        try {
            const data = Array.isArray(verlauf) ? [...verlauf] : [];
            const hasStart = statistik.start_gewicht !== undefined && statistik.start_gewicht !== null && statistik.start_gewicht !== "";
            if (!hasStart) return data;

            const startWeight = Number(statistik.start_gewicht);
            // If the first data point already equals start weight, use as-is
            if (data.length > 0 && Number(data[0].gewicht) === startWeight) return data;

            // If any point already matches the start weight, don't duplicate it at the front
            const alreadyIncluded = data.some(d => Number(d.gewicht) === startWeight);
            if (alreadyIncluded) return data;

            // Choose a sensible datum for the start point:
            // prefer statistik.start_datum, otherwise the earliest datum in verlauf, otherwise today
            let startDatum = statistik.start_datum || (data.length && data[0].datum) || new Date().toISOString();

            // Normalize to ISO string if a Date object was accidentally provided
            try {
                if (startDatum instanceof Date) startDatum = startDatum.toISOString();
            } catch (e) {
                // ignore
            }

            data.unshift({ datum: startDatum, gewicht: startWeight });
            return data;
        } catch (e) {
            console.error('Fehler beim Vorbereiten der Chart-Daten:', e);
            return verlauf;
        }
    })();

    return (
        <Box sx={{ mb: 3 }}>
            {message.status === "error" && (
                <Notification
                    type={message.type}
                    message={message.text}
                    onClose={() => {
                        setShowNotification(true);
                        setMessage("");
                    }}
                />
            )
            }
            {/* Haupt-Statistik Card */}
            <Card sx={{
                mb: 3,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
                <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <Timeline sx={{ color: '#3b82f6', fontSize: 32 }} />
                        <Typography variant="h5" fontWeight={700} sx={{ color: '#e0f2fe' }}>
                            Gewichtsverlauf & Analyse
                        </Typography>
                    </Box>

                    {/* Fortschrittsbalken */}
                    <Box sx={{ mb: 4 }}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" sx={{ color: '#93c5fd' }}>
                                Fortschritt zum Ziel
                            </Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#e0f2fe' }}>
                                {fortschritt.toFixed(1)}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(fortschritt, 100)}
                            sx={{
                                height: 8,
                                borderRadius: "16px",
                                bgcolor: 'rgba(59, 130, 246, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: "16px",
                                    background: fortschritt >= 100
                                        ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                                        : 'linear-gradient(90deg, #3b82f6 0%, #1e40af 100%)'
                                }
                            }}
                        />
                        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={{ xs: 0.5, sm: 0 }} mt={1}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                Start: {statistik.start_gewicht?.toFixed(1)} kg
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                Aktuell: {statistik.aktuelles_gewicht?.toFixed(1)} kg
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                Ziel: {statistik.ziel_gewicht?.toFixed(1)} kg
                            </Typography>
                        </Box>
                    </Box>

                    {/* Gewichtsverlauf Chart */}
                    {verlauf.length > 0 && (
                        <Box sx={{
                            mb: 3,
                            height: compact ? 250 : 350,
                            minHeight: compact ? 250 : 350,
                            width: '100%',
                            position: 'relative'
                        }}>
                            {!chartReady ? (
                                <Box sx={{
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <CircularProgress size={40} />
                                </Box>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart
                                        data={chartData}
                                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                                    >
                                        <defs>
                                            <linearGradient id="gewichtGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
                                        <XAxis
                                            dataKey="datum"
                                            tickFormatter={formatDate}
                                            stroke="#64748b"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <YAxis
                                            stroke="#64748b"
                                            style={{ fontSize: '12px' }}
                                            domain={['dataMin - 2', 'dataMax + 2']}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <ReferenceLine
                                            y={statistik.ziel_gewicht}
                                            stroke="#22c55e"
                                            strokeDasharray="5 5"
                                            label={{
                                                value: 'Ziel',
                                                fill: '#22c55e',
                                                fontSize: 12,
                                                position: 'right'
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="gewicht"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fill="url(#gewichtGradient)"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="gewicht"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={{ fill: '#3b82f6', r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            )}
                        </Box>
                    )}

                    <Divider sx={{ my: 3, borderColor: 'rgba(59, 130, 246, 0.2)' }} />

                    {/* Kalorien-Empfehlung */}
                    {kalorien && (
                        <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <LocalFireDepartment sx={{ color: '#f59e0b', fontSize: 24 }} />
                                <Typography variant="h6" fontWeight={600} sx={{ color: '#e0f2fe' }}>
                                    Kalorien-Empfehlung
                                </Typography>
                            </Box>

                            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                                {/* Erhaltungskalorien - enthält die Kalorienanzahl um das Gewicht zu halten */}
                                <Grid>
                                    <Box
                                        sx={{
                                            p: { xs: 1.5, sm: 2 },
                                            borderRadius: '16px',
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            border: '1px solid rgba(59, 130, 246, 0.2)'
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ color: '#93c5fd', display: 'block', mb: 0.5 }}>
                                            Erhaltungskalorien
                                        </Typography>
                                        <Typography variant="h5" fontWeight={700} sx={{ color: '#e0f2fe' }}>
                                            {kalorien.erhaltung}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                                            kcal/Tag
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Dynamisch: Defizit oder Überschuss je nach Ziel vs Aktuell */}
                                <Grid>
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: '16px',
                                            background: statistik.ziel_gewicht < statistik.aktuelles_gewicht ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                            border: statistik.ziel_gewicht < statistik.aktuelles_gewicht ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(34, 197, 94, 0.2)'
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ color: statistik.ziel_gewicht < statistik.aktuelles_gewicht ? '#fca5a5' : '#6ee7b7', display: 'block', mb: 0.5 }}>
                                            {statistik.ziel_gewicht < statistik.aktuelles_gewicht ? 'Empfohlenes Defizit' : 'Empfohlener Überschuss'}
                                        </Typography>
                                        <Typography variant="h5" fontWeight={700} sx={{ color: statistik.ziel_gewicht < statistik.aktuelles_gewicht ? '#ef4444' : '#22c55e' }}>
                                            {(() => {
                                                const def = Math.abs(kalorien.defizit || 0);
                                                return statistik.ziel_gewicht < statistik.aktuelles_gewicht ? `-${def}` : `+${def}`;
                                            })()}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                                            kcal/Tag
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Ziel-Kalorien */}
                                <Grid>
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: '16px',
                                            background: 'rgba(34, 197, 94, 0.1)',
                                            border: '1px solid rgba(34, 197, 94, 0.2)'
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ color: '#6ee7b7', display: 'block', mb: 0.5 }}>
                                            Ziel-Kalorien
                                        </Typography>
                                        <Typography variant="h5" fontWeight={700} sx={{ color: '#22c55e' }}>
                                            {kalorien.zielKalorien}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                                            kcal/Tag
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Zeitplan Info */}
                            {statistik.ziel_datum && (
                                <Box
                                    sx={{
                                        mt: 3,
                                        p: { xs: 2, sm: 2.5 },
                                        borderRadius: '16px',
                                        background: 'rgba(234, 179, 8, 0.1)',
                                        border: '1px solid rgba(234, 179, 8, 0.2)'
                                    }}
                                >
                                    <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                                        <CalendarToday sx={{ color: '#fbbf24' }} />
                                        <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#fbbf24' }}>
                                            Zeitplan zum Ziel
                                        </Typography>
                                    </Box>

                                    <Grid container spacing={2}>
                                        <Grid>
                                            <Typography variant="body2" sx={{ color: '#93c5fd', mb: 0.5 }}>
                                                Zieldatum: <strong style={{ color: '#e0f2fe' }}>
                                                    {new Date(statistik.ziel_datum).toLocaleDateString('de-DE', {
                                                        day: '2-digit',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </strong>
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#93c5fd' }}>
                                                Noch <strong style={{ color: '#e0f2fe' }}>{statistik.tage_bis_ziel} Tage</strong>
                                            </Typography>
                                        </Grid>
                                        <Grid>
                                            <Typography variant="body2" sx={{ color: '#93c5fd', mb: 0.5 }}>
                                                Noch zu verlieren: <strong style={{ color: '#e0f2fe' }}>
                                                    {Math.abs(statistik.gewicht_differenz).toFixed(1)} kg
                                                </strong>
                                            </Typography>
                                            <Chip
                                                size="small"
                                                icon={<FitnessCenter sx={{ fontSize: 16 }} />}
                                                label={`${kalorien.empfehlung === 'aggressive' ? 'Schnell' : kalorien.empfehlung === 'moderate' ? 'Moderat' : 'Langsam'} (${kalorien.defizit} kcal Defizit)`}
                                                sx={{
                                                    bgcolor: kalorien.empfehlung === 'aggressive'
                                                        ? 'rgba(239, 68, 68, 0.2)'
                                                        : kalorien.empfehlung === 'moderate'
                                                            ? 'rgba(234, 179, 8, 0.2)'
                                                            : 'rgba(34, 197, 94, 0.2)',
                                                    color: kalorien.empfehlung === 'aggressive'
                                                        ? '#ef4444'
                                                        : kalorien.empfehlung === 'moderate'
                                                            ? '#fbbf24'
                                                            : '#22c55e'
                                                }}
                                            />
                                        </Grid>
                                    </Grid>

                                    {statistik.warnung && (
                                        <Alert
                                            severity="warning"
                                            sx={{
                                                mt: 2,
                                                bgcolor: 'rgba(234, 179, 8, 0.1)',
                                                color: '#fbbf24',
                                                '& .MuiAlert-icon': { color: '#fbbf24' }
                                            }}
                                        >
                                            {statistik.warnung}
                                        </Alert>
                                    )}
                                </Box>
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}

export default GewichtStatistik;