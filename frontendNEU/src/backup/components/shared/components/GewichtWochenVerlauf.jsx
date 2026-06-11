import { useState, useEffect, useRef } from 'react';
import {
    Card,
    CardContent,
    Box,
    Typography,
    CircularProgress,
    Chip,
} from '@mui/material';
import { BarChart } from '@mui/icons-material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { GewichtApi } from '../../../services/api';
import Notification from '../../util/notifications/Notification';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function berechneWochenDifferenzen(verlauf) {
    if (!Array.isArray(verlauf) || verlauf.length < 2) return [];

    const sorted = [...verlauf].sort(
        (a, b) => new Date(a.datum) - new Date(b.datum),
    );

    const getKW = (dateStr) => {
        const d = new Date(dateStr);
        const jan4 = new Date(d.getFullYear(), 0, 4);
        const startOfWeek1 = new Date(jan4);
        startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
        const diff = d - startOfWeek1;
        const kw = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
        return `KW ${String(kw).padStart(2, '0')} ${d.getFullYear()}`;
    };

    const gruppen = {};
    for (const eintrag of sorted) {
        const kw = getKW(eintrag.datum);
        if (!gruppen[kw]) gruppen[kw] = [];
        gruppen[kw].push(Number(eintrag.gewicht));
    }

    return Object.entries(gruppen)
        .filter(([, gewichte]) => gewichte.length >= 2)
        .map(([kw, gewichte]) => {
            const diff = +(gewichte[gewichte.length - 1] - gewichte[0]).toFixed(2);
            return { kw, diff };
        });
}

const BALKEN_BREITE = 56;
const MIN_BREITE = 300;

