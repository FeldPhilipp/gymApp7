import { useState, useEffect } from 'react';
import { Alert, Snackbar, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const Notification = ({ message, type = 'info', duration = 3000, onClose }) => {
    const [open, setOpen] = useState(true);
    console.log(message)

    useEffect(() => {
        const timer = setTimeout(() => {
            setOpen(false);
            setTimeout(() => {
                if (onClose) {
                    onClose();
                }
            }, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
        setTimeout(() => {
            if (onClose) {
                onClose();
            }
        }, 300);
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'error':
                return '#2d1618';
            case 'success':
                return '#1a2e1a';
            case 'warning':
                return '#2d2618';
            default:
                return '#1e293b';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'error':
                return '#f87171';
            case 'success':
                return '#4ade80';
            case 'warning':
                return '#fbbf24';
            default:
                return '#60a5fa';
        }
    };

    if (!message) return null;

    return (
        <Snackbar
            open={open}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            onClose={handleClose}
            sx={{
                top: { xs: '80px', sm: '90px' }, // Abstand von oben (unter NavBar)
                zIndex: 1400, // Über anderen Elementen
            }}
        >
            <Alert
                onClose={handleClose}
                severity={type}
                sx={{
                    width: { xs: '90vw', sm: '500px' }, // Responsive Breite
                    maxWidth: '100%',
                    backgroundColor: getBackgroundColor(),
                    color: '#fff',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    borderRadius: '16px',
                    border: `1px solid ${getIconColor()}40`, // Leichter Rand in Icon-Farbe
                    '.MuiAlert-icon': {
                        color: getIconColor()
                    },
                    '.MuiAlert-message': {
                        width: '100%',
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                    },
                    '& .MuiAlert-action': {
                        alignItems: 'center',
                        paddingTop: 0
                    }
                }}
                action={
                    <IconButton
                        size="small"
                        aria-label="close"
                        color="inherit"
                        onClick={handleClose}
                        sx={{
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

export default Notification;