const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const env = require('./config/env');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // JWT Socket Authentication Middleware
  io.use((socket, next) => {
    try {
      let token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        socket.handshake.headers?.authorization;

      if (token && typeof token === 'string' && token.startsWith('Bearer ')) {
        token = token.slice(7).trim();
      }

      if (token) {
        try {
          const decoded = jwt.verify(token, env.JWT_SECRET);
          socket.user = decoded; // { id, role, ... }
        } catch (err) {
          console.warn('[Socket Auth] Token verification warning:', err.message);
          socket.user = null;
        }
      } else {
        socket.user = null;
      }

      next();
    } catch (error) {
      console.error('[Socket Auth Error]', error.message);
      next(error);
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`[Socket Connected] Socket ID: ${socket.id} | User: ${user ? `${user.id} (${user.role})` : 'Guest'}`);

    if (user && user.id) {
      // 1. Join user-private room
      socket.join(`user:${user.id}`);

      // 2. Join role-specific broadcast room
      if (user.role) {
        socket.join(`role:${user.role}`);

        if (user.role === 'technician') {
          socket.join(`technician:${user.id}`);
        } else if (user.role === 'partner') {
          socket.join(`partner:${user.id}`);
        }
      }
    }

    // Dynamic room join for order tracking
    socket.on('join_order', (orderId) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
        console.log(`[Socket ${socket.id}] Joined room: order:${orderId}`);
      }
    });

    socket.on('leave_order', (orderId) => {
      if (orderId) {
        socket.leave(`order:${orderId}`);
        console.log(`[Socket ${socket.id}] Left room: order:${orderId}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket Disconnected] Socket ID: ${socket.id} (${reason})`);
    });
  });

  console.log('[Socket Engine] Socket.IO server initialized successfully.');
  return io;
};

const getIO = () => {
  if (!io) {
    console.warn('[Socket Warning] Socket.IO instance not initialized yet.');
  }
  return io;
};

// --- Real-Time Typed Broadcast Helpers ---

const emitOrderCreated = (order) => {
  if (!io || !order) return;
  const payload = {
    orderId: order.orderId,
    orderStatus: order.orderStatus,
    kycStatus: order.kycStatus,
    paidAmount: order.paymentDetails?.paidAmount,
    installationAddress: order.installationDetails?.installationAddress,
    city: order.installationDetails?.city,
    assignedTechnician: order.assignedTechnician,
    assignedEngineer: order.installationDetails?.assignedEngineer,
    createdAt: order.createdAt,
    itemsCount: order.quote?.items?.length || 1,
  };

  // Broadcast to Admins, the placing User, and the assigned Technician
  io.to('role:admin').emit('ORDER_CREATED', payload);
  if (order.user) {
    const userId = order.user._id ? order.user._id.toString() : order.user.toString();
    io.to(`user:${userId}`).emit('ORDER_CREATED', payload);
  }
  if (order.assignedTechnician) {
    const techId = order.assignedTechnician._id ? order.assignedTechnician._id.toString() : order.assignedTechnician.toString();
    io.to(`technician:${techId}`).emit('ORDER_CREATED', payload);
    io.to('role:technician').emit('ORDER_CREATED', payload);
  }
};

const emitOrderStatusUpdated = (order, extra = {}) => {
  if (!io || !order) return;
  const payload = {
    orderId: order.orderId,
    orderStatus: order.orderStatus,
    kycStatus: order.kycStatus,
    timeline: order.timeline,
    serviceActivation: order.serviceActivation,
    installationDetails: order.installationDetails,
    assignedTechnician: order.assignedTechnician,
    ...extra,
    updatedAt: new Date().toISOString(),
  };

  io.to(`order:${order.orderId}`).emit('ORDER_STATUS_UPDATED', payload);
  io.to('role:admin').emit('ORDER_STATUS_UPDATED', payload);

  if (order.user) {
    const userId = order.user._id ? order.user._id.toString() : order.user.toString();
    io.to(`user:${userId}`).emit('ORDER_STATUS_UPDATED', payload);
  }
  if (order.assignedTechnician) {
    const techId = order.assignedTechnician._id ? order.assignedTechnician._id.toString() : order.assignedTechnician.toString();
    io.to(`technician:${techId}`).emit('ORDER_STATUS_UPDATED', payload);
  }
};

