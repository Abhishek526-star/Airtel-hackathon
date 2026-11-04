const express = require('express');
const router = express.Router();
const advisorController = require('../controllers/advisorController');

router.post('/chat', advisorController.chat);
router.post('/recommend', advisorController.recommend);

module.exports = router;
