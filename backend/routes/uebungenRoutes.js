const express = require('express');
const router = express.Router();
const uebungenController = require('../controllers/uebungenController');

router.get('/', uebungenController.getAllUebungen);
router.get('/kategorie/:kategorie', uebungenController.getUebungenByKategorie);
router.get('/:id', uebungenController.getUebungById);
router.post('/', uebungenController.createUebung);

module.exports = router;
