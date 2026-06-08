const express = require('express');
const router = express.Router();
const gruppenController = require('../controllers/gruppenController');

// Gruppen
router.get('/nutzer/:nutzerId', gruppenController.getGruppenByNutzer);
router.get('/favorit/:nutzerId', gruppenController.getFavoritGruppe);
router.post('/', gruppenController.createGruppe);
router.post('/favorit', gruppenController.setFavorit);
router.delete('/', gruppenController.deleteGruppe);
router.post('/leave', gruppenController.leaveGruppe);
router.get('/:gruppeId/stats', gruppenController.getGruppenStats);

// Mitglieder
router.get('/:gruppeId/mitglieder', gruppenController.getMitglieder);
router.delete('/mitglieder', gruppenController.removeMitglied);

// Nutzer-Suche
router.get('/search/nutzer', gruppenController.searchNutzer);

// Einladungen
router.post('/einladungen', gruppenController.createEinladung);
router.get('/einladungen/:nutzerId', gruppenController.getEinladungen);
router.post('/einladungen/accept', gruppenController.acceptEinladung);
router.post('/einladungen/decline', gruppenController.declineEinladung);

// Benachrichtigungen
router.get('/benachrichtigungen/:nutzerId', gruppenController.getBenachrichtigungen);
router.post('/benachrichtigungen/read', gruppenController.markAsRead);

// Push-Benachrichtigungen
router.get('/push/vapid-key', gruppenController.getVapidPublicKey);
router.post('/push/subscribe', gruppenController.subscribePush);
router.delete('/push/unsubscribe', gruppenController.unsubscribePush);

// Gym-Termine
router.get('/:gruppeId/termine', gruppenController.getGymTermine);
router.post('/termine', gruppenController.createGymTermin);
router.put('/termine/:terminId', gruppenController.updateGymTermin);
router.delete('/termine/:terminId', gruppenController.deleteGymTermin);
router.post('/teilnahme-status', gruppenController.setTeilnahmeStatus);
router.post('/teilnahme-remove', gruppenController.removeTeilnahme);

//Kommentare zu Terminen
router.get('/termine/:id/kommentare', gruppenController.getKommentare);
router.post('/termine/:id/kommentare', gruppenController.addKommentar);
router.get('/termin/:id', gruppenController.getGruppeByTerminId);

module.exports = router;