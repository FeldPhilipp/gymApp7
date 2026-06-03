const db = require('../config/db');

// Alle eigenen Trainingspläne eines Nutzers
exports.getEigeneTrainingsplaene = async (req, res) => {
  try {
    const { nutzerId } = req.params;
    const [plaene] = await db.query(`
      SELECT 
        id,
        name,
        beschreibung,
        erstellt_am,
        aktualisiert_am
      FROM nutzer_eigene_trainingsplaene
      WHERE nutzer_id = ?
      ORDER BY aktualisiert_am DESC
    `, [nutzerId]);

    res.json(plaene);
  } catch (error) {
    console.error('Fehler beim Abrufen eigener Pläne:', error);
    res.status(500).json({ error: error.message });
  }
};

// Einzelnen eigenen Trainingsplan mit Übungen
exports.getEigenerTrainingsplanById = async (req, res) => {
  try {
    const { planId } = req.params;
    const { nutzerId } = req.query;

    // Plan-Details
    const [plan] = await db.query(`
      SELECT *
      FROM nutzer_eigene_trainingsplaene
      WHERE id = ? AND nutzer_id = ?
    `, [planId, nutzerId]);

    if (plan.length === 0) {
      return res.status(404).json({ error: 'Plan nicht gefunden' });
    }

    // Übungen des Plans
    // Wenn die übung eine eigene Nutzerübung ist, liefern wir die Felder aus
    // nutzer_eigene_uebungen, andernfalls aus der Standard-Tabelle uebungen.
    const [uebungen] = await db.query(`
      SELECT 
        neu.id,
        neu.uebung_id,
        COALESCE(ue.uebung_name, u.name) as uebung_name,
        COALESCE(ue.zielmuskel, u.zielmuskel) as zielmuskel,
        COALESCE(ue.kategorie, u.kategorie) as kategorie,
        COALESCE(ue.uebung_beschreibung, u.beschreibung) as beschreibung,
        neu.reihenfolge,
        neu.empfohlene_saetze,
        neu.empfohlene_wiederholungen,
        neu.notizen,
        neu.eigene_uebung
      FROM nutzer_eigene_trainingsplan_uebungen neu
      LEFT JOIN uebungen u ON neu.uebung_id = u.id AND (neu.eigene_uebung = 0 OR neu.eigene_uebung IS NULL)
      LEFT JOIN nutzer_eigene_uebungen ue ON neu.uebung_id = ue.id AND neu.eigene_uebung = 1
      WHERE neu.eigener_trainingsplan_id = ?
      ORDER BY neu.reihenfolge ASC
    `, [planId]);

    res.json({
      plan: plan[0],
      uebungen: uebungen
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Plans:', error);
    res.status(500).json({ error: error.message });
  }
};

// Neuen eigenen Trainingsplan erstellen
exports.createEigenerTrainingsplan = async (req, res) => {
  try {
    const { nutzer_id, name, beschreibung } = req.body;

    if (!nutzer_id || !name) {
      return res.status(400).json({ error: 'Nutzer-ID und Name sind erforderlich' });
    }

    const [result] = await db.query(
      'INSERT INTO nutzer_eigene_trainingsplaene (nutzer_id, name, beschreibung) VALUES (?, ?, ?)',
      [nutzer_id, name, beschreibung]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Trainingsplan erstellt'
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des Plans:', error);
    res.status(500).json({ error: error.message });
  }
};

// Trainingsplan aktualisieren
exports.updateEigenerTrainingsplan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { nutzer_id, name, beschreibung } = req.body;

    // Prüfen ob Plan dem Nutzer gehört
    const [plan] = await db.query(
      'SELECT * FROM nutzer_eigene_trainingsplaene WHERE id = ? AND nutzer_id = ?',
      [planId, nutzer_id]
    );

    if (plan.length === 0) {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }

    await db.query(
      'UPDATE nutzer_eigene_trainingsplaene SET name = ?, beschreibung = ? WHERE id = ?',
      [name, beschreibung, planId]
    );

    res.json({ message: 'Trainingsplan aktualisiert' });
  } catch (error) {
    console.error('Fehler beim Aktualisieren:', error);
    res.status(500).json({ error: error.message });
  }
};

// Trainingsplan löschen
exports.deleteEigenerTrainingsplan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { nutzer_id } = req.body;

    // Prüfen ob Plan dem Nutzer gehört
    const [plan] = await db.query(
      'SELECT * FROM nutzer_eigene_trainingsplaene WHERE id = ? AND nutzer_id = ?',
      [planId, nutzer_id]
    );

    if (plan.length === 0) {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }

    await db.query('DELETE FROM nutzer_eigene_trainingsplaene WHERE id = ?', [planId]);

    res.json({ message: 'Trainingsplan gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen:', error);
    res.status(500).json({ error: error.message });
  }
};

