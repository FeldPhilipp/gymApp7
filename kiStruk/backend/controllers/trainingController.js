const db = require('../config/db');

// Alle Trainingspläne abrufen
exports.getAllTrainingsplaene = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM trainingsplaene');
    res.json(rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Trainingspläne:', error);
    res.status(500).json({ error: error.message });
  }
};

// Übungen eines Trainingsplans abrufen
exports.getUebungenByPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { nutzerId } = req.query;

    const [rows] = await db.query(`
      SELECT 
        ntp.id as nutzer_trainingsplan_id,
        ntp.reihenfolge,
        ntp.saetze as geplante_saetze,
        ntp.wiederholungen as geplante_wiederholungen,
        ntp.gewicht_kg as geplantes_gewicht,
        ntp.notizen,
        u.id as uebung_id,
        u.name as uebung_name,
        u.zielmuskel,
        u.kategorie,
        u.beschreibung
      FROM nutzer_trainingsplan ntp
      JOIN uebungen u ON ntp.uebung_id = u.id
      WHERE ntp.trainingsplan_id = ? AND ntp.nutzer_id = ?
      ORDER BY ntp.reihenfolge
    `, [planId, nutzerId]);

    res.json(rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Übungen:', error);
    res.status(500).json({ error: error.message });
  }
};

