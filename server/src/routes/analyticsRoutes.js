const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Executive Dashboard Telemetry Endpoints
router.get('/overview', analyticsController.getOverview);
router.get('/funnel', analyticsController.getFunnel);
router.get('/cohort', analyticsController.getCohortAnalytics);

module.exports = router;

