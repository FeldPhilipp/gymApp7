import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Chip,
  CircularProgress,
  Divider,
  ThemeProvider,
  Card,
  CardContent,
  Collapse,
  useMediaQuery,
} from '@mui/material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useNavigate } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import HistoryIcon from '@mui/icons-material/History';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TimerIcon from '@mui/icons-material/Timer';
import NavBar from '../../layout/NavBar';
import { useAuth } from '../../context/AuthContext';
import { TrainingApi, TestApi } from '../../../services/api';
import { darkTheme } from '../../../theme/darkTheme';
import { useApiProtectionContext } from '../../context/ApiProtectionContext';
import BackButton from '../../util/buttons/BackButton';
import NavBarBot from '../../layout/NavBarBot';
import Notification from '../../util/notifications/Notification';
import HistoryDialog from '../../util/Dialogs/HistoryDialog';
import HeaderCard from '../../layout/HeaderCard';
import LoadingPage from '../../layout/LoadingPage';


// ============================================================
// SatzMitDrops – einen normalen Satz + aufklappbare Dropsätze
// ============================================================
function SatzMitDrops({ satz, idx, drops }) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ mb: 0.5 }}>
      <Box display="flex" alignItems="center" gap={0.5}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>
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
              mb: 0.25,
            }}
          >
            {open ? 'Drop ▲' : `${drops.length} Drop ▼`}
          </Button>
        )}
      </Box>
      <Collapse in={open}>
        {drops.map((ds, dsIdx) => (
          <Typography
            key={`drop-${dsIdx}`}
            variant="body2"
            sx={{ mb: 0.25, pl: 2, color: 'warning.main', fontSize: '0.8rem' }}
          >
            Dropsatz {dsIdx + 1}: {ds.wiederholungen} Wdh @ {ds.gewicht_kg}kg
          </Typography>
        ))}
      </Collapse>
    </Box>
  );
}

// ============================================================
// SessionSaetze – gruppiert flaches DB-Array nach Elternsatz
// ============================================================
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


