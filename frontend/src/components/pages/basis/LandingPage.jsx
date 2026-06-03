import React, { useEffect, useMemo, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
    AppBar,
    Box,
    Button,
    Container,
    Drawer,
    IconButton,
    Link,
    List,
    ListItemButton,
    ListItemText,
    Stack,
    Typography,
    useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from 'react-router-dom';

const colors = {
    blue: '#3b82f6',
    blueDark: '#1e3a8a',
    blueLight: '#93c5fd',
    green: '#34d399',
    dark: '#0f172a',
    panel: '#1e293b',
    textLight: '#e0f2fe',
    mutedLight: '#93c5fd',
    line: 'rgba(59, 130, 246, 0.2)',
};

const pagePadding = {
    px: { xs: 2, sm: 3, md: 5, lg: 7 },
};

const getTheme = () =>
    createTheme({
        palette: {
            mode: 'dark',
            primary: {
                main: colors.blue,
                dark: colors.blueDark,
                light: colors.blueLight,
                contrastText: '#ffffff',
            },
            secondary: {
                main: colors.green,
                contrastText: '#ffffff',
            },
            background: {
                default: colors.dark,
                paper: colors.panel,
            },
            text: {
                primary: colors.textLight,
                secondary: colors.mutedLight,
            },
        },
        typography: {
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            h1: {
                fontWeight: 700,
                lineHeight: 1.02,
                letterSpacing: 0,
                fontSize: '3rem',
                '@media (min-width:600px)': {
                    fontSize: '4.7rem',
                },
                '@media (min-width:1200px)': {
                    fontSize: '6.2rem',
                },
            },
            h2: {
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: 0,
                fontSize: '2.1rem',
                '@media (min-width:900px)': {
                    fontSize: '3.25rem',
                },
            },
            button: {
                textTransform: 'none',
                fontWeight: 600,
            },
        },
        shape: {
            borderRadius: 18,
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        minHeight: 44,
                        borderRadius: 999,
                        boxShadow: 'none',
                    },
                    contained: {
                        background: colors.blue,
                        '&:hover': {
                            background: '#2563eb',
                            boxShadow: 'none',
                        },
                    },
                },
            },
        },
    });

const navItems = [
    { label: 'Training', href: '#training' },
    { label: 'Fortschritt', href: '#fortschritt' },
    { label: 'Gruppen', href: '#gruppen' },
];

const features = [
    {
        id: 'training',
        icon: <FitnessCenterIcon />,
        title: 'Training erfassen',
        text: 'Sätze, Wiederholungen und Gewicht schnell dokumentieren.',
        tone: colors.blue,
    },
    {
        id: 'fortschritt',
        icon: <QueryStatsIcon />,
        title: 'Fortschritt sehen',
        text: 'Historie, Bestwerte und Gewichtsentwicklung auf einen Blick.',
        tone: colors.green,
    },
    {
        id: 'gruppen',
        icon: <GroupsIcon />,
        title: 'Gemeinsam trainieren',
        text: 'Gruppen, Kalender und Kommentare für gemeinsame Sessions.',
        tone: '#8b5cf6',
    },
    {
        id: 'motivation',
        icon: <EmojiEventsIcon />,
        title: 'Motivation behalten',
        text: 'Highscores und Ziele halten den nächsten Satz sichtbar.',
        tone: '#fbbf24',
    },
];

const screenRows = [
    { name: 'Bankdrücken', value: '82,5 kg', trend: '+5,0 kg' },
    { name: 'Kniebeuge', value: '105 kg', trend: '+7,5 kg' },
    { name: 'Rudern', value: '68 kg', trend: '+2,5 kg' },
];

const LinkButton = ({ children, onClick, href }) => (
    <Button
        href={href}
        onClick={onClick}
        endIcon={<ArrowForwardIosIcon sx={{ fontSize: '0.8rem !important' }} />}
        sx={{
            color: 'primary.main',
            px: 0.5,
            py: 0.5,
            minHeight: 34,
            fontSize: '1.05rem',
            '&:hover': {
                bgcolor: 'transparent',
                textDecoration: 'underline',
            },
        }}
    >
        {children}
    </Button>
);

