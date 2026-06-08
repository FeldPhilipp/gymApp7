const db = require('../config/db');

// Gewicht erstellen
exports.createGewicht = async (req, res) => {
  try {
    const { nutzer_id, gewicht, datum, notiz } = req.body;

    if (!nutzer_id || !gewicht || !datum) {
      return res.status(400).json({ error: 'Nutzer-ID, Gewicht und Datum sind erforderlich' });
    }

    // Prüfen ob bereits ein Eintrag für dieses Datum existiert
    const [existing] = await db.query(
      'SELECT id FROM gewicht_tracking WHERE nutzer_id = ? AND datum = ?',
      [nutzer_id, datum]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Für dieses Datum existiert bereits ein Eintrag' });
    }

    const [result] = await db.query(
      'INSERT INTO gewicht_tracking (nutzer_id, gewicht, datum, notiz) VALUES (?, ?, ?, ?)',
      [nutzer_id, gewicht, datum, notiz || null]
    );

    // Aktuelles Gewicht in nutzer-Tabelle aktualisieren
    await db.query(
      'UPDATE nutzer SET gewicht = ? WHERE id = ?',
      [gewicht, nutzer_id]
    );

    res.status(201).json({
      id: result.insertId,
      nutzer_id,
      gewicht,
      datum,
      notiz,
      message: 'Gewicht erfolgreich eingetragen'
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des Gewichtseintrags:', error);
    res.status(500).json({ error: error.message });
  }
};

// Gewicht eines Nutzers abrufen
exports.getGewichtByNutzer = async (req, res) => {
  try {
    const { nutzerId } = req.params;
    const limit = parseInt(req.query.limit) || 30;

    const [rows] = await db.query(
      'SELECT * FROM gewicht_tracking WHERE nutzer_id = ? ORDER BY datum DESC LIMIT ?',
      [nutzerId, limit]
    );

    res.json(rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Gewichtsdaten:', error);
    res.status(500).json({ error: error.message });
  }
};

// Statistiken berechnen
exports.getGewichtStats = async (req, res) => {
  try {
    const { nutzerId } = req.params;
    const days = parseInt(req.query.days) || 30;

    // Aktuelles Gewicht
    const [current] = await db.query(
      'SELECT gewicht FROM gewicht_tracking WHERE nutzer_id = ? ORDER BY datum DESC LIMIT 1',
      [nutzerId]
    );

    // Gewicht vor X Tagen
    const [previous] = await db.query(
      'SELECT gewicht FROM gewicht_tracking WHERE nutzer_id = ? AND datum <= DATE_SUB(CURDATE(), INTERVAL ? DAY) ORDER BY datum DESC LIMIT 1',
      [nutzerId, days]
    );

    // Zielgewicht aus nutzer-Tabelle
    const [nutzer] = await db.query(
      'SELECT ziel_gewicht FROM nutzer WHERE id = ?',
      [nutzerId]
    );

    // Anzahl Einträge in den letzten X Tagen (separates Query)
    const [count] = await db.query(
      'SELECT COUNT(*) as anzahl FROM gewicht_tracking WHERE nutzer_id = ? AND datum >= DATE_SUB(CURDATE(), INTERVAL ? DAY)',
      [nutzerId, days]
    );

    const aktuelles_gewicht = current[0]?.gewicht || null;
    const vorheriges_gewicht = previous[0]?.gewicht || null;
    const ziel_gewicht = nutzer[0]?.ziel_gewicht || null;

    const differenz = aktuelles_gewicht && vorheriges_gewicht
      ? parseFloat((aktuelles_gewicht - vorheriges_gewicht).toFixed(2))
      : 0;

    const ziel_differenz = aktuelles_gewicht && ziel_gewicht
      ? parseFloat((aktuelles_gewicht - ziel_gewicht).toFixed(2))
      : null;

    res.json({
      aktuelles_gewicht: aktuelles_gewicht ? parseFloat(aktuelles_gewicht) : null,
      differenz,
      ziel_gewicht: ziel_gewicht ? parseFloat(ziel_gewicht) : null,
      ziel_differenz,
      anzahl_eintraege: count[0].anzahl
    });
  } catch (error) {
    console.error('Fehler beim Berechnen der Statistiken:', error);
    res.status(500).json({ error: error.message });
  }
};

// Einzelnen Gewichtseintrag abrufen
exports.getGewichtById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      'SELECT * FROM gewicht_tracking WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Eintrag nicht gefunden' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Fehler beim Abrufen des Eintrags:', error);
    res.status(500).json({ error: error.message });
  }
};

// Gewichtseintrag aktualisieren
exports.updateGewicht = async (req, res) => {
  try {
    const { id } = req.params;
    const { gewicht, datum, notiz } = req.body;

    if (!gewicht || !datum) {
      return res.status(400).json({ error: 'Gewicht und Datum sind erforderlich' });
    }

    // Prüfen ob Eintrag existiert
    const [existing] = await db.query(
      'SELECT nutzer_id FROM gewicht_tracking WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Eintrag nicht gefunden' });
    }

    // Prüfen ob bereits ein anderer Eintrag für dieses Datum existiert
    const [duplicate] = await db.query(
      'SELECT id FROM gewicht_tracking WHERE nutzer_id = ? AND datum = ? AND id != ?',
      [existing[0].nutzer_id, datum, id]
    );

    if (duplicate.length > 0) {
      return res.status(409).json({ error: 'Für dieses Datum existiert bereits ein anderer Eintrag' });
    }

    await db.query(
      'UPDATE gewicht_tracking SET gewicht = ?, datum = ?, notiz = ? WHERE id = ?',
      [gewicht, datum, notiz || null, id]
    );

    // Wenn dies der neueste Eintrag ist, auch nutzer-Tabelle aktualisieren
    const [latest] = await db.query(
      'SELECT id, gewicht FROM gewicht_tracking WHERE nutzer_id = ? ORDER BY datum DESC LIMIT 1',
      [existing[0].nutzer_id]
    );

    if (latest[0].id === parseInt(id)) {
      await db.query(
        'UPDATE nutzer SET gewicht = ? WHERE id = ?',
        [gewicht, existing[0].nutzer_id]
      );
    }

    res.json({ message: 'Gewichtseintrag aktualisiert' });
  } catch (error) {
    console.error('Fehler beim Aktualisieren:', error);
    res.status(500).json({ error: error.message });
  }
};

