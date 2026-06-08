const db = require('../config/db');

//Data für den ESP32 abrufen
exports.getData = async (req, res) => {
  try {
    const { monat, jahr } = req.query;
    let dateFilter = '';
    let highscores;

    const [feedbackRows] = await db.query('SELECT * FROM feedback');
    const [ergebnissRows] = await db.query(`
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
      WHERE ts.nutzer_id = 7
      ORDER BY ts.datum DESC
    `);

    if (monat && jahr) {
      const startDatum = `${jahr}-${monat.padStart(2, '0')}-01`;
      dateFilter = 'AND gt.datum BETWEEN ? AND LAST_DAY(?)';
      params.push(startDatum, startDatum);
    }

    const [terminRows] = await db.query(`
      SELECT 
        gt.id,
        gt.datum,
        gt.startzeit,
        gt.notiz,
        gt.nutzer_id as ersteller_id,
        n.vname as ersteller_vname,
        n.nname as ersteller_nname,
        GROUP_CONCAT(
          CONCAT(tn.id, ':', tn.vname, ' ', tn.nname, ':', gtt.status)
          SEPARATOR '||'
        ) as teilnehmer
      FROM gym_termine gt
      JOIN nutzer n ON gt.nutzer_id = n.id
      LEFT JOIN gym_termin_teilnehmer gtt ON gt.id = gtt.termin_id
      LEFT JOIN nutzer tn ON gtt.nutzer_id = tn.id
      WHERE gt.gruppe_id = 7
      ${dateFilter}
      GROUP BY gt.id
      ORDER BY gt.datum ASC, gt.startzeit ASC
    `);

    const termine = terminRows.map(t => ({
      ...t,
      teilnehmer: t.teilnehmer ? t.teilnehmer.split('||').map(p => {
        const [id, name, status] = p.split(':');
        return { id: parseInt(id), name, status };
      }) : []
    }));

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
        WHERE ts.nutzer_id = 7
        GROUP BY te.uebung_id
        ORDER BY u.name
        LIMIT 10
      `);

    res.json({
      feedback: feedbackRows,
      ergebnisse: ergebnissRows,
      termine: termine,
      highscores: personalHighscores,
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Trainingspläne:', error);
    res.status(500).json({ error: error.message });
  }
};