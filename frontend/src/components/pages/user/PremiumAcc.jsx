import NavBar from "../../layout/NavBar";
import NavBarBot from "../../layout/NavBarBot";
import HeaderCard from "../../layout/HeaderCard";
import {
    Box, Container, ThemeProvider, Card, CardContent,
    Button, Grid, Chip, Typography, Divider
} from "@mui/material";
import { darkTheme } from "../../../theme/darkTheme";
import CrownIcon from "@mui/icons-material/WorkspacePremium";
import NoAdsIcon from "@mui/icons-material/Block";
import ChartIcon from "@mui/icons-material/BarChart";
import ListIcon from "@mui/icons-material/PlaylistAddCheck";
import BoltIcon from "@mui/icons-material/Bolt";
import DownloadIcon from "@mui/icons-material/Download";
import ShieldIcon from "@mui/icons-material/VerifiedUser";

const PremiumAcc = () => {

    const btnSx = {
        padding: { sm: '14px 28px' },
        fontSize: { sm: '1rem' },
        fontWeight: 600, borderRadius: '16px',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        color: '#fff', textTransform: 'none', transition: 'all 0.3s ease',
        height: '100%',
        '&:hover': {
            background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(30, 64, 175, 0.3)'
        }
    };

    const benefits = [
        { icon: <NoAdsIcon />, color: '#60a5fa', bg: 'rgba(59,130,246,0.12)', title: 'Keine Werbung', desc: 'Trainiere ungestört – komplett werbefrei auf allen Geräten.' },
        { icon: <ChartIcon />, color: '#a78bfa', bg: 'rgba(139,92,246,0.12)', title: 'Erweiterte Funktionen', desc: 'Exklusiver Zugang zum Gewichtstracker, 1RM Rechner und mehr.' },
        { icon: <ListIcon />, color: '#4ade80', bg: 'rgba(34,197,94,0.12)', title: 'Unbegrenzte Trainingspläne', desc: 'Erstelle so viele eigene Pläne und Übungen wie du möchtest.' },
        { icon: <DownloadIcon />, color: '#fb7185', bg: 'rgba(244,63,94,0.12)', title: 'Daten exportieren', desc: 'Exportiere deine Daten als PDF oder CSV.' },
        { icon: <BoltIcon />, color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', title: 'App-Vorabzug', desc: 'Vorabzugang zur kommenden fertigen App.' },
    ];

    return (
        <>
            <ThemeProvider theme={darkTheme}>
                <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 4 }}>
                    <NavBar />
                    <Container maxWidth="lg" sx={{ pt: { md: 4 }, mt: 2 }}>

                        {/* Header */}
                        <Card sx={{
                            mb: 2, borderRadius: "16px",
                            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                            border: "1px solid rgba(59, 130, 246, 0.25)"
                        }}>
                            <CardContent sx={{ p: { md: 2.5 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <CrownIcon sx={{ fontSize: 32, color: '#fbbf24' }} />
                                <Box>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                        Premium
                                    </Typography>
                                    <Typography variant="h6" sx={{ color: '#f1f5f9', fontWeight: 600, lineHeight: 1.2 }}>
                                        Upgrade dein Training
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Pricing Cards */}
                        <Grid container spacing={1.5} sx={{ mb: 2, display: 'flex', justifyContent: 'space-around' }}>
                            {[
                                { label: 'Monatlich', price: '1,99', sub: '€/mo', desc: 'Jederzeit kündbar', featured: false },
                                { label: 'Jährlich', price: '0,99', sub: '€/mo', desc: '11,88 € pro Jahr', featured: true },
                            ].map(plan => (
                                <Grid key={plan.label}>
                                    <Card sx={{
                                        borderRadius: '16px',
                                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                        border: plan.featured
                                            ? '2px solid rgba(59,130,246,0.6)'
                                            : '1px solid rgba(59,130,246,0.2)',
                                        cursor: 'pointer', position: 'relative', overflow: 'visible',
                                        transition: 'all 0.2s',
                                        '&:hover': { transform: 'translateY(-2px)', borderColor: 'rgba(59,130,246,0.5)' }
                                    }}>
                                        {plan.featured && (
                                            <Chip label="Beliebt" size="small" sx={{
                                                position: 'absolute', top: -10, right: 12,
                                                bgcolor: 'rgba(59,130,246,0.2)', color: '#93c5fd',
                                                fontWeight: 600, fontSize: '0.7rem', height: 20
                                            }} />
                                        )}
                                        <CardContent sx={{ p: { md: 2.5 } }}>
                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                {plan.label}
                                            </Typography>
                                            <Box display="flex" alignItems="baseline" gap={0.5} mt={0.5}>
                                                <Typography sx={{ fontSize: '1.8rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>
                                                    {plan.price}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#64748b' }}>{plan.sub}</Typography>
                                            </Box>
                                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                                                {plan.desc}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Benefits */}
                        <Card sx={{
                            mb: 2, borderRadius: "16px",
                            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                            border: "1px solid rgba(59, 130, 246, 0.2)"
                        }}>
                            <CardContent sx={{ p: { md: 3 } }}>
                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 2 }}>
                                    Vorteile im Überblick
                                </Typography>

                                {benefits.map((b, i) => (
                                    <Box key={i}>
                                        <Box display="flex" alignItems="flex-start" gap={1.5} py={1}>
                                            <Box sx={{
                                                width: 36, height: 36, borderRadius: '8px',
                                                bgcolor: b.bg, color: b.color,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0, '& svg': { fontSize: '1.1rem' }
                                            }}>
                                                {b.icon}
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#e2e8f0' }}>
                                                    {b.title}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#64748b', lineHeight: 1.5, display: 'block' }}>
                                                    {b.desc}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        {i < benefits.length - 1 && (
                                            <Divider sx={{ borderColor: 'rgba(59,130,246,0.1)' }} />
                                        )}
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>

                        {/* CTA */}
                        <Button onClick={() => alert("Bald verfügbar")} variant="contained" size="large" fullWidth sx={btnSx}>
                            Jetzt Premium sichern
                        </Button>

                    </Container>
                </Box>
            </ThemeProvider>
            <NavBarBot />
        </>
    );
};

export default PremiumAcc;