function GewichtWochenVerlauf({ nutzerId }) {
    const [loading, setLoading] = useState(true);
    const [verlauf, setVerlauf] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (nutzerId) fetchVerlauf();
    }, [nutzerId]);

    const fetchVerlauf = async () => {
        try {
            setLoading(true);
            const response = await GewichtApi.getErweiterteStats(nutzerId);
            const rawVerlauf = response.data?.gewichtsverlauf || [];
            setVerlauf(berechneWochenDifferenzen(rawVerlauf));
        } catch (err) {
            console.error('Fehler beim Laden des Wochenverlaufs:', err);
            setMessage({ type: 'error', text: 'Fehler beim Laden des Wochenverlaufs' });
        } finally {
            setLoading(false);
        }
    };

    const gesamtVeraenderung = verlauf.reduce((sum, w) => sum + w.diff, 0);
    const positivWochen = verlauf.filter((w) => w.diff > 0).length;
    const negativWochen = verlauf.filter((w) => w.diff < 0).length;

    const innerWidth = Math.max(MIN_BREITE, verlauf.length * BALKEN_BREITE);

    const maxAbs = verlauf.length
        ? Math.ceil(Math.max(...verlauf.map((w) => Math.abs(w.diff))) + 0.3)
        : 2;

    const chartData = {
        labels: verlauf.map((w) => w.kw),
        datasets: [
            {
                data: verlauf.map((w) => w.diff),
                // Pro Balken Farbe: grün positiv, rot negativ
                backgroundColor: verlauf.map((w) =>
                    w.diff > 0
                        ? 'rgba(34, 197, 94, 0.75)'
                        : w.diff < 0
                        ? 'rgba(239, 68, 68, 0.75)'
                        : 'rgba(71, 85, 105, 0.75)',
                ),
                borderColor: verlauf.map((w) =>
                    w.diff > 0
                        ? '#22c55e'
                        : w.diff < 0
                        ? '#ef4444'
                        : '#475569',
                ),
                borderWidth: 1.5,
                borderRadius: 4,
                // Balken wachsen immer von der 0-Linie weg
                borderSkipped: false,
            },
        ],
    };

    const chartOptions = {
        responsive: false, // wir steuern die Breite selbst (scrollbar)
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(59, 130, 246, 0.3)',
                borderWidth: 1,
                titleColor: '#93c5fd',
                bodyColor: '#e0f2fe',
                bodyFont: { weight: '600', size: 13 },
                padding: 10,
                cornerRadius: 10,
                callbacks: {
                    title: (items) => items[0].label,
                    label: (item) => {
                        const v = item.raw;
                        return `${v >= 0 ? '+' : ''}${v.toFixed(2)} kg`;
                    },
                },
            },
            // Werte direkt über/unter jedem Balken anzeigen
            datalabels: undefined,
        },
        scales: {
            x: {
                grid: { color: 'rgba(59, 130, 246, 0.08)' },
                ticks: {
                    color: '#64748b',
                    font: { size: 11 },
                    maxRotation: 35,
                    minRotation: 35,
                },
                border: { color: '#334155' },
            },
            y: {
                min: -maxAbs,
                max: maxAbs,
                grid: {
                    color: (ctx) =>
                        ctx.tick.value === 0
                            ? 'rgba(148, 163, 184, 0.5)'
                            : 'rgba(59, 130, 246, 0.08)',
                    lineWidth: (ctx) => (ctx.tick.value === 0 ? 1.5 : 1),
                },
                ticks: {
                    color: '#64748b',
                    font: { size: 11 },
                    stepSize: 1,
                    callback: (v) => `${v > 0 ? '+' : ''}${v}`,
                },
                border: { color: '#334155' },
            },
        },
        // Außerhalb der Balken beschriften via afterDraw-Plugin (siehe unten)
        animation: { duration: 400 },
    };

    // Chart.js-Plugin: Wert außerhalb des Balkens anzeigen
    // (positiv → über dem Balken, negativ → unter dem Balken)
    const datalabelPlugin = {
        id: 'outsideLabels',
        afterDatasetsDraw(chart) {
            const { ctx, data, scales } = chart;
            const dataset = data.datasets[0];
            const meta = chart.getDatasetMeta(0);

            ctx.save();
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            meta.data.forEach((bar, i) => {
                const value = dataset.data[i];
                if (value === 0) return;

                const label = `${value >= 0 ? '+' : ''}${value.toFixed(2)}`;
                const x = bar.x;
                const PADDING = 8;

                if (value >= 0) {
                    // Über dem Balken
                    ctx.fillStyle = '#22c55e';
                    ctx.fillText(label, x, bar.y - PADDING);
                } else {
                    // Unter dem Balken
                    ctx.fillStyle = '#ef4444';
                    ctx.fillText(label, x, bar.y + bar.height + PADDING);
                }
            });

            ctx.restore();
        },
    };

    if (loading) {
        return (
            <Card
                sx={{
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    minHeight: 180,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <CircularProgress />
            </Card>
        );
    }

    if (!verlauf.length) return null;

    return (
        <Box sx={{ mb: 3 }}>
            {message.type === 'error' && (
                <Notification
                    type={message.type}
                    message={message.text}
                    onClose={() => setMessage({ type: '', text: '' })}
                />
            )}

            <Card
                sx={{
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                }}
            >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    {/* Header */}
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <BarChart sx={{ color: '#3b82f6', fontSize: 32 }} />
                        <Typography
                            variant="h5"
                            fontWeight={700}
                            sx={{
                                color: '#e0f2fe',
                                fontSize: { xs: '1.1rem', sm: '1.5rem' },
                            }}
                        >
                            Wöchentliche Veränderung
                        </Typography>
                    </Box>

                    {/* Zusammenfassung */}
                    <Box display="flex" gap={1} flexWrap="wrap" mb={3}>
                        <Chip
                            label={`Gesamt: ${gesamtVeraenderung >= 0 ? '+' : ''}${gesamtVeraenderung.toFixed(2)} kg`}
                            size="small"
                            sx={{
                                bgcolor: 'rgba(59, 130, 246, 0.15)',
                                color: '#93c5fd',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                            }}
                        />
                        <Chip
                            label={`↑ ${positivWochen} Wochen`}
                            size="small"
                            sx={{
                                bgcolor: 'rgba(34, 197, 94, 0.12)',
                                color: '#22c55e',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                            }}
                        />
                        <Chip
                            label={`↓ ${negativWochen} Wochen`}
                            size="small"
                            sx={{
                                bgcolor: 'rgba(239, 68, 68, 0.12)',
                                color: '#ef4444',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                            }}
                        />
                    </Box>

                    {/* Scrollbarer Chart-Container */}
                    <Box
                        sx={{
                            overflowX: 'auto',
                            overflowY: 'hidden',
                            '&::-webkit-scrollbar': { height: 4 },
                            '&::-webkit-scrollbar-track': {
                                bgcolor: 'rgba(255,255,255,0.05)',
                                borderRadius: 2,
                            },
                            '&::-webkit-scrollbar-thumb': {
                                bgcolor: 'rgba(59, 130, 246, 0.4)',
                                borderRadius: 2,
                            },
                        }}
                    >
                        {/* Feste Pixelbreite → Chart.js bekommt stabile Maße */}
                        <Box sx={{ width: innerWidth, height: 300 }}>
                            <Bar
                                data={chartData}
                                options={chartOptions}
                                plugins={[datalabelPlugin]}
                                width={innerWidth}
                                height={300}
                            />
                        </Box>
                    </Box>

                    {verlauf.length > 5 && (
                        <Typography
                            variant="caption"
                            sx={{
                                display: 'block',
                                textAlign: 'center',
                                color: '#475569',
                                mt: 1,
                                fontSize: '0.7rem',
                            }}
                        >
                            ← scroll →
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}

export default GewichtWochenVerlauf;