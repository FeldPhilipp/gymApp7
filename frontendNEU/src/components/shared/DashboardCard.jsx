import { Box, Card, CardContent, Avatar, Typography, Divider } from '@mui/material';

/**
 * DashboardCard – allgemeine Karte mit Icon-Header.
 *
 * Props:
 *   title       {string}      Überschrift
 *   icon        {ReactNode}   Icon im Avatar
 *   accentColor {string}      Hex-Farbe für Avatar-Hintergrund und Akzent (default: '#1e3a8a')
 *   hoverColor  {string}      Hex-Farbe für Divider-Akzent (default: '#3b82f6')
 *   children    {ReactNode}   Inhalt der Karte
 */
function DashboardCard({
  title,
  icon,
  accentColor = '#1e3a8a',
  hoverColor = '#3b82f6',
  children,
}) {
  // Extrahiert r,g,b aus einem Hex-Wert für rgba()-Nutzung
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '59, 130, 246';
  };

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Card
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#1f2937',
          borderRadius: '16px',
        }}
      >
        <CardContent
          sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: { xs: 1.5, sm: 2 } }}
        >
          <Box display="flex" alignItems="center" mb={1.5}>
            <Avatar sx={{ bgcolor: accentColor, mr: 1, width: 32, height: 32 }}>
              {icon}
            </Avatar>
            <Typography variant="subtitle2" fontWeight={600} color="#e0f2fe">
              {title}
            </Typography>
          </Box>
          <Divider sx={{ mb: 1.5, borderColor: `rgba(${hexToRgb(hoverColor)}, 0.2)` }} />
          {children}
        </CardContent>
      </Card>
    </Box>
  );
}

export default DashboardCard;