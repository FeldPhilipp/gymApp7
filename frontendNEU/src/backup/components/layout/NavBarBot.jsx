import { ThemeProvider, Box, IconButton, useMediaQuery } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { useDrawer } from '../context/DrawerContext';
import { darkTheme } from "../../theme/darkTheme";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const NavBarBot = ({ mainBtnF, mainBtnTxt, mainBtnDisabled, sideBtn1Icon, sideBtn1F, sideBtn2Icon, sideBtn2F, sideBtn3Icon, sideBtn3F }) => {

    const navigate = useNavigate();
    const isMobile = useMediaQuery(darkTheme.breakpoints.down('md'));
    const { setDrawerOpen } = useDrawer();
    const isHome = window.location.pathname === '/dashboard';

    if (!isMobile) {
        return null;
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <Box sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: "64px",
                bgcolor: 'background.paper',
                borderTop: '1px solid',
                borderColor: 'divider',
                minHeight: '64px',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                px: 2,
                py: 1,
                zIndex: 1000,
            }}>
                {!isHome  && !sideBtn1F ? (
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{
                            color: 'text.primary',
                            borderRadius: '16px',
                            p: 1.5,
                            '&:hover': {
                                bgcolor: 'rgba(59, 130, 246, 0.1)',
                            },
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                ) : (
                    <IconButton
                        onClick={sideBtn1F}
                        disabled={!sideBtn1F}
                        sx={{
                            color: 'text.primary',
                            borderRadius: '16px',
                            p: 1.5,
                            '&:hover': {
                                bgcolor: 'rgba(59, 130, 246, 0.1)',
                            },
                            '&:disabled': {
                                opacity: 0.3,
                            },
                        }}
                    >
                        {sideBtn1Icon || <Box sx={{ width: 24, height: 24 }} />}
                    </IconButton>
                )}

                <IconButton
                    disabled={!sideBtn2Icon || !sideBtn2F}
                    onClick={sideBtn2F}
                    sx={{
                        color: 'text.primary',
                        borderRadius: '16px',
                        p: 1.5,
                        '&:hover': {
                            bgcolor: 'rgba(59, 130, 246, 0.1)',
                        },
                        '&:disabled': {
                            opacity: 0.3,
                        },
                    }}
                >
                    {sideBtn2Icon || <Box sx={{ width: 24, height: 24 }} />}
                </IconButton>

                {mainBtnF && mainBtnTxt ? (
                    <IconButton
                        onClick={mainBtnF}
                        disabled={mainBtnDisabled}
                        sx={{
                            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
                            color: 'white',
                            borderRadius: '50%',
                            width: '70px',
                            height: '70px',
                            top: '-10px',
                            boxShadow: '0 4px 12px rgba(8, 17, 32, 0.69)',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: '0 6px 16px rgba(30, 64, 175, 0.5)',
                            },
                            '&:disabled': {
                                opacity: 0.3,
                                background: 'rgba(59, 130, 246, 0.4)'
                            }
                        }}
                    >
                        {mainBtnTxt}
                    </IconButton>
                ) : (
                    <Box sx={{ width: 56, height: 56 }} />
                )}

                <IconButton
                    disabled={!sideBtn3Icon || !sideBtn3F}
                    onClick={sideBtn3F}
                    sx={{
                        color: 'text.primary',
                        borderRadius: '16px',
                        p: 1.5,
                        '&:hover': {
                            bgcolor: 'rgba(59, 130, 246, 0.1)',
                        },
                        '&:disabled': {
                            opacity: 0.3,
                        },
                    }}
                >
                    {sideBtn3Icon || <Box sx={{ width: 24, height: 24 }} />}
                </IconButton>

                <IconButton
                    onClick={() => setDrawerOpen(true)}
                    sx={{
                        color: 'text.primary',
                        borderRadius: '16px',
                        p: 1.5,
                        '&:hover': {
                            bgcolor: 'rgba(59, 130, 246, 0.1)',
                        },
                    }}
                >
                    <MenuIcon />
                </IconButton>
            </Box>
        </ThemeProvider>
    );
}

export default NavBarBot;