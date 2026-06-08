import React from 'react';
import { Box, List, ListItem, ListItemText, Typography, Chip, Avatar } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const Highscores = ({ highscores = [], ansicht = 'persoenlich', nutzer = {}, navigate, gruppeId }) => {
    if (!Array.isArray(highscores) || highscores.length === 0) {
        return (
            <Typography color="#93c5fd" align="center" variant="caption" sx={{ py: 2 }}>
                Noch keine Highscores vorhanden
            </Typography>
        );
    }

    return (
        <>
            <List dense sx={{ overflow: 'auto', flex: 1, width: '100%' }}>
                {highscores.slice(0, 3).map((score, index) => (
                    <ListItem
                        key={index}
                        sx={{
                            px: 0,
                            py: 0.5,
                            width: '100%',
                            flex: '0 0 auto',
                        }}
                    >
                        <Box
                            sx={{
                                width: '100%',
                                p: 1,
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            {/* Übungsinformationen */}
                            <ListItemText
                                sx={{ flex: 1, minWidth: 0 }}
                                primary={
                                    <Box>
                                        <Typography 
                                            variant="body2" 
                                            fontWeight={600} 
                                            color="#fff"
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {score.uebung_name || 'Unbekannte Übung'}
                                        </Typography>
                                        {ansicht === 'gruppe' && (
                                            <Typography variant="caption" color="#93c5fd">
                                                {score.vname || ''} {score.nname || ''}
                                            </Typography>
                                        )}
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="caption" color="#93c5fd">
                                        {score.zielmuskel || 'Unbekannt'}
                                    </Typography>
                                }
                            />

                            {/* Gewicht-Chip */}
                            <Chip
                                icon={<FitnessCenterIcon sx={{ fontSize: 14 }} />}
                                label={`${score.max_gewicht || 0}kg`}
                                size="small"
                                sx={{
                                    backgroundColor: '#1e3a8a',
                                    color: '#e0f2fe',
                                    fontWeight: 600,
                                    height: 24,
                                    fontSize: '0.75rem',
                                    '& .MuiChip-icon': {
                                        color: '#3b82f6',
                                    }
                                }}
                            />
                        </Box>
                    </ListItem>
                ))}
            </List>

            {/* Link zu allen Highscores */}
            <ListItem
                sx={{
                    px: 0,
                    py: 0.5,
                    width: '100%',
                    flex: '0 0 auto',
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        p: 1,
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            borderColor: 'rgba(59, 130, 246, 0.5)',
                            backgroundColor: 'rgba(59, 130, 246, 0.05)',
                        }
                    }}
                    onClick={() => navigate(`/allHighscores/${gruppeId}`)}
                >
                    <Typography variant="body2" fontWeight={600} color="#fff">
                        Alle Highscores
                    </Typography>
                    <LaunchIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                </Box>
            </ListItem>
        </>
    );
};

export default Highscores;