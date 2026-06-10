const express = require('express');
const router = express.Router();
const controller = require('../controllers/cardioController');

// Statistiken (vor /:id damit kein Konflikt)
router.get('/stats', controller.getCardioStats);

// CRUD
router.get('/', controller.getCardioSessions);
router.get('/:id', controller.getCardioSessionById);
router.post('/', controller.createCardioSession);
router.put('/:id', controller.updateCardioSession);
router.delete('/:id', controller.deleteCardioSession);

module.exports = router;