const express = require('express');
const router = express.Router();
const uebungenController = require('../controllers/uebungenController');

router.get('/', uebungenController.getAllUebungen);
router.get('/kategorie/:kategorie', uebungenController.getUebungenByKategorie);
router.post('/user-uebung', uebungenController.createUserUebung);
router.get('/user-uebungen/:id', uebungenController.getUebungByUserId);
router.get('/:id', uebungenController.getUebungById);

module.exports = router;