// Letzte Ergebnisse einer Übung abrufen (für History)
// NEU: gibt ist_dropsatz mit zurück
exports.getLetzteErgebnisse = async (req, res) => {
  try {
    const { uebungId } = req.params;
    const { nutzerId, eigeneUebung } = req.query;
    const eigeneUebungFlag = eigeneUebung ? parseInt(eigeneUebung, 10) : 0;

    const [rows] = await db.query(`
      SELECT 
        ts.id as session_id,
        te.erstellt_am,
        te.satz_nummer,
        te.wiederholungen,
        te.gewicht_kg,
        te.notizen,
        te.ist_dropsatz
      FROM trainings_ergebnisse te
      JOIN trainings_sessions ts ON te.session_id = ts.id
      WHERE te.uebung_id = ? AND te.eigene_uebung = ? AND ts.nutzer_id = ?
      ORDER BY ts.datum DESC, te.erstellt_am DESC, te.satz_nummer ASC
    `, [uebungId, eigeneUebungFlag, nutzerId]);

    res.json(rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der letzten Ergebnisse:', error);
    res.status(500).json({ error: error.message });
  }
};

// Neue Training Session erstellen
exports.createSession = async (req, res) => {
  try {
    const { nutzer_id, trainingsplan_id, trainingsplan_typ, datum, startzeit, endzeit, notizen, ergebnisse } = req.body;

    const planTyp = trainingsplan_typ || 'standard';
    if (!['standard', 'custom'].includes(planTyp)) {
      return res.status(400).json({ error: 'Ungültiger Trainingsplan-Typ' });
    }

    const standard_plan_id = planTyp === 'standard' ? trainingsplan_id : null;
    const custom_plan_id   = planTyp === 'custom'   ? trainingsplan_id : null;

    const [sessionResult] = await db.query(
      'INSERT INTO trainings_sessions (nutzer_id, standard_plan_id, custom_plan_id, trainingsplan_typ, datum, startzeit, endzeit, notizen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nutzer_id, standard_plan_id, custom_plan_id, planTyp, datum, startzeit, endzeit, notizen]
    );

    const sessionId = sessionResult.insertId;

    if (ergebnisse && ergebnisse.length > 0) {
      // NEU: ist_dropsatz aus dem Request übernehmen (Fallback 0)
      const values = ergebnisse.map(e => [
        sessionId,
        e.uebung_id,
        e.satz_nummer,
        e.wiederholungen,
        e.gewicht_kg,
        e.notizen,
        e.eigene_uebung  || 0,
        e.ist_dropsatz   || 0,   // NEU
      ]);

      await db.query(
        'INSERT INTO trainings_ergebnisse (session_id, uebung_id, satz_nummer, wiederholungen, gewicht_kg, notizen, eigene_uebung, ist_dropsatz) VALUES ?',
        [values]
      );
    }

    res.status(201).json({ message: 'Training erfolgreich gespeichert', sessionId });
  } catch (error) {
    console.error('Fehler beim Speichern der Session:', error);
    res.status(500).json({ error: error.message });
  }
};

// Alle Sessions eines Nutzers
exports.getSessionsByNutzer = async (req, res) => {
  try {
    const { nutzerId } = req.params;

    const [rows] = await db.query(`
      SELECT 
        ts.id,
        ts.datum,
        ts.startzeit,
        ts.endzeit,
        ts.notizen,
        ts.trainingsplan_typ,
        ts.standard_plan_id,
        ts.custom_plan_id,
        CASE 
          WHEN ts.trainingsplan_typ = 'custom' THEN netp.name
          ELSE tp.name
        END as trainingsplan_name
      FROM trainings_sessions ts
      LEFT JOIN trainingsplaene tp ON ts.standard_plan_id = tp.id
      LEFT JOIN nutzer_eigene_trainingsplaene netp ON ts.custom_plan_id = netp.id
      WHERE ts.nutzer_id = ?
      ORDER BY ts.datum DESC
    `, [nutzerId]);

    res.json(rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Sessions:', error);
    res.status(500).json({ error: error.message });
  }
};

// Standard-Übungen oder letzte Übungen eines Plans für einen Nutzer
exports.getUebungenFuerPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { nutzerId, planTyp } = req.query;
    const typ = planTyp || 'standard';

    if (typ === 'custom') {
      const [rows] = await db.query(`
        SELECT 
          netu.reihenfolge,
          netu.empfohlene_saetze,
          netu.empfohlene_wiederholungen,
          netu.eigene_uebung,
          COALESCE(nu.uebung_name, u.name) as uebung_name,
          COALESCE(nu.zielmuskel, u.zielmuskel) as zielmuskel,
          COALESCE(nu.kategorie, u.kategorie) as kategorie,
          COALESCE(nu.uebung_beschreibung, u.beschreibung) as beschreibung,
          netu.uebung_id
        FROM nutzer_eigene_trainingsplan_uebungen netu
        LEFT JOIN uebungen u ON netu.uebung_id = u.id AND (netu.eigene_uebung = 0 OR netu.eigene_uebung IS NULL)
        LEFT JOIN nutzer_eigene_uebungen nu ON netu.uebung_id = nu.id AND netu.eigene_uebung = 1
        WHERE netu.eigener_trainingsplan_id = ?
        ORDER BY netu.reihenfolge
      `, [planId]);

      return res.json({ source: 'custom', uebungen: rows });
    }

    const [historie] = await db.query(`
      SELECT DISTINCT uebung_id
      FROM nutzer_trainingsplan_historie
      WHERE nutzer_id = ? AND trainingsplan_id = ?
    `, [nutzerId, planId]);

    if (historie.length > 0) {
      const [rows] = await db.query(`
        SELECT 
          nth.reihenfolge,
          u.id as uebung_id,
          u.name as uebung_name,
          u.zielmuskel,
          u.kategorie,
          u.beschreibung
        FROM nutzer_trainingsplan_historie nth
        JOIN uebungen u ON nth.uebung_id = u.id
        WHERE nth.nutzer_id = ? AND nth.trainingsplan_id = ?
        ORDER BY nth.reihenfolge
      `, [nutzerId, planId]);

      return res.json({ source: 'historie', uebungen: rows });
    }

    const [rows] = await db.query(`
      SELECT 
        tsu.reihenfolge,
        tsu.empfohlene_saetze,
        tsu.empfohlene_wiederholungen,
        u.id as uebung_id,
        u.name as uebung_name,
        u.zielmuskel,
        u.kategorie,
        u.beschreibung
      FROM trainingsplan_standard_uebungen tsu
      JOIN uebungen u ON tsu.uebung_id = u.id
      WHERE tsu.trainingsplan_id = ?
      ORDER BY tsu.reihenfolge
    `, [planId]);

    return res.json({ source: 'standard', uebungen: rows });
  } catch (error) {
    console.error('Fehler beim Abrufen der Übungen für Plan:', error);
    res.status(500).json({ error: error.message });
  }
};

