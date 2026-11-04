const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { optionalAuth } = require('../middleware/auth');

// Public or Protected endpoint for downloading the B2B GST Telecom Tax Invoice PDF
router.get('/download', optionalAuth, invoiceController.downloadInvoice);
router.get('/:orderId/pdf', optionalAuth, invoiceController.downloadInvoice);
router.get('/details', optionalAuth, invoiceController.getInvoiceDetails);

module.exports = router;