const emitKycStatusUpdated = (kycData) => {
  if (!io || !kycData) return;
  const payload = {
    userId: kycData.userId,
    kycStatus: kycData.kycStatus,
    documentType: kycData.documentType,
    verifiedIdentifier: kycData.verifiedIdentifier,
    verifiedAt: kycData.verifiedAt || new Date().toISOString(),
    message: kycData.message || 'KYC verification status changed.',
  };

  io.to('role:admin').emit('KYC_STATUS_UPDATED', payload);
  io.to('role:partner').emit('KYC_STATUS_UPDATED', payload);

  if (kycData.userId) {
    io.to(`user:${kycData.userId}`).emit('KYC_STATUS_UPDATED', payload);
  }
};

const emitKycExceptionAssigned = (requestData) => {
  if (!io || !requestData) return;
  const payload = {
    requestId: requestData.requestId,
    customerName: requestData.customerName,
    customerPhone: requestData.customerPhone,
    businessName: requestData.businessName,
    locationCircle: requestData.locationCircle,
    requestType: requestData.requestType,
    notes: requestData.notes,
    assignedPartner: requestData.assignedPartner,
    createdAt: requestData.createdAt || new Date().toISOString(),
  };

  io.to('role:admin').emit('KYC_EXCEPTION_ASSIGNED', payload);
  io.to('role:partner').emit('KYC_EXCEPTION_ASSIGNED', payload);

  if (requestData.assignedPartner) {
    const partnerId = requestData.assignedPartner._id ? requestData.assignedPartner._id.toString() : requestData.assignedPartner.toString();
    io.to(`partner:${partnerId}`).emit('KYC_EXCEPTION_ASSIGNED', payload);
  }
};

const emitTechnicianTaskUpdated = (order, taskDetails = {}) => {
  if (!io || !order) return;
  const payload = {
    orderId: order.orderId,
    orderStatus: order.orderStatus,
    installationDetails: order.installationDetails,
    assignedTechnician: order.assignedTechnician,
    ...taskDetails,
    updatedAt: new Date().toISOString(),
  };

  io.to('role:admin').emit('TECHNICIAN_TASK_UPDATED', payload);
  io.to(`order:${order.orderId}`).emit('TECHNICIAN_TASK_UPDATED', payload);

  if (order.user) {
    const userId = order.user._id ? order.user._id.toString() : order.user.toString();
    io.to(`user:${userId}`).emit('TECHNICIAN_TASK_UPDATED', payload);
  }
  if (order.assignedTechnician) {
    const techId = order.assignedTechnician._id ? order.assignedTechnician._id.toString() : order.assignedTechnician.toString();
    io.to(`technician:${techId}`).emit('TECHNICIAN_TASK_UPDATED', payload);
  }
};

const emitServiceActivated = (serviceData) => {
  if (!io || !serviceData) return;
  const payload = {
    orderId: serviceData.orderId,
    circuitId: serviceData.circuitId,
    staticIp: serviceData.staticIp,
    cpeSerialNumber: serviceData.cpeSerialNumber,
    slaUptimePercent: serviceData.slaUptimePercent || 99.8,
    activatedAt: serviceData.activatedAt || new Date().toISOString(),
  };

  io.to('role:admin').emit('SERVICE_ACTIVATED', payload);
  if (serviceData.orderId) {
    io.to(`order:${serviceData.orderId}`).emit('SERVICE_ACTIVATED', payload);
  }
  if (serviceData.userId) {
    io.to(`user:${serviceData.userId}`).emit('SERVICE_ACTIVATED', payload);
  }
};

const emitPartnerAssistanceRequested = (requestData) => {
  if (!io || !requestData) return;
  io.to('role:admin').emit('PARTNER_ASSISTANCE_REQUESTED', requestData);
  io.to('role:partner').emit('PARTNER_ASSISTANCE_REQUESTED', requestData);

  if (requestData.assignedPartner) {
    const partnerId = requestData.assignedPartner._id ? requestData.assignedPartner._id.toString() : requestData.assignedPartner.toString();
    io.to(`partner:${partnerId}`).emit('PARTNER_ASSISTANCE_REQUESTED', requestData);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitOrderCreated,
  emitOrderStatusUpdated,
  emitKycStatusUpdated,
  emitKycExceptionAssigned,
  emitTechnicianTaskUpdated,
  emitServiceActivated,
  emitPartnerAssistanceRequested,
};
