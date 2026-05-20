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

// Neue Übung erstellen
exports.createUebung = async (req, res) => {
  try {
    const { name, zielmuskel, kategorie, beschreibung, sicherheitshinweise } = req.body;
    const [result] = await db.query(
      'INSERT INTO uebungen (name, zielmuskel, kategorie, beschreibung, sicherheitshinweise) VALUES (?, ?, ?, ?, ?)',
      [name, zielmuskel, kategorie, beschreibung, sicherheitshinweise]
    );
    res.status(201).json({ id: result.insertId, message: 'Übung erstellt' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};