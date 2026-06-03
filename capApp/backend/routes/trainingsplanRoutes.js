const express = require('express');
const router = express.Router();
const trainingsplanController = require('../controllers/trainingsplanController');

router.get('/', trainingsplanController.getAllTrainingsplaene);
router.get('/:id', trainingsplanController.getTrainingsplanById);

module.exports = router;
