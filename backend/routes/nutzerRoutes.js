const express = require('express');
const router = express.Router();
const nutzerController = require('../controllers/nutzerController');

// POST /api/nutzer/login - Login
router.post('/login', nutzerController.login);

// POST /api/nutzer - Registrierung
router.post('/', nutzerController.createNutzer);

// GET /api/nutzer - Alle Nutzer
router.get('/', nutzerController.getAllNutzer);

// GET /api/nutzer/:id - Einzelner Nutzer
router.get('/:id', nutzerController.getNutzerById);

// PUT /api/nutzer/:id - Nutzer aktualisieren
router.put('/:id', nutzerController.updateNutzer);

router.post('/forgot-password', nutzerController.forgotPassword);

router.post('/reset-password', nutzerController.resetPassword);

// PUT /api/nutzer/:id/change-password
router.put('/:id/change-password', nutzerController.changePassword);

router.get('/:id/is-admin', nutzerController.isAdmin);

// Ziel-Einstellungen
router.put('/:id/ziel-einstellungen', nutzerController.updateZielEinstellungen);

// ⭐ NEU: Session-Validierung (GET)
router.get('/validate-session', nutzerController.validateSession);

// ⭐ NEU: Logout (POST)
router.post('/logout', nutzerController.logout);

router.post('/setPremium', nutzerController.setPremium);

module.exports = router;