// Session speichern UND Historie aktualisieren
// NEU: ist_dropsatz wird korrekt gespeichert
exports.createSessionMitHistorie = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      nutzer_id,
      trainingsplan_id,
      trainingsplan_typ,
      datum,
      startzeit,
      endzeit,
      notizen,
      ergebnisse,
      uebungen_reihenfolge
    } = req.body;

    const planTyp = trainingsplan_typ || 'standard';
    if (!['standard', 'custom'].includes(planTyp)) {
      await connection.rollback();
      return res.status(400).json({ error: 'Ungültiger Trainingsplan-Typ' });
    }

    const standard_plan_id = planTyp === 'standard' ? trainingsplan_id : null;
    const custom_plan_id   = planTyp === 'custom'   ? trainingsplan_id : null;

    // 1. Session erstellen
    const [sessionResult] = await connection.query(
      'INSERT INTO trainings_sessions (nutzer_id, standard_plan_id, custom_plan_id, trainingsplan_typ, datum, startzeit, endzeit, notizen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nutzer_id, standard_plan_id, custom_plan_id, planTyp, datum, startzeit, endzeit, notizen]
    );

    const sessionId = sessionResult.insertId;

    // 2. Ergebnisse einfügen (normale Sätze + Dropsätze in einem INSERT)
    // NEU: ist_dropsatz als Spalte hinzugefügt
    if (ergebnisse && ergebnisse.length > 0) {
      const values = ergebnisse.map(e => [
        sessionId,
        e.uebung_id,
        e.satz_nummer,
        e.wiederholungen,
        e.gewicht_kg,
        e.notizen,
        e.eigene_uebung  || 0,
        e.ist_dropsatz   || 0,   // NEU
      ]);

      await connection.query(
        'INSERT INTO trainings_ergebnisse (session_id, uebung_id, satz_nummer, wiederholungen, gewicht_kg, notizen, eigene_uebung, ist_dropsatz) VALUES ?',
        [values]
      );
    }

    // 3. Historie aktualisieren (nur Standard-Pläne)
    if (planTyp === 'standard' && uebungen_reihenfolge && uebungen_reihenfolge.length > 0) {
      await connection.query(
        'DELETE FROM nutzer_trainingsplan_historie WHERE nutzer_id = ? AND trainingsplan_id = ?',
        [nutzer_id, trainingsplan_id]
      );

      const historieValues = uebungen_reihenfolge.map(u => [
        nutzer_id,
        trainingsplan_id,
        u.uebung_id,
        u.reihenfolge,
      ]);

      await connection.query(
        'INSERT INTO nutzer_trainingsplan_historie (nutzer_id, trainingsplan_id, uebung_id, reihenfolge) VALUES ?',
        [historieValues]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Training erfolgreich gespeichert', sessionId });

  } catch (error) {
    await connection.rollback();
    console.error('Fehler beim Speichern der Session:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// Dashboard-Statistiken für Home
// NEU: Highscores und Verbesserungen ignorieren Dropsätze (ist_dropsatz = 0)
exports.getDashboardStats = async (req, res) => {
  try {
    const { nutzerId } = req.params;
    const { gruppeId }  = req.query;

    // 1. Letzte Trainings
    const [letzteTrainings] = await db.query(`
      SELECT 
        ts.id,
        ts.datum,
        ts.trainingsplan_typ,
        CASE 
          WHEN ts.trainingsplan_typ = 'custom' THEN netp.name
          ELSE tp.name
        END as trainingsplan_name,
        COUNT(DISTINCT te.uebung_id) as anzahl_uebungen
      FROM trainings_sessions ts
      LEFT JOIN trainingsplaene tp ON ts.standard_plan_id = tp.id
      LEFT JOIN nutzer_eigene_trainingsplaene netp ON ts.custom_plan_id = netp.id
      LEFT JOIN trainings_ergebnisse te ON ts.id = te.session_id
      WHERE ts.nutzer_id = ?
      GROUP BY ts.id
      ORDER BY ts.datum DESC
    `, [nutzerId]);

    // 2. Beste Fortschritte – nur normale Sätze (ist_dropsatz = 0)
    //    Optimiert: ein LEFT JOIN statt drei korrelierte Subqueries
    const [verbesserungen] = await db.query(`
      SELECT 
        u.name          as uebung_name,
        u.zielmuskel,
        MAX(te.gewicht_kg)   as aktuell,
        MAX(te_alt.gewicht_kg) as vor_30_tagen,
        MAX(te.gewicht_kg) - MAX(te_alt.gewicht_kg) as steigerung
      FROM trainings_ergebnisse te
      JOIN trainings_sessions ts ON te.session_id = ts.id
      JOIN uebungen u ON te.uebung_id = u.id
      LEFT JOIN trainings_ergebnisse te_alt
        ON te_alt.uebung_id = te.uebung_id
        AND te_alt.ist_dropsatz = 0
        AND te_alt.session_id IN (
          SELECT id FROM trainings_sessions
          WHERE nutzer_id = ?
          AND datum < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        )
      WHERE ts.nutzer_id = ?
        AND ts.datum >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        AND te.ist_dropsatz = 0
      GROUP BY te.uebung_id
      HAVING steigerung > 0
      ORDER BY steigerung DESC
      LIMIT 5
    `, [nutzerId, nutzerId]);

    // 3. Highscores – nur normale Sätze (ist_dropsatz = 0)
    let highscores;
    if (gruppeId) {
      const [groupHighscores] = await db.query(`
        SELECT 
          u.name as uebung_name,
          u.zielmuskel,
          n.vname,
          n.nname,
          ts.nutzer_id,
          MAX(te.gewicht_kg) as max_gewicht
        FROM trainings_ergebnisse te
        JOIN trainings_sessions ts ON te.session_id = ts.id
        JOIN uebungen u ON te.uebung_id = u.id
        JOIN nutzer n ON ts.nutzer_id = n.id
        WHERE ts.nutzer_id IN (
          SELECT nutzer_id FROM gruppen_mitglieder WHERE gruppe_id = ?
        )
        AND te.ist_dropsatz = 0
        GROUP BY te.uebung_id, ts.nutzer_id
        HAVING max_gewicht = (
          SELECT MAX(te2.gewicht_kg)
          FROM trainings_ergebnisse te2
          JOIN trainings_sessions ts2 ON te2.session_id = ts2.id
          WHERE te2.uebung_id = te.uebung_id
            AND te2.ist_dropsatz = 0
            AND ts2.nutzer_id IN (
              SELECT nutzer_id FROM gruppen_mitglieder WHERE gruppe_id = ?
            )
        )
        ORDER BY u.name
        LIMIT 10
      `, [gruppeId, gruppeId]);
      highscores = groupHighscores;
    } else {
      const [personalHighscores] = await db.query(`
        SELECT 
          u.name as uebung_name,
          u.zielmuskel,
          n.vname,
          n.nname,
          ts.nutzer_id,
          MAX(te.gewicht_kg) as max_gewicht
        FROM trainings_ergebnisse te
        JOIN trainings_sessions ts ON te.session_id = ts.id
        JOIN uebungen u ON te.uebung_id = u.id
        JOIN nutzer n ON ts.nutzer_id = n.id
        WHERE ts.nutzer_id = ?
          AND te.ist_dropsatz = 0
        GROUP BY te.uebung_id
        ORDER BY u.name
        LIMIT 10
      `, [nutzerId]);
      highscores = personalHighscores;
    }

    res.json({ letzteTrainings, verbesserungen, highscores, isGruppenAnsicht: !!gruppeId });

  } catch (error) {
    console.error('Fehler beim Abrufen der Dashboard-Stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// Session-Details abrufen
exports.getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const [rows] = await db.query(`
      SELECT 
        ts.id,
        ts.nutzer_id,
        ts.standard_plan_id,
        ts.custom_plan_id,
        ts.trainingsplan_typ,
        ts.datum,
        ts.startzeit,
        ts.endzeit,
        ts.notizen,
        CASE 
          WHEN ts.trainingsplan_typ = 'custom' THEN netp.name
          ELSE tp.name
        END as trainingsplan_name,
        n.vname,
        n.nname
      FROM trainings_sessions ts
      LEFT JOIN trainingsplaene tp ON ts.standard_plan_id = tp.id
      LEFT JOIN nutzer_eigene_trainingsplaene netp ON ts.custom_plan_id = netp.id
      JOIN nutzer n ON ts.nutzer_id = n.id
      WHERE ts.id = ?
    `, [sessionId]);

    if (rows.length === 0) return res.status(404).json({ error: 'Session nicht gefunden' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Fehler beim Abrufen der Session-Details:', error);
    res.status(500).json({ error: error.message });
  }
};

// Ergebnisse einer Session abrufen
// NEU: ist_dropsatz in beiden Abfragepfaden enthalten
exports.getSessionErgebnisse = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const [session] = await db.query(
      'SELECT nutzer_id, standard_plan_id, custom_plan_id, trainingsplan_typ FROM trainings_sessions WHERE id = ?',
      [sessionId]
    );

    if (session.length === 0) return res.status(404).json({ error: 'Session nicht gefunden' });

    const { nutzer_id, standard_plan_id, custom_plan_id, trainingsplan_typ } = session[0];
    let rows;

    if (trainingsplan_typ === 'custom') {
      [rows] = await db.query(`
        SELECT 
          te.id,
          te.session_id,
          te.uebung_id,
          te.satz_nummer,
          te.wiederholungen,
          te.gewicht_kg,
          te.notizen,
          te.erstellt_am,
          te.ist_dropsatz,
          COALESCE(nu.uebung_name, u.name) as uebung_name,
          COALESCE(nu.zielmuskel, u.zielmuskel) as zielmuskel,
          COALESCE(nu.kategorie, u.kategorie) as kategorie,
          netu.reihenfolge,
          te.eigene_uebung
        FROM trainings_ergebnisse te
        LEFT JOIN uebungen u ON te.uebung_id = u.id AND (te.eigene_uebung = 0 OR te.eigene_uebung IS NULL)
        LEFT JOIN nutzer_eigene_uebungen nu ON te.uebung_id = nu.id AND te.eigene_uebung = 1
        LEFT JOIN nutzer_eigene_trainingsplan_uebungen netu 
          ON netu.eigener_trainingsplan_id = ?
          AND netu.uebung_id = te.uebung_id
          AND netu.eigene_uebung = te.eigene_uebung
        WHERE te.session_id = ?
        ORDER BY COALESCE(netu.reihenfolge, 999), te.satz_nummer
      `, [custom_plan_id, sessionId]);
    } else {
      [rows] = await db.query(`
        SELECT 
          te.id,
          te.session_id,
          te.uebung_id,
          te.satz_nummer,
          te.wiederholungen,
          te.gewicht_kg,
          te.notizen,
          te.erstellt_am,
          te.ist_dropsatz,
          u.name as uebung_name,
          u.zielmuskel,
          u.kategorie,
          COALESCE(nth.reihenfolge, 999) as reihenfolge
        FROM trainings_ergebnisse te
        JOIN uebungen u ON te.uebung_id = u.id
        LEFT JOIN nutzer_trainingsplan_historie nth 
          ON nth.nutzer_id = ? 
          AND nth.trainingsplan_id = ?
          AND nth.uebung_id = te.uebung_id
        WHERE te.session_id = ?
        ORDER BY COALESCE(nth.reihenfolge, 999), te.satz_nummer
      `, [nutzer_id, standard_plan_id, sessionId]);
    }

    res.json(rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Ergebnisse:', error);
    res.status(500).json({ error: error.message });
  }
};

// Session aktualisieren
// NEU: ist_dropsatz beim Re-Insert berücksichtigt
exports.updateSession = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { sessionId } = req.params;
    const {
      nutzer_id, trainingsplan_id, trainingsplan_typ,
      datum, startzeit, endzeit, notizen,
      ergebnisse, uebungen_reihenfolge
    } = req.body;

    const [session] = await connection.query(
      'SELECT nutzer_id, trainingsplan_typ FROM trainings_sessions WHERE id = ?',
      [sessionId]
    );

    if (session.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Session nicht gefunden' });
    }

    if (session[0].nutzer_id !== nutzer_id) {
      await connection.rollback();
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }

    const planTyp          = trainingsplan_typ || session[0].trainingsplan_typ;
    const standard_plan_id = planTyp === 'standard' ? trainingsplan_id : null;
    const custom_plan_id   = planTyp === 'custom'   ? trainingsplan_id : null;

    await connection.query(
      'UPDATE trainings_sessions SET standard_plan_id = ?, custom_plan_id = ?, trainingsplan_typ = ?, datum = ?, startzeit = ?, endzeit = ?, notizen = ? WHERE id = ?',
      [standard_plan_id, custom_plan_id, planTyp, datum, startzeit, endzeit, notizen, sessionId]
    );

    await connection.query('DELETE FROM trainings_ergebnisse WHERE session_id = ?', [sessionId]);

    if (ergebnisse && ergebnisse.length > 0) {
      const values = ergebnisse.map(e => [
        sessionId,
        e.uebung_id,
        e.satz_nummer,
        e.wiederholungen,
        e.gewicht_kg,
        e.notizen,
        e.eigene_uebung  || 0,
        e.ist_dropsatz   || 0,   // NEU
      ]);

      await connection.query(
        'INSERT INTO trainings_ergebnisse (session_id, uebung_id, satz_nummer, wiederholungen, gewicht_kg, notizen, eigene_uebung, ist_dropsatz) VALUES ?',
        [values]
      );
    }

    if (uebungen_reihenfolge && uebungen_reihenfolge.length > 0) {
      if (planTyp === 'standard') {
        await connection.query(
          'DELETE FROM nutzer_trainingsplan_historie WHERE nutzer_id = ? AND trainingsplan_id = ?',
          [nutzer_id, trainingsplan_id]
        );

        const historieValues = uebungen_reihenfolge.map(u => [
          nutzer_id, trainingsplan_id, u.uebung_id, u.reihenfolge
        ]);

        await connection.query(
          'INSERT INTO nutzer_trainingsplan_historie (nutzer_id, trainingsplan_id, uebung_id, reihenfolge) VALUES ?',
          [historieValues]
        );
      } else if (planTyp === 'custom') {
        for (const uebung of uebungen_reihenfolge) {
          const eigeneFlag = uebung.eigene_uebung ? 1 : 0;
          await connection.query(
            `UPDATE nutzer_eigene_trainingsplan_uebungen 
               SET reihenfolge = ? 
               WHERE eigener_trainingsplan_id = ? AND uebung_id = ? AND eigene_uebung = ?`,
            [uebung.reihenfolge, trainingsplan_id, uebung.uebung_id, eigeneFlag]
          );
        }
      }
    }

    await connection.commit();
    res.json({ message: 'Training erfolgreich aktualisiert', sessionId });

  } catch (error) {
    await connection.rollback();
    console.error('Fehler beim Aktualisieren der Session:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// Session löschen
// CASCADE löscht trainings_ergebnisse automatisch – kein manuelles DELETE nötig
exports.deleteSession = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { sessionId } = req.params;
    const { nutzer_id } = req.body;

    const [session] = await connection.query(
      'SELECT nutzer_id FROM trainings_sessions WHERE id = ?',
      [sessionId]
    );

    if (session.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Session nicht gefunden' });
    }

    if (session[0].nutzer_id !== nutzer_id) {
      await connection.rollback();
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }

    // ON DELETE CASCADE übernimmt trainings_ergebnisse
    await connection.query('DELETE FROM trainings_sessions WHERE id = ?', [sessionId]);

    await connection.commit();
    res.json({ message: 'Training erfolgreich gelöscht' });

  } catch (error) {
    await connection.rollback();
    console.error('Fehler beim Löschen der Session:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// Temp-Session speichern/aktualisieren
exports.saveTempSession = async (req, res) => {
  try {
    const {
      nutzer_id, trainingsplan_id, trainingsplan_typ,
      gewaehlte_uebungen, ergebnisse, timer_start
    } = req.body;

    let mysqlTimerStart = null;
    if (timer_start) {
      mysqlTimerStart = new Date(timer_start).toISOString().slice(0, 19).replace('T', ' ');
    }

    const [existing] = await db.query(
      'SELECT id FROM temp_trainings_sessions WHERE nutzer_id = ?',
      [nutzer_id]
    );

    // ergebnisse enthält jetzt { saetze: [...], dropsaetze: [...] } pro Übung –
    // das wird als JSON gespeichert, kein Schemaänderung nötig.
    if (existing.length > 0) {
      await db.query(
        `UPDATE temp_trainings_sessions 
         SET trainingsplan_id = ?, trainingsplan_typ = ?, gewaehlte_uebungen = ?, ergebnisse = ?, timer_start = ?
         WHERE nutzer_id = ?`,
        [trainingsplan_id, trainingsplan_typ, JSON.stringify(gewaehlte_uebungen), JSON.stringify(ergebnisse), mysqlTimerStart, nutzer_id]
      );
    } else {
      await db.query(
        `INSERT INTO temp_trainings_sessions (nutzer_id, trainingsplan_id, trainingsplan_typ, gewaehlte_uebungen, ergebnisse, timer_start)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nutzer_id, trainingsplan_id, trainingsplan_typ, JSON.stringify(gewaehlte_uebungen), JSON.stringify(ergebnisse), mysqlTimerStart]
      );
    }

    res.json({ message: 'Temp-Session gespeichert' });
  } catch (error) {
    console.error('Fehler beim Speichern der Temp-Session:', error);
    res.status(500).json({ error: error.message });
  }
};

// Temp-Session laden
exports.getTempSession = async (req, res) => {
  try {
    const { nutzerId } = req.params;

    const [rows] = await db.query(
      'SELECT * FROM temp_trainings_sessions WHERE nutzer_id = ?',
      [nutzerId]
    );

    if (rows.length === 0) return res.json(null);

    const session = rows[0];

    let timerStartISO = null;
    if (session.timer_start) {
      timerStartISO = new Date(session.timer_start + 'Z').toISOString();
    }

    res.json({
      trainingsplan_id:   session.trainingsplan_id,
      trainingsplan_typ:  session.trainingsplan_typ,
      gewaehlte_uebungen: session.gewaehlte_uebungen,
      ergebnisse:         session.ergebnisse,   // enthält dropsaetze automatisch
      timer_start:        timerStartISO,
    });
  } catch (error) {
    console.error('Fehler beim Laden der Temp-Session:', error);
    res.status(500).json({ error: error.message });
  }
};

// Temp-Session löschen
exports.deleteTempSession = async (req, res) => {
  try {
    const { nutzerId } = req.params;
    await db.query('DELETE FROM temp_trainings_sessions WHERE nutzer_id = ?', [nutzerId]);
    res.json({ message: 'Temp-Session gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen der Temp-Session:', error);
    res.status(500).json({ error: error.message });
  }
};