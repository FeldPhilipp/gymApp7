import { createTheme } from '@mui/material/styles';

// Erweitertes Dark Theme für die HomeDark-Komponente
export const darkTheme = createTheme({
  // Palette für konsistente Farben
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6', // Blau, verwendet in Buttons und Icons
      dark: '#1e3a8a', // Dunkleres Blau für Gradienten
      light: '#93c5fd', // Helleres Blau für Texte und Akzente
      contrastText: '#fff', // Textfarbe auf primären Elementen
    },
    secondary: {
      main: '#34d399', // Grün, verwendet in Feedback-Button
      dark: '#166534', // Dunkleres Grün für Gradienten
      light: '#6ee7b7', // Helleres Grün für Texte
      contrastText: '#fff',
    },
    error: {
      main: '#f87171', // Rot für Fehlermeldungen (Alert)
      light: 'rgba(239, 68, 68, 0.1)', // Hintergrund für Alert
    },
    background: {
      default: '#0f172a', // Haupt-Hintergrundfarbe für die gesamte Seite
      paper: '#1e293b', // Hintergrund für Karten und Container
    },
    text: {
      primary: '#e0f2fe', // Haupt-Textfarbe (z. B. für Typography in Cards)
      secondary: '#93c5fd', // Sekundäre Textfarbe (z. B. für Captions)
    },
  },
  // Typografie für konsistente Schriftarten
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem', // Für "Willkommen zurück"
    },
    subtitle2: {
      fontWeight: 600,
      fontSize: '1rem', // Für Card-Titel
    },
    body2: {
      fontWeight: 600,
      fontSize: '0.875rem', // Für ListItem-Text
    },
    caption: {
      fontSize: '0.75rem', // Für kleinere Texte
    },
  },
  // Globale Komponenten-Styles
  components: {
    // CssBaseline für Body- und HTML-Styles
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          height: '100%', // Volle Höhe für HTML
          margin: 0,
        },
        body: {
          backgroundColor: '#0f172a', // Sicherstellen, dass der Body-Hintergrund dunkel ist
          margin: 0,
          minHeight: '100vh', // Mindesthöhe für die gesamte Seite
          overflowX: 'hidden', // Verhindert horizontales Scrollen
        },
      },
    },
    // Anpassungen für Buttons
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '16px', // Konsistente abgerundete Ecken
          textTransform: 'none', // Keine Großschreibung
          fontWeight: 600,
          padding: { xs: '6px 12px', sm: '8px 16px' },
        },
        contained: {
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', // Standard-Button-Gradient
          '&:hover': {
            background: 'linear-gradient(135deg, #1e40af 0%, #60a5fa 100%)', // Hover-Effekt
          },
        },
      },
    },
    // Anpassungen für ToggleButtonGroup
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b', // Passt zu background.paper
          borderRadius: '16px',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          color: '#3b82f6', // primary.main
          '&.Mui-selected': {
            backgroundColor: '#1e3a8a', // primary.dark
            color: '#fff',
            '&:hover': {
              backgroundColor: '#1e40af', // Etwas heller für Hover
            },
          },
        },
      },
    },
    // Anpassungen für Cards
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px', // Konsistente abgerundete Ecken
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', // Standard-Card-Gradient
          border: '1px solid rgba(59, 130, 246, 0.2)', // Konsistente Border
        },
      },
    },
    // Anpassungen für Alert
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)', // Konsistenter Fehler-Hintergrund
          color: '#f87171', // error.main
        },
      },
    },
    // Anpassungen für ListItem
    MuiListItem: {
      styleOverrides: {
        root: {
          padding: '0.5rem 0', // Konsistenter Abstand
        },
      },
    },
    // Anpassungen für Chip
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px', // Kleinere abgerundete Ecken für Chips
          fontSize: '0.65rem',
          height: '20px',
        },
      },
    },
    // Anpassungen für Divider
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(59, 130, 246, 0.2)', // Konsistente Divider-Farbe
        },
      },
    },
  },
});