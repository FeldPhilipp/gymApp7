// ============================================================
// UebungCard.jsx – Dropsätze sind jetzt Teil von `ergebnisse`
// ============================================================
//
// ÄNDERUNGEN gegenüber dem Original:
//
//  1. countDS (lokaler State) wurde ENTFERNT.
//     Dropsätze leben jetzt in ergebnisse[uiId].dropsaetze[]
//     und werden über onDropSatzAdd / onDropSatzChange /
//     onDropSatzRemove nach oben kommuniziert.
//
//  2. addDropSatz / updateDropSatz wurden durch Props ersetzt,
//     damit der Parent (Trainingsergebnisse) alle Daten beim
//     Speichern kennt.
//
//  3. Die UebungCard-Signatur hat vier neue Props:
//       onDropSatzAdd(uiId)
//       onDropSatzChange(uiId, dsIdx, field, value)
//       onDropSatzRemove(uiId, dsIdx)
//       dropsaetze   ← aus ergebnisse[uiId].dropsaetze
//
// ============================================================

function UebungCard({
  uebung,
  onEdit,
  onDelete,
  ergebnisse,          // { saetze: [...], dropsaetze: [...] }
  onChange,            // (uiId, satzIdx, field, value) – unverändert
  onDropSatzAdd,       // (uiId) => void
  onDropSatzChange,    // (uiId, dsIdx, field, value) => void
  onDropSatzRemove,    // (uiId, dsIdx) => void
  onToggleHistory,
  onOpenFullHistory,
  showHistory,
  letzteErgebnisse,
  isDragging
}) {
  const [expanded, setExpanded] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: uebung.uiId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const groupedBySession = letzteErgebnisse && Array.isArray(letzteErgebnisse)
    ? letzteErgebnisse.reduce((acc, result) => {
        const sessionKey = result.session_id;
        if (!acc[sessionKey]) {
          acc[sessionKey] = { session_id: result.session_id, timestamp: result.erstellt_am, saetze: [] };
        }
        acc[sessionKey].saetze.push(result);
        return acc;
      }, {})
    : {};

  const saetze = Array.isArray(ergebnisse?.saetze) ? ergebnisse.saetze : [];
  // NEU: Dropsätze aus ergebnisse lesen (nicht aus lokalem State)
  const dropsaetze = Array.isArray(ergebnisse?.dropsaetze) ? ergebnisse.dropsaetze : [];

  const sortedSessions = Object.values(groupedBySession)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        mb: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        touchAction: 'pan-y',
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* ── Header ── */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            <IconButton
              {...attributes}
              {...listeners}
              size="small"
              sx={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none', flexShrink: 0 }}
            >
              <DragIndicatorIcon />
            </IconButton>
            <Box flex={1}>
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {uebung.name}
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                <Chip label={uebung.zielmuskel} size="small" color="primary" variant="outlined" />
                <Chip label={uebung.kategorie}  size="small" color="secondary" variant="outlined" />
              </Box>
            </Box>
          </Box>
          <Box display="flex" gap={0.5} sx={{ flexShrink: 0 }}>
            {expanded && (
              <IconButton onClick={onToggleHistory} size="small" color="info">
                <HistoryIcon />
              </IconButton>
            )}
            {!confirmDelete ? (
              <IconButton onClick={() => setConfirmDelete(true)} size="small" color="error">
                <DeleteIcon />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton onClick={() => setConfirmDelete(false)} size="small" color="inherit">
                  <CloseIcon />
                </IconButton>
                <IconButton
                  onClick={() => { setConfirmDelete(false); onDelete?.(); }}
                  size="small"
                  color="error"
                >
                  <CheckIcon />
                </IconButton>
              </Box>
            )}
            <IconButton onClick={onEdit} size="small" color="warning">
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => setExpanded(!expanded)} size="small">
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded}>
          {/* ── Historie ── */}
          {showHistory && sortedSessions.length > 0 && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="subtitle2" fontWeight={600}>Trainings-Historie:</Typography>
                <Button
                  size="small"
                  onClick={() => onOpenFullHistory?.(uebung, letzteErgebnisse)}
                  sx={{ color: '#667eea', textTransform: 'none' }}
                >
                  Ganze Historie anzeigen
                </Button>
              </Box>
              {sortedSessions.slice(0, 1).map((session, idx) => (
                <Box key={idx}>
                  <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 500, display: 'block', mb: 1 }}>
                    {session.timestamp
                      ? new Date(session.timestamp).toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' })
                      : 'Datum unbekannt'} • {session.saetze.length} Sätze
                  </Typography>
                  {session.saetze.map((satz, satzIdx) => (
                    <Typography key={satzIdx} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Satz {satz.satz_nummer}: {satz.wiederholungen} Wdh @ {satz.gewicht_kg}kg
                      {satz.ist_dropsatz ? ' 🔽' : ''}
                    </Typography>
                  ))}
                </Box>
              ))}
              {sortedSessions.length > 1 && (
                <Box mt={2}>
                  <Button
                    size="small"
                    onClick={() => setExpandedHistory(!expandedHistory)}
                    sx={{ color: '#667eea', textTransform: 'none' }}
                  >
                    {expandedHistory ? 'Weniger anzeigen' : `Weitere ${Math.min(2, sortedSessions.length - 1)} Trainings anzeigen`}
                  </Button>
                  <Collapse in={expandedHistory}>
                    {sortedSessions.slice(1, 3).map((session, idx) => (
                      <Box key={idx} mt={2}>
                        <Divider sx={{ my: 1.5, borderColor: 'rgba(102, 126, 234, 0.2)' }} />
                        <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 500, display: 'block', mb: 1 }}>
                          {session.timestamp
                            ? new Date(session.timestamp).toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' })
                            : 'Datum unbekannt'} • {session.saetze.length} Sätze
                        </Typography>
                        {session.saetze.map((satz, satzIdx) => (
                          <Typography key={satzIdx} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Satz {satz.satz_nummer}: {satz.wiederholungen} Wdh @ {satz.gewicht_kg}kg
                            {satz.ist_dropsatz ? ' 🔽' : ''}
                          </Typography>
                        ))}
                      </Box>
                    ))}
                  </Collapse>
                </Box>
              )}
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* ── Normale Sätze ── */}
            {saetze.length > 0 ? saetze.map((satz, satzIdx) => (
              <Box key={satzIdx}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Satz {satzIdx + 1}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Gewicht (kg)"
                      type="number"
                      slotProps={{ htmlInput: { inputMode: 'decimal', pattern: '[0-9.]*' } }}
                      size="small"
                      fullWidth
                      value={satz.gewicht}
                      onChange={(e) => onChange(uebung.uiId, satzIdx, 'gewicht', e.target.value)}
                      inputProps={{ step: '0.5' }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Wiederholungen"
                      type="number"
                      slotProps={{ htmlInput: { inputMode: 'decimal', pattern: '[0-9.]*' } }}
                      size="small"
                      fullWidth
                      value={satz.wiederholungen}
                      onChange={(e) => onChange(uebung.uiId, satzIdx, 'wiederholungen', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Box>
            )) : (
              <Typography variant="body2" color="text.secondary">
                Keine Sätze zum Eintragen verfügbar.
              </Typography>
            )}

            {/* ── Dropsätze ── */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Dropsätze {dropsaetze.length > 0 ? `(${dropsaetze.length})` : ''}
                </Typography>
                {/* NEU: ruft Parent-Handler auf statt lokalem State */}
                <IconButton
                  onClick={() => onDropSatzAdd(uebung.uiId)}
                  size="small"
                  color="primary"
                  title="Dropsatz hinzufügen"
                >
                  <AddIcon />
                </IconButton>
              </Box>

              {dropsaetze.map((ds, dsIdx) => (
                <Box key={dsIdx}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" color="warning.main" gutterBottom>
                      Dropsatz {dsIdx + 1} 🔽
                    </Typography>
                    {/* Dropsatz entfernen */}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDropSatzRemove(uebung.uiId, dsIdx)}
                      title="Dropsatz entfernen"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        label="Gewicht (kg)"
                        type="number"
                        slotProps={{ htmlInput: { inputMode: 'decimal', pattern: '[0-9.]*' } }}
                        size="small"
                        fullWidth
                        value={ds.gewicht}
                        onChange={(e) => onDropSatzChange(uebung.uiId, dsIdx, 'gewicht', e.target.value)}
                        inputProps={{ step: '0.5' }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        label="Wiederholungen"
                        type="number"
                        slotProps={{ htmlInput: { inputMode: 'decimal', pattern: '[0-9.]*' } }}
                        size="small"
                        fullWidth
                        value={ds.wdh}
                        onChange={(e) => onDropSatzChange(uebung.uiId, dsIdx, 'wdh', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}