// Gewichtseintrag löschen
exports.deleteGewicht = async (req, res) => {
  try {
    const { id } = req.params;

    // Prüfen ob Eintrag existiert
    const [existing] = await db.query(
      'SELECT nutzer_id FROM gewicht_tracking WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Eintrag nicht gefunden' });
    }

    await db.query('DELETE FROM gewicht_tracking WHERE id = ?', [id]);

    // Aktuelles Gewicht in nutzer-Tabelle aktualisieren
    const [latest] = await db.query(
      'SELECT gewicht FROM gewicht_tracking WHERE nutzer_id = ? ORDER BY datum DESC LIMIT 1',
      [existing[0].nutzer_id]
    );

    if (latest.length > 0) {
      await db.query(
        'UPDATE nutzer SET gewicht = ? WHERE id = ?',
        [latest[0].gewicht, existing[0].nutzer_id]
      );
    }

    res.json({ message: 'Gewichtseintrag gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen:', error);
    res.status(500).json({ error: error.message });
  }
};

// Füge diese neue Funktion zum bestehenden Controller hinzu:

exports.getErweiterteStats = async (req, res) => {
  try {
    const { nutzerId } = req.params;

    // Nutzer-Daten abrufen
    const [nutzer] = await db.query(
      'SELECT id, vname, nname, email, geb_datum, geschlecht, gewicht, start_gewicht, ziel_gewicht, ziel_datum, groesse, aktivitaetslevel FROM nutzer WHERE id = ?',
      [nutzerId]
    );

    if (nutzer.length === 0) {
      return res.status(404).json({ error: 'Nutzer nicht gefunden' });
    }

    const nutzerData = nutzer[0];

    // Wenn kein Startgewicht gesetzt ist, ersten Eintrag oder aktuelles Gewicht nehmen
    let startGewicht = nutzerData.start_gewicht;
    if (!startGewicht) {
      const [ersterEintrag] = await db.query(
        'SELECT gewicht FROM gewicht_tracking WHERE nutzer_id = ? ORDER BY datum ASC LIMIT 1',
        [nutzerId]
      );
      startGewicht = ersterEintrag.length > 0 ? ersterEintrag[0].gewicht : nutzerData.gewicht;
    }

    // Aktuelles Gewicht aus letztem Eintrag
    const [aktuellesGewicht] = await db.query(
      'SELECT gewicht FROM gewicht_tracking WHERE nutzer_id = ? ORDER BY datum DESC LIMIT 1',
      [nutzerId]
    );
    const aktuelles_gewicht = aktuellesGewicht.length > 0 ? aktuellesGewicht[0].gewicht : nutzerData.gewicht;

    // Gewichtsverlauf abrufen (alle Einträge)
    const [verlauf] = await db.query(
      'SELECT gewicht, datum FROM gewicht_tracking WHERE nutzer_id = ? ORDER BY datum ASC',
      [nutzerId]
    );

    // Startgewicht als ersten Datenpunkt hinzufügen wenn keine Einträge
    const gewichtsverlauf = verlauf.length > 0 ? verlauf : [
      { gewicht: startGewicht, datum: new Date().toISOString().split('T')[0] }
    ];

    // Fortschritt berechnen
    const gewicht_differenz = aktuelles_gewicht - nutzerData.ziel_gewicht;
    const gesamte_strecke = startGewicht - nutzerData.ziel_gewicht;
    const bereits_geschafft = startGewicht - aktuelles_gewicht;
    const fortschritt = gesamte_strecke !== 0 ? (bereits_geschafft / gesamte_strecke) * 100 : 0;

    // Kalorien-Bedarf berechnen
    let kalorienBedarf = null;
    let tage_bis_ziel = null;
    let erwarteter_verlust = 0;
    let warnung = null;

    if (nutzerData.ziel_datum && nutzerData.ziel_gewicht) {
      const heute = new Date();
      const zielDatum = new Date(nutzerData.ziel_datum);
      tage_bis_ziel = Math.ceil((zielDatum - heute) / (1000 * 60 * 60 * 24));

      if (tage_bis_ziel > 0) {
        // Benötigter Gewichtsverlust
        const kg_zu_verlieren = Math.abs(gewicht_differenz);

        // Benötigter Verlust pro Woche
        const wochen_bis_ziel = tage_bis_ziel / 7;
        const kg_pro_woche = kg_zu_verlieren / wochen_bis_ziel;

        // 1 kg Fett ≈ 7700 kcal
        const kalorien_defizit_pro_tag = (kg_pro_woche * 7700) / 7;

        // Empfehlung basierend auf Defizit
        let empfehlung = 'moderate';
        let tagesbedarf_defizit = 500; // Standard moderates Defizit

        if (kalorien_defizit_pro_tag > 1000) {
          empfehlung = 'aggressive';
          tagesbedarf_defizit = 1000; // Max. empfohlenes Defizit
          warnung = `Das Zieldatum ist sehr ambitioniert. Ein Defizit von ${Math.round(kalorien_defizit_pro_tag)} kcal/Tag ist nicht gesund. Wir empfehlen ein moderateres Tempo.`;
        } else if (kalorien_defizit_pro_tag > 750) {
          empfehlung = 'aggressive';
          tagesbedarf_defizit = Math.round(kalorien_defizit_pro_tag);
        } else if (kalorien_defizit_pro_tag > 500) {
          empfehlung = 'moderate';
          tagesbedarf_defizit = Math.round(kalorien_defizit_pro_tag);
        } else if (kalorien_defizit_pro_tag > 250) {
          empfehlung = 'slow';
          tagesbedarf_defizit = Math.round(kalorien_defizit_pro_tag);
        } else {
          empfehlung = 'slow';
          tagesbedarf_defizit = 250; // Min. sinnvolles Defizit
          warnung = 'Das Zieldatum lässt viel Zeit. Du könntest dein Ziel schneller erreichen mit einem moderaten Defizit.';
        }

        // BMR berechnen (wird im Frontend nochmal gemacht, aber für Tagesbedarf)
        const alter = new Date().getFullYear() - new Date(nutzerData.geb_datum).getFullYear();
        let bmr;

        if (nutzerData.geschlecht === 'm') {
          bmr = 10 * aktuelles_gewicht + 6.25 * nutzerData.groesse - 5 * alter + 5;
        } else if (nutzerData.geschlecht === 'w') {
          bmr = 10 * aktuelles_gewicht + 6.25 * nutzerData.groesse - 5 * alter - 161;
        } else {
          bmr = 10 * aktuelles_gewicht + 6.25 * nutzerData.groesse - 5 * alter - 78;
        }

        const aktivitaetsMultiplikator = {
          sedentary: 1.2,
          light: 1.375,
          moderate: 1.55,
          active: 1.725,
          very_active: 1.9
        };

        const erhaltungskalorien = Math.round(bmr * aktivitaetsMultiplikator[nutzerData.aktivitaetslevel || 'moderate']);

        kalorienBedarf = {
          defizit: tagesbedarf_defizit,
          tagesbedarf: erhaltungskalorien - tagesbedarf_defizit,
          empfehlung: empfehlung
        };

        erwarteter_verlust = (tagesbedarf_defizit * 7) / 7700; // kg pro Woche
      } else {
        warnung = 'Das Zieldatum liegt in der Vergangenheit. Bitte aktualisiere dein Zieldatum.';
      }
    }

    res.json({
      nutzer: nutzerData,
      start_gewicht: startGewicht ? parseFloat(startGewicht) : null,
      aktuelles_gewicht: parseFloat(aktuelles_gewicht),
      ziel_gewicht: nutzerData.ziel_gewicht ? parseFloat(nutzerData.ziel_gewicht) : null,
      ziel_datum: nutzerData.ziel_datum,
      gewicht_differenz: parseFloat(gewicht_differenz.toFixed(2)),
      fortschritt: parseFloat(fortschritt.toFixed(2)),
      gewichtsverlauf: gewichtsverlauf.map(v => ({
        gewicht: parseFloat(v.gewicht),
        datum: v.datum
      })),
      kalorienBedarf: kalorienBedarf,
      tage_bis_ziel: tage_bis_ziel,
      erwarteter_verlust: parseFloat(erwarteter_verlust.toFixed(2)),
      warnung: warnung
    });

  } catch (error) {
    console.error('Fehler beim Berechnen der erweiterten Statistik:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;