// ============================================================
// UebungCard
// ============================================================
function UebungCard({
  uebung,
  onEdit,
  onDelete,
  ergebnisse,
  onChange,
  onDropSatzAdd,
  onDropSatzChange,
  onDropSatzRemove,
  onToggleHistory,
  onOpenFullHistory,
  showHistory,
  letzteErgebnisse,
  isDragging
}) {
  const [expanded, setExpanded] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: uebung.uiId });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const groupedBySession = letzteErgebnisse && Array.isArray(letzteErgebnisse)
    ? letzteErgebnisse.reduce((acc, result) => {
        const key = result.session_id;
        if (!acc[key]) acc[key] = { session_id: result.session_id, timestamp: result.erstellt_am, saetze: [] };
        acc[key].saetze.push(result);
        return acc;
      }, {})
    : {};

  const saetze = Array.isArray(ergebnisse?.saetze) ? ergebnisse.saetze : [];
  const sortedSessions = Object.values(groupedBySession).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <Card ref={setNodeRef} style={style} sx={{ mb: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', touchAction: 'pan-y' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>

        {/* ── Header ── */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            <IconButton {...attributes} {...listeners} size="small" sx={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none', flexShrink: 0 }}>
              <DragIndicatorIcon />
            </IconButton>
            <Box flex={1}>
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{uebung.name}</Typography>
              <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                <Chip label={uebung.zielmuskel} size="small" color="primary" variant="outlined" />
                <Chip label={uebung.kategorie}  size="small" color="secondary" variant="outlined" />
              </Box>
            </Box>
          </Box>
          <Box display="flex" gap={0.5} sx={{ flexShrink: 0 }}>
            {expanded && (
              <IconButton onClick={onToggleHistory} size="small" color="info"><HistoryIcon /></IconButton>
            )}
            {!confirmDelete ? (
              <IconButton onClick={() => setConfirmDelete(true)} size="small" color="error" aria-label={`Lösche Übung ${uebung.name}`}>
                <DeleteIcon />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton onClick={() => setConfirmDelete(false)} size="small" color="inherit"><CloseIcon /></IconButton>
                <IconButton onClick={() => { setConfirmDelete(false); onDelete?.(); }} size="small" color="error"><CheckIcon /></IconButton>
              </Box>
            )}
            <IconButton onClick={onEdit} size="small" color="warning"><EditIcon /></IconButton>
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
                <Button size="small" onClick={() => onOpenFullHistory?.(uebung, letzteErgebnisse)} sx={{ color: '#667eea', textTransform: 'none' }}>
                  Ganze Historie anzeigen
                </Button>
              </Box>

              {/* Neueste Session */}
              {sortedSessions.slice(0, 1).map((session, idx) => {
                const anzNormal = session.saetze.filter(s => !s.ist_dropsatz).length;
                return (
                  <Box key={idx}>
                    <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 500, display: 'block', mb: 1 }}>
                      {session.timestamp
                        ? new Date(session.timestamp).toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' })
                        : 'Datum unbekannt'}
                      {' • '}{anzNormal} Sätze
                    </Typography>
                    <SessionSaetze saetze={session.saetze} />
                  </Box>
                );
              })}

              {/* Ältere Sessions (aufklappbar) */}
              {sortedSessions.length > 1 && (
                <Box mt={2}>
                  <Button size="small" onClick={() => setExpandedHistory(!expandedHistory)} sx={{ color: '#667eea', textTransform: 'none' }}>
                    {expandedHistory ? 'Weniger anzeigen' : `Weitere ${Math.min(2, sortedSessions.length - 1)} Trainings anzeigen`}
                  </Button>
                  <Collapse in={expandedHistory}>
                    {sortedSessions.slice(1, 3).map((session, idx) => {
                      const anzNormal = session.saetze.filter(s => !s.ist_dropsatz).length;
                      return (
                        <Box key={idx} mt={2}>
                          <Divider sx={{ my: 1.5, borderColor: 'rgba(102, 126, 234, 0.2)' }} />
                          <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 500, display: 'block', mb: 1 }}>
                            {session.timestamp
                              ? new Date(session.timestamp).toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' })
                              : 'Datum unbekannt'}
                            {' • '}{anzNormal} Sätze
                          </Typography>
                          <SessionSaetze saetze={session.saetze} />
                        </Box>
                      );
                    })}
                  </Collapse>
                </Box>
              )}
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* ── Eingabe: Sätze + ihre Dropsätze ── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {saetze.length > 0 ? saetze.map((satz, satzIdx) => (
              <Box key={satzIdx}>
                {/* Satz-Label */}
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Satz {satzIdx + 1}
                </Typography>

                {/* Satz-Felder */}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Gewicht (kg)" type="number"
                      slotProps={{ htmlInput: { inputMode: 'decimal', pattern: '[0-9.]*' } }}
                      size="small" fullWidth
                      value={satz.gewicht}
                      onChange={(e) => onChange(uebung.uiId, satzIdx, 'gewicht', e.target.value)}
                      inputProps={{ step: '0.5' }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Wiederholungen" type="number"
                      slotProps={{ htmlInput: { inputMode: 'decimal', pattern: '[0-9.]*' } }}
                      size="small" fullWidth
                      value={satz.wiederholungen}
                      onChange={(e) => onChange(uebung.uiId, satzIdx, 'wiederholungen', e.target.value)}
                    />
                  </Grid>
                </Grid>

                {/* Dropsätze dieses Satzes */}
                {(satz.dropsaetze || []).map((ds, dsIdx) => (
                  <Box key={dsIdx} sx={{ mt: 1, pl: 2, borderLeft: '2px solid', borderColor: 'warning.main' }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2" color="warning.main" sx={{ fontSize: '0.8rem' }}>
                        Dropsatz {dsIdx + 1}
                      </Typography>
                      <IconButton size="small" color="error" onClick={() => onDropSatzRemove(uebung.uiId, satzIdx, dsIdx)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <TextField
                          label="Gewicht (kg)" type="number"
                          slotProps={{ htmlInput: { inputMode: 'decimal', pattern: '[0-9.]*' } }}
                          size="small" fullWidth
                          value={ds.gewicht}
                          onChange={(e) => onDropSatzChange(uebung.uiId, satzIdx, dsIdx, 'gewicht', e.target.value)}
                          inputProps={{ step: '0.5' }}
                        />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <TextField
                          label="Wiederholungen" type="number"
                          slotProps={{ htmlInput: { inputMode: 'decimal', pattern: '[0-9.]*' } }}
                          size="small" fullWidth
                          value={ds.wiederholungen}
                          onChange={(e) => onDropSatzChange(uebung.uiId, satzIdx, dsIdx, 'wiederholungen', e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}

                {/* + Dropsatz Button direkt unter dem Satz */}
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => onDropSatzAdd(uebung.uiId, satzIdx)}
                  sx={{ mt: 0.75, color: 'warning.main', textTransform: 'none', fontSize: '0.75rem', p: '2px 8px' }}
                >
                  Dropsatz
                </Button>
              </Box>
            )) : (
              <Typography variant="body2" color="text.secondary">Keine Sätze zum Eintragen verfügbar.</Typography>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}


// ============================================================
// Haupt-Komponente
// ============================================================
function Trainingsergebnisse() {
  const isMobile = useMediaQuery(darkTheme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { protect } = useApiProtectionContext();
  const { nutzer } = useAuth();
  const [trainingsplaene, setTrainingsplaene] = useState([]);
  const [customTrainingsplaene, setCustomTrainingsplaene] = useState([]);
  const [selectedCustomPlan, setSelectedCustomPlan] = useState('');
  const [selectedStandardPlan, setSelectedStandardPlan] = useState('');
  const [alleUebungen, setAlleUebungen] = useState([]);
  const [customUebungen, setCustomUebungen] = useState([]);
  const [gewaehlteUebungen, setGewaehlteUebungen] = useState([]);
  const [ergebnisse, setErgebnisse] = useState({});
  const [letzteErgebnisse, setLetzteErgebnisse] = useState({});
  const [showHistory, setShowHistory] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyDialogContext, setHistoryDialogContext] = useState({ uebung: null, historyData: [] });
  const [timerStart, setTimerStart] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [filterKategorie, setFilterKategorie] = useState('');
  const [filterZielmuskel, setFilterZielmuskel] = useState('');
  const [selectedUebung, setSelectedUebung] = useState(null);
  const [selectedPlanType, setSelectedPlanType] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const nutzerId = nutzer?.id;

  const createDefaultErgebnisse = (count = 3) => ({
    saetze: Array.from({ length: count }, () => ({
      wiederholungen: '',
      gewicht: '',
      dropsaetze: [],
    })),
  });

  const normalizeErgebnis = (data) => {
    if (!data) return createDefaultErgebnisse();
    if (Array.isArray(data)) {
      return { saetze: data.map(s => ({ ...s, dropsaetze: s.dropsaetze || [] })) };
    }
    return {
      saetze: Array.isArray(data.saetze)
        ? data.saetze.map(s => ({ ...s, dropsaetze: Array.isArray(s.dropsaetze) ? s.dropsaetze : [] }))
        : [],
    };
  };

  const parseUebungKey = (uiId) => {
    if (typeof uiId !== 'string') return { source: null, uebungId: null };
    const parts = uiId.split('-');
    if (parts.length >= 3) {
      const source = parts[0];
      const uebungId = parseInt(parts[1], 10);
      return { source, uebungId: Number.isNaN(uebungId) ? null : uebungId };
    }
    return { source: parts[0] || null, uebungId: parseInt(parts[parts.length - 1], 10) || null };
  };

  const createExerciseItem = (exercise, source = 'standard', index = 0) => {
    const uebungId = exercise.uebung_id || exercise.id || exercise.uebungId;
    const uiId = exercise.uiId || `${source}-${uebungId}-${index}`;
    return { ...exercise, id: exercise.id || uebungId, uebung_id: uebungId, source, uiId, empfohlene_saetze: exercise.empfohlene_saetze || 3 };
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Timer ──
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerStart) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - new Date(timerStart).getTime()) / 1000));
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isTimerRunning, timerStart]);

  // ── Übungen laden ──
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [res, customRes] = await Promise.all([TestApi.getAllUebungen(), TrainingApi.getUebungenByUserId(nutzerId)]);
        setAlleUebungen(res.data);
        setCustomUebungen(customRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [nutzerId]);

  // ── Trainingspläne laden ──
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try { const res = await TrainingApi.getAllTrainingsplaene(); setTrainingsplaene(res.data); }
      catch (err) { setMessage({ type: "error", text: "Trainingspläne konnten nicht geladen werden." }); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  // ── Custom Pläne laden ──
  useEffect(() => {
    if (!nutzerId) return;
    const fetch = async () => {
      setLoading(true);
      try { const res = await TrainingApi.getCustomPlaene(nutzerId); setCustomTrainingsplaene(res.data); }
      catch (err) { setMessage({ type: "error", text: "Custom-Trainingspläne konnten nicht geladen werden." }); }
      finally { setLoading(false); }
    };
    fetch();
  }, [nutzerId]);

  // ── Temp-Session laden ──
  useEffect(() => {
    if (!nutzerId) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await TrainingApi.getTempSession(nutzerId);
        const saved = res.data;
        if (!saved) return;

        const { trainingsplan_id, trainingsplan_typ, gewaehlte_uebungen, ergebnisse: savedErgebnisse, timer_start } = saved;

        if (trainingsplan_typ === 'custom') { setSelectedCustomPlan(trainingsplan_id); setSelectedStandardPlan(''); }
        else if (trainingsplan_typ === 'standard') { setSelectedStandardPlan(trainingsplan_id); setSelectedCustomPlan(''); }
        setSelectedPlanType(trainingsplan_typ);

        if (gewaehlte_uebungen?.length > 0) {
          const mapped = gewaehlte_uebungen.map((u, index) => {
            const source = u.source || 'standard';
            const uebungId = u.uebung_id || u.id;
            return createExerciseItem({ ...u, uiId: `${source}-${uebungId}-${index}` }, source, index);
          });

          const neueErgebnisse = {};
          mapped.forEach((u, index) => {
            const alte_uiId = gewaehlte_uebungen[index].uiId;
            const raw = savedErgebnisse?.[alte_uiId] || savedErgebnisse?.[u.uiId];
            neueErgebnisse[u.uiId] = normalizeErgebnis(raw);
          });

          setGewaehlteUebungen(mapped);
          setErgebnisse(neueErgebnisse);

          if (timer_start) {
            const diff = Math.floor((new Date().getTime() - new Date(timer_start).getTime()) / 1000);
            setTimerStart(timer_start);
            setElapsedTime(diff);
            setIsTimerRunning(true);
          }
        }
      } catch (err) { console.error('Fehler beim Laden der Temp-Session:', err); }
      finally { setLoading(false); }
    };
    load();
  }, [nutzerId]);

  // ── Auto-Save ──
  useEffect(() => {
    if ((selectedCustomPlan || selectedStandardPlan) && gewaehlteUebungen.length > 0) {
      const id = setTimeout(async () => {
        try {
          await TrainingApi.saveTempSession({
            nutzer_id: nutzerId,
            trainingsplan_id: selectedCustomPlan || selectedStandardPlan,
            trainingsplan_typ: selectedPlanType,
            gewaehlte_uebungen: gewaehlteUebungen,
            ergebnisse,
            timer_start: timerStart
          });
        } catch (err) { console.error('Auto-Save Fehler:', err); }
      }, 1000);
      return () => clearTimeout(id);
    }
  }, [ergebnisse, gewaehlteUebungen, selectedCustomPlan, selectedStandardPlan, selectedPlanType, nutzerId, timerStart]);

  const handleClearSession = async () => {
    if (!window.confirm('Session wirklich löschen?')) return;
    try {
      await TrainingApi.deleteTempSession(nutzerId);
      setGewaehlteUebungen([]); setErgebnisse({});
      setSelectedCustomPlan(''); setSelectedStandardPlan(''); setSelectedPlanType('');
      setTimerStart(null); setElapsedTime(0); setIsTimerRunning(false);
    } catch (err) { console.error(err); }
  };

  const handleToggleTimer = () => {
    if (!isTimerRunning) { setTimerStart(new Date().toISOString()); setIsTimerRunning(true); setElapsedTime(0); }
    else { setIsTimerRunning(false); }
  };

  const hatEingaben = () =>
    Object.values(ergebnisse).some(u =>
      Array.isArray(u?.saetze) && u.saetze.some(s => s.gewicht || s.wiederholungen)
    );

  const handlePlanChange = async (e, source) => {
    const planId = e.target.value;
    if (hatEingaben() && (selectedCustomPlan || selectedStandardPlan)) {
      if (!window.confirm('Trainingsplan wechseln? Alle aktuellen Eingaben gehen verloren!')) return;
    }
    setLoading(true);
    setMessage({ type: "", text: "" });
    let planType = source;
    if (source === 'custom') { setSelectedCustomPlan(planId); setSelectedStandardPlan(''); }
    else { setSelectedStandardPlan(planId); setSelectedCustomPlan(''); }
    setSelectedPlanType(planType);
    if (!planId) {
      setGewaehlteUebungen([]); setErgebnisse({});
      setTimerStart(null); setElapsedTime(0); setIsTimerRunning(false);
      setLoading(false); return;
    }
    try {
      let uebungenMitId = [];
      if (source === 'custom') {
        const res = await TrainingApi.getCustomPlanUebungen(planId, nutzer.id);
        uebungenMitId = res.data.uebungen.map((u, i) =>
          createExerciseItem({ uebung_id: u.uebung_id, name: u.uebung_name, zielmuskel: u.zielmuskel, kategorie: u.kategorie, beschreibung: u.beschreibung, empfohlene_saetze: u.empfohlene_saetze || 3 }, u.eigene_uebung === 1 ? 'custom' : 'standard', i)
        );
      } else {
        const res = await TrainingApi.getUebungenFuerPlan(planId, nutzer.id, 'standard');
        uebungenMitId = res.data.uebungen.map((u, i) =>
          createExerciseItem({ uebung_id: u.uebung_id, name: u.uebung_name, zielmuskel: u.zielmuskel, kategorie: u.kategorie, beschreibung: u.beschreibung }, 'standard', i)
        );
      }
      const initialErgebnisse = {};
      uebungenMitId.forEach(item => { initialErgebnisse[item.uiId] = createDefaultErgebnisse(item.empfohlene_saetze); });
      setGewaehlteUebungen(uebungenMitId);
      setErgebnisse(initialErgebnisse);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Übungen konnten nicht geladen werden." });
    } finally { setLoading(false); }
  };

  const handleAddUebung = () => { setEditIndex(null); setSelectedUebung(null); setFilterKategorie(''); setFilterZielmuskel(''); setDialogOpen(true); };
  const handleEditUebung = (index) => { setEditIndex(index); setSelectedUebung(gewaehlteUebungen[index]); setDialogOpen(true); };

  const handleDialogConfirm = () => {
    if (!selectedUebung) return;
    if (editIndex !== null) {
      const updated = [...gewaehlteUebungen];
      updated[editIndex] = { ...selectedUebung, source: selectedUebung.source || 'standard' };
      setGewaehlteUebungen(updated);
    } else {
      const source = selectedUebung.source || 'standard';
      const newItem = createExerciseItem({ ...selectedUebung, source }, source, gewaehlteUebungen.length);
      setGewaehlteUebungen([...gewaehlteUebungen, newItem]);
      setErgebnisse(prev => ({ ...prev, [newItem.uiId]: createDefaultErgebnisse(3) }));
    }
    setDialogOpen(false);
  };

  const handleDeleteUebung = (index) => {
    const key = gewaehlteUebungen[index].uiId;
    setGewaehlteUebungen(gewaehlteUebungen.filter((_, i) => i !== index));
    const { [key]: _, ...rest } = ergebnisse;
    setErgebnisse(rest);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      setGewaehlteUebungen(prev => {
        const oldIdx = prev.findIndex(u => u.uiId === active.id);
        const newIdx = prev.findIndex(u => u.uiId === over.id);
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  };

  // ── Normale Satz-Eingabe ──
  const handleInputChange = (uebungUiId, satzIdx, field, value) => {
    setErgebnisse(prev => {
      const ex = normalizeErgebnis(prev[uebungUiId]);
      return {
        ...prev,
        [uebungUiId]: {
          ...ex,
          saetze: ex.saetze.map((s, i) => i === satzIdx ? { ...s, [field]: value } : s)
        }
      };
    });
  };

  // ── Dropsatz-Handler ──
  const handleDropSatzAdd = (uebungUiId, satzIdx) => {
    setErgebnisse(prev => {
      const ex = normalizeErgebnis(prev[uebungUiId]);
      return {
        ...prev,
        [uebungUiId]: {
          ...ex,
          saetze: ex.saetze.map((s, i) =>
            i === satzIdx
              ? { ...s, dropsaetze: [...(s.dropsaetze || []), { gewicht: '', wiederholungen: '' }] }
              : s
          )
        }
      };
    });
  };

  const handleDropSatzChange = (uebungUiId, satzIdx, dsIdx, field, value) => {
    setErgebnisse(prev => {
      const ex = normalizeErgebnis(prev[uebungUiId]);
      return {
        ...prev,
        [uebungUiId]: {
          ...ex,
          saetze: ex.saetze.map((s, i) =>
            i === satzIdx
              ? { ...s, dropsaetze: s.dropsaetze.map((ds, j) => j === dsIdx ? { ...ds, [field]: value } : ds) }
              : s
          )
        }
      };
    });
  };

  const handleDropSatzRemove = (uebungUiId, satzIdx, dsIdx) => {
    setErgebnisse(prev => {
      const ex = normalizeErgebnis(prev[uebungUiId]);
      return {
        ...prev,
        [uebungUiId]: {
          ...ex,
          saetze: ex.saetze.map((s, i) =>
            i === satzIdx
              ? { ...s, dropsaetze: s.dropsaetze.filter((_, j) => j !== dsIdx) }
              : s
          )
        }
      };
    });
  };

  const toggleHistory = async (uebung) => {
    setShowHistory(prev => ({ ...prev, [uebung.uiId]: !prev[uebung.uiId] }));
    if (!letzteErgebnisse[uebung.uiId] && !showHistory[uebung.uiId]) {
      try {
        const res = await TrainingApi.getLetzteErgebnisse(uebung.uebung_id, nutzer.id, uebung.source === 'custom' ? 1 : 0);
        setLetzteErgebnisse(prev => ({ ...prev, [uebung.uiId]: res.data }));
      } catch (err) { console.error(err); }
    }
  };

  const openFullHistoryDialog = (uebung, historyData = []) => { setHistoryDialogContext({ uebung, historyData }); setHistoryDialogOpen(true); };
  const closeFullHistoryDialog = () => setHistoryDialogOpen(false);

  const handleSaveClick = () => setSaveConfirmOpen(true);
  const handleSaveConfirm = async () => { setSaveConfirmOpen(false); await handleSave(); };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const alleErgebnisse = [];

      Object.entries(ergebnisse).forEach(([uebungKey, data]) => {
        const exercise = gewaehlteUebungen.find(u => u.uiId === uebungKey);
        const parsed = parseUebungKey(uebungKey);
        const source = exercise?.source || parsed.source || (selectedPlanType === 'custom' ? 'custom' : 'standard');
        const uebungId = exercise?.uebung_id ?? parsed.uebungId;
        const eigeneUebung = source === 'custom' ? 1 : 0;
        const normalized = normalizeErgebnis(data);

        normalized.saetze.forEach((satz, satzIdx) => {
          if (!satz.wiederholungen && !satz.gewicht) return;

          const satzNummer = satzIdx + 1;

          if (satz.wiederholungen && satz.gewicht) {
            alleErgebnisse.push({
              uebung_id: uebungId,
              satz_nummer: satzNummer,
              wiederholungen: parseInt(satz.wiederholungen),
              gewicht_kg: parseFloat(satz.gewicht),
              notizen: null,
              eigene_uebung: eigeneUebung,
              ist_dropsatz: 0,
              parent_satz_nummer: null,
            });
          }

          (satz.dropsaetze || []).forEach((ds, dsIdx) => {
            if (ds.wiederholungen && ds.gewicht) {
              alleErgebnisse.push({
                uebung_id: uebungId,
                satz_nummer: normalized.saetze.length + dsIdx + 1,
                wiederholungen: parseInt(ds.wiederholungen),
                gewicht_kg: parseFloat(ds.gewicht),
                notizen: null,
                eigene_uebung: eigeneUebung,
                ist_dropsatz: 1,
                parent_satz_nummer: satzNummer,
              });
            }
          });
        });
      });

      if (alleErgebnisse.length === 0) {
        setMessage({ type: "error", text: "Bitte fülle mindestens eine Übung aus." });
        setLoading(false); return;
      }

      const uebungenReihenfolge = gewaehlteUebungen.map((u, idx) => {
        const parsed = parseUebungKey(u.uiId || u.id?.toString?.());
        return {
          uebung_id: u.uebung_id ?? parsed.uebungId,
          reihenfolge: idx + 1,
          eigene_uebung: selectedPlanType === 'custom' ? 1 : (u.source === 'custom' || parsed.source === 'custom' ? 1 : 0)
        };
      });

      await protect("Trainingsergebnisse - createSessionMitHistorie", async () => {
        await TrainingApi.createSessionMitHistorie({
          nutzer_id: nutzer.id,
          trainingsplan_id: selectedCustomPlan || selectedStandardPlan,
          trainingsplan_typ: selectedPlanType,
          datum: new Date().toISOString().split('T')[0],
          startzeit: null, endzeit: null, notizen: null,
          ergebnisse: alleErgebnisse,
          uebungen_reihenfolge: uebungenReihenfolge
        });
        await TrainingApi.deleteTempSession(nutzerId);
        setMessage({ type: "success", text: "Training erfolgreich gespeichert!" });
        setGewaehlteUebungen([]); setErgebnisse({});
        setSelectedCustomPlan(''); setSelectedStandardPlan(''); setSelectedPlanType('');
        setTimerStart(null); setElapsedTime(0); setIsTimerRunning(false);
      });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Fehler beim Speichern des Trainings." });
    } finally { setLoading(false); }
  };

  const hanldeOpenCustomTraining = () => navigate("/customTraining");

  const sortByName = (a, b) => (a?.name || '').toString().localeCompare((b?.name || '').toString(), 'de', { sensitivity: 'base' });

  const gefilterteUebungen = alleUebungen.filter(u => u && (!filterKategorie || u.kategorie === filterKategorie) && (!filterZielmuskel || u.zielmuskel === filterZielmuskel) && u.name).sort(sortByName);
  const gefilterteCustomUebungen = customUebungen.filter(u => u && (!filterKategorie || u.kategorie === filterKategorie) && (!filterZielmuskel || u.zielmuskel === filterZielmuskel) && u.name).sort(sortByName);
  const kategorien = [...new Set(alleUebungen.filter(u => u?.kategorie).map(u => u.kategorie))];
  const zielmuskeln = [...new Set(alleUebungen.filter(u => u?.zielmuskel).map(u => u.zielmuskel))];

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const TimerDisplay = () => isTimerRunning
    ? <Typography sx={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700, color: '#3b82f6' }}>{formatTime(elapsedTime)}</Typography>
    : <TimerIcon />;

  if (loading) return <LoadingPage />;

  const btnSx = { padding: { xs: '10px 16px', sm: '14px 28px' }, fontSize: { xs: '0.85rem', sm: '1rem' }, fontWeight: 600, borderRadius: '16px', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: '#fff', textTransform: 'none', transition: 'all 0.3s ease', height: '100%', '&:hover': { background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)', transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(30, 64, 175, 0.3)' } };

  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 4 }}>
          <NavBar />
          <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 4 }, pb: "44px" }}>
            {!isMobile && <BackButton />}
            <HeaderCard title={"Training erfassen"} />

            <Card sx={{ mb: 2, borderRadius: "16px", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel id="custom-plan-label">Eigene Trainingspläne</InputLabel>
                      <Select labelId="custom-plan-label" value={selectedCustomPlan} onChange={(e) => handlePlanChange(e, 'custom')} label="Eigene Trainingspläne">
                        <MenuItem value="">Kein Plan ausgewählt</MenuItem>
                        {customTrainingsplaene.map((p, i) => <MenuItem key={`c-${p.id}-${i}`} value={p.id}>{p.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel id="standard-plan-label">Standard Trainingspläne</InputLabel>
                      <Select labelId="standard-plan-label" value={selectedStandardPlan} onChange={(e) => handlePlanChange(e, 'standard')} label="Standard Trainingspläne">
                        <MenuItem value="">Kein Plan ausgewählt</MenuItem>
                        {trainingsplaene.map((p, i) => <MenuItem key={`s-${p.id}-${i}`} value={p.id}>{p.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {(selectedCustomPlan || selectedStandardPlan) ? (
                    <>
                      <Grid size={{ xs: 6 }}><Button onClick={hanldeOpenCustomTraining} variant="contained" size="large" fullWidth sx={btnSx}>Plan erstellen</Button></Grid>
                      <Grid size={{ xs: 6 }}><Button onClick={hanldeOpenCustomTraining} variant="contained" size="large" fullWidth sx={btnSx}>Pläne bearb.</Button></Grid>
                      <Grid size={{ xs: 6 }}><Button variant="contained" size="large" fullWidth onClick={handleAddUebung} sx={btnSx}>Übung hinz.</Button></Grid>
                      <Grid size={{ xs: 6 }}><Button variant="contained" size="large" fullWidth onClick={() => navigate('/user/uebung-erstellen')} sx={btnSx}>Übung erstellen</Button></Grid>
                    </>
                  ) : (
                    <Grid size={{ xs: 12 }}><Button onClick={hanldeOpenCustomTraining} variant="contained" size="large" fullWidth sx={btnSx}>Plan erstellen</Button></Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {(message.type === "error" || message.type === "success") && (
              <Notification type={message.type} message={message.text} onClose={() => { setShowNotification(true); setMessage({ type: "", text: "" }); }} />
            )}

            {(selectedCustomPlan || selectedStandardPlan) && (
              <>
                {!isMobile && (
                  <Grid size={{ xs: 12 }} sx={{ pb: "15px" }}>
                    <Button onClick={handleSaveClick} variant="contained" size="large" fullWidth disabled={loading || !hatEingaben()} sx={btnSx}>
                      Training speichern
                    </Button>
                  </Grid>
                )}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={(e) => setActiveId(e.active.id)} onDragEnd={handleDragEnd}>
                  <SortableContext items={gewaehlteUebungen.map(u => u.uiId)} strategy={verticalListSortingStrategy}>
                    {gewaehlteUebungen.map((uebung, index) => (
                      <UebungCard
                        key={uebung.uiId}
                        uebung={uebung}
                        onEdit={() => handleEditUebung(index)}
                        onDelete={() => handleDeleteUebung(index)}
                        ergebnisse={normalizeErgebnis(ergebnisse[uebung.uiId])}
                        onChange={handleInputChange}
                        onDropSatzAdd={handleDropSatzAdd}
                        onDropSatzChange={handleDropSatzChange}
                        onDropSatzRemove={handleDropSatzRemove}
                        onToggleHistory={() => toggleHistory(uebung)}
                        onOpenFullHistory={openFullHistoryDialog}
                        showHistory={showHistory[uebung.uiId]}
                        letzteErgebnisse={letzteErgebnisse[uebung.uiId]}
                        isDragging={activeId === uebung.uiId}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </>
            )}
          </Container>

          {/* Dialog: Übung hinzufügen */}
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth fullScreen={window.innerWidth < 600}>
            <DialogTitle>{editIndex !== null ? 'Übung ändern' : 'Übung hinzufügen'}</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Kategorie</InputLabel>
                    <Select value={filterKategorie} onChange={(e) => setFilterKategorie(e.target.value)} label="Kategorie">
                      <MenuItem value="">Alle</MenuItem>
                      {kategorien.map(k => <MenuItem key={k} value={k}>{k}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Zielmuskel</InputLabel>
                    <Select value={filterZielmuskel} onChange={(e) => setFilterZielmuskel(e.target.value)} label="Zielmuskel">
                      <MenuItem value="">Alle</MenuItem>
                      {zielmuskeln.map(z => <MenuItem key={z} value={z}>{z}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>
                <Autocomplete
                  options={[
                    ...gefilterteUebungen.map((u, i) => createExerciseItem({ id: `standard-${u.id}`, uebung_id: u.id, name: u.name, zielmuskel: u.zielmuskel, kategorie: u.kategorie, _quelle: "Übungen" }, 'standard', i)),
                    ...gefilterteCustomUebungen.map((u, i) => createExerciseItem({ id: `custom-${u.id}`, uebung_id: u.id, name: u.uebung_name, beschreibung: u.uebung_beschreibung, muskelgruppe: u.muskelgruppe, zielmuskel: u.zielmuskel, kategorie: u.kategorie, _quelle: "Meine Übungen" }, 'custom', i)),
                  ]}
                  groupBy={(o) => o._quelle}
                  getOptionLabel={(o) => `${o.name || o.uebung_name} (${o.zielmuskel})`}
                  value={selectedUebung}
                  onChange={(e, v) => setSelectedUebung(v)}
                  renderInput={(params) => <TextField {...params} label="Übung suchen" />}
                  renderOption={(props, option) => {
                    const { key, ...other } = props;
                    return <li key={key} {...other}><Box><Typography variant="body1">{option.name || option.uebung_name}</Typography><Typography variant="body2" color="text.secondary">{option.zielmuskel} • {option.kategorie}</Typography></Box></li>;
                  }}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
              <Button onClick={handleDialogConfirm} variant="contained" disabled={!selectedUebung}>{editIndex !== null ? 'Ändern' : 'Hinzufügen'}</Button>
            </DialogActions>
          </Dialog>

          <HistoryDialog open={historyDialogOpen} onClose={closeFullHistoryDialog} uebung={historyDialogContext.uebung} historyData={historyDialogContext.historyData} />
        </Box>

        <Dialog open={saveConfirmOpen} onClose={() => setSaveConfirmOpen(false)}>
          <DialogTitle>Training speichern?</DialogTitle>
          <DialogContent><Typography>Möchtest du dein Training wirklich speichern?</Typography></DialogContent>
          <DialogActions>
            <Button onClick={() => setSaveConfirmOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSaveConfirm} variant="contained" sx={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>Speichern</Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>

      <NavBarBot
        mainBtnF={handleSaveClick}
        mainBtnTxt={"Speichern"}
        mainBtnDisabled={loading || !hatEingaben()}
        sideBtn3Icon={<TimerDisplay />}
        sideBtn3F={handleToggleTimer}
      />
    </>
  );
}

export default Trainingsergebnisse;