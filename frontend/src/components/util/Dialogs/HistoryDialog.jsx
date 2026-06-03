import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const HistoryDialog = ({ open, onClose, uebung, historyData = [] }) => {
  const groupedSessions = Array.isArray(historyData)
    ? historyData.reduce((acc, result) => {
        const sessionKey = result.session_id ?? `${result.erstellt_am}-${result.satz_nummer}`;

        if (!acc[sessionKey]) {
          acc[sessionKey] = {
            session_id: result.session_id,
            timestamp: result.erstellt_am,
            saetze: [],
          };
        }

        acc[sessionKey].saetze.push(result);
        return acc;
      }, {})
    : {};

  const sessions = Object.values(groupedSessions).sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Datum unbekannt';
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          maxHeight: 'calc(100vh - 40px)',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
        <Box>
          <Typography variant="h6">Komplette Historie</Typography>
          <Typography variant="body2" color="text.secondary">
            {uebung?.name || 'Übung'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2, overflowY: 'auto' }}>
        {sessions.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Keine Historie verfügbar.
          </Typography>
        ) : (
          sessions.map((session, index) => (
            <Box key={`session-${index}`} sx={{ mb: index < sessions.length - 1 ? 2.5 : 0 }}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {formatDate(session.timestamp)} • {session.saetze.length} Sätze
                </Typography>
              </Box>

              {session.saetze
                .sort((a, b) => a.satz_nummer - b.satz_nummer)
                .map((satz, satzIndex) => (
                  <Box key={`satz-${satzIndex}`} sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Satz {satz.satz_nummer}: {satz.wiederholungen} Wdh @ {satz.gewicht_kg}kg
                    </Typography>
                  </Box>
                ))}

              {index < sessions.length - 1 && (
                <Divider sx={{ mt: 1.5, borderColor: 'rgba(148, 163, 184, 0.15)' }} />
              )}
            </Box>
          ))
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Schließen</Button>
      </DialogActions>
    </Dialog>
  );
};

export default HistoryDialog;
