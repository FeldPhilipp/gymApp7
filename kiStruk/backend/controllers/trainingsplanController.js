const db = require('../config/db');

// Alle Trainingspläne abrufen
exports.getAllTrainingsplaene = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM trainingsplaene');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Einzelnen Trainingsplan abrufen
exports.getTrainingsplanById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM trainingsplaene WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Trainingsplan nicht gefunden' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};