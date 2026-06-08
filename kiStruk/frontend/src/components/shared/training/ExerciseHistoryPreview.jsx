import { Box, Button, Collapse, Divider, Typography } from "@mui/material";

function groupHistoryBySession(historyData) {
  if (!Array.isArray(historyData)) return [];

  const grouped = historyData.reduce((acc, result) => {
    const sessionKey = result.session_id;
    if (!acc[sessionKey]) {
      acc[sessionKey] = {
        session_id: result.session_id,
        timestamp: result.erstellt_am,
        saetze: [],
      };
    }
    acc[sessionKey].saetze.push(result);
    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function formatSessionDate(timestamp) {
  if (!timestamp) return "Datum unbekannt";

  return new Date(timestamp).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function HistorySession({ session, showDropSetMarker = false }) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ color: "#cbd5e1", fontWeight: 500, display: "block", mb: 1 }}
      >
        {formatSessionDate(session.timestamp)} - {session.saetze.length} Saetze
      </Typography>
      {session.saetze.map((satz, satzIdx) => (
        <Typography key={satzIdx} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Satz {satz.satz_nummer}: {satz.wiederholungen} Wdh @ {satz.gewicht_kg}kg
          {showDropSetMarker && satz.ist_dropsatz ? " Dropsatz" : ""}
        </Typography>
      ))}
    </Box>
  );
}

function ExerciseHistoryPreview({
  historyData,
  exercise,
  expandedHistory,
  onToggleExpandedHistory,
  onOpenFullHistory,
  showFullHistoryButton = false,
  showDropSetMarker = false,
}) {
  const sortedSessions = groupHistoryBySession(historyData);

  if (sortedSessions.length === 0) return null;

  return (
    <Box sx={{ mb: 2, p: 2, bgcolor: "background.default", borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="subtitle2" fontWeight={600}>
          Trainings-Historie:
        </Typography>
        {showFullHistoryButton && (
          <Button
            size="small"
            onClick={() => onOpenFullHistory?.(exercise, historyData)}
            sx={{ color: "#667eea", textTransform: "none" }}
          >
            Ganze Historie anzeigen
          </Button>
        )}
      </Box>

      {sortedSessions.slice(0, 1).map((session) => (
        <HistorySession
          key={session.session_id}
          session={session}
          showDropSetMarker={showDropSetMarker}
        />
      ))}

      {sortedSessions.length > 1 && (
        <Box mt={2}>
          <Button
            size="small"
            onClick={onToggleExpandedHistory}
            sx={{ color: "#667eea", textTransform: "none" }}
          >
            {expandedHistory
              ? "Weniger anzeigen"
              : `Weitere ${Math.min(2, sortedSessions.length - 1)} Trainings anzeigen`}
          </Button>
          <Collapse in={expandedHistory}>
            {sortedSessions.slice(1, 3).map((session) => (
              <Box key={session.session_id} mt={2}>
                <Divider sx={{ my: 1.5, borderColor: "rgba(102, 126, 234, 0.2)" }} />
                <HistorySession session={session} showDropSetMarker={showDropSetMarker} />
              </Box>
            ))}
          </Collapse>
        </Box>
      )}
    </Box>
  );
}

export default ExerciseHistoryPreview;
