const db = require('../config/db');
const crypto = require('crypto');
const emailService = require('../services/emailService');
const webpush = require('web-push');

// VAPID Konfiguration
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:info@fitness-app.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// ========================================
// HELPER FUNKTIONEN
// ========================================

// Push-Benachrichtigung an einen Nutzer senden
async function sendPushNotification(nutzerId, notification) {
  try {

    const [subscriptions] = await db.query(
      'SELECT subscription FROM push_subscriptions WHERE nutzer_id = ? AND aktiv = TRUE',
      [nutzerId]
    );

    if (subscriptions.length === 0) {
      console.log(`[Push Backend] ⚠️ Keine aktiven Subscriptions für Nutzer ${nutzerId}`);
      return { success: false, reason: 'no_subscriptions' };
    }


    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/logo192.png',
      badge: notification.badge || '/badge.png',
      tag: notification.tag || 'default',
      data: notification.data || {}
    });


  console.log(subscriptions, payload)

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const subscription = typeof sub.subscription === 'string'
            ? JSON.parse(sub.subscription)
            : sub.subscription;

          await webpush.sendNotification(subscription, payload);
          console.log(`[Push Backend] ✅ Push erfolgreich gesendet an Nutzer ${nutzerId}`);
          return { success: true };
        } catch (error) {
          console.error(`[Push Backend] ✗ Fehler beim Senden an Nutzer ${nutzerId}:`, error);

          // Bei 410 (Gone) = Subscription nicht mehr gültig
          if (error.statusCode === 410) {
            await db.query(
              'UPDATE push_subscriptions SET aktiv = FALSE WHERE subscription = ?',
              [typeof sub.subscription === 'string' ? sub.subscription : JSON.stringify(sub.subscription)]
            );
          }
          return { success: false, error: error.message };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;

    console.log(`[Push Backend] Push-Ergebnis für Nutzer ${nutzerId}: ${successful}/${subscriptions.length} erfolgreich`);

    return {
      success: successful > 0,
      total: subscriptions.length,
      successful
    };
  } catch (error) {
    console.error(`[Push Backend] Allgemeiner Fehler bei Push für Nutzer ${nutzerId}:`, error);
    return { success: false, error: error.message };
  }
}

// Push an alle Gruppenmitglieder senden (außer Ersteller)
async function notifyGroupMembers(gruppeId, excludeNutzerId, notification) {
  try {
    const [members] = await db.query(
      'SELECT nutzer_id FROM gruppen_mitglieder WHERE gruppe_id = ? AND nutzer_id != ?',
      [gruppeId, excludeNutzerId]
    );

    console.log(`[Push Backend] 📢 Sende Benachrichtigung an ${members.length} Gruppenmitglieder (Gruppe ${gruppeId})`);

    if (members.length === 0) {
      console.log(`[Push Backend] Keine Mitglieder zum Benachrichtigen (außer Ersteller)`);
      return { success: true, total: 0, successful: 0 };
    }

    const results = await Promise.allSettled(
      members.map(member => sendPushNotification(member.nutzer_id, notification))
    );

    const successful = results.filter(r =>
      r.status === 'fulfilled' && r.value.success
    ).length;

    console.log(`[Push Backend] ✅ Gruppen-Push abgeschlossen: ${successful}/${members.length} erfolgreich`);

    return {
      success: successful > 0,
      total: members.length,
      successful
    };
  } catch (error) {
    console.error('[Push Backend] Fehler beim Benachrichtigen der Gruppe:', error);
    return { success: false, error: error.message };
  }
}

// ========================================
// PUSH-BENACHRICHTIGUNGEN ENDPUNKTE
// ========================================

