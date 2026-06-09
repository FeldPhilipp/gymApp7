const db = require('../config/db');
const path = require('path');
const fs = require('fs');

exports.getAllTermine = async (req, res) => {
    try {
        const [termine] = await db.query(`SELECT gruppe_id, datum, startzeit FROM gym_termine`)
        console.table(termine)
        res.json(termine)
    } catch (error) {
        console.error("Fehler bei getAllTermine: ", error)
        res.status(500).json({ error: error.message });
    }
};

exports.addNewUebung = async (req, res) => {
    try {
        const { name, zielmuskel, kategorie, beschreibung } = req.body;
        console.log(name, zielmuskel, kategorie, beschreibung)
        const [result] = await db.query(
            'INSERT INTO uebungen (name, zielmuskel, kategorie, beschreibung) VALUES (?, ?, ?, ?)',
            [name, zielmuskel, kategorie, beschreibung]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Übung erstellt'
        });
    } catch (error) {
        console.error("Fehler bei addNewuebung: ", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const lines = 100; // optional ?lines=200

        // Pfade zu deinen PM2-Logs
        const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '..', 'logs');
        const LOG_OUT = path.join(LOG_DIR, 'tiegel-backend-out.log');
        const LOG_ERR = path.join(LOG_DIR, 'tiegel-backend-error.log');

        // Hilfsfunktion: letzte X Zeilen einer Logdatei lesen
        const tail = (file, lines) => {
            if (!fs.existsSync(file)) return 'Datei nicht gefunden unter ' + file;
            const data = fs.readFileSync(file, 'utf8').trim().split('\n');
            return data.slice(-lines).join('\n');
        };

        // Logs lesen
        const outLog = tail(LOG_OUT, lines);
        const errLog = tail(LOG_ERR, lines);

        // JSON-Antwort
        res.json({
            success: true,
            lines,
            logs: {
                out: outLog,
                error: errLog
            }
        });

    } catch (error) {
        console.error('Fehler bei getLogs:', error);
        res.status(500).json({ error: error.message });
    }
};