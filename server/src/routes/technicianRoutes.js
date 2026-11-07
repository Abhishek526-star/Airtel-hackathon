const express = require('express');
const router = express.Router();
const technicianController = require('../controllers/technicianController');
const { authenticate, authorize } = require('../middleware/auth');

// Protect all technician routes
router.use(authenticate);
router.use(authorize('technician', 'admin'));

router.get('/tasks', technicianController.getAssignedTasks);
router.get('/tasks/:id', technicianController.getTaskById);
router.patch('/tasks/:id/status', technicianController.updateTaskStatus);
router.patch('/availability', technicianController.updateAvailability);

module.exports = router;

