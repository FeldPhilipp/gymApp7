const express = require('express');
const router = express.Router();
const controller = require('../controllers/premAccController');

// GET  /api/sub/status/:nutzerId  – Premium-Status prüfen
router.get('/status/:nutzerId', controller.getStatus);

// POST /api/sub/activate           – Nach PayPal-Zahlung aktivieren
router.post('/activate', controller.activatePremium);

// POST /api/sub/cancel             – Abo kündigen
router.post('/cancel', controller.cancelSubscription);

module.exports = router;