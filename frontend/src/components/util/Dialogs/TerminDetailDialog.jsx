import { useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Avatar,
  IconButton,
  Divider,
  List,
  ListItem,
  Stack,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CommentIcon from '@mui/icons-material/Comment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import UndoIcon from '@mui/icons-material/Undo';
import PersonIcon from '@mui/icons-material/Person';
import dayjs from 'dayjs';

const TerminDetailDialog = ({
  detailDialogOpen,
  setDetailDialogOpen,
  selectedTermin,
  handleTeilnahmeStatus,
  getTeilnahmeStatus,
  handleDeleteTermin,
  handleRemoveTeilnahme,
  handleEditTermin,
  nutzer,
  isDateInPast
}) => {
  const navigate = useNavigate();

  if (!selectedTermin) return null;

  const zusagen = selectedTermin.teilnehmer.filter(t => t.status === 'zusage');
  const absagen = selectedTermin.teilnehmer.filter(t => t.status === 'absage');
  const teilnahmeStatus = getTeilnahmeStatus(selectedTermin);
  const istErsteller = selectedTermin.ersteller_id === nutzer.id;
  const kannBearbeiten = istErsteller && !isDateInPast(dayjs(selectedTermin.datum));

  return (
    <Dialog 
      open={detailDialogOpen} 
      onClose={() => setDetailDialogOpen(false)} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          margin: 1,
          maxHeight: 'calc(100vh - 16px)',
          borderRadius: '20px',
        }
      }}
    >
      {/* Header mit Close Button */}
      <Box sx={{ 
        bgcolor: '#1f2937', 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <Typography variant="h6" color="#e0f2fe" sx={{ fontSize: '1.1rem' }}>
          Termin-Details
        </Typography>
        <IconButton 
          onClick={() => setDetailDialogOpen(false)}
          size="small"
          sx={{ color: '#93c5fd' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ bgcolor: '#1f2937', p: 2 }}>
        <Stack spacing={2.5}>
          {/* Datum & Zeit Kompakt */}
          <Box sx={{ 
            bgcolor: 'rgba(59, 130, 246, 0.1)', 
            borderRadius: '16px', 
            p: 2,
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CalendarTodayIcon sx={{ color: '#3b82f6', fontSize: '1.2rem' }} />
                <Typography variant="body1" color="#e0f2fe" sx={{ fontWeight: 500 }}>
                  {new Date(selectedTermin.datum).toLocaleDateString('de-DE', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <AccessTimeIcon sx={{ color: '#3b82f6', fontSize: '1.2rem' }} />
                <Typography variant="body1" color="#e0f2fe" sx={{ fontWeight: 500 }}>
                  {selectedTermin.startzeit.substring(0, 5)} Uhr
                </Typography>
              </Box>
              {selectedTermin.notiz && (
                <Typography variant="body2" color="#93c5fd" sx={{ mt: 1, fontStyle: 'italic' }}>
                  "{selectedTermin.notiz}"
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Chat Button */}
          <Button
            variant="outlined"
            startIcon={<CommentIcon />}
            onClick={() => navigate(`/chat/${selectedTermin.id}`)}
            fullWidth
            sx={{
              borderColor: '#3b82f6',
              color: '#e0f2fe',
              borderRadius: '12px',
              py: 1.2,
              textTransform: 'none',
              fontSize: '0.95rem',
              '&:hover': {
                borderColor: '#60a5fa',
                bgcolor: 'rgba(59, 130, 246, 0.05)'
              }
            }}
          >
            Chat öffnen
          </Button>

          {/* Teilnehmer Übersicht */}
          <Stack spacing={2}>
            {/* Zusagen */}
            <Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mb: 1.5,
                pb: 0.5,
                borderBottom: '2px solid rgba(34, 197, 94, 0.3)'
              }}>
                <ThumbUpIcon sx={{ color: '#22c55e', fontSize: '1.1rem' }} />
                <Typography variant="body2" color="#e0f2fe" sx={{ fontWeight: 600 }}>
                  Zusagen
                </Typography>
                <Chip 
                  label={zusagen.length} 
                  size="small" 
                  sx={{ 
                    bgcolor: '#22c55e', 
                    color: '#fff',
                    height: 20,
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }} 
                />
              </Box>
              {zusagen.length > 0 ? (
                <Stack spacing={0.5}>
                  {zusagen.map((t) => (
                    <Box
                      key={t.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1,
                        bgcolor: 'rgba(34, 197, 94, 0.05)',
                        borderRadius: '10px',
                        border: t.id === nutzer.id ? '1px solid rgba(34, 197, 94, 0.4)' : 'none'
                      }}
                    >
                      <Avatar sx={{ 
                        bgcolor: '#1e3a8a', 
                        width: 32, 
                        height: 32, 
                        fontSize: '0.9rem',
                        color: '#e0f2fe' 
                      }}>
                        {t.name.charAt(0)}
                      </Avatar>
                      <Typography 
                        variant="body2" 
                        color="#e0f2fe"
                        sx={{ 
                          flex: 1,
                          fontWeight: t.id === nutzer.id ? 600 : 400
                        }}
                      >
                        {t.name}
                        {t.id === nutzer.id && ' (Du)'}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 2,
                  color: '#93c5fd',
                  fontSize: '0.85rem'
                }}>
                  Noch keine Zusagen
                </Box>
              )}
            </Box>

            {/* Absagen */}
            <Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mb: 1.5,
                pb: 0.5,
                borderBottom: '2px solid rgba(239, 68, 68, 0.3)'
              }}>
                <ThumbDownIcon sx={{ color: '#ef4444', fontSize: '1.1rem' }} />
                <Typography variant="body2" color="#e0f2fe" sx={{ fontWeight: 600 }}>
                  Absagen
                </Typography>
                <Chip 
                  label={absagen.length} 
                  size="small" 
                  sx={{ 
                    bgcolor: '#ef4444', 
                    color: '#fff',
                    height: 20,
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }} 
                />
              </Box>
              {absagen.length > 0 ? (
                <Stack spacing={0.5}>
                  {absagen.map((t) => (
                    <Box
                      key={t.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1,
                        bgcolor: 'rgba(239, 68, 68, 0.05)',
                        borderRadius: '10px',
                        border: t.id === nutzer.id ? '1px solid rgba(239, 68, 68, 0.4)' : 'none'
                      }}
                    >
                      <Avatar sx={{ 
                        bgcolor: '#7f1d1d', 
                        width: 32, 
                        height: 32, 
                        fontSize: '0.9rem',
                        color: '#fee2e2' 
                      }}>
                        {t.name.charAt(0)}
                      </Avatar>
                      <Typography 
                        variant="body2" 
                        color="#e0f2fe"
                        sx={{ 
                          flex: 1,
                          fontWeight: t.id === nutzer.id ? 600 : 400
                        }}
                      >
                        {t.name}
                        {t.id === nutzer.id && ' (Du)'}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 2,
                  color: '#93c5fd',
                  fontSize: '0.85rem'
                }}>
                  Keine Absagen
                </Box>
              )}
            </Box>
          </Stack>

          {/* Aktionsbuttons */}
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            {/* Zusage/Absage Buttons */}
            {teilnahmeStatus !== 'zusage' && teilnahmeStatus !== 'absage' && (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<ThumbUpIcon />}
                  onClick={() => handleTeilnahmeStatus(selectedTermin.id, 'zusage')}
                  fullWidth
                  sx={{
                    background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                    color: '#fff',
                    borderRadius: '12px',
                    py: 1.2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
                    }
                  }}
                >
                  Zusagen
                </Button>
                <Button
                  variant="contained"
                  startIcon={<ThumbDownIcon />}
                  onClick={() => handleTeilnahmeStatus(selectedTermin.id, 'absage')}
                  fullWidth
                  sx={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                    color: '#fff',
                    borderRadius: '12px',
                    py: 1.2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
                    }
                  }}
                >
                  Absagen
                </Button>
              </Stack>
            )}

            {/* Status ändern wenn bereits zugesagt/abgesagt */}
            {teilnahmeStatus === 'zusage' && (
              <Button
                variant="outlined"
                startIcon={<ThumbDownIcon />}
                onClick={() => handleTeilnahmeStatus(selectedTermin.id, 'absage')}
                fullWidth
                sx={{
                  borderColor: '#ef4444',
                  color: '#ef4444',
                  borderRadius: '12px',
                  py: 1.2,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#dc2626',
                    bgcolor: 'rgba(239, 68, 68, 0.05)'
                  }
                }}
              >
                Zu Absage ändern
              </Button>
            )}

            {teilnahmeStatus === 'absage' && (
              <Button
                variant="outlined"
                startIcon={<ThumbUpIcon />}
                onClick={() => handleTeilnahmeStatus(selectedTermin.id, 'zusage')}
                fullWidth
                sx={{
                  borderColor: '#22c55e',
                  color: '#22c55e',
                  borderRadius: '12px',
                  py: 1.2,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#16a34a',
                    bgcolor: 'rgba(34, 197, 94, 0.05)'
                  }
                }}
              >
                Zu Zusage ändern
              </Button>
            )}

            {/* Teilnahme zurückziehen */}
            {teilnahmeStatus && (
              <Button
                variant="text"
                startIcon={<UndoIcon />}
                onClick={() => handleRemoveTeilnahme(selectedTermin.id)}
                fullWidth
                sx={{ 
                  color: '#93c5fd', 
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  py: 1
                }}
              >
                Teilnahme zurückziehen
              </Button>
            )}
          </Stack>
        </Stack>
      </DialogContent>

      {/* Footer Aktionen für Ersteller */}
      {kannBearbeiten && (
        <DialogActions sx={{ 
          bgcolor: '#1f2937', 
          p: 2,
          borderTop: '1px solid rgba(59, 130, 246, 0.2)',
          gap: 1
        }}>
          <IconButton
            onClick={() => {
              handleEditTermin(selectedTermin);
              setDetailDialogOpen(false);
            }}
            sx={{ 
              color: '#93c5fd',
              bgcolor: 'rgba(59, 130, 246, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(59, 130, 246, 0.2)'
              }
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteTermin(selectedTermin.id)}
            sx={{ 
              color: '#f87171',
              bgcolor: 'rgba(239, 68, 68, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(239, 68, 68, 0.2)'
              }
            }}
          >
            <DeleteIcon />
          </IconButton>
          <Box sx={{ flex: 1 }} />
          <Typography variant="caption" color="#93c5fd">
            Ersteller-Aktionen
          </Typography>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default TerminDetailDialog;