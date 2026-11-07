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
router.post('/kyc/:id/approve', partnerController.approveKycRequest);

// Historic / Cohort Unclosed Leads Pipeline & Smart KYC Partner Recovery
router.get('/leads', partnerController.getAssignedLeads);
router.get('/leads/:id', partnerController.getLeadDetails);
router.get('/leads/:id/customer-details', partnerController.getLeadCustomerDetails);
router.get('/leads/:id/documents/:docId/preview', partnerController.getSecureDocumentPreview);
router.post('/leads/:id/recovery-action', partnerController.recordRecoveryAction);
router.post('/leads/:id/assist-kyc', partnerController.assistKyc);

module.exports = router;
