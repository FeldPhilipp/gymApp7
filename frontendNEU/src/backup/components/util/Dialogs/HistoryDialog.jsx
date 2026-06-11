import React, { useState } from 'react';
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
  Collapse,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function SatzMitDrops({ satz, idx, drops }) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ mb: 0.5 }}>
      <Box display="flex" alignItems="center" gap={0.75}>
        <Typography variant="body2" color="text.secondary">
          Satz {idx + 1}: {satz.wiederholungen} Wdh @ {satz.gewicht_kg}kg
        </Typography>
        {drops.length > 0 && (
          <Button
            size="small"
            onClick={() => setOpen(o => !o)}
            sx={{
              minWidth: 0,
              p: '0px 6px',
              fontSize: '0.7rem',
              color: 'warning.main',
              textTransform: 'none',
              lineHeight: 1.4,
              border: '1px solid',
              borderColor: 'warning.main',
              borderRadius: '6px',
            }}
          >
            {open ? '▲' : `${drops.length} ▼`}
          </Button>
        )}
      </Box>
      <Collapse in={open}>
        {drops.map((ds, dsIdx) => (
          <Typography
            key={`drop-${dsIdx}`}
            variant="body2"
            sx={{ pl: 2, mb: 0.25, color: 'warning.main', fontSize: '0.8rem' }}
          >
            Dropsatz {dsIdx + 1}: {ds.wiederholungen} Wdh @ {ds.gewicht_kg}kg
          </Typography>
        ))}
      </Collapse>
    </Box>
  );
}

function SessionSaetze({ saetze }) {
  const normaleSaetze = saetze.filter(s => !s.ist_dropsatz);
  const dropMap = saetze
    .filter(s => s.ist_dropsatz)
    .reduce((acc, ds) => {
      const key = String(ds.parent_satz_nummer);
      if (!acc[key]) acc[key] = [];
      acc[key].push(ds);
      return acc;
    }, {});

  return (
    <>
      {normaleSaetze.map((satz, idx) => (
        <SatzMitDrops
          key={`satz-${idx}`}
          satz={satz}
          idx={idx}
          drops={dropMap[String(satz.satz_nummer)] || []}
        />
      ))}
    </>
  );
}

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
          sessions.map((session, index) => {
            const anzNormal = session.saetze.filter(s => !s.ist_dropsatz).length;
            return (
              <Box key={`session-${index}`} sx={{ mb: index < sessions.length - 1 ? 2.5 : 0 }}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {formatDate(session.timestamp)}
                    {' • '}{anzNormal} Sätze
                  </Typography>
                </Box>

                <SessionSaetze saetze={session.saetze} />

                {index < sessions.length - 1 && (
                  <Divider sx={{ mt: 1.5, borderColor: 'rgba(148, 163, 184, 0.15)' }} />
                )}
              </Box>
            );
          })
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Schließen</Button>
      </DialogActions>
    </Dialog>
  );
};

export default HistoryDialog;