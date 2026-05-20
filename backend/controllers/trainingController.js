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
exports.getLetzteErgebnisse = async (req, res) => {
  try {
    const { uebungId } = req.params;
    const { nutzerId } = req.query;

    const [rows] = await db.query(`
      SELECT 
        ts.id as session_id,
        te.erstellt_am,
        te.satz_nummer,
        te.wiederholungen,
        te.gewicht_kg,
        te.notizen
      FROM trainings_ergebnisse te
      JOIN trainings_sessions ts ON te.session_id = ts.id
      WHERE te.uebung_id = ? AND ts.nutzer_id = ?
      ORDER BY ts.datum DESC, te.erstellt_am DESC, te.satz_nummer ASC
      LIMIT 15
    `, [uebungId, nutzerId]);

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

    // Validierung des Plantyps
    const planTyp = trainingsplan_typ || 'standard';
    if (!['standard', 'custom'].includes(planTyp)) {
      return res.status(400).json({ error: 'Ungültiger Trainingsplan-Typ' });
    }

    // NEUE LOGIK: Bestimme welche Spalte befüllt werden soll
    const standard_plan_id = planTyp === 'standard' ? trainingsplan_id : null;
    const custom_plan_id = planTyp === 'custom' ? trainingsplan_id : null;

    // Session erstellen
    const [sessionResult] = await db.query(
      'INSERT INTO trainings_sessions (nutzer_id, standard_plan_id, custom_plan_id, trainingsplan_typ, datum, startzeit, endzeit, notizen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nutzer_id, standard_plan_id, custom_plan_id, planTyp, datum, startzeit, endzeit, notizen]
    );

    const sessionId = sessionResult.insertId;

    // Ergebnisse einfügen
    if (ergebnisse && ergebnisse.length > 0) {
      const values = ergebnisse.map(e => [
        sessionId,
        e.uebung_id,
        e.satz_nummer,
        e.wiederholungen,
        e.gewicht_kg,
        e.notizen
      ]);

      await db.query(
        'INSERT INTO trainings_ergebnisse (session_id, uebung_id, satz_nummer, wiederholungen, gewicht_kg, notizen) VALUES ?',
        [values]
      );
    }

    res.status(201).json({
      message: 'Training erfolgreich gespeichert',
      sessionId: sessionId
    });

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
      // Custom Plan - lade Übungen aus nutzer_eigene_trainingsplan_uebungen
      const [rows] = await db.query(`
        SELECT 
          netu.reihenfolge,
          netu.empfohlene_saetze,
          netu.empfohlene_wiederholungen,
          u.id as uebung_id,
          u.name as uebung_name,
          u.zielmuskel,
          u.kategorie,
          u.beschreibung
        FROM nutzer_eigene_trainingsplan_uebungen netu
        JOIN uebungen u ON netu.uebung_id = u.id
        WHERE netu.eigener_trainingsplan_id = ?
        ORDER BY netu.reihenfolge
      `, [planId]);

      return res.json({ source: 'custom', uebungen: rows });
    }

    // Standard Plan - prüfe Historie
    const [historie] = await db.query(`
      SELECT DISTINCT uebung_id
      FROM nutzer_trainingsplan_historie
      WHERE nutzer_id = ? AND trainingsplan_id = ?
    `, [nutzerId, planId]);

    if (historie.length > 0) {
      // User hat Plan schon gemacht - Lade letzte Übungen
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
    } else {
      // User hat Plan noch nie gemacht - Lade Standard-Übungen
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
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Übungen für Plan:', error);
    res.status(500).json({ error: error.message });
  }
};

