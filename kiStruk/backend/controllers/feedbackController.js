const db = require('../config/db');

exports.createFeedback = async (req, res) => {
  const { nutzer_id, typ, titel, beschreibung } = req.body;

  // Validierung
  if (!nutzer_id || !typ || !titel || !beschreibung) {
    return res.status(400).json({ error: 'Alle Felder sind erforderlich' });
  }

  const validTypes = ['fehler', 'verbesserung', 'wunsch'];
  if (!validTypes.includes(typ)) {
    return res.status(400).json({ error: 'Ungültiger Feedback-Typ' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO feedback (nutzer_id, typ, titel, beschreibung) VALUES (?, ?, ?, ?)',
      [nutzer_id, typ, titel, beschreibung]
    );
    res.json({ id: result.insertId, message: 'Feedback gespeichert' });
  } catch (error) {
    console.error('Fehler beim Speichern des Feedbacks:', error);
    res.status(500).json({ error: 'Fehler beim Speichern des Feedbacks' });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const [feedback] = await db.query(
      'SELECT f.*, n.vname, n.nname FROM feedback f JOIN nutzer n ON f.nutzer_id = n.id ORDER BY f.erstellt_am DESC'
    );
    res.json(feedback);
  } catch (error) {
    console.error('Fehler beim Abrufen des Feedbacks:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen des Feedbacks' });
  }
};

exports.updateFeedbackStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatus = ['neu', 'in_bearbeitung', 'erledigt'];
  if (!validStatus.includes(status)) {
    return res.status(400).json({ error: 'Ungültiger Status' });
  }

  try {
    await db.query('UPDATE feedback SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status aktualisiert' });
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Status:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Status' });
  }
};

exports.deleteFeedback = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM feedback WHERE id = ?', [id]);
    res.json({ message: 'Feedback gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Feedbacks:', error);
    res.status(500).json({ error: 'Fehler beim Löschen des Feedbacks' });
  }
};