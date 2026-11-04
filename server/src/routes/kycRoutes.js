const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kycController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate);
router.post('/consent', kycController.submitConsent);
router.post('/upload', upload.single('document'), kycController.uploadDocument);
router.get('/status', kycController.getStatus);

module.exports = router;

