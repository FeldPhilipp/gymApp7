const express = require('express');
const router = express.Router();
const gewichtController = require('../controllers/gewichtController');

// POST /api/gewicht - Gewicht erstellen
router.post('/', gewichtController.createGewicht);

// GET /api/gewicht/nutzer/:nutzerId - Gewichtsdaten eines Nutzers
router.get('/nutzer/:nutzerId', gewichtController.getGewichtByNutzer);

// GET /api/gewicht/nutzer/:nutzerId/stats - Statistiken
router.get('/nutzer/:nutzerId/stats', gewichtController.getGewichtStats);

// GET /api/gewicht/:id - Einzelner Eintrag
router.get('/:id', gewichtController.getGewichtById);

// PUT /api/gewicht/:id - Gewichtseintrag aktualisieren
router.put('/:id', gewichtController.updateGewicht);

// DELETE /api/gewicht/:id - Gewichtseintrag löschen
router.delete('/:id', gewichtController.deleteGewicht);

// Füge diese Route hinzu:
router.get('/nutzer/:nutzerId/erweiterte-stats', gewichtController.getErweiterteStats);

module.exports = router;