const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const { authenticate } = require('../middleware/auth');

router.post('/calculate', quoteController.calculateQuote);
router.post('/', authenticate, quoteController.createQuote);
router.get('/:id', authenticate, quoteController.getQuoteById);
router.post('/:id/accept', authenticate, quoteController.acceptQuote);

module.exports = router;

