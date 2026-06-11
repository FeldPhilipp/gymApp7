import {
    AppBar, Toolbar, Typography, Button, Container, Box,
    IconButton, Drawer, List, ListItem, ListItemButton,
    ListItemText, ListItemIcon, useMediaQuery, ThemeProvider,
    Chip, Tooltip,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import LockIcon from '@mui/icons-material/Lock';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ScaleIcon from '@mui/icons-material/Scale';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import { darkTheme } from '../../theme/darkTheme';
import { PremiumApi } from '../../services/api';
import PremiumModal from '../util/Dialogs/PremiumModal';
import { useAuth } from '../context/AuthContext';

// ─── Nav-Einträge ────────────────────────────────────────────────────────────
// premiumRequired: true  →  gesperrt für Nicht-Premium-Nutzer
const NAV_ITEMS = [
    { label: 'Home', path: '/home', premiumRequired: false, icon: <HomeIcon /> },
    { label: 'Training', path: '/training', premiumRequired: false, icon: <FitnessCenterIcon /> },
    { label: 'Ernährung', path: '/ernaehrung', premiumRequired: true, icon: <RestaurantIcon /> },
    { label: 'Gewicht', path: '/gewicht', premiumRequired: true, icon: <ScaleIcon /> },
    { label: 'Statistiken', path: '/statistiken', premiumRequired: true, icon: <BarChartIcon /> },
    { label: 'Fortschritt', path: '/fortschritt', premiumRequired: true, icon: <TrendingUpIcon /> },
];

export default function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useMediaQuery(darkTheme.breakpoints.down('md'));

    const title = process.env.REACT_APP_TITLE;
    const version = process.env.REACT_APP_VERSION;

    const { nutzer } = useAuth();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [premiumModalOpen, setPremiumModalOpen] = useState(false);
    const [isPremium, setIsPremium] = useState(false);

    // Premium-Status beim Mount laden
    useEffect(() => {
        if (!nutzer?.id) return;
        PremiumApi.getStatus(nutzer.id)
            .then(res => setIsPremium(res.data?.is_premium === true))
            .catch(() => setIsPremium(false));
    }, [nutzer?.id]);

    // Nach erfolgreicher Zahlung: Status neu laden & Modal schließen
    const handlePremiumActivated = () => {
        setIsPremium(true);
        setPremiumModalOpen(false);
    };

    // Klick auf einen Nav-Eintrag
    const handleNavClick = (item) => {
        setDrawerOpen(false);
        if (item.premiumRequired && !isPremium) {
            setPremiumModalOpen(true);
        } else {
            navigate(item.path);
        }
    };

    // ── Desktop Nav-Link ────────────────────────────────────────────────────
    const NavLink = ({ item }) => {
        const isActive = location.pathname === item.path;
        const isLocked = item.premiumRequired && !isPremium;

        return (
            <Tooltip
                title={isLocked ? 'Nur für Premium-Nutzer – jetzt freischalten' : ''}
                placement="bottom"
                arrow
            >
                <Button
                    onClick={() => handleNavClick(item)}
                    color="inherit"
                    startIcon={isLocked ? <LockIcon sx={{ fontSize: '14px !important', opacity: 0.5 }} /> : null}
                    sx={{
                        fontWeight: isActive ? 700 : 600,
                        color: isLocked
                            ? 'text.disabled'
                            : isActive
                                ? 'primary.main'
                                : 'inherit',
                        textTransform: 'none',
                        '&:hover': {
                            bgcolor: isLocked
                                ? 'rgba(59, 130, 246, 0.05)'
                                : 'rgba(59, 130, 246, 0.1)',
                        },
                    }}
                >
                    {item.label}
                </Button>
            </Tooltip>
        );
    };

    // ── Drawer-ListItem ─────────────────────────────────────────────────────
    const DrawerItem = ({ item }) => {
        const isLocked = item.premiumRequired && !isPremium;
        const isActive = location.pathname === item.path;

        return (
            <ListItem disablePadding>
                <ListItemButton
                    onClick={() => handleNavClick(item)}
                    sx={{
                        opacity: isLocked ? 0.5 : 1,
                        bgcolor: isActive ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                        borderLeft: isActive ? '3px solid' : '3px solid transparent',
                        borderColor: isActive ? 'primary.main' : 'transparent',
                    }}
                >
                    {isLocked && (
                        <ListItemIcon sx={{ minWidth: 32 }}>
                            <LockIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                        </ListItemIcon>
                    )}
                    {!isLocked && item.icon && (
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            {item.icon}
                        </ListItemIcon>
                    )}
                    <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                            fontSize: 15,
                            color: isActive ? 'primary.main' : 'text.primary',
                        }}
                    />
                    {isLocked && (
                        <Chip
                            label="PRO"
                            size="small"
                            sx={{
                                height: 18,
                                fontSize: 10,
                                bgcolor: 'rgba(59, 130, 246, 0.12)',
                                color: 'primary.main',
                                border: '1px solid',
                                borderColor: 'primary.main',
                            }}
                        />
                    )}
                </ListItemButton>
            </ListItem>
        );
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
            >
                <Container maxWidth="lg">
                    <Toolbar
                        disableGutters
                        sx={{
                            minHeight: { xs: 56, md: 64 },
                            display: 'flex',
                            justifyContent: isMobile ? 'space-between' : 'center',
                        }}
                    >
                        {/* Logo */}
                        <Typography
                            variant="h6"
                            sx={{
                                flexGrow: 1,
                                fontWeight: 700,
                                fontSize: { xs: '1.2rem', md: '1.5rem' },
                                cursor: 'pointer',
                                background: 'linear-gradient(45deg, #3b82f6 30%, #8b5cf6 90%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                            onClick={() => navigate('/home')}
                        >
                            {title}
                        </Typography>

                        {/* Desktop Navigation */}
                        {!isMobile && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {NAV_ITEMS.map(item => (
                                    <NavLink key={item.path} item={item} />
                                ))}

                                {/* Premium Badge oder Upgrade-Button */}
                                {isPremium ? (
                                    <Chip
                                        icon={<WorkspacePremiumIcon sx={{ fontSize: '16px !important', color: 'primary.main !important' }} />}
                                        label="Premium"
                                        size="small"
                                        sx={{
                                            ml: 1,
                                            bgcolor: 'rgba(59, 130, 246, 0.12)',
                                            border: '1px solid',
                                            borderColor: 'primary.main',
                                            color: 'primary.main',
                                            fontWeight: 600,
                                            fontSize: 12,
                                        }}
                                    />
                                ) : (
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<WorkspacePremiumIcon sx={{ fontSize: '16px !important' }} />}
                                        onClick={() => setPremiumModalOpen(true)}
                                        sx={{
                                            ml: 1,
                                            borderRadius: 2,
                                            fontWeight: 700,
                                            fontSize: 13,
                                            px: 2,
                                            textTransform: 'none',
                                        }}
                                    >
                                        Premium
                                    </Button>
                                )}
                            </Box>
                        )}

                        {/* Mobile: Version-Anzeige */}
                        {isMobile && (
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                                    background: 'linear-gradient(45deg, #3b82f6 30%, #8b5cf6 90%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                {version}
                            </Typography>
                        )}

                        {/* Mobile: Hamburger */}
                        {isMobile && (
                            <IconButton
                                onClick={() => setDrawerOpen(true)}
                                color="inherit"
                                sx={{ ml: 1 }}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: { bgcolor: 'background.default', width: 280 },
                }}
            >
                <Box sx={{ width: 280, bgcolor: 'background.paper', height: '100%' }}>
                    {/* Drawer Header */}
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                                background: 'linear-gradient(45deg, #3b82f6 30%, #8b5cf6 90%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            {title}
                        </Typography>
                        <IconButton onClick={() => setDrawerOpen(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <List>
                        {NAV_ITEMS.map(item => (
                            <DrawerItem key={item.path} item={item} />
                        ))}
                    </List>

                    {/* Upgrade-Button im Drawer */}
                    {!isPremium && (
                        <Box sx={{ p: 2, mt: 'auto' }}>
                            <Button
                                variant="contained"
                                fullWidth
                                startIcon={<WorkspacePremiumIcon />}
                                onClick={() => { setDrawerOpen(false); setPremiumModalOpen(true); }}
                                sx={{
                                    borderRadius: 2,
                                    fontWeight: 700,
                                    textTransform: 'none',
                                }}
                            >
                                Jetzt Premium werden
                            </Button>
                        </Box>
                    )}
                </Box>
            </Drawer>

            {/* Premium Modal */}
            <PremiumModal
                open={premiumModalOpen}
                onClose={() => setPremiumModalOpen(false)}
                nutzerId={nutzer?.id}
                onPremiumActivated={handlePremiumActivated}
            />
        </ThemeProvider>
    );
}