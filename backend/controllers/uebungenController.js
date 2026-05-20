const db = require('../config/db');

// Alle uebungen abrufen
exports.getAllUebungen = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM uebungen');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// uebungen nach Kategorie filtern
exports.getUebungenByKategorie = async (req, res) => {
  try {
    const { kategorie } = req.params;
    const [rows] = await db.query('SELECT * FROM uebungen WHERE kategorie = ?', [kategorie]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Einzelne Übung abrufen
exports.getUebungById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM uebungen WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Übung nicht gefunden' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Benutzerdefinierte Übung erstellen
exports.createUserUebung = async (req, res) => {
  try {
    const { name, beschreibung, zielmuskel, kategorie } = req.body;
    const userId = req.user.id;
    console.log(userId, name, beschreibung, zielmuskel, kategorie)

    await db.query(
      'INSERT INTO nutzer_eigene_uebungen (nutzer_id, uebung_name, uebung_beschreibung, zielmuskel, kategorie) VALUES (?, ?, ?, ?, ?)',
      [userId, name, beschreibung, zielmuskel, kategorie]
    );

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Alle Übungen eines Benutzers abrufen
exports.getUebungByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM nutzer_eigene_uebungen WHERE nutzer_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Übung nicht gefunden' });
    }
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};