const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  let token;

  try {
    // 1. **Prüfe auf Bearer Token im Authorization Header (Für ESP32/APIs)**
    // Der ESP32 sendet: 'Authorization: Bearer <token>'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      // Token aus dem String 'Bearer <token>' extrahieren
      token = req.headers.authorization.split(' ')[1];
    } 
    
    // 2. **Fallback: Prüfe auf authToken Cookie (Für Webbrowser)**
    else if (req.cookies.authToken) {
      token = req.cookies.authToken;
    }

    // 3. Wenn immer noch kein Token vorhanden
    if (!token) {
      return res.status(401).json({ error: 'Kein Token vorhanden. Bitte einloggen.' });
    }

    // 4. Token verifizieren (unabhängig von der Quelle)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Nutzer-Informationen an Request anhängen
    req.user = decoded;

    // Weiter zur nächsten Funktion
    next();
  } catch (error) {
    // Fehlerbehandlung
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token abgelaufen. Bitte erneut einloggen.' });
    }
    // Logge den Fehler für Debugging auf dem Server
    console.error('JWT Verifizierungsfehler:', error.message); 
    return res.status(401).json({ error: 'Ungültiger Token.' });
  }
};

module.exports = authMiddleware;