// Session speichern UND Historie aktualisieren
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

    // Validierung des Plantyps
    const planTyp = trainingsplan_typ || 'standard';
    if (!['standard', 'custom'].includes(planTyp)) {
      await connection.rollback();
      return res.status(400).json({ error: 'Ungültiger Trainingsplan-Typ' });
    }

    // NEUE LOGIK: Bestimme welche Spalte befüllt werden soll
    const standard_plan_id = planTyp === 'standard' ? trainingsplan_id : null;
    const custom_plan_id = planTyp === 'custom' ? trainingsplan_id : null;

    // 1. Session erstellen
    const [sessionResult] = await connection.query(
      'INSERT INTO trainings_sessions (nutzer_id, standard_plan_id, custom_plan_id, trainingsplan_typ, datum, startzeit, endzeit, notizen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nutzer_id, standard_plan_id, custom_plan_id, planTyp, datum, startzeit, endzeit, notizen]
    );

    const sessionId = sessionResult.insertId;

    // 2. Ergebnisse einfügen
    if (ergebnisse && ergebnisse.length > 0) {
      const values = ergebnisse.map(e => [
        sessionId,
        e.uebung_id,
        e.satz_nummer,
        e.wiederholungen,
        e.gewicht_kg,
        e.notizen
      ]);

      await connection.query(
        'INSERT INTO trainings_ergebnisse (session_id, uebung_id, satz_nummer, wiederholungen, gewicht_kg, notizen) VALUES ?',
        [values]
      );
    }

    // 3. Historie aktualisieren (nur für Standard-Pläne)
    if (planTyp === 'standard' && uebungen_reihenfolge && uebungen_reihenfolge.length > 0) {
      // Erst alte Historie für diesen Plan löschen
      await connection.query(
        'DELETE FROM nutzer_trainingsplan_historie WHERE nutzer_id = ? AND trainingsplan_id = ?',
        [nutzer_id, trainingsplan_id]
      );

      // Neue Historie einfügen
      const historieValues = uebungen_reihenfolge.map(u => [
        nutzer_id,
        trainingsplan_id,
        u.uebung_id,
        u.reihenfolge
      ]);

      await connection.query(
        'INSERT INTO nutzer_trainingsplan_historie (nutzer_id, trainingsplan_id, uebung_id, reihenfolge) VALUES ?',
        [historieValues]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: 'Training erfolgreich gespeichert',
      sessionId: sessionId
    });

  } catch (error) {
    await connection.rollback();
    console.error('Fehler beim Speichern der Session:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// Dashboard-Statistiken für Home
exports.getDashboardStats = async (req, res) => {
  try {
    const { nutzerId } = req.params;
    const { gruppeId } = req.query;

    // 1. LETZTE TRAININGS - IMMER NUR EIGENE
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

    // 2. BESTE FORTSCHRITTE - IMMER NUR EIGENE
    const [verbesserungen] = await db.query(`
      SELECT 
        u.name as uebung_name,
        u.zielmuskel,
        MAX(te.gewicht_kg) as aktuell,
        (
          SELECT MAX(te2.gewicht_kg)
          FROM trainings_ergebnisse te2
          JOIN trainings_sessions ts2 ON te2.session_id = ts2.id
          WHERE te2.uebung_id = te.uebung_id
          AND ts2.nutzer_id = ?
          AND ts2.datum < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ) as vor_30_tagen,
        (MAX(te.gewicht_kg) - (
          SELECT MAX(te2.gewicht_kg)
          FROM trainings_ergebnisse te2
          JOIN trainings_sessions ts2 ON te2.session_id = ts2.id
          WHERE te2.uebung_id = te.uebung_id
          AND ts2.nutzer_id = ?
          AND ts2.datum < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        )) as steigerung
      FROM trainings_ergebnisse te
      JOIN trainings_sessions ts ON te.session_id = ts.id
      JOIN uebungen u ON te.uebung_id = u.id
      WHERE ts.nutzer_id = ?
      AND ts.datum >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY te.uebung_id
      HAVING steigerung > 0
      ORDER BY steigerung DESC
      LIMIT 5
    `, [nutzerId, nutzerId, nutzerId]);

    // 3. HIGHSCORES - ABHÄNGIG VON GRUPPE/PERSÖNLICH
    let highscores;

    if (gruppeId) {
      // GRUPPE: Alle Gruppenmitglieder
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
        GROUP BY te.uebung_id, ts.nutzer_id
        HAVING max_gewicht = (
          SELECT MAX(te2.gewicht_kg)
          FROM trainings_ergebnisse te2
          JOIN trainings_sessions ts2 ON te2.session_id = ts2.id
          WHERE te2.uebung_id = te.uebung_id
          AND ts2.nutzer_id IN (
            SELECT nutzer_id FROM gruppen_mitglieder WHERE gruppe_id = ?
          )
        )
        ORDER BY u.name
        LIMIT 10
      `, [gruppeId, gruppeId]);
      highscores = groupHighscores;
    } else {
      // PERSÖNLICH: Nur eigene Highscores
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
        GROUP BY te.uebung_id
        ORDER BY u.name
        LIMIT 10
      `, [nutzerId]);
      highscores = personalHighscores;
    }

    res.json({
      letzteTrainings,
      verbesserungen,
      highscores,
      isGruppenAnsicht: !!gruppeId
    });

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

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Session nicht gefunden' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Fehler beim Abrufen der Session-Details:', error);
    res.status(500).json({ error: error.message });
  }
};