// VAPID Public Key abrufen
exports.getVapidPublicKey = (req, res) => {
  if (!process.env.VAPID_PUBLIC_KEY) {
    console.error('[Push Backend] ❌ VAPID_PUBLIC_KEY nicht in .env gesetzt!');
    return res.status(500).json({ error: 'VAPID Key nicht konfiguriert' });
  }

  console.log('[Push Backend] ✅ VAPID Public Key abgerufen');
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

// Push-Subscription registrieren
exports.subscribePush = async (req, res) => {
  try {
    const { nutzer_id, subscription } = req.body;

    if (!nutzer_id || !subscription) {
      console.error('[Push Backend] ❌ Fehlende Daten:', { nutzer_id, subscription: !!subscription });
      return res.status(400).json({ error: 'Fehlende Daten' });
    }


    await db.query(
      `INSERT INTO push_subscriptions (nutzer_id, subscription, aktiv, erstellt_am) 
       VALUES (?, ?, TRUE, NOW())
       ON DUPLICATE KEY UPDATE aktiv = TRUE, aktualisiert_am = NOW()`,
      [nutzer_id, JSON.stringify(subscription)]
    );

    console.log(`[Push Backend] ✅ Subscription gespeichert für Nutzer ${nutzer_id}`);
    res.json({ success: true, message: 'Subscription gespeichert' });
  } catch (error) {
    console.error('[Push Backend] ❌ Fehler beim Speichern der Subscription:', error);
    res.status(500).json({ error: error.message });
  }
};

// Push-Subscription deaktivieren
exports.unsubscribePush = async (req, res) => {
  try {
    const { nutzer_id } = req.body;

    console.log(`[Push Backend] Deaktiviere Push-Subscription für Nutzer ${nutzer_id}`);

    await db.query(
      'UPDATE push_subscriptions SET aktiv = FALSE WHERE nutzer_id = ?',
      [nutzer_id]
    );

    console.log(`[Push Backend] ✅ Subscription deaktiviert für Nutzer ${nutzer_id}`);
    res.json({ success: true, message: 'Subscription deaktiviert' });
  } catch (error) {
    console.error('[Push Backend] ❌ Fehler beim Deaktivieren der Subscription:', error);
    res.status(500).json({ error: error.message });
  }
};

// ========================================
// EINLADUNG ERSTELLEN - MIT PUSH AN EMPFÄNGER
// ========================================

exports.createEinladung = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { gruppe_id, einlader_id, empfaenger_id } = req.body;

    const token = crypto.randomBytes(32).toString('hex');

    const [einladungResult] = await connection.query(
      'INSERT INTO gruppen_einladungen (gruppe_id, einlader_id, empfaenger_id, token) VALUES (?, ?, ?, ?)',
      [gruppe_id, einlader_id, empfaenger_id, token]
    );

    const einladungId = einladungResult.insertId;

    const [gruppenInfo] = await connection.query(
      'SELECT name FROM gruppen WHERE id = ?',
      [gruppe_id]
    );

    const [einladerInfo] = await connection.query(
      'SELECT vname, nname FROM nutzer WHERE id = ?',
      [einlader_id]
    );

    const [empfaengerInfo] = await connection.query(
      'SELECT email, vname FROM nutzer WHERE id = ?',
      [empfaenger_id]
    );

    const einladerName = `${einladerInfo[0].vname} ${einladerInfo[0].nname}`;
    const gruppenName = gruppenInfo[0].name;

    // Benachrichtigung in DB speichern
    await connection.query(
      'INSERT INTO benachrichtigungen (nutzer_id, typ, titel, nachricht, link) VALUES (?, ?, ?, ?, ?)',
      [
        empfaenger_id,
        'einladung',
        'Neue Gruppeneinladung',
        `${einladerName} hat dich zur Gruppe "${gruppenName}" eingeladen`,
        `/einladungen`
      ]
    );

    await connection.commit();

    console.log(`[Einladung] ✅ Einladung ${einladungId} erfolgreich erstellt`);

    const pushResult = await sendPushNotification(empfaenger_id, {
      title: '🎉 Neue Gruppeneinladung!',
      body: `${einladerName} hat dich zu "${gruppenName}" eingeladen`,
      icon: '/logo192.png',
      badge: '/badge.png',
      tag: `invitation-${einladungId}`,
      data: {
        url: '/einladungen',
        einladung_id: einladungId,
        gruppe_id: gruppe_id,
        type: 'gruppeneinladung'
      }
    });

    if (pushResult.success) {
      console.log(`[Einladung] ✅ Push erfolgreich an Empfänger ${empfaenger_id} gesendet`);
    } else {
      console.log(`[Einladung] ⚠️ Push konnte nicht gesendet werden: ${pushResult.reason || pushResult.error}`);
    }

    // E-Mail asynchron senden (nicht blockierend)
    emailService.sendGruppenEinladung(
      empfaengerInfo[0].email,
      empfaengerInfo[0].vname,
      einladerName,
      gruppenName,
      token
    ).catch(err => {
      console.error('[Einladung] ⚠️ E-Mail konnte nicht versendet werden:', err);
    });

  } catch (error) {
    await connection.rollback();
    console.error('[Einladung] ❌ Fehler beim Erstellen der Einladung:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
    res.json({ message: 'Einladung erstellt' });
  }
};

// ========================================
// WEITERE GRUPPEN ENDPUNKTE
// ========================================

