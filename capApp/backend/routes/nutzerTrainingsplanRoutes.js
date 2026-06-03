const express = require('express');
const router = express.Router();
const nutzerTrainingsplanController = require('../controllers/nutzerTrainingsplanController');

router.get('/nutzer/:nutzerId', nutzerTrainingsplanController.getTrainingsplaeneByNutzerId);
router.post('/', nutzerTrainingsplanController.addUebungToTrainingsplan);
router.delete('/:id', nutzerTrainingsplanController.deleteUebungFromTrainingsplan);

module.exports = router;