// Ergebnisse einer Session abrufen
exports.getSessionErgebnisse = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Zuerst Session-Info holen für nutzer_id, plan_ids und trainingsplan_typ
    const [session] = await db.query(`
      SELECT nutzer_id, standard_plan_id, custom_plan_id, trainingsplan_typ
      FROM trainings_sessions 
      WHERE id = ?
    `, [sessionId]);

    if (session.length === 0) {
      return res.status(404).json({ error: 'Session nicht gefunden' });
    }

    const { nutzer_id, standard_plan_id, custom_plan_id, trainingsplan_typ } = session[0];

    // Ergebnisse laden - unterschiedlich je nach Plantyp
    let rows;

    if (trainingsplan_typ === 'custom') {
      // Custom Plan - keine Historie-Tabelle verwenden
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
          u.name as uebung_name,
          u.zielmuskel,
          u.kategorie,
          netu.reihenfolge
        FROM trainings_ergebnisse te
        JOIN uebungen u ON te.uebung_id = u.id
        LEFT JOIN nutzer_eigene_trainingsplan_uebungen netu 
          ON netu.eigener_trainingsplan_id = ?
          AND netu.uebung_id = te.uebung_id
        WHERE te.session_id = ?
        ORDER BY COALESCE(netu.reihenfolge, 999), te.satz_nummer
      `, [custom_plan_id, sessionId]);
    } else {
      // Standard Plan - mit Historie
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
exports.updateSession = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { sessionId } = req.params;
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

    // 1. Prüfe ob Session dem Nutzer gehört
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

    const planTyp = trainingsplan_typ || session[0].trainingsplan_typ;
    const standard_plan_id = planTyp === 'standard' ? trainingsplan_id : null;
    const custom_plan_id = planTyp === 'custom' ? trainingsplan_id : null;

    // 2. Session-Details aktualisieren
    await connection.query(
      'UPDATE trainings_sessions SET standard_plan_id = ?, custom_plan_id = ?, trainingsplan_typ = ?, datum = ?, startzeit = ?, endzeit = ?, notizen = ? WHERE id = ?',
      [standard_plan_id, custom_plan_id, planTyp, datum, startzeit, endzeit, notizen, sessionId]
    );

    // 3. Alte Ergebnisse löschen
    await connection.query(
      'DELETE FROM trainings_ergebnisse WHERE session_id = ?',
      [sessionId]
    );

    // 4. Neue Ergebnisse einfügen
    if (ergebnisse && ergebnisse.length > 0) {
      const values = ergebnisse.map(e => [
        sessionId,
        e.uebung_id,
        e.satz_nummer,
        e.wiederholungen,
        e.gewicht_kg,
        e.notizen
      ]);

      await connection.query(
        'INSERT INTO trainings_ergebnisse (session_id, uebung_id, satz_nummer, wiederholungen, gewicht_kg, notizen) VALUES ?',
        [values]
      );
    }

    // 5. Reihenfolge aktualisieren - FÜR BEIDE PLANTYPEN
    if (uebungen_reihenfolge && uebungen_reihenfolge.length > 0) {
      if (planTyp === 'standard') {
        // Standard-Plan: Historie-Tabelle
        await connection.query(
          'DELETE FROM nutzer_trainingsplan_historie WHERE nutzer_id = ? AND trainingsplan_id = ?',
          [nutzer_id, trainingsplan_id]
        );

        const historieValues = uebungen_reihenfolge.map(u => [
          nutzer_id,
          trainingsplan_id,
          u.uebung_id,
          u.reihenfolge
        ]);

        await connection.query(
          'INSERT INTO nutzer_trainingsplan_historie (nutzer_id, trainingsplan_id, uebung_id, reihenfolge) VALUES ?',
          [historieValues]
        );
      } else if (planTyp === 'custom') {
        // Custom-Plan: Reihenfolge in nutzer_eigene_trainingsplan_uebungen aktualisieren
        for (const uebung of uebungen_reihenfolge) {
          await connection.query(
            `UPDATE nutzer_eigene_trainingsplan_uebungen 
             SET reihenfolge = ? 
             WHERE eigener_trainingsplan_id = ? AND uebung_id = ?`,
            [uebung.reihenfolge, trainingsplan_id, uebung.uebung_id]
          );
        }
      }
    }

    await connection.commit();

    res.json({
      message: 'Training erfolgreich aktualisiert',
      sessionId: sessionId
    });

  } catch (error) {
    await connection.rollback();
    console.error('Fehler beim Aktualisieren der Session:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// Session löschen
exports.deleteSession = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { sessionId } = req.params;
    const { nutzer_id } = req.body;

    // Prüfe ob Session dem Nutzer gehört
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

    // Ergebnisse löschen
    await connection.query(
      'DELETE FROM trainings_ergebnisse WHERE session_id = ?',
      [sessionId]
    );

    // Session löschen
    await connection.query(
      'DELETE FROM trainings_sessions WHERE id = ?',
      [sessionId]
    );

    await connection.commit();

    res.json({
      message: 'Training erfolgreich gelöscht'
    });

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
      nutzer_id,
      trainingsplan_id,
      trainingsplan_typ,
      gewaehlte_uebungen,
      ergebnisse,
      timer_start // Kann null sein
    } = req.body;

    // Konvertiere ISO 8601 DateTime zu MySQL DATETIME Format
    let mysqlTimerStart = null;
    if (timer_start) {
      const date = new Date(timer_start);
      // Konvertiert '2025-10-30T12:47:53.665Z' zu '2025-10-30 12:47:53'
      mysqlTimerStart = date.toISOString().slice(0, 19).replace('T', ' ');
    }

    // Prüfe ob bereits eine Temp-Session existiert
    const [existing] = await db.query(
      'SELECT id FROM temp_trainings_sessions WHERE nutzer_id = ?',
      [nutzer_id]
    );

    if (existing.length > 0) {
      // UPDATE
      await db.query(
        `UPDATE temp_trainings_sessions 
         SET trainingsplan_id = ?, 
             trainingsplan_typ = ?, 
             gewaehlte_uebungen = ?, 
             ergebnisse = ?,
             timer_start = ?
         WHERE nutzer_id = ?`,
        [
          trainingsplan_id,
          trainingsplan_typ,
          JSON.stringify(gewaehlte_uebungen),
          JSON.stringify(ergebnisse),
          mysqlTimerStart, // Konvertiertes DateTime oder null
          nutzer_id
        ]
      );
    } else {
      // INSERT
      await db.query(
        `INSERT INTO temp_trainings_sessions 
         (nutzer_id, trainingsplan_id, trainingsplan_typ, gewaehlte_uebungen, ergebnisse, timer_start) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          nutzer_id,
          trainingsplan_id,
          trainingsplan_typ,
          JSON.stringify(gewaehlte_uebungen),
          JSON.stringify(ergebnisse),
          mysqlTimerStart // Konvertiertes DateTime oder null
        ]
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

    if (rows.length === 0) {
      return res.json(null);
    }

    const session = rows[0];

    // Konvertiere MySQL DATETIME zurück zu ISO 8601 String (falls vorhanden)
    let timerStartISO = null;
    if (session.timer_start) {
      const utcDate = new Date(session.timer_start + 'Z');
      timerStartISO = utcDate.toISOString();
    }

    res.json({
      trainingsplan_id: session.trainingsplan_id,
      trainingsplan_typ: session.trainingsplan_typ,
      gewaehlte_uebungen: session.gewaehlte_uebungen,
      ergebnisse: session.ergebnisse,
      timer_start: timerStartISO // ISO 8601 Format für Frontend
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

    await db.query(
      'DELETE FROM temp_trainings_sessions WHERE nutzer_id = ?',
      [nutzerId]
    );

    res.json({ message: 'Temp-Session gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen der Temp-Session:', error);
    res.status(500).json({ error: error.message });
  }
};