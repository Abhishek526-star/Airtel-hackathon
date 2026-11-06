const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

// Customer-facing assistance requests (Public / Optional customer auth)
router.post('/request-assistance', optionalAuth, partnerController.requestAssistance);
router.get('/customer-active-request', optionalAuth, partnerController.getCustomerActiveRequest);

// Protected Channel Partner / Admin routes
router.use(authenticate);
router.use(authorize('partner', 'admin'));

// Partner live status & availability
router.get('/status', partnerController.getPartnerStatus);
router.patch('/availability', partnerController.updateAvailability);

// Partner assigned incoming customer assistance requests
router.get('/my-requests', partnerController.getMyRequests);
router.patch('/my-requests/:id/status', partnerController.updateRequestStatus);

// Historic / Cohort Unclosed Leads Pipeline
router.get('/leads', partnerController.getAssignedLeads);
router.get('/leads/:id', partnerController.getLeadDetails);
router.post('/leads/:id/assist-kyc', partnerController.assistKyc);

module.exports = router;
