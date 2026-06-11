import { useState, useEffect, useCallback } from 'react';
import {
    Dialog, DialogContent, Box, Typography, Button,
    Chip, ToggleButton, ToggleButtonGroup, IconButton,
    Divider, CircularProgress, Alert, ThemeProvider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { darkTheme } from '../../../theme/darkTheme';
import { PremiumApi } from '../../../services/api';

const PLANS = {
    monthly: {
        label: 'Monatlich',
        price: '1,99 €',
        priceValue: '1.99',
        description: 'pro Monat',
        badge: null,
    },
    yearly: {
        label: 'Jährlich',
        price: '14,99 €',
        priceValue: '14.99',
        description: 'pro Jahr',
        badge: 'Spare 37%',
    },
};

const FEATURES = [
    { label: 'Gewichtstracker', icon: '⚖️' },
    { label: 'Ernährungsplan', icon: '🥗' },
    { label: 'Fortschrittsfotos', icon: '📸' },
    { label: 'Statistiken & Auswertungen', icon: '📊' },
    { label: 'Unbegrenzte Custom-Pläne', icon: '♾️' },
    { label: 'Daten exportieren (PDF/CSV)', icon: '📥' },
];

export default function PremiumModal({ open, onClose, nutzerId, onPremiumActivated }) {
    const [plan, setPlan] = useState('yearly');
    const [step, setStep] = useState('select'); // 'select' | 'payment' | 'success' | 'error'
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Reset beim Öffnen
    useEffect(() => {
        if (open) {
            setStep('select');
            setErrorMsg('');
        }
    }, [open]);

    const handlePlanChange = (_, newPlan) => {
        if (newPlan) setPlan(newPlan);
    };

    // PayPal: Order auf unserem Server erstellen (oder direkt mit Betrag)
    const createOrder = useCallback((data, actions) => {
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: PLANS[plan].priceValue,
                    currency_code: 'EUR',
                },
                description: `GymApp Premium – ${PLANS[plan].label}`,
            }],
        });
    }, [plan]);

    // PayPal: Nach erfolgreicher Zahlung
    const onApprove = useCallback(async (data, actions) => {
        setLoading(true);
        try {
            // Order bei PayPal capturen
            await actions.order.capture();

            // Backend informieren & Status setzen
            await PremiumApi.activatePremium({
                nutzerId,
                plan,
                paypalOrderId: data.orderID,
            });

            setStep('success');
            onPremiumActivated?.(); // Parent-Callback um z.B. User-State neu zu laden
        } catch (err) {
            console.error('Fehler bei Premium-Aktivierung:', err);
            setErrorMsg('Zahlung war erfolgreich, aber Aktivierung schlug fehl. Bitte Support kontaktieren.');
            setStep('error');
        } finally {
            setLoading(false);
        }
    }, [nutzerId, plan, onPremiumActivated]);

    const onError = useCallback((err) => {
        console.error('PayPal Fehler:', err);
        setErrorMsg('Zahlung fehlgeschlagen. Bitte versuche es erneut.');
        setStep('error');
    }, []);

    return (
        <ThemeProvider theme={darkTheme}>
            <PayPalScriptProvider options={{
                'client-id': process.env.REACT_APP_PAYPAL_CLIENT_ID,
                currency: 'EUR',
            }}>
                <Dialog
                    open={open}
                    onClose={step === 'success' ? onClose : undefined}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 3,
                            overflow: 'hidden',
                        }
                    }}
                >
                    {/* Header */}
                    <Box sx={{
                        background: 'linear-gradient(135deg, #f0a500 0%, #e67e22 100%)',
                        px: 3, py: 2,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WorkspacePremiumIcon sx={{ color: '#fff', fontSize: 28 }} />
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, letterSpacing: 0.5 }}>
                                GymApp Premium
                            </Typography>
                        </Box>
                        {(step === 'success' || step === 'select') && (
                            <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                <CloseIcon />
                            </IconButton>
                        )}
                    </Box>

                    <DialogContent sx={{ p: 3 }}>

                        {/* SUCCESS */}
                        {step === 'success' && (
                            <Box sx={{ textAlign: 'center', py: 3 }}>
                                <CheckCircleIcon sx={{ fontSize: 72, color: '#4caf50', mb: 2 }} />
                                <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                                    Premium aktiviert! 🎉
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
                                    Du hast jetzt Zugriff auf alle Premium-Features.
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={onClose}
                                    sx={{
                                        background: 'linear-gradient(135deg, #f0a500, #e67e22)',
                                        px: 4, borderRadius: 2, fontWeight: 700,
                                    }}
                                >
                                    Los geht's
                                </Button>
                            </Box>
                        )}

                        {/* ERROR */}
                        {step === 'error' && (
                            <Box sx={{ py: 2 }}>
                                <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>
                                <Button
                                    variant="outlined"
                                    onClick={() => setStep('select')}
                                    fullWidth
                                >
                                    Zurück
                                </Button>
                            </Box>
                        )}

                        {/* PLAN AUSWAHL */}
                        {step === 'select' && (
                            <>
                                {/* Features */}
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, textTransform: 'uppercase', letterSpacing: 1, fontSize: 11 }}>
                                    Enthaltene Features
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                    {FEATURES.map(f => (
                                        <Chip
                                            key={f.label}
                                            label={`${f.icon} ${f.label}`}
                                            size="small"
                                            sx={{
                                                background: 'rgba(240,165,0,0.12)',
                                                border: '1px solid rgba(240,165,0,0.3)',
                                                color: '#f0c060',
                                                fontSize: 12,
                                            }}
                                        />
                                    ))}
                                </Box>

                                <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 3 }} />

                                {/* Plan Toggle */}
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1.5, textTransform: 'uppercase', letterSpacing: 1, fontSize: 11 }}>
                                    Laufzeit wählen
                                </Typography>
                                <ToggleButtonGroup
                                    value={plan}
                                    exclusive
                                    onChange={handlePlanChange}
                                    fullWidth
                                    sx={{ mb: 3 }}
                                >
                                    {Object.entries(PLANS).map(([key, p]) => (
                                        <ToggleButton
                                            key={key}
                                            value={key}
                                            sx={{
                                                py: 2,
                                                border: '1px solid rgba(255,255,255,0.12) !important',
                                                color: 'rgba(255,255,255,0.5)',
                                                position: 'relative',
                                                '&.Mui-selected': {
                                                    background: 'rgba(240,165,0,0.15)',
                                                    border: '1px solid rgba(240,165,0,0.6) !important',
                                                    color: '#f0a500',
                                                },
                                            }}
                                        >
                                            <Box>
                                                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{p.label}</Typography>
                                                <Typography sx={{ fontSize: 13, opacity: 0.8 }}>{p.price} <span style={{ fontSize: 11 }}>{p.description}</span></Typography>
                                                {p.badge && (
                                                    <Chip
                                                        label={p.badge}
                                                        size="small"
                                                        sx={{
                                                            position: 'absolute', top: 6, right: 6,
                                                            background: '#4caf50', color: '#fff',
                                                            fontSize: 10, height: 18,
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>

                                {/* Weiter zu PayPal */}
                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    onClick={() => setStep('payment')}
                                    sx={{
                                        background: 'linear-gradient(135deg, #f0a500, #e67e22)',
                                        borderRadius: 2, fontWeight: 700, py: 1.5,
                                        fontSize: 15,
                                        '&:hover': { background: 'linear-gradient(135deg, #e09500, #d46e12)' },
                                    }}
                                >
                                    Weiter zur Zahlung – {PLANS[plan].price}
                                </Button>
                                <Typography sx={{ textAlign: 'center', mt: 1.5, color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                                    Jederzeit kündbar · Sichere Zahlung via PayPal
                                </Typography>
                            </>
                        )}

                        {/* PAYPAL BUTTONS */}
                        {step === 'payment' && (
                            <>
                                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <IconButton onClick={() => setStep('select')} size="small" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                        ←
                                    </IconButton>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                        {PLANS[plan].label} · <strong style={{ color: '#f0a500' }}>{PLANS[plan].price}</strong>
                                    </Typography>
                                </Box>

                                {loading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                        <CircularProgress sx={{ color: '#f0a500' }} />
                                    </Box>
                                ) : (
                                    <PayPalButtons
                                        style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
                                        createOrder={createOrder}
                                        onApprove={onApprove}
                                        onError={onError}
                                        onCancel={() => setStep('select')}
                                    />
                                )}
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </PayPalScriptProvider>
        </ThemeProvider>
    );
}