import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText, Container, Grid, Card, CardContent, CardActions, Box, Modal, TextField, Link, useMediaQuery, Avatar, Fade } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';
import '../../../index.css';

const getTheme = (mode) =>

    createTheme({
        palette: {
            mode,
            primary: {
                main: mode === 'dark' ? '#2997ff' : '#0071e3',
                contrastText: '#ffffff',
            },
            secondary: {
                main: mode === 'dark' ? '#1d1d1f' : '#f5f5f7',
            },
            text: {
                primary: mode === 'dark' ? '#f5f5f7' : '#1d1d1f',
                secondary: '#86868b',
            },
            background: {
                default: mode === 'dark' ? '#000000' : '#ffffff',
                paper: mode === 'dark' ? '#1d1d1f' : '#ffffff',
            },
        },
        typography: {
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            h1: { fontSize: { xs: '2.5rem', md: '5rem' }, fontWeight: 700, lineHeight: 1.08 },
            h2: { fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 700 },
            h5: { fontSize: { xs: '1.2rem', md: '1.5rem' }, fontWeight: 400, lineHeight: 1.4 },
            h6: { fontSize: '1.5rem', fontWeight: 600 },
            body1: { fontSize: '1rem', lineHeight: 1.5 },
            caption: { fontSize: '0.875rem', color: 'text.secondary' },
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: '980px',
                        textTransform: 'none',
                        padding: '12px 24px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                        },
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: '16px',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                        },
                    },
                },
            },
        },
    });

const StyledModalBox = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: '16px',
    padding: '48px',
    maxWidth: '480px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
    animation: 'modalFadeIn 0.3s ease',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    '@keyframes modalFadeIn': {
        from: { opacity: 0, transform: 'scale(0.95)' },
        to: { opacity: 1, transform: 'scale(1)' },
    },
    [theme.breakpoints.down('sm')]: {
        padding: '32px 24px',
    },
}));

