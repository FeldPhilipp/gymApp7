const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login - ANGEPASST FÜR COOKIE-BASED AUTH
exports.login = async (req, res) => {
  try {
    const { email, pw } = req.body;

    // Validierung
    if (!email || !pw) {
      return res.status(400).json({ error: 'E-Mail und Passwort sind erforderlich' });
    }

    // Nutzer in DB suchen
    const [rows] = await db.query('SELECT * FROM nutzer WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    const nutzer = rows[0];

    // Passwort mit bcrypt vergleichen
    const passwordMatch = await bcrypt.compare(pw, nutzer.pw);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    // JWT-Token erstellen
    const token = jwt.sign(
      {
        id: nutzer.id,
        email: nutzer.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token ist 7 Tage gültig
    );

    // ⭐ NEU: Token als httpOnly Cookie setzen
    res.cookie('authToken', token, {
      httpOnly: true,        // Nicht von JavaScript zugreifbar (XSS-Schutz)
      secure: process.env.NODE_ENV === 'production', // Nur HTTPS in Production
      sameSite: 'strict',    // CSRF-Schutz
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Tage in Millisekunden
      path: '/'
    });

    // Passwort aus Response entfernen (Sicherheit!)
    delete nutzer.pw;
    delete nutzer.is_admin;

    // ⭐ GEÄNDERT: Token NICHT mehr im Response-Body!
    res.json({
      message: 'Erfolgreich angemeldet',
      token: token,
      nutzer: nutzer
      // token: token  ← ENTFERNT!
    });

  } catch (error) {
    console.error('Login-Fehler:', error);
    res.status(500).json({ error: error.message });
  }
};

// ⭐ NEU: Session-Validierung
exports.validateSession = async (req, res) => {
  try {
    // req.user wird durch authenticateToken Middleware gesetzt
    const userId = req.user.id;

    const [rows] = await db.query(
      'SELECT id, vname, nname, email, geb_datum, geschlecht, gewicht, start_gewicht, ziel_gewicht, groesse FROM nutzer WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Session ungültig' });
    }

    res.json({
      success: true,
      nutzer: rows[0]
    });
  } catch (error) {
    console.error('Session-Validierung Fehler:', error);
    res.status(401).json({ error: 'Session ungültig' });
  }
};

// ⭐ NEU: Logout
exports.logout = async (req, res) => {
  try {
    // Cookie löschen
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    res.json({
      success: true,
      message: 'Erfolgreich abgemeldet'
    });
  } catch (error) {
    console.error('Logout-Fehler:', error);
    res.status(500).json({ error: error.message });
  }
};

