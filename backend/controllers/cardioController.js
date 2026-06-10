const db = require('../config/db');

// Alle Cardio-Sessions eines Nutzers abrufen
exports.getCardioSessions = async (req, res) => {
    try {
        const nutzer_id = req.user.id;

        const [sessions] = await db.query(
            `SELECT 
                cs.id,
                cs.datum,
                cs.cardio_typ,
                cs.dauer_minuten,
                cs.distanz_km,
                cs.durchschnitts_bpm,
                cs.max_bpm,
                cs.kalorien,
                cs.intensitaet,
                cs.notizen,
                cs.created_at
            FROM cardio_sessions cs
            WHERE cs.nutzer_id = ?
            ORDER BY cs.datum DESC, cs.created_at DESC`,
            [nutzer_id]
        );

        res.json(sessions);
    } catch (error) {
        console.error('Fehler bei getCardioSessions:', error);
        res.status(500).json({ error: error.message });
    }
};

// Einzelne Cardio-Session abrufen
exports.getCardioSessionById = async (req, res) => {
    try {
        const nutzer_id = req.user.id;
        const { id } = req.params;

        const [sessions] = await db.query(
            `SELECT * FROM cardio_sessions WHERE id = ? AND nutzer_id = ?`,
            [id, nutzer_id]
        );

        if (sessions.length === 0) {
            return res.status(404).json({ error: 'Session nicht gefunden' });
        }

        res.json(sessions[0]);
    } catch (error) {
        console.error('Fehler bei getCardioSessionById:', error);
        res.status(500).json({ error: error.message });
    }
};

// Neue Cardio-Session erstellen
exports.createCardioSession = async (req, res) => {
    try {
        const nutzer_id = req.user.id;
        const {
            datum,
            cardio_typ,
            dauer_minuten,
            distanz_km,
            durchschnitts_bpm,
            max_bpm,
            kalorien,
            intensitaet,
            notizen
        } = req.body;

        if (!datum || !cardio_typ || !dauer_minuten) {
            return res.status(400).json({ error: 'Datum, Typ und Dauer sind Pflichtfelder' });
        }

        const erlaubteTypen = ['laufen', 'radfahren', 'schwimmen', 'rudern', 'seilspringen', 'ellipse', 'stepper', 'sonstiges'];
        if (!erlaubteTypen.includes(cardio_typ)) {
            return res.status(400).json({ error: 'Ungültiger Cardio-Typ' });
        }

        const erlaubteIntensitaeten = ['leicht', 'moderat', 'intensiv', 'maximal'];
        if (intensitaet && !erlaubteIntensitaeten.includes(intensitaet)) {
            return res.status(400).json({ error: 'Ungültige Intensität' });
        }

        const [result] = await db.query(
            `INSERT INTO cardio_sessions 
                (nutzer_id, datum, cardio_typ, dauer_minuten, distanz_km, durchschnitts_bpm, max_bpm, kalorien, intensitaet, notizen)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nutzer_id,
                datum,
                cardio_typ,
                dauer_minuten,
                distanz_km || null,
                durchschnitts_bpm || null,
                max_bpm || null,
                kalorien || null,
                intensitaet || null,
                notizen || null
            ]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Cardio-Session gespeichert'
        });
    } catch (error) {
        console.error('Fehler bei createCardioSession:', error);
        res.status(500).json({ error: error.message });
    }
};

// Cardio-Session aktualisieren
exports.updateCardioSession = async (req, res) => {
    try {
        const nutzer_id = req.user.id;
        const { id } = req.params;
        const {
            datum,
            cardio_typ,
            dauer_minuten,
            distanz_km,
            durchschnitts_bpm,
            max_bpm,
            kalorien,
            intensitaet,
            notizen
        } = req.body;

        // Prüfen ob Session dem Nutzer gehört
        const [existing] = await db.query(
            `SELECT id FROM cardio_sessions WHERE id = ? AND nutzer_id = ?`,
            [id, nutzer_id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Session nicht gefunden' });
        }

        await db.query(
            `UPDATE cardio_sessions SET
                datum = ?,
                cardio_typ = ?,
                dauer_minuten = ?,
                distanz_km = ?,
                durchschnitts_bpm = ?,
                max_bpm = ?,
                kalorien = ?,
                intensitaet = ?,
                notizen = ?
            WHERE id = ? AND nutzer_id = ?`,
            [
                datum,
                cardio_typ,
                dauer_minuten,
                distanz_km || null,
                durchschnitts_bpm || null,
                max_bpm || null,
                kalorien || null,
                intensitaet || null,
                notizen || null,
                id,
                nutzer_id
            ]
        );

        res.json({ message: 'Cardio-Session aktualisiert' });
    } catch (error) {
        console.error('Fehler bei updateCardioSession:', error);
        res.status(500).json({ error: error.message });
    }
};

// Cardio-Session löschen
exports.deleteCardioSession = async (req, res) => {
    try {
        const nutzer_id = req.user.id;
        const { id } = req.params;

        const [result] = await db.query(
            `DELETE FROM cardio_sessions WHERE id = ? AND nutzer_id = ?`,
            [id, nutzer_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Session nicht gefunden' });
        }

        res.json({ message: 'Cardio-Session gelöscht' });
    } catch (error) {
        console.error('Fehler bei deleteCardioSession:', error);
        res.status(500).json({ error: error.message });
    }
};

// Statistiken / Zusammenfassung
exports.getCardioStats = async (req, res) => {
    try {
        const nutzer_id = req.user.id;
        const { von, bis } = req.query;

        let dateFilter = '';
        const params = [nutzer_id];

        if (von && bis) {
            dateFilter = 'AND datum BETWEEN ? AND ?';
            params.push(von, bis);
        }

        const [stats] = await db.query(
            `SELECT
                COUNT(*) AS anzahl_sessions,
                SUM(dauer_minuten) AS gesamt_minuten,
                ROUND(SUM(distanz_km), 2) AS gesamt_km,
                ROUND(AVG(durchschnitts_bpm), 0) AS avg_bpm,
                SUM(kalorien) AS gesamt_kalorien,
                cardio_typ,
                COUNT(*) AS typ_anzahl
            FROM cardio_sessions
            WHERE nutzer_id = ? ${dateFilter}
            GROUP BY cardio_typ
            ORDER BY typ_anzahl DESC`,
            params
        );

        const [gesamt] = await db.query(
            `SELECT
                COUNT(*) AS anzahl_sessions,
                SUM(dauer_minuten) AS gesamt_minuten,
                ROUND(SUM(distanz_km), 2) AS gesamt_km,
                SUM(kalorien) AS gesamt_kalorien
            FROM cardio_sessions
            WHERE nutzer_id = ? ${dateFilter}`,
            params
        );

        res.json({
            gesamt: gesamt[0],
            nach_typ: stats
        });
    } catch (error) {
        console.error('Fehler bei getCardioStats:', error);
        res.status(500).json({ error: error.message });
    }
};