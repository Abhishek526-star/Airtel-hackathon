const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('partner', 'admin'));

router.get('/leads', partnerController.getAssignedLeads);
router.get('/leads/:id', partnerController.getLeadDetails);
router.post('/leads/:id/assist-kyc', partnerController.assistKyc);

module.exports = router;
