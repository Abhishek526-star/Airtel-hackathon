const express = require('express');
const router = express.Router();
const mockController = require('../controllers/mockController');

router.get('/gstin/:gstin', mockController.lookupGstin);
router.get('/udyam/:udyam', mockController.lookupUdyam);

module.exports = router;