// Übung zum Plan hinzufügen
exports.addUebungToPlan = async (req, res) => {
  try {
    const { eigener_trainingsplan_id, uebung_id, reihenfolge, notizen, nutzer_id, eigene_uebung = 0 } = req.body;

    // Prüfen ob Plan dem Nutzer gehört
    const [plan] = await db.query(
      'SELECT * FROM nutzer_eigene_trainingsplaene WHERE id = ? AND nutzer_id = ?',
      [eigener_trainingsplan_id, nutzer_id]
    );

    if (plan.length === 0) {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }

    const [result] = await db.query(
      'INSERT INTO nutzer_eigene_trainingsplan_uebungen (eigener_trainingsplan_id, uebung_id, reihenfolge, notizen, eigene_uebung) VALUES (?, ?, ?, ?, ?)',
      [eigener_trainingsplan_id, uebung_id, reihenfolge, notizen, eigene_uebung ? 1 : 0]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Übung hinzugefügt'
    });
  } catch (error) {
    console.error('Fehler beim Hinzufügen der Übung:', error);
    res.status(500).json({ error: error.message });
  }
};

// Übung aus Plan entfernen
exports.deleteUebungFromPlan = async (req, res) => {
  try {
    const { uebungId } = req.params;
    const { nutzer_id } = req.body;

    // Prüfen ob Übung zu einem Plan des Nutzers gehört
    const [uebung] = await db.query(`
      SELECT neu.*
      FROM nutzer_eigene_trainingsplan_uebungen neu
      JOIN nutzer_eigene_trainingsplaene netp ON neu.eigener_trainingsplan_id = netp.id
      WHERE neu.id = ? AND netp.nutzer_id = ?
    `, [uebungId, nutzer_id]);

    if (uebung.length === 0) {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }

    await db.query('DELETE FROM nutzer_eigene_trainingsplan_uebungen WHERE id = ?', [uebungId]);

    res.json({ message: 'Übung entfernt' });
  } catch (error) {
    console.error('Fehler beim Entfernen der Übung:', error);
    res.status(500).json({ error: error.message });
  }
};

// Übung im Plan aktualisieren
exports.updateUebungInPlan = async (req, res) => {
  try {
    const { uebungId } = req.params;
    const { reihenfolge, empfohlene_saetze, empfohlene_wiederholungen, notizen, nutzer_id, eigene_uebung } = req.body;

    // Prüfen ob Übung zu einem Plan des Nutzers gehört
    const [uebung] = await db.query(`
      SELECT neu.*
      FROM nutzer_eigene_trainingsplan_uebungen neu
      JOIN nutzer_eigene_trainingsplaene netp ON neu.eigener_trainingsplan_id = netp.id
      WHERE neu.id = ? AND netp.nutzer_id = ?
    `, [uebungId, nutzer_id]);

    if (uebung.length === 0) {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }

    await db.query(
      'UPDATE nutzer_eigene_trainingsplan_uebungen SET reihenfolge = ?, empfohlene_saetze = ?, empfohlene_wiederholungen = ?, notizen = ?, eigene_uebung = ? WHERE id = ?',
      [reihenfolge, empfohlene_saetze, empfohlene_wiederholungen, notizen, eigene_uebung ? 1 : 0, uebungId]
    );

    res.json({ message: 'Übung aktualisiert' });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Übung:', error);
    res.status(500).json({ error: error.message });
  }
};

// Alle verfügbaren Übungen für Auswahl
exports.getAlleVerfuegbareUebungen = async (req, res) => {
  try {
    const [uebungen] = await db.query(`
      SELECT 
        id,
        name,
        zielmuskel,
        kategorie,
        beschreibung
      FROM uebungen
      ORDER BY kategorie, name ASC
    `);

    res.json(uebungen);
  } catch (error) {
    console.error('Fehler beim Abrufen der Übungen:', error);
    res.status(500).json({ error: error.message });
  }
};