const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { optionalAuth } = require('../middleware/auth');

router.post('/chat', optionalAuth, supportController.chat);
router.post('/escalate', optionalAuth, supportController.escalate);

module.exports = router;

