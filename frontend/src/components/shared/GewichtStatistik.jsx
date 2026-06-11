import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Box,
    Typography,
    Grid,
    LinearProgress,
    CircularProgress,
} from '@mui/material';
import { Timeline } from '@mui/icons-material';
import { ResponsiveLine } from '@nivo/line';
import { GewichtApi } from '../../services/api';
import Notification from '../util/notifications/Notification';

function GewichtStatistik({ nutzerId, compact = false }) {
    const [showNotification, setShowNotification] = useState(false);
    const [loading, setLoading] = useState(true);
    const [statistik, setStatistik] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (nutzerId) {
            fetchStatistik();
        }
    }, [nutzerId]);

    const fetchStatistik = async () => {
        try {
            setLoading(true);
            const response = await GewichtApi.getErweiterteStats(nutzerId);
            setStatistik(response.data);
            setMessage({ type: 'success', text: 'Statistik erfolgreich geladen' });
        } catch (err) {
            console.error('Fehler beim Laden der Statistik:', err);
            setMessage({ type: 'error', text: 'Fehler beim Laden der Statistik' });
        } finally {
            setLoading(false);
        }
    };

    const berechneKalorien = () => {
        if (!statistik) return null;

        const { nutzer, kalorienBedarf } = statistik;
        const currentWeight = Number(statistik.aktuelles_gewicht ?? statistik.start_gewicht ?? 0);
        const height = Number(nutzer?.groesse ?? 0);

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
            alter = 0;
        }

        let bmr = 0;
        if (nutzer?.geschlecht === 'm') {
            bmr = 10 * currentWeight + 6.25 * height - 5 * alter + 5;
        } else if (nutzer?.geschlecht === 'w') {
            bmr = 10 * currentWeight + 6.25 * height - 5 * alter - 161;
        } else {
            bmr = 10 * currentWeight + 6.25 * height - 5 * alter - 78;
        }

        const aktivitaetsMultiplikator = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            very_active: 1.9,
        };

        const activityKey = nutzer?.aktivitaetslevel || 'moderate';
        const multiplier = aktivitaetsMultiplikator[activityKey] ?? aktivitaetsMultiplikator['moderate'];
        const erhaltungskalorien = Math.round(bmr * multiplier);

        const apiDefizit = Number(kalorienBedarf?.defizit ?? NaN);
        const emp = kalorienBedarf?.empfehlung || 'moderate';
        const defaultDefizitByEmp = { aggressive: 800, moderate: 500, slow: 250 };
        const defaultDefizit = defaultDefizitByEmp[emp] ?? 500;
        const defizit = Number.isFinite(apiDefizit) ? Math.abs(apiDefizit) : defaultDefizit;

        const ziel = Number(statistik.ziel_gewicht ?? NaN);
        const weightDiff =
            Number.isFinite(ziel) && Number.isFinite(currentWeight) ? ziel - currentWeight : 0;

        let zielKalorien = erhaltungskalorien;
        let mode = 'maintain';
        if (Number.isFinite(weightDiff) && weightDiff < 0) {
            zielKalorien = Math.round(erhaltungskalorien - Math.abs(defizit));
            mode = 'deficit';
        } else if (Number.isFinite(weightDiff) && weightDiff > 0) {
            zielKalorien = Math.round(erhaltungskalorien + Math.abs(defizit));
            mode = 'surplus';
        }

        return { erhaltung: erhaltungskalorien, zielKalorien, defizit, empfehlung: emp, mode };
    };

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'short',
        });

    // Nivo erwartet das Format: [{ id, data: [{ x, y }] }]
    const buildNivoData = (verlauf, startGewicht, startDatum) => {
        const raw = Array.isArray(verlauf) ? [...verlauf] : [];

        // Startpunkt ggf. voranstellen
        if (startGewicht != null && startGewicht !== '') {
            const sw = Number(startGewicht);
            const alreadyIn = raw.some((d) => Number(d.gewicht) === sw);
            if (!alreadyIn) {
                const datum =
                    startDatum || (raw.length ? raw[0].datum : new Date().toISOString());
                raw.unshift({ datum, gewicht: sw });
            }
        }

        return [
            {
                id: 'gewicht',
                color: '#3b82f6',
                data: raw.map((d) => ({
                    x: d.datum,
                    y: Number(d.gewicht),
                })),
            },
        ];
    };

    if (loading) {
        return (
            <Card
                sx={{
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    minHeight: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3
                }}
            >
                <CircularProgress />
            </Card>
        );
    }

    if (!statistik) return null;

    const fortschritt = statistik.fortschritt || 0;
    const verlauf = statistik.gewichtsverlauf || [];
    const nivoData = buildNivoData(
        verlauf,
        statistik.start_gewicht,
        statistik.start_datum,
    );

    // Y-Achsen-Bereich mit etwas Puffer
    const alleGewichte = nivoData[0].data.map((d) => d.y);
    const minY = Math.min(...alleGewichte, Number(statistik.ziel_gewicht ?? Infinity)) - 2;
    const maxY = Math.max(...alleGewichte, Number(statistik.ziel_gewicht ?? -Infinity)) + 2;

    // Ziel-Linie als Nivo-Marker
    const zielMarker = statistik.ziel_gewicht != null
        ? [
            {
                axis: 'y',
                value: Number(statistik.ziel_gewicht),
                lineStyle: {
                    stroke: '#22c55e',
                    strokeWidth: 1.5,
                    strokeDasharray: '6 4',
                },
                legend: `Ziel ${Number(statistik.ziel_gewicht).toFixed(1)} kg`,
                legendPosition: 'bottom-right',
                legendOrientation: 'horizontal',
                textStyle: { fill: '#22c55e', fontSize: 11 },
            },
        ]
        : [];

    // Anzahl sichtbarer X-Ticks reduzieren auf mobil
    const tickCount = verlauf.length <= 6 ? verlauf.length : 4;

    return (
        <Box sx={{ mb: 3 }}>
            {message.type === 'error' && (
                <Notification
                    type={message.type}
                    message={message.text}
                    onClose={() => {
                        setShowNotification(true);
                        setMessage('');
                    }}
                />
            )}

            <Card
                sx={{
                    mb: 3,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                }}
            >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    {/* Header */}
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <Timeline sx={{ color: '#3b82f6', fontSize: 32 }} />
                        <Typography
                            variant="h5"
                            fontWeight={700}
                            sx={{ color: '#e0f2fe', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}
                        >
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
                                borderRadius: '16px',
                                bgcolor: 'rgba(59, 130, 246, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: '16px',
                                    background:
                                        fortschritt >= 100
                                            ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                                            : 'linear-gradient(90deg, #3b82f6 0%, #1e40af 100%)',
                                },
                            }}
                        />
                        <Box
                            display="flex"
                            flexDirection={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between"
                            gap={{ xs: 0.5, sm: 0 }}
                            mt={1}
                        >
                            <Typography
                                variant="caption"
                                sx={{ color: '#64748b', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                            >
                                Start: {statistik.start_gewicht?.toFixed(1)} kg
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{ color: '#64748b', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                            >
                                Aktuell: {statistik.aktuelles_gewicht?.toFixed(1)} kg
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{ color: '#64748b', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                            >
                                Ziel: {statistik.ziel_gewicht?.toFixed(1)} kg
                            </Typography>
                        </Box>
                    </Box>

                    {/* Nivo Line Chart */}
                    {verlauf.length > 0 && (
                        <Box
                            sx={{
                                height: compact ? 220 : 300,
                                width: '100%',
                                minWidth: 0,
                                position: 'relative',
                            }}
                        >
                            <ResponsiveLine
                                data={nivoData}
                                margin={{
                                    top: 10,
                                    // Rechts mehr Platz für Ziel-Label
                                    right: 6,
                                    bottom: 50,
                                    // Links schmaler auf Mobile halten
                                    left: 30,
                                }}
                                // X-Achse ist ein Datum-String → als Kategorie behandeln
                                xScale={{ type: 'point' }}
                                yScale={{
                                    type: 'linear',
                                    min: minY,
                                    max: maxY,
                                    stacked: false,
                                }}
                                // Kurve leicht glätten
                                curve="monotoneX"
                                // Achsen-Stil
                                axisBottom={{
                                    tickSize: 4,
                                    tickPadding: 6,
                                    tickRotation: -35,
                                    format: (v) => formatDate(v),
                                    // Nur jeden n-ten Tick zeigen
                                    tickValues: nivoData[0].data
                                        .filter((_, i) => {
                                            const total = nivoData[0].data.length;
                                            if (total <= tickCount) return true;
                                            const step = Math.ceil(total / tickCount);
                                            return i % step === 0 || i === total - 1;
                                        })
                                        .map((d) => d.x),
                                }}
                                axisLeft={{
                                    tickSize: 4,
                                    tickPadding: 6,
                                    tickRotation: 0,
                                    format: (v) => `${v}`,
                                    tickCount: 5,
                                }}
                                // Grid
                                enableGridX={false}
                                gridYValues={5}
                                theme={{
                                    grid: {
                                        line: {
                                            stroke: 'rgba(59, 130, 246, 0.1)',
                                            strokeWidth: 1,
                                        },
                                    },
                                    axis: {
                                        ticks: {
                                            text: {
                                                fill: '#64748b',
                                                fontSize: 11,
                                            },
                                            line: { stroke: '#64748b' },
                                        },
                                        domain: {
                                            line: { stroke: '#334155' },
                                        },
                                    },
                                    crosshair: {
                                        line: {
                                            stroke: '#3b82f6',
                                            strokeWidth: 1,
                                            strokeOpacity: 0.5,
                                        },
                                    },
                                    tooltip: {
                                        container: {
                                            background: 'rgba(15, 23, 42, 0.95)',
                                            border: '1px solid rgba(59, 130, 246, 0.3)',
                                            borderRadius: '12px',
                                            padding: '8px 12px',
                                            color: '#e0f2fe',
                                            fontSize: 13,
                                        },
                                    },
                                }}
                                // Linie
                                colors={['#3b82f6']}
                                lineWidth={3}
                                // Punkte – auf Mobile etwas kleiner
                                enablePoints={true}
                                pointSize={6}
                                pointColor="#3b82f6"
                                pointBorderWidth={2}
                                pointBorderColor="#1e293b"
                                // Area unter der Linie
                                enableArea={true}
                                areaOpacity={0.15}
                                // Tooltip
                                useMesh={true}
                                tooltip={({ point }) => (
                                    <Box
                                        sx={{
                                            bgcolor: 'rgba(15, 23, 42, 0.95)',
                                            border: '1px solid rgba(59, 130, 246, 0.3)',
                                            borderRadius: '12px',
                                            px: 1.5,
                                            py: 1,
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{ color: '#93c5fd', display: 'block', mb: 0.3 }}
                                        >
                                            {formatDate(point.data.x)}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            fontWeight={600}
                                            sx={{ color: '#e0f2fe' }}
                                        >
                                            {Number(point.data.y).toFixed(1)} kg
                                        </Typography>
                                    </Box>
                                )}
                                // Legende ausblenden (wird oben textuell angezeigt)
                                legends={[]}
                                // Ziel-Linie
                                markers={zielMarker}
                                // Kein animiertes Re-render bei Resize (besser für Mobile)
                                animate={true}
                                motionConfig="gentle"
                            />
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}

export default GewichtStatistik;