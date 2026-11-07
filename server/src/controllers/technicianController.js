const Order = require('../models/Order');
const User = require('../models/User');
const BusinessProfile = require('../models/BusinessProfile');
const { emitTechnicianTaskUpdated, emitOrderStatusUpdated, emitServiceActivated } = require('../socket');

// @desc    Get all installation tasks assigned to the authenticated field technician
// @route   GET /api/technician/tasks
// @access  Private (Technician / Admin)
exports.getAssignedTasks = async (req, res, next) => {
  try {
    const isTech = req.user.role === 'technician';
    const query = isTech ? { assignedTechnician: req.user._id } : {};

    const { status, filter } = req.query;
    if (status) {
      query.orderStatus = status;
    } else if (filter === 'active') {
      query.orderStatus = { $in: ['INSTALLATION_SCHEDULED', 'INSTALLATION_IN_PROGRESS', 'KYC_VERIFIED'] };
    } else if (filter === 'completed') {
      query.orderStatus = 'ACTIVATED';
    }

    const tasks = await Order.find(query)
      .populate('user', 'fullName email phone')
      .populate('businessProfile')
      .populate('quote')
      .populate('assignedTechnician', 'fullName phone badgeId specialization territoryCircle')
      .sort({ createdAt: -1 });

    // Aggregate summary stats for the technician
    const allTechOrders = await Order.find(isTech ? { assignedTechnician: req.user._id } : {});
    const stats = {
      totalAssigned: allTechOrders.length,
      scheduled: allTechOrders.filter((o) => o.orderStatus === 'INSTALLATION_SCHEDULED' || o.orderStatus === 'KYC_VERIFIED').length,
      inProgress: allTechOrders.filter((o) => o.orderStatus === 'INSTALLATION_IN_PROGRESS').length,
      activated: allTechOrders.filter((o) => o.orderStatus === 'ACTIVATED').length,
    };

    res.status(200).json({
      success: true,
      message: `Retrieved ${tasks.length} installation tasks.`,
      data: {
        tasks,
        stats,
        technician: {
          fullName: req.user.fullName,
          badgeId: req.user.badgeId || 'ENG-DELHI-408',
          territoryCircle: req.user.territoryCircle || 'Delhi NCR',
          specialization: req.user.specialization || 'Fiber Splicing & CPE Provisioning',
          availabilityStatus: req.user.availabilityStatus || 'AVAILABLE',
        },
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task details by Order ID
// @route   GET /api/technician/tasks/:id
// @access  Private (Technician / Admin)
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Order.findOne({
      $or: [{ orderId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }],
    })
      .populate('user', 'fullName email phone')
      .populate('businessProfile')
      .populate('quote')
      .populate('assignedTechnician', 'fullName phone badgeId specialization territoryCircle');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Installation task '${req.params.id}' not found.`,
        data: null,
        error: { code: 'TASK_NOT_FOUND' },
      });
    }

    // Role check: Only assigned technician or admin can access
    if (req.user.role === 'technician' && String(task.assignedTechnician?._id || task.assignedTechnician) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this installation request.',
        data: null,
        error: { code: 'UNAUTHORIZED_TASK_ACCESS' },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task details retrieved.',
      data: task,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status & execute on-site CPE provisioning
// @route   PATCH /api/technician/tasks/:id/status
// @access  Private (Technician / Admin)
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const {
      nextStatus,
      notes,
      opticalPowerRx,
      opticalPowerTx,
      cpeSerialNumber,
      staticIp,
      circuitId,
    } = req.body;

    const order = await Order.findOne({
      $or: [{ orderId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order '${req.params.id}' not found.`,
        data: null,
        error: { code: 'ORDER_NOT_FOUND' },
      });
    }

    // Validate technician authorization
    if (req.user.role === 'technician' && order.assignedTechnician && String(order.assignedTechnician) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update an order not assigned to you.',
        data: null,
        error: { code: 'FORBIDDEN' },
      });
    }

    const validStatuses = ['INSTALLATION_IN_PROGRESS', 'ACTIVATED'];
    if (!validStatuses.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid technician status '${nextStatus}'. Must be INSTALLATION_IN_PROGRESS or ACTIVATED.`,
        data: null,
        error: { code: 'INVALID_STATUS' },
      });
    }

    order.orderStatus = nextStatus;

    if (nextStatus === 'INSTALLATION_IN_PROGRESS') {
      order.timeline.push({
        status: 'INSTALLATION_IN_PROGRESS',
        title: 'Field Technician On-Site Installing CPE Router',
        description: notes || `Technician ${req.user.fullName} (${req.user.badgeId || 'Field Tech'}) arrived on-site. Fiber pulled and ONT mounting commenced.`,
        timestamp: new Date(),
      });
    } else if (nextStatus === 'ACTIVATED') {
      const generatedCircuit = circuitId || 'ACCEL-FIBER-NCR-' + Math.floor(10000 + Math.random() * 90000);
      const generatedOnt = cpeSerialNumber || 'ONT-NOKIA-XS-' + Math.floor(100000 + Math.random() * 900000);
      const generatedIp = staticIp || '103.24.188.' + Math.floor(20 + Math.random() * 200);

      order.serviceActivation = {
        activatedAt: new Date(),
        circuitId: generatedCircuit,
        cpeSerialNumber: generatedOnt,
        assignedStaticIp: generatedIp,
        slaUptimePercent: 99.8,
      };

      order.timeline.push({
        status: 'ACTIVATED',
        title: 'Enterprise Line Activated & Live',
        description: notes || `Optical line verified (Rx: ${opticalPowerRx || '-19.2'} dBm). CPE ONT ${generatedOnt} linked and static IP ${generatedIp} live.`,
        timestamp: new Date(),
      });

      // Update technician workload
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { activeAssignedInstallationsCount: -1 },
      });
    }

    await order.save();

    // Emit Real-Time Telemetry to Customer, Admin, and Technician dashboards
    emitOrderStatusUpdated(order, { notes });
    emitTechnicianTaskUpdated(order, { notes, opticalPowerRx, opticalPowerTx });
    if (nextStatus === 'ACTIVATED') {
      emitServiceActivated({
        orderId: order.orderId,
        userId: order.user,
        circuitId: order.serviceActivation.circuitId,
        staticIp: order.serviceActivation.assignedStaticIp,
        cpeSerialNumber: order.serviceActivation.cpeSerialNumber,
        slaUptimePercent: order.serviceActivation.slaUptimePercent,
        activatedAt: order.serviceActivation.activatedAt,
      });
    }

    res.status(200).json({
      success: true,
      message: `Installation task advanced to ${nextStatus}.`,
      data: order,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update technician availability status
// @route   PATCH /api/technician/availability
// @access  Private (Technician)
exports.updateAvailability = async (req, res, next) => {
  try {
    const { availabilityStatus, isAvailable } = req.body;
    const user = await User.findById(req.user._id);

    if (availabilityStatus) {
      user.availabilityStatus = availabilityStatus;
      user.isAvailable = availabilityStatus !== 'OFFLINE';
    }
    if (typeof isAvailable === 'boolean') {
      user.isAvailable = isAvailable;
      if (!isAvailable) {
        user.availabilityStatus = 'OFFLINE';
      } else if (user.availabilityStatus === 'OFFLINE') {
        user.availabilityStatus = 'AVAILABLE';
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Technician status updated to ${user.availabilityStatus}.`,
      data: {
        availabilityStatus: user.availabilityStatus,
        isAvailable: user.isAvailable,
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

