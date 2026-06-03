import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
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
  Alert,
  CircularProgress,
  Divider,
  ThemeProvider,
  Card,
  CardContent,
  Collapse,
  useMediaQuery,
  LinearProgress
} from '@mui/material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
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
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import HistoryIcon from '@mui/icons-material/History';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
import LoadingNavBarBot from '../../layout/LoadingNavBarBot';
import LoadingPage from '../../layout/LoadingPage';
// import localforage from 'localforage';


// // IndexedDB Konfiguration
// const trainingStorage = localforage.createInstance({
//   name: 'TrainingApp',
//   storeName: 'trainingSessions',
//   description: 'Speichert temporäre Trainingssessions'
// });

// Sortierbare Übungs-Card
function UebungCard({
  uebung,
  onEdit,
  onDelete,
  ergebnisse,
  onChange,
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
  } = useSortable({
    id: uebung.uiId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Gruppiere Ergebnisse nach Session
  const groupedBySession = letzteErgebnisse && Array.isArray(letzteErgebnisse)
    ? letzteErgebnisse.reduce((acc, result) => {
      const sessionKey = result.session_id;

      if (!acc[sessionKey]) {
        acc[sessionKey] = {
          session_id: result.session_id,
          timestamp: result.erstellt_am,
          saetze: []
        };
      }

      acc[sessionKey].saetze.push(result);
      return acc;
    }, {})
    : {};

  const saetze = Array.isArray(ergebnisse?.saetze) ? ergebnisse.saetze : [];
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
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            <IconButton
              {...attributes}
              {...listeners}
              size="small"
              sx={{
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none',
                flexShrink: 0,
                '&:active': {
                  cursor: 'grabbing',
                }
              }}
            >
              <DragIndicatorIcon />
            </IconButton>
            <Box flex={1}>
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {uebung.name}
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                <Chip label={uebung.zielmuskel} size="small" color="primary" variant="outlined" />
                <Chip label={uebung.kategorie} size="small" color="secondary" variant="outlined" />
              </Box>
            </Box>
          </Box>
          <Box display="flex" gap={0.5} sx={{ flexShrink: 0 }}>
            {expanded && (
              <IconButton onClick={onToggleHistory} size="small" color="info">
                <HistoryIcon />
              </IconButton>
            )}
            {/* Delete confirmation: first click toggles confirm state and shows cancel/confirm icons */}
            {!confirmDelete ? (
              <IconButton
                onClick={() => setConfirmDelete(true)}
                size="small"
                color="error"
                aria-label={`Lösche Übung ${uebung.name}`}
              >
                <DeleteIcon />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  onClick={() => { setConfirmDelete(false); }}
                  size="small"
                  color="inherit"
                  aria-label="Abbrechen"
                >
                  <CloseIcon />
                </IconButton>
                <IconButton
                  onClick={() => { setConfirmDelete(false); onDelete && onDelete(); }}
                  size="small"
                  color="error"
                  aria-label="Löschen bestätigen"
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
          {/* HISTORY SECTION */}
          {showHistory && sortedSessions.length > 0 && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Trainings-Historie:
                </Typography>
                <Button
                  size="small"
                  onClick={() => onOpenFullHistory?.(uebung, letzteErgebnisse)}
                  sx={{ color: '#667eea', textTransform: 'none' }}
                >
                  Ganze Historie anzeigen
                </Button>
              </Box>

              {sortedSessions.slice(0, 1).map((session, sessionIdx) => (
                <Box key={sessionIdx}>
                  <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 500, display: 'block', mb: 1 }}>
                    {session.timestamp ? new Date(session.timestamp).toLocaleDateString('de-DE', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    }) : 'Datum unbekannt'} • {session.saetze.length} Sätze
                  </Typography>
                  {session.saetze.map((satz, satzIdx) => (
                    <Typography key={satzIdx} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Satz {satz.satz_nummer}: {satz.wiederholungen} Wdh @ {satz.gewicht_kg}kg
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
                    {sortedSessions.slice(1, 3).map((session, sessionIdx) => (
                      <Box key={sessionIdx} mt={2}>
                        <Divider sx={{ my: 1.5, borderColor: 'rgba(102, 126, 234, 0.2)' }} />
                        <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 500, display: 'block', mb: 1 }}>
                          {session.timestamp ? new Date(session.timestamp).toLocaleDateString('de-DE', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          }) : 'Datum unbekannt'} • {session.saetze.length} Sätze
                        </Typography>
                        {session.saetze.map((satz, satzIdx) => (
                          <Typography key={satzIdx} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Satz {satz.satz_nummer}: {satz.wiederholungen} Wdh @ {satz.gewicht_kg}kg
                          </Typography>
                        ))}
                      </Box>
                    ))}
                  </Collapse>
                </Box>
              )}
            </Box>
          )}

          {/* INPUT SECTION */}
          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                      slotProps={{
                        htmlInput: {
                          inputMode: 'decimal',
                          pattern: '[0-9.]*',
                        },
                      }}
                      size="small"
                      fullWidth
                      value={satz.gewicht}
                      onChange={(e) => onChange(uebung.uiId, satzIdx, 'gewicht', e.target.value)}
                      inputProps={{ step: "0.5" }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Wiederholungen"
                      type="number"
                      slotProps={{
                        htmlInput: {
                          inputMode: 'decimal',
                          pattern: '[0-9.]*',
                        },
                      }}
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
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

// Haupt-Komponente
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
  const [selectedPlanType, setSelectedPlanType] = useState(''); // 'standard' oder 'custom'

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // const STORAGE_KEY = `training_${nutzer?.id}`;
  const nutzerId = nutzer?.id;

  const createDefaultSaetze = (count = 3) =>
    Array.from({ length: count }, () => ({ wiederholungen: '', gewicht: '' }));

  const parseUebungKey = (uiId) => {
    if (typeof uiId !== 'string') {
      return { source: null, uebungId: null };
    }

    const parts = uiId.split('-');
    if (parts.length >= 3) {
      const source = parts[0];
      const uebungId = parseInt(parts[1], 10);
      return { source, uebungId: Number.isNaN(uebungId) ? null : uebungId };
    }

    return {
      source: parts[0] || null,
      uebungId: parseInt(parts[parts.length - 1], 10) || null
    };
  };

  const createExerciseItem = (exercise, source = 'standard', index = 0) => {
    const uebungId = exercise.uebung_id || exercise.id || exercise.uebungId;
    const uiId = exercise.uiId || `${source}-${uebungId}-${index}`;

    return {
      ...exercise,
      id: exercise.id || uebungId,
      uebung_id: uebungId,
      source,
      uiId,
      empfohlene_saetze: exercise.empfohlene_saetze || 3,
    };
  };

  // Sensoren für Drag & Drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ============ TIMER LOGIK ============
  useEffect(() => {
    let interval = null;

    if (isTimerRunning && timerStart) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const start = new Date(timerStart).getTime();
        const diff = Math.floor((now - start) / 1000); // Sekunden
        setElapsedTime(diff);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerStart]);

  // Alle Übungen laden
  useEffect(() => {
    const fetchUebungen = async () => {
      setLoading(true);
      try {
        const response = await TestApi.getAllUebungen();
        const customUebungen = await TrainingApi.getUebungenByUserId(nutzerId);
        setAlleUebungen(response.data);
        setCustomUebungen(customUebungen.data);
      } catch (err) {
        console.error('Fehler beim Laden der Übungen:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUebungen();
  }, [nutzerId]);

  // Trainingspläne laden
  useEffect(() => {
    const fetchPlaene = async () => {
      setLoading(true);
      try {
        const response = await TrainingApi.getAllTrainingsplaene();
        setTrainingsplaene(response.data);
      } catch (err) {
        console.error('Fehler beim Laden der Pläne:', err);
        setMessage({ type: "error", text: "Trainingspläne konnten nicht geladen werden." });
      } finally {
        setLoading(false);
      }
    };
    fetchPlaene();
  }, []);

  // Custom Pläne laden
  useEffect(() => {
    const fetchCustomPlaene = async () => {
      setLoading(true);
      try {
        const response = await TrainingApi.getCustomPlaene(nutzerId);
        setCustomTrainingsplaene(response.data);
      } catch (err) {
        console.error('Fehler beim Laden der CustomPläne:', err);
        setMessage({ type: "error", text: "Custom-Trainingspläne konnten nicht geladen werden." });
      } finally {
        setLoading(false);
      }
    };
    if (nutzerId) fetchCustomPlaene();
  }, [nutzerId]);

  useEffect(() => {
    if (!nutzerId) {
      return;
    }

    const loadSession = async () => {
      setLoading(true);
      try {
        const response = await TrainingApi.getTempSession(nutzerId);
        const saved = response.data;
        if (saved) {
          const { trainingsplan_id, trainingsplan_typ, gewaehlte_uebungen, ergebnisse, timer_start } = saved;

          // Setze Plan und Typ
          if (trainingsplan_typ === 'custom') {
            setSelectedCustomPlan(trainingsplan_id);
            setSelectedStandardPlan('');
          } else if (trainingsplan_typ === 'standard') {
            setSelectedStandardPlan(trainingsplan_id);
            setSelectedCustomPlan('');
          }

          setSelectedPlanType(trainingsplan_typ);

          if (gewaehlte_uebungen && gewaehlte_uebungen.length > 0) {

            // uiIds frisch generieren, damit veraltete Cache-Einträge automatisch geheilt werden
            const uebungenMitNeuenIds = gewaehlte_uebungen.map((u, index) => {
              const source = u.source || 'standard';
              const uebungId = u.uebung_id || u.id;
              const freshUiId = `${source}-${uebungId}-${index}`;
              return { alte_uiId: u.uiId, neue_uiId: freshUiId, u, source, index };
            });

            const neueMappedUebungen = uebungenMitNeuenIds.map(({ u, source, index, neue_uiId }) =>
              createExerciseItem({ ...u, uiId: neue_uiId }, source, index)
            );

            // Ergebnisse-Keys auf neue uiIds umschreiben
            const neueErgebnisse = {};
            uebungenMitNeuenIds.forEach(({ alte_uiId, neue_uiId }) => {
              if (ergebnisse?.[alte_uiId]) {
                neueErgebnisse[neue_uiId] = ergebnisse[alte_uiId];
              } else if (ergebnisse?.[neue_uiId]) {
                neueErgebnisse[neue_uiId] = ergebnisse[neue_uiId];
              }
            });

            setGewaehlteUebungen(neueMappedUebungen);
            setErgebnisse(neueErgebnisse);

            // Timer wiederherstellen
            if (timer_start) {
              const now = new Date().getTime();
              const start = new Date(timer_start).getTime();
              const diff = Math.floor((now - start) / 1000);

              setTimerStart(timer_start);
              setElapsedTime(diff);
              setIsTimerRunning(true); // WICHTIG: Als letztes setzen, damit der useEffect triggert
            }
          }
        }
      } catch (err) {
        console.error('Fehler beim Laden der Temp-Session:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [nutzerId]);

  // ============ AUTO-SAVE (statt IndexedDB) ============
  useEffect(() => {
    if ((selectedCustomPlan || selectedStandardPlan) && gewaehlteUebungen.length > 0) {
      const saveSession = async () => {
        const trainingsplan_id = selectedCustomPlan || selectedStandardPlan;
        try {
          await TrainingApi.saveTempSession({
            nutzer_id: nutzerId,
            trainingsplan_id,
            trainingsplan_typ: selectedPlanType,
            gewaehlte_uebungen: gewaehlteUebungen,
            ergebnisse,
            timer_start: timerStart // NEU
          });
        } catch (err) {
          console.error('Fehler beim Auto-Save:', err);
        }
      };

      const timeoutId = setTimeout(saveSession, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [ergebnisse, gewaehlteUebungen, selectedCustomPlan, selectedStandardPlan, selectedPlanType, nutzerId, timerStart]); // timerStart hinzugefügt!

  // ============ SESSION LÖSCHEN (API statt IndexedDB) ============
  const handleClearSession = async () => {
    if (window.confirm('Möchtest du die aktuelle Session wirklich löschen?')) {
      try {
        await TrainingApi.deleteTempSession(nutzerId);
        setGewaehlteUebungen([]);
        setErgebnisse({});
        setSelectedCustomPlan('');
        setSelectedStandardPlan('');
        setSelectedPlanType('');
        setTimerStart(null);
        setElapsedTime(0);
        setIsTimerRunning(false);
      } catch (err) {
        console.error('Fehler beim Löschen der Session:', err);
      }
    }
  };

  // ============ TIMER TOGGLE ============
  const handleToggleTimer = () => {
    if (!isTimerRunning) {
      // Timer starten
      const now = new Date().toISOString();
      setTimerStart(now);
      setIsTimerRunning(true);
      setElapsedTime(0);
    } else {
      // Timer stoppen
      setIsTimerRunning(false);
    }
  };

  // Prüfe ob Daten eingegeben wurden
  const hatEingaben = () => {
    return Object.values(ergebnisse).some(uebung =>
      Array.isArray(uebung?.saetze) && uebung.saetze.some(satz => satz.gewicht || satz.wiederholungen)
    );
  };

  const handlePlanChange = async (e, source) => {
    const planId = e.target.value;

    // Warnung wenn bereits Daten eingegeben wurden
    if (hatEingaben() && (selectedCustomPlan || selectedStandardPlan)) {
      if (!window.confirm('Trainingsplan wechseln? Alle aktuellen Eingaben gehen verloren!')) {
        return; // User hat abgebrochen
      }
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    let planType = '';
    if (source === 'custom') {
      setSelectedCustomPlan(planId);
      setSelectedStandardPlan('');
      planType = 'custom';
    } else {
      setSelectedStandardPlan(planId);
      setSelectedCustomPlan('');
      planType = 'standard';
    }

    setSelectedPlanType(planType);

    if (!planId) {
      setGewaehlteUebungen([]);
      setErgebnisse({});
      // Timer zurücksetzen beim Plan-Wechsel
      setTimerStart(null);
      setElapsedTime(0);
      setIsTimerRunning(false);
      setLoading(false);
      return;
    }

    try {
      let uebungenMitId = [];
      let initialErgebnisse = {};

      if (source === 'custom') {
        const response = await TrainingApi.getCustomPlanUebungen(planId, nutzer.id);
        const { uebungen } = response.data;

        uebungenMitId = uebungen.map((u, index) => {
          const uebungSource = u.eigene_uebung === 1 ? 'custom' : 'standard';

          return createExerciseItem({
            uebung_id: u.uebung_id,
            name: u.uebung_name,
            zielmuskel: u.zielmuskel,
            kategorie: u.kategorie,
            beschreibung: u.beschreibung,
            empfohlene_saetze: u.empfohlene_saetze || 3
          }, uebungSource, index);
        });

        initialErgebnisse = {};
        uebungenMitId.forEach(item => {
          initialErgebnisse[item.uiId] = {
            saetze: createDefaultSaetze(item.empfohlene_saetze)
          };
        });
      } else {
        const response = await TrainingApi.getUebungenFuerPlan(planId, nutzer.id, 'standard');
        const { uebungen } = response.data;

        uebungenMitId = uebungen.map((u, index) => createExerciseItem({
          uebung_id: u.uebung_id,
          name: u.uebung_name,
          zielmuskel: u.zielmuskel,
          kategorie: u.kategorie,
          beschreibung: u.beschreibung
        }, 'standard', index));

        initialErgebnisse = {};
        uebungenMitId.forEach(item => {
          initialErgebnisse[item.uiId] = {
            saetze: createDefaultSaetze(item.empfohlene_saetze)
          };
        });
      }

      setGewaehlteUebungen(uebungenMitId);
      setErgebnisse(initialErgebnisse);
    } catch (err) {
      console.error('Fehler beim Laden der Übungen:', err);
      setMessage({ type: "error", text: "Übungen konnten nicht geladen werden." });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUebung = () => {
    setEditIndex(null);
    setSelectedUebung(null);
    setFilterKategorie('');
    setFilterZielmuskel('');
    setDialogOpen(true);
  };

  const handleEditUebung = (index) => {
    setEditIndex(index);
    setSelectedUebung(gewaehlteUebungen[index]);
    setDialogOpen(true);
  };

  const handleDialogConfirm = () => {
    if (!selectedUebung) return;

    if (editIndex !== null) {
      const updated = [...gewaehlteUebungen];
      updated[editIndex] = {
        ...selectedUebung,
        source: selectedUebung.source || 'standard'
      };
      setGewaehlteUebungen(updated);
    } else {
      const source = selectedUebung.source || 'standard';
      const newItem = createExerciseItem({ ...selectedUebung, source }, source, gewaehlteUebungen.length);
      setGewaehlteUebungen([...gewaehlteUebungen, newItem]);
      setErgebnisse(prev => ({
        ...prev,
        [newItem.uiId]: {
          saetze: Array(3).fill().map(() => ({ wiederholungen: '', gewicht: '' }))
        }
      }));
    }
    setDialogOpen(false);
  };

  const handleDeleteUebung = (index) => {
    const uebungKey = gewaehlteUebungen[index].uiId;
    setGewaehlteUebungen(gewaehlteUebungen.filter((_, i) => i !== index));
    const { [uebungKey]: removed, ...rest } = ergebnisse;
    setErgebnisse(rest);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setGewaehlteUebungen(prev => {
        const oldIndex = prev.findIndex(u => u.uiId === active.id);
        const newIndex = prev.findIndex(u => u.uiId === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleInputChange = (uebungUiId, satzIdx, field, value) => {
    setErgebnisse(prev => {
      const existing = prev[uebungUiId] || { saetze: createDefaultSaetze() };
      const saetze = Array.isArray(existing.saetze) ? existing.saetze : createDefaultSaetze();
      return {
        ...prev,
        [uebungUiId]: {
          ...existing,
          saetze: saetze.map((satz, idx) =>
            idx === satzIdx ? { ...satz, [field]: value } : satz
          )
        }
      };
    });
  };

  const toggleHistory = async (uebung) => {
    setShowHistory(prev => ({ ...prev, [uebung.uiId]: !prev[uebung.uiId] }));
    if (!letzteErgebnisse[uebung.uiId] && !showHistory[uebung.uiId]) {
      try {
        const response = await TrainingApi.getLetzteErgebnisse(uebung.uebung_id, nutzer.id, uebung.source === 'custom' ? 1 : 0);
        setLetzteErgebnisse(prev => ({ ...prev, [uebung.uiId]: response.data }));
      } catch (err) {
        console.error('Fehler beim Laden der Historie:', err);
      }
    }
  };

  const openFullHistoryDialog = (uebung, historyData = []) => {
    setHistoryDialogContext({ uebung, historyData });
    setHistoryDialogOpen(true);
  };

  const closeFullHistoryDialog = () => {
    setHistoryDialogOpen(false);
  };

  // ============ TRAINING SPEICHERN (Temp-Session danach löschen) ============

  const handleSaveClick = () => {
    setSaveConfirmOpen(true);
  };

  const handleSaveConfirm = async () => {
    setSaveConfirmOpen(false);
    await handleSave();
  };

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
        const saetze = Array.isArray(data?.saetze) ? data.saetze : [];

        // (debug logs removed)

        saetze.forEach((satz, idx) => {
          if (satz.wiederholungen && satz.gewicht) {
            alleErgebnisse.push({
              uebung_id: uebungId,
              satz_nummer: idx + 1,
              wiederholungen: parseInt(satz.wiederholungen),
              gewicht_kg: parseFloat(satz.gewicht),
              notizen: null,
              eigene_uebung: eigeneUebung
            });
          }
        });
      });

      if (alleErgebnisse.length === 0) {
        setMessage({ type: "error", text: "Bitte fülle mindestens eine Übung aus." });
        setLoading(false);
        return;
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
        // (debug logs removed)
        await TrainingApi.createSessionMitHistorie({
          nutzer_id: nutzer.id,
          trainingsplan_id: selectedCustomPlan || selectedStandardPlan,
          trainingsplan_typ: selectedPlanType,
          datum: new Date().toISOString().split('T')[0],
          startzeit: null,
          endzeit: null,
          notizen: null,
          ergebnisse: alleErgebnisse,
          uebungen_reihenfolge: uebungenReihenfolge
        });

        // Temp-Session nach erfolgreichem Speichern löschen
        await TrainingApi.deleteTempSession(nutzerId);

        setMessage({ type: "success", text: "Training erfolgreich gespeichert!" });
        setGewaehlteUebungen([]);
        setErgebnisse({});
        setSelectedCustomPlan('');
        setSelectedStandardPlan('');
        setSelectedPlanType('');
        setTimerStart(null);
        setElapsedTime(0);
        setIsTimerRunning(false);
      });
    } catch (err) {
      console.error('Fehler beim Speichern:', err);
      setMessage({ type: "error", text: "Fehler beim Speichern des Trainings." });
    } finally {
      setLoading(false);
    }
  };

  const hanldeOpenCustomTraining = () => {
    navigate("/customTraining");
  };

  const sortByName = (a, b) => {
    const nameA = (a?.name || '').toString();
    const nameB = (b?.name || '').toString();
    return nameA.localeCompare(nameB, 'de', { sensitivity: 'base' });
  };

  const gefilterteUebungen = alleUebungen
    .filter(u => u && (!filterKategorie || u.kategorie === filterKategorie))
    .filter(u => u && (!filterZielmuskel || u.zielmuskel === filterZielmuskel))
    .filter(u => u && u.name)
    .sort(sortByName);

  const gefilterteCustomUebungen = customUebungen
    .filter(u => u && (!filterKategorie || u.kategorie === filterKategorie))
    .filter(u => u && (!filterZielmuskel || u.zielmuskel === filterZielmuskel))
    .filter(u => u && u.name)
    .sort(sortByName);

  const kategorien = [...new Set(alleUebungen.filter(u => u && u.kategorie).map(u => u.kategorie))];
  const zielmuskeln = [...new Set(alleUebungen.filter(u => u && u.zielmuskel).map(u => u.zielmuskel))];

  // ============ TIMER DISPLAY ============
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const TimerDisplay = () => {
    if (!isTimerRunning) {
      return <TimerIcon />;
    }
    return (
      <Typography
        sx={{
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          fontWeight: 700,
          color: '#3b82f6'
        }}
      >
        {formatTime(elapsedTime)}
      </Typography>
    );
  };

  if (loading) {
    return (
      <LoadingPage />
    );
  }

  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 4 }}>
          <NavBar />
          {!loading ? (
            <>
              <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 4 }, pb: "44px" }}>
                {!isMobile && (
                  <BackButton />
                )}

                <HeaderCard title={"Training erfassen"} />

                <Card sx={{ mb: 2, borderRadius: "16px", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                  <CardContent sx={{ p: { xs: 2.5, md: 3.5 }, height: "100%" }}>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth>
                          <InputLabel id="custom-trainingsplan-select">Eigene Trainingspläne</InputLabel>
                          <Select
                            labelId="custom-trainingsplan-select"
                            value={selectedCustomPlan}
                            onChange={(e) => handlePlanChange(e, 'custom')}
                            label="Eigene Trainingspläne"
                          >
                            <MenuItem value="">Kein Plan ausgewählt</MenuItem>
                            {customTrainingsplaene.map((customPlan, index) => (
                              <MenuItem
                                key={`custom-${customPlan.id}-${index}`}
                                value={customPlan.id}
                              >
                                {customPlan.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth>
                          <InputLabel id="standard-trainingsplan-select">Standard Trainingspläne</InputLabel>
                          <Select
                            labelId="standard-trainingsplan-select"
                            value={selectedStandardPlan}
                            onChange={(e) => handlePlanChange(e, 'standard')}
                            label="Standard Trainingspläne"
                          >
                            <MenuItem value="">Kein Plan ausgewählt</MenuItem>
                            {trainingsplaene.map((plan, index) => (
                              <MenuItem
                                key={`standard-${plan.id}-${index}`}
                                value={plan.id}
                              >
                                {plan.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      {(selectedCustomPlan || selectedStandardPlan) ? (
                        <>
                          <Grid size={{ xs: 6, sm: 6 }}>
                            <Button
                              onClick={hanldeOpenCustomTraining}
                              variant="contained"
                              size="large"
                              fullWidth
                              sx={{
                                padding: { xs: '10px 16px', sm: '14px 28px' },
                                fontSize: { xs: '0.85rem', sm: '1rem' },
                                fontWeight: 600,
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                color: '#fff',
                                textTransform: 'none',
                                transition: 'all 0.3s ease',
                                height: '100%',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 8px 24px rgba(30, 64, 175, 0.3)',
                                },
                              }}
                            >
                              Plan erstellen
                            </Button>
                          </Grid>
                          <Grid size={{ xs: 6, sm: 6 }}>
                            <Button
                              onClick={hanldeOpenCustomTraining}
                              variant="contained"
                              size="large"
                              fullWidth
                              sx={{
                                padding: { xs: '10px 16px', sm: '14px 28px' },
                                fontSize: { xs: '0.85rem', sm: '1rem' },
                                fontWeight: 600,
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                color: '#fff',
                                textTransform: 'none',
                                transition: 'all 0.3s ease',
                                height: '100%',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 8px 24px rgba(30, 64, 175, 0.3)',
                                },
                              }}
                            >
                              Pläne bearb.
                            </Button>
                          </Grid>
                          <Grid size={{ xs: 6, sm: 6 }}>
                            <Button
                              variant="contained"
                              size="large"
                              fullWidth
                              onClick={handleAddUebung}
                              sx={{
                                height: '100%',
                                fontSize: { xs: '0.85rem', sm: '1rem' },
                                padding: { xs: '10px 16px', sm: '14px 28px' },
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                color: '#fff',
                                borderRadius: '16px',
                                textTransform: 'none',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)',
                                  boxShadow: '0 6px 18px rgba(30, 64, 175, 0.25)',
                                  transform: 'translateY(-2px)',
                                },
                              }}
                            >
                              Übung hinz.
                            </Button>

                          </Grid>
                          <Grid size={{ xs: 6, sm: 6 }}>
                            <Button
                              variant="contained"
                              size="large"
                              fullWidth
                              onClick={() => navigate('/user/uebung-erstellen')}
                              sx={{
                                height: '100%',
                                fontSize: { xs: '0.85rem', sm: '1rem' },
                                padding: { xs: '10px 16px', sm: '14px 28px' },
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                color: '#fff',
                                borderRadius: '16px',
                                textTransform: 'none',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)',
                                  boxShadow: '0 6px 18px rgba(30, 64, 175, 0.25)',
                                  transform: 'translateY(-2px)',
                                },
                              }}
                            >
                              Übung erstellen
                            </Button>

                          </Grid>
                        </>
                      ) : (
                        <Grid size={{ xs: 12, sm: 12 }}>
                          <Button
                            onClick={hanldeOpenCustomTraining}
                            variant="contained"
                            size="large"
                            fullWidth
                            sx={{
                              padding: { xs: '10px 16px', sm: '14px 28px' },
                              fontSize: { xs: '0.85rem', sm: '1rem' },
                              fontWeight: 600,
                              borderRadius: '16px',
                              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                              color: '#fff',
                              textTransform: 'none',
                              transition: 'all 0.3s ease',
                              height: '100%',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 24px rgba(30, 64, 175, 0.3)',
                              },
                            }}
                          >
                            Plan erstellen
                          </Button>
                        </Grid>
                      )}
                    </Grid>

                  </CardContent>
                </Card>


                {(message.type === "error" || message.type === "success") && (
                  <Notification
                    type={message.type}
                    message={message.text}
                    onClose={() => {
                      setShowNotification(true);
                      setMessage({ type: "", text: "" });
                    }}
                  />
                )}

                {(selectedCustomPlan || selectedStandardPlan) && (
                  <>
                    {!isMobile && (
                      <Grid size={{ xs: 12, sm: 12 }} sx={{ pb: "15px" }}>
                        <Button
                          onClick={handleSaveClick}
                          variant="contained"
                          size="large"
                          fullWidth
                          disabled={loading || !hatEingaben()}
                          sx={{
                            padding: { xs: '10px 16px', sm: '14px 28px' },
                            fontSize: { xs: '0.85rem', sm: '1rem' },
                            fontWeight: 600,
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                            color: '#fff',
                            textTransform: 'none',
                            transition: 'all 0.3s ease',
                            height: '100%',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 24px rgba(30, 64, 175, 0.3)',
                            },
                          }}
                        >
                          Training speichern
                        </Button>
                      </Grid>
                    )}
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={(event) => setActiveId(event.active.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={gewaehlteUebungen.map(u => u.uiId)}
                        strategy={verticalListSortingStrategy}
                      >
                        {gewaehlteUebungen.map((uebung, index) => (
                          <UebungCard
                            key={uebung.uiId}
                            uebung={uebung}
                            onEdit={() => handleEditUebung(index)}
                            onDelete={() => handleDeleteUebung(index)}
                            ergebnisse={ergebnisse[uebung.uiId] || { saetze: createDefaultSaetze() }}
                            onChange={handleInputChange}
                            onToggleHistory={() => toggleHistory(uebung)}
                            onOpenFullHistory={(exercise, historyData) => openFullHistoryDialog(exercise, historyData)}
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

              <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
                fullScreen={window.innerWidth < 600}
              >
                <DialogTitle>
                  {editIndex !== null ? 'Übung ändern' : 'Übung hinzufügen'}
                </DialogTitle>
                <DialogContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Kategorie</InputLabel>
                        <Select
                          value={filterKategorie}
                          onChange={(e) => setFilterKategorie(e.target.value)}
                          label="Kategorie"
                        >
                          <MenuItem value="">Alle</MenuItem>
                          {kategorien.map(k => <MenuItem key={k} value={k}>{k}</MenuItem>)}
                        </Select>
                      </FormControl>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Zielmuskel</InputLabel>
                        <Select
                          value={filterZielmuskel}
                          onChange={(e) => setFilterZielmuskel(e.target.value)}
                          label="Zielmuskel"
                        >
                          <MenuItem value="">Alle</MenuItem>
                          {zielmuskeln.map(z => <MenuItem key={z} value={z}>{z}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Box>

                    <Autocomplete
                      options={[
                        ...gefilterteUebungen.map((u, index) => createExerciseItem({
                          id: `standard-${u.id}`,
                          uebung_id: u.id,
                          name: u.name,
                          zielmuskel: u.zielmuskel,
                          kategorie: u.kategorie,
                          _quelle: "Übungen"
                        }, 'standard', index)),
                        ...gefilterteCustomUebungen.map((u, index) => createExerciseItem({
                          id: `custom-${u.id}`,
                          uebung_id: u.id,
                          name: u.uebung_name,
                          beschreibung: u.uebung_beschreibung,
                          muskelgruppe: u.muskelgruppe,
                          zielmuskel: u.zielmuskel,
                          kategorie: u.kategorie,
                          _quelle: "Meine Übungen"
                        }, 'custom', index)),
                      ]}
                      groupBy={(option) => option._quelle}
                      getOptionLabel={(option) => `${option.name || option.uebung_name} (${option.zielmuskel})`}
                      value={selectedUebung}
                      onChange={(e, newValue) => setSelectedUebung(newValue)}
                      renderInput={(params) => (
                        <TextField {...params} label="Übung suchen" />
                      )}
                      renderOption={(props, option) => {
                        const { key, ...other } = props;
                        return (
                          <li key={key} {...other}>
                            <Box>
                              <Typography variant="body1">{option.name || option.uebung_name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {option.zielmuskel} • {option.kategorie}
                              </Typography>
                            </Box>
                          </li>
                        );
                      }}
                    />
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
                  <Button
                    onClick={handleDialogConfirm}
                    variant="contained"
                    disabled={!selectedUebung}
                  >
                    {editIndex !== null ? 'Ändern' : 'Hinzufügen'}
                  </Button>
                </DialogActions>
              </Dialog>
              <HistoryDialog
                open={historyDialogOpen}
                onClose={closeFullHistoryDialog}
                uebung={historyDialogContext.uebung}
                historyData={historyDialogContext.historyData}
              />
            </>
          ) : (
            <>
              <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 4 } }}>
                {(message.type === "error" || message.type === "success") && (
                  <Notification
                    type={message.type}
                    message={message.text}
                    onClose={() => {
                      setShowNotification(true);
                      setMessage({ type: "", text: "" });
                    }}
                  />
                )}
                <CircularProgress sx={{ position: "absolute", top: "45%", left: "45%", display: 'block', mx: 'auto', mb: 2 }} />
              </Container>
            </>
          )}
        </Box>
        <Dialog open={saveConfirmOpen} onClose={() => setSaveConfirmOpen(false)}>
          <DialogTitle>Training speichern?</DialogTitle>
          <DialogContent>
            <Typography>
              Möchtest du dein Training wirklich speichern?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSaveConfirmOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={handleSaveConfirm}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Speichern
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider >
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