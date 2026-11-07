const express = require('express');
const router = express.Router();
const advisorController = require('../controllers/advisorController');
const { optionalAuth } = require('../middleware/auth');

router.post('/chat', optionalAuth, advisorController.chat);
router.post('/recommend', optionalAuth, advisorController.recommend);

module.exports = router;

