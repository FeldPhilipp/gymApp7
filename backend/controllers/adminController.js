const db = require('../config/db');
const path = require('path');
const fs = require('fs');

exports.getAllTermine = async (req, res) => {
    try {
        const [termine] = await db.query(`SELECT gruppe_id, datum, startzeit FROM gym_termine`)
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

// Whitelist erlaubter Tabellen
const ALLOWED_TABLES = [
    'nutzer', 'uebungen', 'training_sessions', 'training_ergebnisse',
    'gym_termine', 'feedback', 'custom_trainingsplan', 'custom_plan_uebungen',
    'gruppen', 'gruppen_mitglieder', 'gewicht_eintraege'
];

exports.getIndividual = async (req, res) => {
    try {
        const { table, fields, filters, order_by, order_dir, limit } = req.query;

        if (!table) return res.status(400).json({ error: 'Tabelle fehlt' });
        if (!ALLOWED_TABLES.includes(table)) return res.status(400).json({ error: 'Tabelle nicht erlaubt' });

        // Felder
        let cols = '*';
        if (fields) {
            const fieldList = fields.split(',').map(f => f.trim()).filter(Boolean);
            if (fieldList.length) cols = fieldList.map(f => `\`${f}\``).join(', ');
        }

        // Filter: filters=spalte:wert,spalte2:wert2
        const whereParts = [];
        const values = [];
        if (filters) {
            filters.split(',').forEach(part => {
                const [col, ...rest] = part.split(':');
                const val = rest.join(':');
                if (col && val !== undefined) {
                    whereParts.push(`\`${col.trim()}\` = ?`);
                    values.push(val.trim());
                }
            });
        }
        const where = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

        // Order
        const safeDir = order_dir?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        const orderClause = order_by ? `ORDER BY \`${order_by}\` ${safeDir}` : '';

        // Limit (max 500)
        const safeLimit = Math.min(parseInt(limit) || 50, 500);

        // Schema abfragen für Spalteninfo
        const [columns] = await db.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION`,
            [table]
        );

        const sql = `SELECT ${cols} FROM \`${table}\` ${where} ${orderClause} LIMIT ?`;
        const [rows] = await db.query(sql, [...values, safeLimit]);

        res.json({
            table,
            columns: columns.map(c => c.COLUMN_NAME),
            count: rows.length,
            rows
        });

    } catch (error) {
        console.error('Fehler bei getIndividual:', error);
        res.status(500).json({ error: error.message });
    }
};