const DeviceShowcase = () => (
    <Box
        sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 920,
            mx: 'auto',
            mt: { xs: 4, md: 6 },
            minHeight: { xs: 360, sm: 430, md: 520 },
        }}
    >
        <Box
            sx={{
                position: 'absolute',
                left: '50%',
                top: { xs: 12, md: 0 },
                transform: 'translateX(-50%)',
                width: { xs: 270, sm: 320, md: 380 },
                borderRadius: '42px',
                p: 1.2,
                bgcolor: '#020617',
                boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                zIndex: 2,
            }}
        >
            <Box
                sx={{
                    borderRadius: '34px',
                    overflow: 'hidden',
                    bgcolor: colors.dark,
                    color: colors.textLight,
                    p: { xs: 2, md: 2.4 },
                }}
            >
                <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                            <Typography sx={{ color: colors.blueLight, fontSize: '0.74rem', fontWeight: 700 }}>
                                HEUTE
                            </Typography>
                            <Typography sx={{ fontWeight: 800, fontSize: '1.35rem' }}>Push Training</Typography>
                        </Box>
                        <Box
                            sx={{
                                px: 1.2,
                                py: 0.6,
                                borderRadius: 999,
                                bgcolor: 'rgba(52, 211, 153, 0.16)',
                                color: colors.green,
                                fontWeight: 800,
                                fontSize: '0.82rem',
                            }}
                        >
                            72%
                        </Box>
                    </Stack>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                        {[
                            ['5', 'Übungen'],
                            ['18', 'Sätze'],
                            ['48', 'Min'],
                        ].map(([value, label]) => (
                            <Box key={label} sx={{ p: 1.2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.07)' }}>
                                <Typography sx={{ fontWeight: 900, fontSize: '1.2rem' }}>{value}</Typography>
                                <Typography sx={{ color: colors.blueLight, fontSize: '0.72rem' }}>{label}</Typography>
                            </Box>
                        ))}
                    </Box>

                    <Stack spacing={1}>
                        {screenRows.map((row) => (
                            <Stack
                                key={row.name}
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                sx={{
                                    p: 1.2,
                                    borderRadius: 2,
                                    bgcolor: 'rgba(255,255,255,0.07)',
                                }}
                            >
                                <Box>
                                    <Typography sx={{ fontWeight: 800, fontSize: '0.92rem' }}>{row.name}</Typography>
                                    <Typography sx={{ color: colors.blueLight, fontSize: '0.74rem' }}>Bestwert</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography sx={{ fontWeight: 900, fontSize: '0.92rem' }}>{row.value}</Typography>
                                    <Typography sx={{ color: colors.green, fontSize: '0.74rem', fontWeight: 800 }}>{row.trend}</Typography>
                                </Box>
                            </Stack>
                        ))}
                    </Stack>
                </Stack>
            </Box>
        </Box>

        <Box
            sx={{
                position: 'absolute',
                left: { xs: '50%', md: 0 },
                right: { md: 0 },
                bottom: { xs: 0, md: 10 },
                transform: { xs: 'translateX(-50%)', md: 'none' },
                width: { xs: 330, sm: 470, md: '100%' },
                height: { xs: 190, sm: 230, md: 285 },
                borderRadius: { xs: 4, md: 5 },
                bgcolor: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid',
                borderColor: colors.line,
                zIndex: 1,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                gap: 1,
                p: { xs: 1.4, md: 2 },
            }}
        >
            {features.map((feature) => (
                <Box
                    key={feature.title}
                    sx={{
                        borderRadius: 3,
                        bgcolor: 'rgba(15, 23, 42, 0.72)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: feature.tone,
                    }}
                >
                    {feature.icon}
                </Box>
            ))}
        </Box>
    </Box>
);

