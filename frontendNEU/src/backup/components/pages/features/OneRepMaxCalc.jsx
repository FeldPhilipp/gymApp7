import React, { useState } from 'react';
import NavBar from '../../layout/NavBar';
import NavBarBot from '../../layout/NavBarBot';
import {
    Container,
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Divider,
    TextField,
    Button,
    Alert,
    ThemeProvider,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HistoryIcon from '@mui/icons-material/History';
import { darkTheme } from '../../../theme/darkTheme';

function calc1RM(weight, reps) {
    if (reps === 1) return weight;
    return weight * (1 + reps / 30);
}

function fmt(val) {
    return val.toFixed(1);
}

const percentages = [100, 95, 90, 85, 80, 75, 70, 65, 60];

export default function OneRepMaxCalc() {
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [history, setHistory] = useState([]);

    const handleCalc = () => {
        const w = parseFloat(weight);
        const r = parseInt(reps);
        if (!w || !r || w <= 0 || r <= 0 || r > 30) {
            setError('Bitte gültige Werte eingeben (Wdh. 1–30).');
            return;
        }
        setError('');
        const res = calc1RM(w, r);
        setResult({ orm: res, weight: w, reps: r });
        setHistory(prev => [
            { weight: w, reps: r, orm: res, id: Date.now() },
            ...prev.slice(0, 4)
        ]);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleCalc();
    };

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
                    maxWidth={false}
                    sx={{
                        pt: 2,
                        px: 2,
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    {/* Eingabe-Karte */}
                    <Card>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box display="flex" alignItems="center" mb={1.5}>
                                <Avatar sx={{ bgcolor: 'primary.dark', mr: 1, width: 32, height: 32 }}>
                                    <FitnessCenterIcon fontSize="small" />
                                </Avatar>
                                <Typography variant="subtitle2" color="text.primary">
                                    1RM Rechner
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: "-moz-initial", gap: 2, mb: 2 }}>
                                <TextField
                                    label="Kg."
                                    type="number"
                                    inputProps={{ min: 0, step: 0.5 }}
                                    placeholder="z.B. 100"
                                    value={weight}
                                    onChange={e => setWeight(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    size="small"
                                    fullWidth
                                />
                                <TextField
                                    label="Wdh."
                                    type="number"
                                    inputProps={{ min: 1, max: 30, step: 1 }}
                                    placeholder="z.B. 5"
                                    value={reps}
                                    onChange={e => setReps(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    size="small"
                                    fullWidth
                                />

                                <Button variant="contained" fullWidth onClick={handleCalc}>
                                    Berechnen
                                </Button>
                            </Box>

                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                        </CardContent>
                    </Card>

                    {/* Ergebnis-Karte */}
                    {result && (
                        <Card>
                            <CardContent sx={{ p: 2 }}>
                                <Box display="flex" alignItems="center" mb={1.5}>
                                    <Avatar sx={{ bgcolor: 'primary.dark', mr: 1, width: 32, height: 32 }}>
                                        <EmojiEventsIcon fontSize="small" />
                                    </Avatar>
                                    <Typography variant="subtitle2" color="text.primary">
                                        Ergebnis
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                                        {result.weight} kg × {result.reps} Wdh.
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />

                                <Box textAlign="center" mb={2}>
                                    <Typography
                                        sx={{
                                            fontSize: 'clamp(56px, 20vw, 80px)',
                                            fontWeight: 900,
                                            color: 'primary.light',
                                            lineHeight: 1,
                                            letterSpacing: '-0.04em',
                                        }}
                                    >
                                        {fmt(result.orm)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        kg geschätzter 1RM
                                    </Typography>
                                </Box>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.12em',
                                        display: 'block',
                                        mb: 1,
                                    }}
                                >
                                    Trainingsgewichte
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    {percentages.map(pct => {
                                        const w = result.orm * pct / 100;
                                        const isMax = pct === 100;
                                        return (
                                            <Box
                                                key={pct}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    px: 1.5,
                                                    py: 0.75,
                                                    borderRadius: '8px',
                                                    bgcolor: isMax
                                                        ? 'rgba(59, 130, 246, 0.08)'
                                                        : 'background.default',
                                                    border: isMax
                                                        ? '1px solid rgba(59, 130, 246, 0.25)'
                                                        : '1px solid transparent',
                                                }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: isMax ? 'primary.light' : 'text.secondary',
                                                        fontWeight: isMax ? 700 : 400,
                                                    }}
                                                >
                                                    {pct}%
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: isMax ? 'primary.light' : 'text.primary',
                                                        fontWeight: isMax ? 700 : 600,
                                                    }}
                                                >
                                                    {fmt(w)} kg
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </CardContent>
                        </Card>
                    )}
                </Container>
            </Box>
            <NavBarBot />
        </ThemeProvider>
    );
}