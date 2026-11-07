const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticate } = require('../middleware/auth');

// Protected routes for active subscribers
router.use(authenticate);

router.get('/active', serviceController.getActiveServices);
router.post('/:id/diagnostics', serviceController.runDiagnostics);

module.exports = router;