const LandingPage = () => {
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width:768px)');
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useMemo(() => getTheme(), []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }, []);

    const goToLogin = () => navigate('/login');
    const toggleDrawer = () => setMobileOpen((current) => !current);

    const drawer = (
        <Box
            sx={{
                p: 2,
                bgcolor: 'rgba(15, 23, 42, 0.98)',
                borderBottom: '1px solid',
                borderColor: colors.line,
            }}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography sx={{ fontWeight: 800 }}>GymTracker</Typography>
                <IconButton onClick={toggleDrawer} aria-label="Menü schließen">
                    <CloseIcon />
                </IconButton>
            </Stack>
            <List>
                {navItems.map((item) => (
                    <ListItemButton key={item.label} component="a" href={item.href} onClick={toggleDrawer}>
                        <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 700 }} />
                    </ListItemButton>
                ))}
                <ListItemButton onClick={goToLogin}>
                    <ListItemText primary="Anmelden" primaryTypographyProps={{ fontWeight: 700 }} />
                </ListItemButton>
            </List>
        </Box>
    );

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    minHeight: '100vh',
                    bgcolor: colors.dark,
                    color: 'text.primary',
                    overflowX: 'hidden',
                }}
            >
                <Link
                    href="#main-content"
                    sx={{
                        position: 'absolute',
                        top: '-44px',
                        left: 12,
                        zIndex: 2000,
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        color: '#fff',
                        bgcolor: 'primary.main',
                        '&:focus': { top: 12 },
                    }}
                >
                    Zum Hauptinhalt springen
                </Link>

                <AppBar
                    position="sticky"
                    elevation={0}
                    sx={{
                        bgcolor: 'rgba(15, 23, 42, 0.86)',
                        backdropFilter: 'blur(18px)',
                        borderBottom: '1px solid',
                        borderColor: colors.line,
                    }}
                >
                    <Container maxWidth={false} sx={pagePadding}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ minHeight: 52 }}>
                            <Stack
                                component="a"
                                href="#"
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                sx={{ color: 'text.primary', textDecoration: 'none', mr: 'auto' }}
                            >
                                <FitnessCenterIcon sx={{ color: 'primary.main', fontSize: 23 }} />
                                <Typography sx={{ fontWeight: 700, fontSize: '0.98rem' }}>GymTracker</Typography>
                            </Stack>

                            <Stack direction="row" spacing={1.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
                                {navItems.map((item) => (
                                    <Button key={item.label} href={item.href} color="inherit" sx={{ minHeight: 32, px: 0.5 }}>
                                        {item.label}
                                    </Button>
                                ))}
                            </Stack>

                            <Button
                                variant="contained"
                                onClick={goToLogin}
                                sx={{ display: { xs: 'none', sm: 'inline-flex' }, minHeight: 34, px: 2.2 }}
                            >
                                Anmelden
                            </Button>
                            <IconButton
                                sx={{ display: { md: 'none' } }}
                                onClick={toggleDrawer}
                                color="inherit"
                                aria-label="Menü öffnen"
                                size="small"
                            >
                                <MenuIcon />
                            </IconButton>
                        </Stack>
                    </Container>
                </AppBar>

                <Drawer
                    anchor="top"
                    open={mobileOpen && isMobile}
                    onClose={toggleDrawer}
                    sx={{ '& .MuiDrawer-paper': { bgcolor: 'transparent' } }}
                >
                    {drawer}
                </Drawer>

                <Box component="main" id="main-content">
                    <Box
                        component="section"
                        sx={{
                            pt: { xs: 5, md: 7 },
                            pb: { xs: 7, md: 9 },
                            textAlign: 'center',
                            bgcolor: colors.dark,
                        }}
                    >
                        <Container maxWidth={false} sx={pagePadding}>
                            <Typography variant="h1" component="h1">
                                GymTracker
                            </Typography>
                            <Typography
                                sx={{
                                    mt: 1.5,
                                    color: 'text.secondary',
                                    fontSize: { xs: '1.28rem', md: '1.65rem' },
                                    fontWeight: 500,
                                }}
                            >
                                Training. Fortschritt. Gruppen.
                            </Typography>
                            <Stack direction="row" spacing={2.5} justifyContent="center" sx={{ mt: 2 }}>
                                <LinkButton onClick={goToLogin}>Anmelden</LinkButton>
                                <LinkButton href="#features">Funktionen</LinkButton>
                            </Stack>
                            <DeviceShowcase />
                        </Container>
                    </Box>

                    <Box id="features" component="section" sx={{ bgcolor: '#020617', py: { xs: 2, md: 3 } }}>
                        <Container maxWidth={false} sx={pagePadding}>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                                    gap: { xs: 2, md: 3 },
                                }}
                            >
                                {features.map((feature, index) => (
                                    <Box
                                        id={feature.id}
                                        key={feature.title}
                                        sx={{
                                            minHeight: { xs: 360, md: 500 },
                                            borderRadius: 0,
                                            p: { xs: 3, md: 5 },
                                            textAlign: 'center',
                                            bgcolor: colors.panel,
                                            color: 'text.primary',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                borderRadius: 999,
                                                display: 'grid',
                                                placeItems: 'center',
                                                color: '#fff',
                                                bgcolor: feature.tone,
                                                mb: 2,
                                            }}
                                        >
                                            {feature.icon}
                                        </Box>
                                        <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
                                            {feature.title}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                mt: 1.5,
                                                maxWidth: 430,
                                                color: 'text.secondary',
                                                fontSize: { xs: '1rem', md: '1.12rem' },
                                                lineHeight: 1.6,
                                            }}
                                        >
                                            {feature.text}
                                        </Typography>
                                        {index === 0 && (
                                            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                                                <LinkButton onClick={goToLogin}>Jetzt anmelden</LinkButton>
                                            </Stack>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        </Container>
                    </Box>

                    <Box
                        component="section"
                        sx={{
                            bgcolor: colors.dark,
                            textAlign: 'center',
                            py: { xs: 7, md: 10 },
                        }}
                    >
                        <Container maxWidth="md">
                            <Typography variant="h2">Bereit für dein nächstes Training?</Typography>
                            <Typography sx={{ mt: 1.5, color: 'text.secondary', fontSize: '1.1rem', lineHeight: 1.6 }}>
                                Melde dich an und starte direkt in der App.
                            </Typography>
                            <Stack direction="row" spacing={2.5} justifyContent="center" sx={{ mt: 2 }}>
                                <LinkButton onClick={goToLogin}>Zur Anmeldung</LinkButton>
                            </Stack>
                        </Container>
                    </Box>
                </Box>

                <Box
                    component="footer"
                    sx={{
                        py: 3,
                        bgcolor: '#020617',
                        color: 'text.secondary',
                    }}
                >
                    <Container maxWidth={false} sx={pagePadding}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ sm: 'center' }}>
                            <Typography sx={{ fontSize: '0.85rem' }}>GymTracker</Typography>
                            <Typography sx={{ fontSize: '0.85rem' }}>Philipp Feld · gympwa@gmail.com</Typography>
                        </Stack>
                    </Container>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default LandingPage;
