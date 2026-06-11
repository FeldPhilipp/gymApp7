import NavBar from "../../layout/NavBar";
import NavBarBot from "../../layout/NavBarBot";
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

const PremiumAcc = () => {

    // Der edle, dunkle Premium-Button mit langsam gold funkelndem Text
    const btnSx = {
        padding: { xs: '12px 24px', sm: '14px 28px' },
        fontSize: { sm: '1rem' },
        fontWeight: 700, 
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        textTransform: 'none', 
        transition: 'all 0.4s ease-in-out',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        
        '& .MuiTypography-root, &': {
            background: 'linear-gradient(90deg, #bf953f, #fffdd0, #b38728, #fffdd0, #bf953f)',
            backgroundSize: '400% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'goldShine 20s linear infinite',
        },

        '@keyframes goldShine': {
            '0%': { backgroundPosition: '0% 50%' },
            '100%': { backgroundPosition: '400% 50%' },
        },

        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(212, 175, 55, 0.15)',
            borderColor: 'rgba(212, 175, 55, 0.6)',
            background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        }
    };

    // Die Icons erstrahlen nun passend in sanften Goldtönen
    const benefits = [
        { icon: <NoAdsIcon />, color: '#dfb76c', bg: 'rgba(212, 175, 55, 0.08)', title: 'Keine Werbung', desc: 'Trainiere ungestört – komplett werbefrei auf allen Geräten.' },
        { icon: <ChartIcon />, color: '#dfb76c', bg: 'rgba(212, 175, 55, 0.08)', title: 'Erweiterte Funktionen', desc: 'Exklusiver Zugang zum Gewichtstracker, 1RM Rechner und mehr.' },
        { icon: <ListIcon />, color: '#dfb76c', bg: 'rgba(212, 175, 55, 0.08)', title: 'Unbegrenzte Trainingspläne', desc: 'Erstelle so viele eigene Pläne und Übungen wie du möchtest.' },
        { icon: <DownloadIcon />, color: '#dfb76c', bg: 'rgba(212, 175, 55, 0.08)', title: 'Daten exportieren', desc: 'Exportiere deine Daten als PDF oder CSV.' },
        { icon: <BoltIcon />, color: '#dfb76c', bg: 'rgba(212, 175, 55, 0.08)', title: 'App-Vorabzug', desc: 'Vorabzugang zur kommenden fertigen App.' },
    ];

    return (
        <>
            <ThemeProvider theme={darkTheme}>
                <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 4 }}>
                    <NavBar />
                    <Container maxWidth="lg" sx={{ pt: { md: 4 }, mt: 2 }}>

                        {/* Header Card mit Gold-Rand */}
                        <Card sx={{
                            mb: 3, borderRadius: "16px",
                            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                            border: "1px solid rgba(212, 175, 55, 0.25)"
                        }}>
                            <CardContent sx={{ p: { md: 2.5 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <CrownIcon sx={{ fontSize: 32, color: '#d4af37' }} />
                                <Box>
                                    <Typography variant="caption" sx={{ color: '#b38728', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                        Premium
                                    </Typography>
                                    <Typography variant="h6" sx={{ color: '#f1f5f9', fontWeight: 600, lineHeight: 1.2 }}>
                                        Upgrade dein Training
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Pricing Cards */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            {[
                                { label: 'Monatlich', price: '1,99', sub: '€/mo', desc: 'Jederzeit kündbar', featured: false },
                                { label: 'Jährlich', price: '0,99', sub: '€/mo', desc: '11,88 € pro Jahr', featured: true },
                            ].map(plan => (
                                <Grid key={plan.label} size={{ xs: 12, sm: 6 }}>
                                    <Card sx={{
                                        height: '100%',
                                        borderRadius: '16px',
                                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                        // Der "Beliebt"-Plan sticht nun mit einem goldenen Rand heraus
                                        border: plan.featured
                                            ? '2px solid rgba(212, 175, 55, 0.5)'
                                            : '1px solid rgba(212, 175, 55, 0.15)',
                                        cursor: 'pointer', position: 'relative', overflow: 'visible',
                                        transition: 'all 0.3s ease',
                                        boxShadow: plan.featured ? '0 4px 20px rgba(212, 175, 55, 0.05)' : 'none',
                                        '&:hover': { 
                                            transform: 'translateY(-2px)', 
                                            borderColor: 'rgba(212, 175, 55, 0.6)',
                                            boxShadow: '0 6px 24px rgba(212, 175, 55, 0.12)'
                                        }
                                    }}>
                                        {plan.featured && (
                                            <Chip label="Beliebt" size="small" sx={{
                                                position: 'absolute', top: -10, right: 12,
                                                bgcolor: '#b38728', color: '#fff',
                                                fontWeight: 700, fontSize: '0.7rem', height: 20
                                            }} />
                                        )}
                                        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                                            <Typography variant="caption" sx={{ color: plan.featured ? '#d4af37' : '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                {plan.label}
                                            </Typography>
                                            <Box display="flex" alignItems="baseline" gap={0.5} mt={0.5}>
                                                <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>
                                                    {plan.price}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#64748b' }}>{plan.sub}</Typography>
                                            </Box>
                                            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.5 }}>
                                                {plan.desc}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Benefits Liste */}
                        <Card sx={{
                            mb: 3, borderRadius: "16px",
                            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                            border: "1px solid rgba(212, 175, 55, 0.15)"
                        }}>
                            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                                <Typography variant="caption" sx={{ color: '#b38728', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 2 }}>
                                    Vorteile im Überblick
                                </Typography>

                                {benefits.map((b, i) => (
                                    <Box key={i}>
                                        <Box display="flex" alignItems="flex-start" gap={1.5} py={1.5}>
                                            <Box sx={{
                                                width: 38, height: 38, borderRadius: '10px',
                                                bgcolor: b.bg, color: b.color,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0, '& svg': { fontSize: '1.2rem' }
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
                                            <Divider sx={{ borderColor: 'rgba(212, 175, 55, 0.08)' }} />
                                        )}
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Großer CTA Button */}
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