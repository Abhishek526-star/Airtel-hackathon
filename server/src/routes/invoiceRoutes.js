const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// List customer invoices with search, filter, and sort
router.get('/', authenticate, invoiceController.getInvoices);

// Payment transaction history
router.get('/transactions/history', authenticate, invoiceController.getPaymentTransactions);

// Public or Protected endpoint for downloading the B2B GST Telecom Tax Invoice PDF
router.get('/download', optionalAuth, invoiceController.downloadInvoice);
router.get('/:orderId/pdf', optionalAuth, invoiceController.downloadInvoice);
router.get('/details', optionalAuth, invoiceController.getInvoiceDetails);

// Single invoice detail by ID or invoice number
router.get('/:id', authenticate, invoiceController.getInvoiceById);

module.exports = router;
