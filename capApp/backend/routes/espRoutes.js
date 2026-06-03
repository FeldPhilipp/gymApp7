const express = require('express');
const router = express.Router();
const espController = require('../controllers/espController');

// GET /api/training/plaene - Alle Trainingspläne
router.get('/data', espController.getData);

module.exports = router;