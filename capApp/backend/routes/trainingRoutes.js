const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');

// GET /api/training/plaene - Alle Trainingspläne
router.get('/plaene', trainingController.getAllTrainingsplaene);

// GET /api/training/plaene/:planId/uebungen - Übungen eines Plans
router.get('/plaene/:planId/uebungen', trainingController.getUebungenByPlan);

// GET /api/training/uebungen/:uebungId/letzte - Letzte Ergebnisse einer Übung
router.get('/uebungen/:uebungId/letzte', trainingController.getLetzteErgebnisse);

// POST /api/training/sessions - Neue Session erstellen
router.post('/sessions', trainingController.createSession);

// GET /api/training/sessions/:nutzerId - Alle Sessions eines Nutzers
router.get('/sessions/:nutzerId', trainingController.getSessionsByNutzer);

// GET /api/training/sessions/:sessionId/details - Details einer Session
router.get('/sessions/:sessionId/details', trainingController.getSessionDetails);

// GET /api/training/sessions/:sessionId/ergebnisse - Ergebnisse einer Session
router.get('/sessions/:sessionId/ergebnisse', trainingController.getSessionErgebnisse);

// Neue Route für Übungen mit Historie-Logik
router.get('/plaene/:planId/uebungen-oder-historie', trainingController.getUebungenFuerPlan);

// Neue Route für Session mit Historie
router.post('/sessions/mit-historie', trainingController.createSessionMitHistorie);

// Dashboard-Statistiken
router.get('/dashboard/:nutzerId', trainingController.getDashboardStats);

// PUT /api/training/sessions/:sessionId - Session aktualisieren
router.put('/sessions/:sessionId', trainingController.updateSession);

// DELETE /api/training/sessions/:sessionId - Session löschen
router.delete('/sessions/:sessionId', trainingController.deleteSession);

// POST /api/training/temp-session - Temp-Session speichern
router.post('/temp-session', trainingController.saveTempSession);

// GET /api/training/temp-session/:nutzerId - Temp-Session laden
router.get('/temp-session/:nutzerId', trainingController.getTempSession);

// DELETE /api/training/temp-session/:nutzerId - Temp-Session löschen
router.delete('/temp-session/:nutzerId', trainingController.deleteTempSession);

module.exports = router;