exports.getGruppenByNutzer = async (req, res) => {
  try {
    const { nutzerId } = req.params;

    const [rows] = await db.query(`
      SELECT 
        g.id,
        g.name,
        g.beschreibung,
        g.ersteller_id,
        gm.ist_favorit,
        gm.beigetreten_am,
        COUNT(DISTINCT gm2.nutzer_id) as mitglieder_anzahl,
        CONCAT(n.vname, ' ', n.nname) as ersteller_name
      FROM gruppen_mitglieder gm
      JOIN gruppen g ON gm.gruppe_id = g.id
      JOIN nutzer n ON g.ersteller_id = n.id
      LEFT JOIN gruppen_mitglieder gm2 ON g.id = gm2.gruppe_id
      WHERE gm.nutzer_id = ?
      GROUP BY g.id
      ORDER BY gm.ist_favorit DESC, gm.beigetreten_am DESC
    `, [nutzerId]);

    res.json(rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Gruppen:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getFavoritGruppe = async (req, res) => {
  try {
    const { nutzerId } = req.params;

    const [rows] = await db.query(`
      SELECT 
        g.id,
        g.name,
        g.beschreibung
      FROM gruppen_mitglieder gm
      JOIN gruppen g ON gm.gruppe_id = g.id
      WHERE gm.nutzer_id = ? AND gm.ist_favorit = TRUE
      LIMIT 1
    `, [nutzerId]);

    res.json(rows[0] || null);
  } catch (error) {
    console.error('Fehler beim Abrufen der Favoriten-Gruppe:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createGruppe = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { name, beschreibung, ersteller_id } = req.body;

    const [gruppeResult] = await connection.query(
      'INSERT INTO gruppen (name, beschreibung, ersteller_id) VALUES (?, ?, ?)',
      [name, beschreibung, ersteller_id]
    );

    const gruppeId = gruppeResult.insertId;

    const [favoriten] = await connection.query(
      'SELECT COUNT(*) as count FROM gruppen_mitglieder WHERE nutzer_id = ? AND ist_favorit = TRUE',
      [ersteller_id]
    );

    const istFavorit = favoriten[0].count === 0;

    await connection.query(
      'INSERT INTO gruppen_mitglieder (gruppe_id, nutzer_id, ist_favorit) VALUES (?, ?, ?)',
      [gruppeId, ersteller_id, istFavorit]
    );

    await connection.commit();

    res.status(201).json({
      id: gruppeId,
      message: 'Gruppe erfolgreich erstellt',
      ist_favorit: istFavorit
    });

  } catch (error) {
    await connection.rollback();
    console.error('Fehler beim Erstellen der Gruppe:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

exports.setFavorit = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { gruppeId, nutzerId } = req.body;

    await connection.query(
      'UPDATE gruppen_mitglieder SET ist_favorit = FALSE WHERE nutzer_id = ?',
      [nutzerId]
    );

    await connection.query(
      'UPDATE gruppen_mitglieder SET ist_favorit = TRUE WHERE gruppe_id = ? AND nutzer_id = ?',
      [gruppeId, nutzerId]
    );

    await connection.commit();

    res.json({ message: 'Favorit aktualisiert' });

  } catch (error) {
    await connection.rollback();
    console.error('Fehler beim Setzen des Favoriten:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

exports.getMitglieder = async (req, res) => {
  try {
    const { gruppeId } = req.params;

    const [rows] = await db.query(`
      SELECT 
        n.id,
        n.vname,
        n.nname,
        n.email,
        gm.beigetreten_am,
        g.ersteller_id,
        (g.ersteller_id = n.id) as ist_ersteller
      FROM gruppen_mitglieder gm
      JOIN nutzer n ON gm.nutzer_id = n.id
      JOIN gruppen g ON gm.gruppe_id = g.id
      WHERE gm.gruppe_id = ?
      ORDER BY ist_ersteller DESC, gm.beigetreten_am ASC
    `, [gruppeId]);

    res.json(rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Mitglieder:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.searchNutzer = async (req, res) => {
  try {
    const { query, gruppeId } = req.query;

    const [rows] = await db.query(`
      SELECT 
        n.id,
        n.vname,
        n.nname,
        n.email
      FROM nutzer n
      WHERE (n.vname LIKE ? OR n.nname LIKE ? OR n.email LIKE ?)
      AND n.id NOT IN (
        SELECT nutzer_id FROM gruppen_mitglieder WHERE gruppe_id = ?
      )
      AND n.id NOT IN (
        SELECT empfaenger_id FROM gruppen_einladungen 
        WHERE gruppe_id = ? AND status = 'pending'
      )
      LIMIT 10
    `, [`%${query}%`, `%${query}%`, `%${query}%`, gruppeId, gruppeId]);

    res.json(rows);
  } catch (error) {
    console.error('Fehler bei der Nutzersuche:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getEinladungen = async (req, res) => {
  try {
    const { nutzerId } = req.params;

    const [rows] = await db.query(`
      SELECT 
        e.id,
        e.token,
        e.erstellt_am,
        g.name as gruppen_name,
        g.beschreibung as gruppen_beschreibung,
        CONCAT(n.vname, ' ', n.nname) as einlader_name,
        COUNT(DISTINCT gm.nutzer_id) as mitglieder_anzahl
      FROM gruppen_einladungen e
      JOIN gruppen g ON e.gruppe_id = g.id
      JOIN nutzer n ON e.einlader_id = n.id
      LEFT JOIN gruppen_mitglieder gm ON g.id = gm.gruppe_id
      WHERE e.empfaenger_id = ? AND e.status = 'pending'
      GROUP BY e.id
      ORDER BY e.erstellt_am DESC
    `, [nutzerId]);

    res.json(rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Einladungen:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.acceptEinladung = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { einladungId, nutzerId } = req.body;

    const [einladung] = await connection.query(
      'SELECT * FROM gruppen_einladungen WHERE id = ? AND empfaenger_id = ? AND status = "pending"',
      [einladungId, nutzerId]
    );

    if (einladung.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Einladung nicht gefunden' });
    }

    const gruppeId = einladung[0].gruppe_id;

    const [favoriten] = await connection.query(
      'SELECT COUNT(*) as count FROM gruppen_mitglieder WHERE nutzer_id = ? AND ist_favorit = TRUE',
      [nutzerId]
    );

    const istFavorit = favoriten[0].count === 0;

    await connection.query(
      'INSERT INTO gruppen_mitglieder (gruppe_id, nutzer_id, ist_favorit) VALUES (?, ?, ?)',
      [gruppeId, nutzerId, istFavorit]
    );

    await connection.query(
      'UPDATE gruppen_einladungen SET status = "accepted", beantwortet_am = NOW() WHERE id = ?',
      [einladungId]
    );

    await connection.query(
      'DELETE FROM benachrichtigungen WHERE nutzer_id = ? AND link LIKE ?',
      [nutzerId, `/einladungen%`]
    );

    await connection.commit();

    res.json({
      message: 'Einladung angenommen',
      ist_favorit: istFavorit
    });

  } catch (error) {
    await connection.rollback();
    console.error('Fehler beim Annehmen der Einladung:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

exports.declineEinladung = async (req, res) => {
  try {
    const { einladungId, nutzerId } = req.body;

    await db.query(
      'UPDATE gruppen_einladungen SET status = "declined", beantwortet_am = NOW() WHERE id = ? AND empfaenger_id = ?',
      [einladungId, nutzerId]
    );

    await db.query(
      'DELETE FROM benachrichtigungen WHERE nutzer_id = ? AND link LIKE ?',
      [nutzerId, `/einladungen%`]
    );

    res.json({ message: 'Einladung abgelehnt' });
  } catch (error) {
    console.error('Fehler beim Ablehnen der Einladung:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.leaveGruppe = async (req, res) => {
  try {
    const { gruppeId, nutzerId } = req.body;

    await db.query(
      'DELETE FROM gruppen_mitglieder WHERE gruppe_id = ? AND nutzer_id = ?',
      [gruppeId, nutzerId]
    );

    res.json({ message: 'Gruppe verlassen' });
  } catch (error) {
    console.error('Fehler beim Verlassen der Gruppe:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.removeMitglied = async (req, res) => {
  try {
    const { gruppeId, mitgliedId, erstellerId } = req.body;

    const [gruppe] = await db.query(
      'SELECT ersteller_id FROM gruppen WHERE id = ?',
      [gruppeId]
    );

    if (gruppe.length === 0 || gruppe[0].ersteller_id !== erstellerId) {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }

    await db.query(
      'DELETE FROM gruppen_mitglieder WHERE gruppe_id = ? AND nutzer_id = ?',
      [gruppeId, mitgliedId]
    );

    res.json({ message: 'Mitglied entfernt' });
  } catch (error) {
    console.error('Fehler beim Entfernen des Mitglieds:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteGruppe = async (req, res) => {
  try {
    const { gruppeId, erstellerId } = req.body;

    const [gruppe] = await db.query(
      'SELECT ersteller_id FROM gruppen WHERE id = ?',
      [gruppeId]
    );

    if (gruppe.length === 0 || gruppe[0].ersteller_id !== erstellerId) {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }

    await db.query('DELETE FROM gruppen WHERE id = ?', [gruppeId]);

    res.json({ message: 'Gruppe gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen der Gruppe:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getBenachrichtigungen = async (req, res) => {
  try {
    const { nutzerId } = req.params;

    const [rows] = await db.query(
      'SELECT * FROM benachrichtigungen WHERE nutzer_id = ? ORDER BY erstellt_am DESC LIMIT 50',
      [nutzerId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Benachrichtigungen:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { benachrichtigungId } = req.body;

    await db.query(
      'UPDATE benachrichtigungen SET gelesen = TRUE WHERE id = ?',
      [benachrichtigungId]
    );

    res.json({ message: 'Als gelesen markiert' });
  } catch (error) {
    console.error('Fehler beim Markieren der Benachrichtigung:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getGruppenStats = async (req, res) => {
  try {
    const { gruppeId } = req.params;

    const [aktivitaet] = await db.query(`
      SELECT 
        n.id,
        n.vname,
        n.nname,
        COUNT(DISTINCT ts.id) as anzahl_trainings,
        COUNT(DISTINCT DATE(ts.datum)) as trainingstage,
        SUM(te.anzahl_saetze) as gesamt_saetze
      FROM gruppen_mitglieder gm
      JOIN nutzer n ON gm.nutzer_id = n.id
      LEFT JOIN trainings_sessions ts ON n.id = ts.nutzer_id 
        AND ts.datum >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      LEFT JOIN (
        SELECT session_id, COUNT(*) as anzahl_saetze
        FROM trainings_ergebnisse
        GROUP BY session_id
      ) te ON ts.id = te.session_id
      WHERE gm.gruppe_id = ?
      GROUP BY n.id
      ORDER BY anzahl_trainings DESC
    `, [gruppeId]);

    const [beliebteUebungen] = await db.query(`
      SELECT 
        u.name as uebung_name,
        u.zielmuskel,
        u.kategorie,
        COUNT(DISTINCT ts.nutzer_id) as anzahl_nutzer,
        COUNT(DISTINCT ts.id) as anzahl_sessions,
        AVG(te.gewicht_kg) as durchschnitt_gewicht,
        MAX(te.gewicht_kg) as max_gewicht
      FROM trainings_ergebnisse te
      JOIN trainings_sessions ts ON te.session_id = ts.id
      JOIN uebungen u ON te.uebung_id = u.id
      WHERE ts.nutzer_id IN (
        SELECT nutzer_id FROM gruppen_mitglieder WHERE gruppe_id = ?
      )
      AND ts.datum >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY u.id
      ORDER BY anzahl_sessions DESC
      LIMIT 10
    `, [gruppeId]);

    const [gruppenHighscores] = await db.query(`
      SELECT 
        u.name as uebung_name,
        u.zielmuskel,
        n.vname,
        n.nname,
        MAX(te.gewicht_kg) as max_gewicht,
        ts.nutzer_id
      FROM trainings_ergebnisse te
      JOIN trainings_sessions ts ON te.session_id = ts.id
      JOIN uebungen u ON te.uebung_id = u.id
      JOIN nutzer n ON ts.nutzer_id = n.id
      WHERE ts.nutzer_id IN (
        SELECT nutzer_id FROM gruppen_mitglieder WHERE gruppe_id = ?
      )
      GROUP BY u.id, ts.nutzer_id
      HAVING max_gewicht IN (
        SELECT DISTINCT max_gewicht
        FROM (
          SELECT MAX(te2.gewicht_kg) as max_gewicht
          FROM trainings_ergebnisse te2
          JOIN trainings_sessions ts2 ON te2.session_id = ts2.id
          WHERE te2.uebung_id = u.id
          AND ts2.nutzer_id IN (
            SELECT nutzer_id FROM gruppen_mitglieder WHERE gruppe_id = ?
          )
          GROUP BY ts2.nutzer_id
          ORDER BY max_gewicht DESC
          LIMIT 3
        ) as top3
      )
      ORDER BY u.name, max_gewicht DESC
      LIMIT 30
    `, [gruppeId, gruppeId]);

    const [wochenStats] = await db.query(`
      SELECT 
        YEARWEEK(ts.datum, 1) as woche,
        COUNT(DISTINCT ts.id) as anzahl_trainings,
        COUNT(DISTINCT ts.nutzer_id) as aktive_mitglieder
      FROM trainings_sessions ts
      WHERE ts.nutzer_id IN (
        SELECT nutzer_id FROM gruppen_mitglieder WHERE gruppe_id = ?
      )
      AND ts.datum >= DATE_SUB(CURDATE(), INTERVAL 28 DAY)
      GROUP BY woche
      ORDER BY woche ASC
    `, [gruppeId]);

    res.json({
      aktivitaet,
      beliebteUebungen,
      gruppenHighscores,
      wochenStats
    });

  } catch (error) {
    console.error('Fehler beim Abrufen der Gruppen-Statistiken:', error);
    res.status(500).json({ error: error.message });
  }
};

// ========================================
// GYM-TERMINE MIT PUSH-BENACHRICHTIGUNGEN
// ========================================

exports.getGymTermine = async (req, res) => {
  try {
    const { gruppeId } = req.params;
    const { monat, jahr } = req.query;

    let dateFilter = '';
    let params = [gruppeId];

    if (monat && jahr) {
      const startDatum = `${jahr}-${monat.padStart(2, '0')}-01`;
      dateFilter = 'AND gt.datum BETWEEN ? AND LAST_DAY(?)';
      params.push(startDatum, startDatum);
    }

    const [rows] = await db.query(`
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
      WHERE gt.gruppe_id = ?
      ${dateFilter}
      GROUP BY gt.id
      ORDER BY gt.datum ASC, gt.startzeit ASC
    `, params);

    const termine = rows.map(t => ({
      ...t,
      teilnehmer: t.teilnehmer ? t.teilnehmer.split('||').map(p => {
        const [id, name, status] = p.split(':');
        return { id: parseInt(id), name, status };
      }) : []
    }));

    res.json(termine);
  } catch (error) {
    console.error('Fehler beim Abrufen der Termine:', error);
    res.status(500).json({ error: error.message });
  }
};

// Termin erstellen MIT PUSH-BENACHRICHTIGUNG AN ALLE GRUPPENMITGLIEDER
exports.createGymTermin = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { nutzer_id, gruppe_id, datum, startzeit, notiz } = req.body;

    const nurDatum = datum.split('T')[0];


    if (!nutzer_id || !gruppe_id || !nurDatum || !startzeit) {
      return res.status(400).json({ error: 'Pflichtfelder fehlen' });
    }

    const [mitglied] = await connection.query(
      'SELECT * FROM gruppen_mitglieder WHERE nutzer_id = ? AND gruppe_id = ?',
      [nutzer_id, gruppe_id]
    );

    if (mitglied.length === 0) {
      await connection.rollback();
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }

    const [result] = await connection.query(
      'INSERT INTO gym_termine (nutzer_id, gruppe_id, datum, startzeit, notiz) VALUES (?, ?, ?, ?, ?)',
      [nutzer_id, gruppe_id, nurDatum, startzeit, notiz]
    );

    const terminId = result.insertId;

    const [savedTermin] = await connection.query(
      'SELECT id, datum, startzeit FROM gym_termine WHERE id = ?',
      [terminId]
    );

    // Ersteller automatisch als Teilnehmer hinzufügen
    await connection.query(
      'INSERT INTO gym_termin_teilnehmer (termin_id, nutzer_id) VALUES (?, ?)',
      [terminId, nutzer_id]
    );

    // Nutzer- und Gruppeninfo für Benachrichtigung
    const [nutzerInfo] = await connection.query(
      'SELECT vname, nname FROM nutzer WHERE id = ?',
      [nutzer_id]
    );

    const [gruppenInfo] = await connection.query(
      'SELECT name FROM gruppen WHERE id = ?',
      [gruppe_id]
    );

    await connection.commit();


    // Push-Benachrichtigung an alle Gruppenmitglieder (außer Ersteller) VOR Response
    const erstellerName = `${nutzerInfo[0].vname} ${nutzerInfo[0].nname}`;
    const gruppenName = gruppenInfo[0].name;
    const datumFormatiert = new Date(datum).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });


    const pushResult = await notifyGroupMembers(gruppe_id, nutzer_id, {
      title: '🏋️ Neuer Gym-Termin!',
      body: `${erstellerName} hat einen Termin am ${datumFormatiert} um ${startzeit.substring(0, 5)} Uhr erstellt`,
      icon: '/logo192.png',
      badge: '/badge.png',
      tag: `gym-termin-${terminId}`,
      data: {
        url: `/gruppen/${gruppe_id}/kalender`,
        termin_id: terminId,
        gruppe_id: gruppe_id,
        type: 'gym_termin_erstellt'
      }
    });

    res.status(201).json({
      id: terminId,
      message: 'Termin erstellt',
      push_sent: pushResult.success,
      push_count: pushResult.successful
    });

  } catch (error) {
    await connection.rollback();
    console.error('[Gym-Termin] ❌ Fehler beim Erstellen des Termins:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// Termin aktualisieren
exports.updateGymTermin = async (req, res) => {
  try {
    const { terminId } = req.params;
    const { datum, startzeit, notiz, nutzer_id } = req.body;

    const [termin] = await db.query(
      'SELECT * FROM gym_termine WHERE id = ? AND nutzer_id = ?',
      [terminId, nutzer_id]
    );

    if (termin.length === 0) {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }

    await db.query(
      'UPDATE gym_termine SET datum = ?, startzeit = ?, notiz = ? WHERE id = ?',
      [datum, startzeit, notiz, terminId]
    );

    res.json({ message: 'Termin aktualisiert' });
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Termins:', error);
    res.status(500).json({ error: error.message });
  }
};

// Termin löschen
exports.deleteGymTermin = async (req, res) => {
  try {
    const { terminId } = req.params;
    const { nutzer_id } = req.body;

    const [termin] = await db.query(
      'SELECT * FROM gym_termine WHERE id = ? AND nutzer_id = ?',
      [terminId, nutzer_id]
    );

    if (termin.length === 0) {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }
    await db.query('DELETE FROM termin_kommentare WHERE termin_id = ?', [terminId]);
    await db.query('DELETE FROM gym_termine WHERE id = ?', [terminId]);

    res.json({ message: 'Termin gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Termins:', error);
    res.status(500).json({ error: error.message });
  }
};

// Teilnahme-Status setzen (Zusage/Absage)
exports.setTeilnahmeStatus = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { terminId, nutzerId, status } = req.body; // status: 'zusage' oder 'absage'

    if (!['zusage', 'absage'].includes(status)) {
      return res.status(400).json({ error: 'Ungültiger Status' });
    }

    // Prüfe ob bereits ein Eintrag existiert
    const [existing] = await connection.query(
      'SELECT status FROM gym_termin_teilnehmer WHERE termin_id = ? AND nutzer_id = ?',
      [terminId, nutzerId]
    );

    let actionText = '';
    let previousStatus = existing.length > 0 ? existing[0].status : null;

    if (existing.length > 0) {
      // Status aktualisieren
      await connection.query(
        'UPDATE gym_termin_teilnehmer SET status = ? WHERE termin_id = ? AND nutzer_id = ?',
        [status, terminId, nutzerId]
      );
    } else {
      // Neuen Eintrag erstellen
      await connection.query(
        'INSERT INTO gym_termin_teilnehmer (termin_id, nutzer_id, status) VALUES (?, ?, ?)',
        [terminId, nutzerId, status]
      );
    }

    actionText = status === 'zusage' ? 'hat zugesagt' : 'hat abgesagt';

    // Termin- und Nutzerinfo für Benachrichtigung
    const [terminInfo] = await connection.query(`
      SELECT 
        gt.datum,
        gt.startzeit,
        gt.gruppe_id,
        gt.nutzer_id as ersteller_id,
        g.name as gruppen_name
      FROM gym_termine gt
      JOIN gruppen g ON gt.gruppe_id = g.id
      WHERE gt.id = ?
    `, [terminId]);

    const [nutzerInfo] = await connection.query(
      'SELECT vname, nname FROM nutzer WHERE id = ?',
      [nutzerId]
    );

    await connection.commit();

    console.log(`[Gym-Teilnahme] Nutzer ${nutzerId} ${actionText} für Termin ${terminId}`);

    // Push-Benachrichtigung nur senden wenn Status sich geändert hat
    if (previousStatus !== status) {
      const [teilnehmer] = await db.query(
        'SELECT nutzer_id FROM gym_termin_teilnehmer WHERE termin_id = ? AND nutzer_id != ?',
        [terminId, nutzerId]
      );

      if (teilnehmer.length > 0 && terminInfo.length > 0) {
        const nutzerName = `${nutzerInfo[0].vname} ${nutzerInfo[0].nname}`;
        const datumFormatiert = new Date(terminInfo[0].datum).toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

        const notification = {
          title: status === 'zusage' ? '✅ Neue Zusage!' : '❌ Absage',
          body: `${nutzerName} ${actionText} am ${datumFormatiert} um ${terminInfo[0].startzeit.substring(0, 5)} Uhr`,
          icon: '/logo192.png',
          badge: '/badge.png',
          tag: `gym-teilnahme-${terminId}-${nutzerId}`,
          data: {
            url: `/gruppen/${terminInfo[0].gruppe_id}/kalender`,
            termin_id: terminId,
            gruppe_id: terminInfo[0].gruppe_id,
            type: `gym_${status}`
          }
        };

        const pushResults = await Promise.allSettled(
          teilnehmer.map(t => sendPushNotification(t.nutzer_id, notification))
        );

        const successful = pushResults.filter(r =>
          r.status === 'fulfilled' && r.value.success
        ).length;

        console.log(`[Gym-Teilnahme] ✅ Push an ${successful} von ${teilnehmer.length} Teilnehmern gesendet`);
      }
    }

    res.json({
      message: status === 'zusage' ? 'Zugesagt' : 'Abgesagt',
      status
    });

  } catch (error) {
    await connection.rollback();
    console.error('[Gym-Teilnahme] ❌ Fehler beim Setzen des Status:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// Teilnahme komplett zurückziehen
exports.removeTeilnahme = async (req, res) => {
  try {
    const { terminId, nutzerId } = req.body;

    await db.query(
      'DELETE FROM gym_termin_teilnehmer WHERE termin_id = ? AND nutzer_id = ?',
      [terminId, nutzerId]
    );

    res.json({ message: 'Teilnahme zurückgezogen' });
  } catch (error) {
    console.error('[Gym-Teilnahme] Fehler beim Entfernen:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getKommentare = async (req, res) => {
  try {
    const { id } = req.params;

    let params = [id];

    const [rows] = await db.query(`SELECT * FROM termin_kommentare WHERE termin_id = ?`, params);

    if (rows.length > 0) {
      for (let row of rows) {
        const [nutzerInfo] = await db.query(
          'SELECT vname, nname FROM nutzer WHERE id = ?',
          [row.user_id]
        );
        row.nutzer_info = nutzerInfo[0];
      }
    }
    res.json(rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Kommentare:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.addKommentar = async (req, res) => {
  try {
    const { user_id, kommentar } = req.body;
    const { id: termin_id } = req.params;
    
    const [result] = await db.query(
      'INSERT INTO termin_kommentare (termin_id, user_id, text) VALUES (?, ?, ?)',
      [termin_id, user_id, kommentar]
    );

    const kommentarId = result.insertId;

    // Nutzer-Info für die Response holen
    const [userInfos] = await db.query(
      'SELECT vname, nname FROM nutzer WHERE id = ?', 
      [user_id]
    );

    // ⭐ NEU: Vollständiges Kommentar-Objekt erstellen (wie bei getKommentare)
    const neuesKommentar = {
      id: kommentarId,
      termin_id: termin_id,
      user_id: user_id,
      text: kommentar,
      erstellt_am: new Date(),
      nutzer_info: {
        vname: userInfos[0].vname,
        nname: userInfos[0].nname
      }
    };

    // ⭐ NEU: Socket.io - Sende an alle Clients im Termin-Room
    const io = req.app.get('io');
    io.to(`termin-${termin_id}`).emit('neuer-kommentar', neuesKommentar);
    
    console.log(`[Socket.io] 📨 Neuer Kommentar an termin-${termin_id} gesendet`);

    // Push-Benachrichtigung an Teilnehmer (bleibt wie es war)
    const notification = {
      title: "Neue Chatnachricht",
      body: `${userInfos[0].vname} ${userInfos[0].nname}: ${kommentar}`,
      icon: '/gadse.ico',
      badge: '/gadse.ico',
      tag: `Chat-Nachricht-${termin_id}-${user_id}`,
      data: {
        url: `/chat/${termin_id}`,
      }
    };

    const [teilnehmer] = await db.query(
      'SELECT nutzer_id FROM gym_termin_teilnehmer WHERE termin_id = ? AND nutzer_id != ?', 
      [termin_id, user_id]
    );

    const pushResults = await Promise.allSettled(
      teilnehmer.map(t => sendPushNotification(t.nutzer_id, notification))
    );

    const successful = pushResults.filter(r =>
      r.status === 'fulfilled' && r.value.success
    ).length;

    console.log(`[Chat-Nachricht] ✅ Push an ${successful} von ${teilnehmer.length} Teilnehmern gesendet`);

    res.status(201).json({ 
      id: kommentarId, 
      message: 'Kommentar hinzugefügt',
      kommentar: neuesKommentar // ⭐ NEU: Kommentar zurückgeben
    });
  } catch (error) {
    console.error('Fehler beim Hinzufügen des Kommentars:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getGruppeByTerminId = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(`
      SELECT gruppe_id FROM gym_termine WHERE id = ?
    `, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Kommentar oder Gruppe nicht gefunden' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Fehler beim Abrufen der Gruppe des Kommentars:', error);
    res.status(500).json({ error: error.message });
  }
};