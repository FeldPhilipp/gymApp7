import {
    Box,
    Button,
    ThemeProvider,
} from '@mui/material';
import NavBar from '../../layout/NavBar';
import { darkTheme } from '../../../theme/darkTheme';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import NavBarBot from '../../layout/NavBarBot';

function LoginDark() {

    const navigate = useNavigate();

    return (
        <ThemeProvider theme={darkTheme}>
            <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
                <NavBar />
                <Button>
                    <ArrowBackIcon /> zurück
                </Button>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{
                        mb: { xs: 1, md: 2 },
                        color: "#93c5fd",
                        background: "rgba(59, 130, 246, 0.1)",
                        borderRadius: "16px",
                        padding: "6px 12px",
                    }}
                >
                    Zurück
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{
                        color: '#f87171',
                        borderColor: '#f87171',
                        borderRadius: '16px',
                        backgroundColor: '#1f2937',
                        '&:hover': {
                            borderColor: '#f87171',
                        },
                    }}
                >
                    Zurück
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{
                        color: '#e0f2fe',
                        borderColor: '#f87171',
                        borderRadius: '16px',
                        backgroundColor: '#1f2937',
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': {
                            backgroundColor: '#1f2937',
                            borderColor: '#f87171',
                            color: '#e0f2fe',
                        },
                    }}
                >
                    Zurück
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{
                        color: '#f87171',
                        borderColor: '#f87171',
                        borderRadius: '16px',
                        backgroundColor: '#1e3a8a',
                        boxShadow: '0 2px 4px rgba(168, 85, 247, 0.2)',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                            backgroundColor: '#1f2937',
                            boxShadow: '0 4px 8px rgba(168, 85, 247, 0.3)',
                            borderColor: '#a78bfa',
                        },
                    }}
                >
                    Zurück
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{
                        color: '#d1d5db',
                        borderColor: 'rgba(59, 130, 246, 0.3)',
                        borderRadius: '16px',
                        backgroundColor: '#111827',
                        textTransform: 'none',
                        fontWeight: 500,
                        padding: '6px 12px',
                        '&:hover': {
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderColor: 'rgba(59, 130, 246, 0.5)',
                            boxShadow: '0 0 8px rgba(59, 130, 246, 0.3)',
                        },
                        transition: 'all 0.3s ease-in-out',
                    }}
                >
                    Zurück
                </Button>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{
                        color: '#e5e7eb',
                        backgroundColor: '#1f2937',
                        borderRadius: '16px',
                        border: '1px solid rgba(55, 65, 81, 0.5)',
                        textTransform: 'none',
                        fontWeight: 500,
                        padding: '5px 10px',
                        marginBottom: "20px",
                        '&:hover': {
                            backgroundColor: '#374151',
                            borderColor: 'rgba(55, 65, 81, 0.8)',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        },
                        transition: 'all 0.2s ease',
                    }}
                >
                    Zurück
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{
                        color: '#9ca3af',
                        borderColor: 'transparent',
                        borderRadius: '16px',
                        background: 'linear-gradient(to right, #1f2937, #111827)',
                        textTransform: 'none',
                        fontWeight: 400,
                        padding: '6px 14px',
                        '&:hover': {
                            background: 'linear-gradient(to right, #374151, #1f2937)',
                            color: '#e5e7eb',
                            borderColor: 'rgba(139, 92, 246, 0.2)',
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    Zurück
                </Button>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{
                        color: '#93c5fd',
                        backgroundColor: '#111827',
                        borderRadius: '16px',
                        border: '1px solid rgba(168, 85, 247, 0.2)',
                        textTransform: 'none',
                        fontWeight: 500,
                        padding: '6px 14px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        '&:hover': {
                            backgroundColor: '#1e3a8a',
                            borderColor: 'rgba(168, 85, 247, 0.4)',
                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                            color: '#e0f2fe',
                        },
                        transition: 'all 0.2s ease',
                    }}
                >
                    Zurück
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{
                        color: '#e0f2fe',
                        borderColor: 'rgba(59, 130, 246, 0.3)',
                        borderRadius: '16px',
                        backgroundColor: '#1f2937',
                        textTransform: 'none',
                        fontWeight: 500,
                        padding: '6px 14px',
                        borderWidth: '1px',
                        '&:hover': {
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                            borderColor: 'rgba(59, 130, 246, 0.5)',
                            color: '#e0f2fe',
                        },
                        transition: 'all 0.3s ease-in-out',
                    }}
                >
                    Zurück
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{
                        color: '#f87171',
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        textTransform: 'none',
                        fontWeight: 500,
                        padding: '6px 14px',
                        '&:hover': {
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                            borderColor: 'rgba(239, 68, 68, 0.5)',
                            color: '#f87171',
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    Zurück
                </Button>
            </Box>
            <NavBarBot mainBtnF={() => navigate("/test")} mainBtnTxt={<ArrowBackIcon />} />
        </ThemeProvider>
    );
}

export default LoginDark;