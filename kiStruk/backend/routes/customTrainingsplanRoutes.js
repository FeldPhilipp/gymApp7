const express = require('express');
const router = express.Router();
const controller = require('../controllers/customTrainingsplanController');

// Trainingspläne
router.get('/nutzer/:nutzerId', controller.getEigeneTrainingsplaene);
router.get('/:planId', controller.getEigenerTrainingsplanById);
router.post('/', controller.createEigenerTrainingsplan);
router.put('/:planId', controller.updateEigenerTrainingsplan);
router.delete('/:planId', controller.deleteEigenerTrainingsplan);

// Übungen in Plänen
router.post('/uebungen', controller.addUebungToPlan);
router.delete('/uebungen/:uebungId', controller.deleteUebungFromPlan);
router.put('/uebungen/:uebungId', controller.updateUebungInPlan);

// Verfügbare Übungen
router.get('/uebungen/verfuegbar/alle', controller.getAlleVerfuegbareUebungen);

module.exports = router;