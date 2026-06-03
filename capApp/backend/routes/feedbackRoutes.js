const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

router.post('/', feedbackController.createFeedback);
router.get('/', feedbackController.getAllFeedback);
router.put('/:id', feedbackController.updateFeedbackStatus);
router.delete('/:id', feedbackController.deleteFeedback);

module.exports = router;