const db = require('../config/db');

// Alle Trainingspläne eines Nutzers abrufen
exports.getTrainingsplaeneByNutzerId = async (req, res) => {
  try {
    const { nutzerId } = req.params;
    const [rows] = await db.query(`
      SELECT 
        ntp.id,
        ntp.nutzer_id,
        ntp.trainingsplan_id,
        tp.name as trainingsplan_name,
        ntp.uebung_id,
        u.name as uebung_name,
        u.zielmuskel,
        u.kategorie,
        ntp.reihenfolge,
        ntp.saetze,
        ntp.wiederholungen,
        ntp.notizen
      FROM nutzer_trainingsplan ntp
      JOIN trainingsplaene tp ON ntp.trainingsplan_id = tp.id
      JOIN übungen u ON ntp.uebung_id = u.id
      WHERE ntp.nutzer_id = ?
      ORDER BY ntp.trainingsplan_id, ntp.reihenfolge
    `, [nutzerId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Neue Übung zu Trainingsplan hinzufügen
exports.addUebungToTrainingsplan = async (req, res) => {
  try {
    const { nutzer_id, trainingsplan_id, uebung_id, reihenfolge, saetze, wiederholungen, notizen } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO nutzer_trainingsplan (nutzer_id, trainingsplan_id, uebung_id, reihenfolge, saetze, wiederholungen, notizen) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nutzer_id, trainingsplan_id, uebung_id, reihenfolge, saetze, wiederholungen, notizen]
    );
    res.status(201).json({ id: result.insertId, message: 'Übung zum Trainingsplan hinzugefügt' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Übung aus Trainingsplan löschen
exports.deleteUebungFromTrainingsplan = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM nutzer_trainingsplan WHERE id = ?', [id]);
    res.json({ message: 'Übung aus Trainingsplan entfernt' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};