const LandingPage = () => {

    const navigate = useNavigate();
    const [themeMode, setThemeMode] = useState(localStorage.getItem('theme') || 'light');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
    const isMobile = useMediaQuery('(max-width:768px)');

    const theme = getTheme(themeMode);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', themeMode);
        localStorage.setItem('theme', themeMode);
    }, [themeMode]);

    const handleThemeToggle = () => {
        setThemeMode(themeMode === 'light' ? 'dark' : 'light');
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLoginOpen = () => {
        setLoginOpen(true);
        setRegisterOpen(false);
    };

    const handleRegisterOpen = () => {
        setRegisterOpen(true);
        setLoginOpen(false);
    };

    const handleModalClose = () => {
        setLoginOpen(false);
        setRegisterOpen(false);
    };

    const navItems = [
        { label: 'Features', href: '#features' },
        { label: 'Funktionen', href: '#products' },
        { label: 'Support', href: '#footer' },
    ];

    const drawer = (
        <Box sx={{ p: 2, bgcolor: themeMode === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)' }}>
            <List>
                {navItems.map((item) => (
                    <ListItem button key={item.label} component="a" href={item.href} onClick={handleDrawerToggle}>
                        <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '1rem', fontWeight: 500 }} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
                {/* Skip Link */}
                <Link href="#main-content" sx={{ position: 'absolute', top: '-40px', left: 0, bgcolor: 'primary.main', color: 'primary.contrastText', p: 1, zIndex: 100, '&:focus': { top: 0 } }}>
                    Zum Hauptinhalt springen
                </Link>

                {/* Navigation */}
                <AppBar position="sticky" sx={{ bgcolor: themeMode === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                    <Toolbar sx={{ maxWidth: '980px', width: '100%', mx: 'auto', px: 2 }}>
                        <Typography variant="h6" component="a" href="#" sx={{ fontWeight: 600, color: 'text.primary', textDecoration: 'none', flexGrow: 1 }}>
                            GymTracker
                        </Typography>
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4 }}>
                            {navItems.map((item) => (
                                <Button key={item.label} href={item.href} sx={{ color: 'text.primary', fontSize: '0.875rem', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.05)' } }}>
                                    {item.label}
                                </Button>
                            ))}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton onClick={handleThemeToggle} sx={{ color: 'text.primary' }} aria-label="Dark/Light Mode umschalten">
                                <Brightness4Icon />
                            </IconButton>
                            <IconButton sx={{ display: { md: 'none' } }} onClick={handleDrawerToggle} aria-label="Menü öffnen">
                                <MenuIcon />
                            </IconButton>
                        </Box>
                    </Toolbar>
                </AppBar>
                <Drawer anchor="top" open={mobileOpen && isMobile} onClose={handleDrawerToggle} sx={{ '& .MuiDrawer-paper': { top: '64px', bgcolor: themeMode === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)' } }}>
                    {drawer}
                </Drawer>

                {/* Hero Section */}
                <Box className="hero" sx={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: { xs: 6, md: 10 }, position: 'relative', overflow: 'hidden' }}>
                    <Fade in timeout={1000}>
                        <Box sx={{ maxWidth: '680px', zIndex: 1 }}>
                            <Typography variant="h1" sx={{ color: '#ffffff', mb: 3, textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
                                Trainiere smarter, nicht härter
                            </Typography>
                            <Typography variant="h5" sx={{ color: 'rgba(255, 255, 255, 0.95)', mb: 5, px: { xs: 2, md: 0 } }}>
                                Verfolge deine Fortschritte, erreiche deine Ziele und werde Teil einer motivierten Community
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Button variant="contained" sx={{ bgcolor: '#ffffff', color: '#667eea', px: 4, py: 1.5 }} onClick={() => navigate("/login")}>
                                    Anmelden
                                </Button>
                                <Button variant="outlined" sx={{ borderColor: '#ffffff', color: '#ffffff', px: 4, py: 1.5, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)', borderColor: '#ffffff' } }} onClick={() => navigate("/register")}>
                                    Jetzt starten
                                </Button>
                            </Box>
                        </Box>
                    </Fade>
                </Box>

                {/* Main Content */}
                <Box component="main" id="main-content">
                    {/* Features Section */}
                    <Container sx={{ py: 12, maxWidth: '980px' }} id="features">
                        <Typography variant="h2" sx={{ textAlign: 'center', mb: 3 }}>
                            Alles was du brauchst
                        </Typography>
                        <Typography sx={{ textAlign: 'center', mb: 8, color: 'text.secondary' }}>
                            Leistungsstarke Tools für deinen Trainingserfolg
                        </Typography>
                        <Grid container spacing={5} sx={{ display: "flex", justifyContent: "center" }}>
                            {[
                                { icon: '📊', title: 'Fortschrittstracking', text: 'Verfolge deine Trainingseinheiten, Gewichte und Wiederholungen. Visualisiere deine Entwicklung mit detaillierten Statistiken.' },
                                { icon: '🏋️', title: 'Individuelle Pläne', text: 'Erstelle maßgeschneiderte Trainingspläne oder nutze bewährte Standard-Programme. Passe alles an deine Bedürfnisse an.' },
                                { icon: '👥', title: 'Community', text: 'Trainiere gemeinsam mit Freunden, teile Erfolge und motiviert euch gegenseitig. Gruppenfunktionen und Kalender inklusive.' },
                            ].map((feature, index) => (
                                <Grid key={index}>
                                    <Fade in timeout={600 + index * 200}>
                                        <Card className="feature-card" sx={{ textAlign: 'center', p: 4, bgcolor: 'background.paper' }}>
                                            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', mx: 'auto', mb: 3, fontSize: '2rem' }}>{feature.icon}</Avatar>
                                            <Typography variant="h6" sx={{ mb: 2 }}>{feature.title}</Typography>
                                            <Typography sx={{ color: 'text.secondary' }}>{feature.text}</Typography>
                                        </Card>
                                    </Fade>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>

                    {/* Products Section */}
                    <Box sx={{ py: 12, bgcolor: 'secondary.main', display: "flex", justifyContent: "center" }} id="products">
                        <Container sx={{ maxWidth: '980px' }}>
                            <Typography variant="h2" sx={{ textAlign: 'center', mb: 3 }}>
                                Entdecke die Funktionen
                            </Typography>
                            <Typography sx={{ textAlign: 'center', mb: 8, color: 'text.secondary' }}>
                                Alles was du für dein perfektes Training brauchst
                            </Typography>
                            <Grid container spacing={4} sx={{ display: "flex", justifyContent: "center" }}>
                                {[
                                    { icon: '💪', title: 'Training erfassen', text: 'Erfasse deine Trainings schnell und intuitiv. Mit Verlaufsfunktion siehst du deine letzten Werte direkt beim Eingeben.', href: '#' },
                                    { icon: '📈', title: 'Statistiken & Highscores', text: 'Behalte den Überblick über deine Bestleistungen. Vergleiche dich mit Freunden und feiere gemeinsam Erfolge.', href: '#' },
                                    { icon: '📅', title: 'Gruppenkalender', text: 'Plane deine Gym-Besuche und sieh wann deine Trainingspartner trainieren. Perfekt für gemeinsame Sessions.', href: '#' },
                                ].map((product, index) => (
                                    <Grid key={index}>
                                        <Fade in timeout={600 + index * 200}>
                                            <Card>
                                                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', bgcolor: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                                                    {product.icon}
                                                </Box>
                                                <CardContent sx={{ p: 4 }}>
                                                    <Typography variant="h6" sx={{ mb: 1.5 }}>{product.title}</Typography>
                                                    <Typography sx={{ color: 'text.secondary', mb: 2 }}>{product.text}</Typography>
                                                </CardContent>
                                            </Card>
                                        </Fade>
                                    </Grid>
                                ))}
                            </Grid>
                        </Container>
                    </Box>
                </Box>

                {/* Footer */}
                {/* Footer */}
                <Box component="footer" sx={{ py: 6, bgcolor: 'secondary.main', borderTop: '1px solid', borderColor: 'divider' }} id="footer">
                    <Container sx={{ maxWidth: '980px' }}>
                        <Box sx={{ textAlign: 'center', color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.6 }}>
                            <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                                © 2025 GymTracker. Made with 💪 for fitness enthusiasts.
                            </Typography>

                            <Typography variant="body2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                                Impressum
                            </Typography>
                            <Typography>
                                Philipp Feld<br />
                                Mainstraße 7<br />
                                49809 Lingen<br />
                                Deutschland<br />
                                E-Mail: gympwa@gmail.com<br />
                            </Typography>

                            {/* <Typography variant="body2" sx={{ fontWeight: 600, mt: 2 }}>
                                Datenschutz
                            </Typography>
                            <Typography>
                                Wir erheben keine personenbezogenen Daten in dieser Testversion. In einer echten Version werden hier alle Informationen zur Datenverarbeitung stehen.
                            </Typography>

                            <Typography variant="body2" sx={{ fontWeight: 600, mt: 2 }}>
                                AGB
                            </Typography> */}
                            <Typography>
                                Diese Test-PWA steht kostenlos zur Verfügung. Nutzung auf eigene Verantwortung. Haftung wird ausgeschlossen.
                            </Typography>
                        </Box>
                    </Container>
                </Box>


                {/* Login Modal */}
                <Modal open={loginOpen} onClose={handleModalClose} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)' }}>
                    <StyledModalBox>
                        <IconButton sx={{ position: 'absolute', top: 16, right: 16, color: 'text.secondary', '&:hover': { color: 'text.primary' } }} onClick={handleModalClose} aria-label="Schließen">
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h2" sx={{ mb: 4 }}>Anmelden</Typography>
                        <Box component="form" sx={{ mb: 3 }} onSubmit={(e) => e.preventDefault()}>
                            <TextField fullWidth label="E-Mail" type="email" required autoComplete="email" variant="outlined" sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '16px' } }} />
                            <TextField fullWidth label="Passwort" type="password" required autoComplete="current-password" variant="outlined" sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '16px' } }} />
                            <Button type="submit" variant="contained" sx={{ width: '100%', bgcolor: 'primary.main', py: 2 }}>
                                Anmelden
                            </Button>
                        </Box>
                        <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>
                            Noch kein Account?{' '}
                            <Link href="#" onClick={handleRegisterOpen} sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                Jetzt registrieren
                            </Link>
                        </Typography>
                    </StyledModalBox>
                </Modal>

                {/* Register Modal */}
                <Modal open={registerOpen} onClose={handleModalClose} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)' }}>
                    <StyledModalBox>
                        <IconButton sx={{ position: 'absolute', top: 16, right: 16, color: 'text.secondary', '&:hover': { color: 'text.primary' } }} onClick={handleModalClose} aria-label="Schließen">
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h2" sx={{ mb: 4 }}>Registrieren</Typography>
                        <Box component="form" sx={{ mb: 3 }} onSubmit={(e) => e.preventDefault()}>
                            <TextField fullWidth label="Name" type="text" required autoComplete="name" variant="outlined" sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '16px' } }} />
                            <TextField fullWidth label="E-Mail" type="email" required autoComplete="email" variant="outlined" sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '16px' } }} />
                            <TextField fullWidth label="Passwort" type="password" required autoComplete="new-password" variant="outlined" sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '16px' } }} />
                            <Button type="submit" variant="contained" sx={{ width: '100%', bgcolor: 'primary.main', py: 2 }}>
                                Account erstellen
                            </Button>
                        </Box>
                        <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>
                            Bereits registriert?{' '}
                            <Link href="#" onClick={handleLoginOpen} sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                Zum Login
                            </Link>
                        </Typography>
                    </StyledModalBox>
                </Modal>
            </Box>
        </ThemeProvider>
    );
};

export default LandingPage;