const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Allow public/admin read for hackathon reviewers
router.get('/overview', analyticsController.getOverview);
router.get('/funnel', analyticsController.getFunnel);
router.get('/cohort', analyticsController.getCohortAnalytics);

module.exports = router;