// Registrierung
exports.createNutzer = async (req, res) => {
  try {
    const { vname, nname, email, pw, geb_datum, geschlecht, gewicht, ziel_gewicht, groesse } = req.body;

    // Validierung
    if (!email || !pw) {
      return res.status(400).json({ error: 'E-Mail und Passwort sind erforderlich' });
    }

    if (pw.length < 6) {
      return res.status(400).json({ error: 'Passwort muss mindestens 6 Zeichen lang sein' });
    }

    // Passwort hashen (Sicherheit!)
    const hashedPassword = await bcrypt.hash(pw, 10);

    const [result] = await db.query(
      'INSERT INTO nutzer (vname, nname, email, pw, geb_datum, geschlecht, gewicht, start_gewicht, ziel_gewicht, groesse) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [vname || '', nname || '', email, hashedPassword, geb_datum, geschlecht || 'd', gewicht, gewicht, ziel_gewicht, groesse]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Nutzer erfolgreich registriert',
      nutzer: {
        id: result.insertId,
        vname: vname || '',
        nname: nname || '',
        email
      }
    });
  } catch (error) {
    console.error('Registrierungs-Fehler:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'E-Mail bereits registriert' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.isAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT is_admin FROM nutzer WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Nutzer nicht gefunden' });
    }
    res.json({ isAdmin: rows[0].is_admin === 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Alle Nutzer abrufen
exports.getAllNutzer = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, vname, nname, email, geb_datum, geschlecht, gewicht, ziel_gewicht, groesse, is_admin FROM nutzer');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Einzelnen Nutzer abrufen
exports.getNutzerById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT id, vname, nname, email, geb_datum, geschlecht, gewicht, start_gewicht, ziel_gewicht, groesse, is_admin FROM nutzer WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Nutzer nicht gefunden' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Nutzer aktualisieren
exports.updateNutzer = async (req, res) => {
  try {
    const { id } = req.params;
    const { vname, nname, email, geb_datum, geschlecht, gewicht, start_gewicht, ziel_gewicht, groesse } = req.body;

    await db.query(
      'UPDATE nutzer SET vname = ?, nname = ?, email = ?, geb_datum = ?, geschlecht = ?, gewicht = ?, start_gewicht = ?, ziel_gewicht = ?, groesse = ? WHERE id = ?',
      [vname, nname, email, geb_datum, geschlecht, gewicht, start_gewicht, ziel_gewicht, groesse, id]
    );
    res.json({ message: 'Nutzer aktualisiert' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Passwort vergessen - Token generieren und E-Mail senden
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'E-Mail ist erforderlich' });
    }

    // Nutzer in DB suchen
    const [rows] = await db.query('SELECT * FROM nutzer WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'E-Mail nicht gefunden' });
    }

    // Token generieren (zufällig, 32 Zeichen)
    const resetToken = require('crypto').randomBytes(16).toString('hex');
    const expiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 Stunde gültig

    // Token in DB speichern
    await db.query('UPDATE nutzer SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
      [resetToken, expiry, email]
    );

    // E-Mail senden
    const { sendPasswordResetEmail } = require('../services/emailService');
    await sendPasswordResetEmail(email, resetToken);

    res.json({ message: 'E-Mail mit Reset-Link versendet' });

  } catch (error) {
    console.error('Fehler bei Passwort vergessen:', error);
    res.status(500).json({ error: error.message });
  }
};

// Passwort zurücksetzen mit Token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token und neues Passwort erforderlich' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Passwort muss mindestens 6 Zeichen lang sein' });
    }

    // Nutzer mit Token suchen
    const [rows] = await db.query(
      'SELECT * FROM nutzer WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Token ungültig oder abgelaufen' });
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Passwort aktualisieren und Token löschen
    await db.query(
      'UPDATE nutzer SET pw = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, rows[0].id]
    );

    res.json({ message: 'Passwort erfolgreich zurückgesetzt' });

  } catch (error) {
    console.error('Fehler beim Passwort zurücksetzen:', error);
    res.status(500).json({ error: error.message });
  }
};

// Passwort ändern (authentifizierter Nutzer)
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Altes und neues Passwort erforderlich' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Passwort muss mindestens 6 Zeichen lang sein' });
    }

    // Nutzer abrufen
    const [rows] = await db.query('SELECT * FROM nutzer WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Nutzer nicht gefunden' });
    }

    // Altes Passwort überprüfen
    const passwordMatch = await bcrypt.compare(oldPassword, rows[0].pw);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Altes Passwort ist falsch' });
    }

    // Neues Passwort hashen
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Passwort aktualisieren
    await db.query('UPDATE nutzer SET pw = ? WHERE id = ?', [hashedPassword, id]);

    res.json({ message: 'Passwort erfolgreich geändert' });

  } catch (error) {
    console.error('Fehler beim Passwort ändern:', error);
    res.status(500).json({ error: error.message });
  }
};

// Füge diese Funktion hinzu, um Zieldatum und Aktivitätslevel zu aktualisieren
exports.updateZielEinstellungen = async (req, res) => {
  try {
    const { id } = req.params;
    const { ziel_gewicht, ziel_datum, aktivitaetslevel, start_gewicht } = req.body;

    const updates = [];
    const values = [];

    if (ziel_gewicht !== undefined) {
      updates.push('ziel_gewicht = ?');
      values.push(ziel_gewicht);
    }
    if (ziel_datum !== undefined) {
      updates.push('ziel_datum = ?');
      values.push(ziel_datum);
    }
    if (aktivitaetslevel !== undefined) {
      updates.push('aktivitaetslevel = ?');
      values.push(aktivitaetslevel);
    }
    if (start_gewicht !== undefined) {
      updates.push('start_gewicht = ?');
      values.push(start_gewicht);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Keine zu aktualisierenden Felder' });
    }

    values.push(id);

    await db.query(
      `UPDATE nutzer SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ message: 'Ziel-Einstellungen aktualisiert' });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Ziel-Einstellungen:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.setPremium = async (req, res) => {
  try {
    const { id } = req.body;
    await db.query('UPDATE nutzer SET premium_status = 1 WHERE id = ?', [id]);
    res.json({ message: 'Nutzer auf Premium upgegradet' });
  } catch (error) {
    console.error('Fehler beim Upgraden auf Premium:', error);
    res.status(500).json({ error: error.message });
  }
}