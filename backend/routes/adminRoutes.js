const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminController');

router.get('/termine', controller.getAllTermine);
router.post('/addUebung', controller.addNewUebung);
router.get('/logs', controller.getLogs);
router.get('/individual', controller.getIndividual);


module.exports = router;