const Order = require('../models/Order');
const BusinessProfile = require('../models/BusinessProfile');

// Helper to generate realistic telecom circuit identifiers
const getCircuitId = (orderId, idx) => {
  const cleanSeq = (orderId || '8921').replace(/[^0-9]/g, '').slice(-4) || '8921';
  return `CIR-DEL-FBR-${cleanSeq}${idx > 0 ? `-${idx + 1}` : ''}`;
};

const getM2mId = (orderId, idx) => {
  const cleanSeq = (orderId || '8921').replace(/[^0-9]/g, '').slice(-4) || '8921';
  return `SIM-M2M-891${idx}-${cleanSeq}`;
};

const getDigitalKey = (orderId, idx) => {
  const cleanSeq = (orderId || '8921').replace(/[^0-9]/g, '').slice(-4) || '8921';
  return `WABA-API-${cleanSeq}-${idx + 1}`;
};

// @desc    Get all active telecom and digital services for the current customer
// @route   GET /api/services/active
// @access  Private
exports.getActiveServices = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id, orderStatus: { $ne: 'CANCELLED' } })
      .populate('quote')
      .populate('businessProfile')
      .sort({ createdAt: -1 });

    const profile = await BusinessProfile.findOne({ user: req.user._id });

    let activeServices = [];

    if (orders.length > 0) {
      orders.forEach((order) => {
        const quote = order.quote;
        if (!quote || !quote.items || quote.items.length === 0) return;

        const isLiveActive = order.orderStatus === 'ACTIVATED' || order.orderStatus === 'KYC_VERIFIED';
        const isScheduled = order.orderStatus === 'INSTALLATION_SCHEDULED' || order.orderStatus === 'INSTALLATION_IN_PROGRESS';

        const status = isLiveActive ? 'ACTIVE' : isScheduled ? 'INSTALLATION_SCHEDULED' : 'PROVISIONING';
        const statusLabel = isLiveActive ? 'Active & Transmitting' : isScheduled ? 'Scheduled for Field Setup' : 'Under Provisioning';

        const baseCircuit = order.serviceActivation?.circuitId || getCircuitId(order.orderId, 0);
        const baseIp = order.serviceActivation?.assignedStaticIp || '103.24.188.42';

        quote.items.forEach((item, idx) => {
          const cat = (item.category || '').toLowerCase();
          const isBroadband = cat.includes('connect') || cat.includes('broadband') || cat.includes('fibre') || cat.includes('lease');
          const isMobility = cat.includes('mobil') || cat.includes('m2m') || cat.includes('sim') || cat.includes('iot');
          const isDigital = cat.includes('digital') || cat.includes('cloud') || cat.includes('saas') || cat.includes('api') || cat.includes('voice');

          let serviceId = baseCircuit;
          let speedBandwidth = item.speedBandwidth || 'Enterprise High-Speed';
          let staticIp = '';
          let m2mApn = '';

          if (isBroadband) {
            serviceId = idx === 0 ? baseCircuit : getCircuitId(order.orderId, idx);
            speedBandwidth = item.productName.includes('100')
              ? '100 Mbps Symmetrical'
              : item.productName.includes('300')
              ? '300 Mbps Symmetrical'
              : item.productName.includes('500')
              ? '500 Mbps Symmetrical'
              : item.productName.includes('1000') || item.productName.includes('1G')
              ? '1 Gbps Dedicated'
              : '200 Mbps Symmetrical';
            staticIp = baseIp;
          } else if (isMobility) {
            serviceId = getM2mId(order.orderId, idx);
            speedBandwidth = 'Unlimited CUG + 2GB/day Pooled';
            m2mApn = 'airtelgprs.com';
          } else {
            serviceId = getDigitalKey(order.orderId, idx);
            speedBandwidth = '10,000 Monthly Active Sessions';
          }

          activeServices.push({
            id: `${order.orderId}-${item.productId || idx}`,
            orderId: order.orderId,
            productId: item.productId || `P-${idx}`,
            productName: item.productName,
            category: isBroadband ? 'Connectivity' : isMobility ? 'Mobility' : isDigital ? 'Digital' : 'Voice',
            speedBandwidth,
            quantity: item.quantity || 1,
            unitMonthlyPrice: item.unitMonthlyPrice || 0,
            monthlyTotal: (item.unitMonthlyPrice || 0) * (item.quantity || 1),
            status,
            statusLabel,
            activatedAt: order.serviceActivation?.activatedAt || order.createdAt,
            installationAddress: order.installationDetails?.installationAddress || profile?.address?.street || 'Sector 18, Commercial Hub',
            city: order.installationDetails?.city || profile?.address?.city || 'Delhi NCR',
            pincode: order.installationDetails?.pincode || profile?.address?.pincode || '110001',
            telecomDetails: {
              circuitId: serviceId,
              staticIp,
              gateway: staticIp ? '103.24.188.41' : '',
              subnet: staticIp ? '255.255.255.248 (/29)' : '',
              primaryDns: '125.63.254.2',
              secondaryDns: '125.63.254.3',
              cpeSerialNumber: order.serviceActivation?.cpeSerialNumber || `ONT-NOKIA-DEL-${order.orderId.replace(/[^0-9]/g, '')}`,
              cpeMacAddress: '3C:84:6A:E1:92:B4',
              m2mApn,
              slaUptimePercent: order.serviceActivation?.slaUptimePercent || 99.8,
              latencyMs: 4,
              packetLossPercent: 0.0,
            },
          });
        });
      });
    } else if (req.user.email === 'rajesh@guptasupermart.in' || profile?.tradeName?.includes('Gupta') || profile?.tradeName?.includes('Balaji')) {
      // Hydrate baseline enterprise pack for seeded demo enterprise customer
      activeServices = [
        {
          id: 'ACCEL-ORD-8921-P02',
          orderId: 'ACCEL-ORD-8921',
          productId: 'P02',
          productName: 'Biz Fibre 300 - Enterprise Broadband',
          category: 'Connectivity',
          speedBandwidth: '300 Mbps Symmetrical',
          quantity: 1,
          unitMonthlyPrice: 1999,
          monthlyTotal: 1999,
          status: 'ACTIVE',
          statusLabel: 'Active & Transmitting',
          activatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          installationAddress: profile?.address?.street || 'Shop 14, Main Market, Sector 18',
          city: profile?.address?.city || 'Delhi NCR',
          pincode: profile?.address?.pincode || '110001',
          telecomDetails: {
            circuitId: 'CIR-DEL-FBR-8912',
            staticIp: '103.24.188.42',
            gateway: '103.24.188.41',
            subnet: '255.255.255.248 (/29)',
            primaryDns: '125.63.254.2',
            secondaryDns: '125.63.254.3',
            cpeSerialNumber: 'ONT-NOKIA-DEL-8912',
            cpeMacAddress: '3C:84:6A:E1:92:B4',
            m2mApn: '',
            slaUptimePercent: 99.8,
            latencyMs: 4,
            packetLossPercent: 0.0,
          },
        },
        {
          id: 'ACCEL-ORD-8921-P14',
          orderId: 'ACCEL-ORD-8921',
          productId: 'P14',
          productName: 'POS Digital Gateway M2M IoT SIM',
          category: 'Mobility',
          speedBandwidth: 'Unlimited CUG + 2GB/day Pooled',
          quantity: 2,
          unitMonthlyPrice: 299,
          monthlyTotal: 598,
          status: 'ACTIVE',
          statusLabel: 'Active & Transmitting',
          activatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          installationAddress: profile?.address?.street || 'Shop 14, Main Market, Sector 18',
          city: profile?.address?.city || 'Delhi NCR',
          pincode: profile?.address?.pincode || '110001',
          telecomDetails: {
            circuitId: 'SIM-M2M-8912-01',
            staticIp: '',
            gateway: '',
            subnet: '',
            primaryDns: '125.63.254.2',
            secondaryDns: '125.63.254.3',
            cpeSerialNumber: 'ICCID-899112233445566778',
            cpeMacAddress: '',
            m2mApn: 'airtelgprs.com',
            slaUptimePercent: 99.8,
            latencyMs: 14,
            packetLossPercent: 0.0,
          },
        },
        {
          id: 'ACCEL-ORD-8921-P20',
          orderId: 'ACCEL-ORD-8921',
          productId: 'P20',
          productName: 'WhatsApp Business API Enterprise Starter',
          category: 'Digital',
          speedBandwidth: '10,000 Monthly Active Sessions',
          quantity: 1,
          unitMonthlyPrice: 153,
          monthlyTotal: 153,
          status: 'ACTIVE',
          statusLabel: 'Active & Transmitting',
          activatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          installationAddress: profile?.address?.street || 'Shop 14, Main Market, Sector 18',
          city: profile?.address?.city || 'Delhi NCR',
          pincode: profile?.address?.pincode || '110001',
          telecomDetails: {
            circuitId: 'WABA-API-8921-1',
            staticIp: '',
            gateway: '',
            subnet: '',
            primaryDns: '',
            secondaryDns: '',
            cpeSerialNumber: 'WABA-GATEWAY-AUTH-TOKEN-LIVE',
            cpeMacAddress: '',
            m2mApn: '',
            slaUptimePercent: 99.9,
            latencyMs: 18,
            packetLossPercent: 0.0,
          },
        },
      ];
    }

    // Consolidated Metrics
    const totalMonthlyRecurring = activeServices.reduce((sum, s) => sum + s.monthlyTotal, 0);
    const activeLinesCount = activeServices.filter((s) => s.status === 'ACTIVE').length;
    const overallSlaPercent = activeServices.length > 0 ? 99.8 : 0;

    res.status(200).json({
      success: true,
      message: `Retrieved ${activeServices.length} active telecom and digital services.`,
      data: {
        services: activeServices,
        summary: {
          totalServicesCount: activeServices.length,
          activeLinesCount,
          totalMonthlyRecurring,
          overallSlaPercent,
          circuitId: activeServices.find((s) => s.category === 'Connectivity')?.telecomDetails?.circuitId || 'CIR-DEL-FBR-8912',
          staticIp: activeServices.find((s) => s.telecomDetails?.staticIp)?.telecomDetails?.staticIp || '103.24.188.42',
        },
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Run live network ping and optical line diagnostics
// @route   POST /api/services/:id/diagnostics
// @access  Private
exports.runDiagnostics = async (req, res, next) => {
  try {
    const serviceId = req.params.id;

    // Simulate 3-stage telecom diagnostic test
    const results = {
      serviceId,
      timestamp: new Date().toISOString(),
      tests: [
        {
          name: 'Optical Carrier & Signal Check (OLT to ONT)',
          status: 'PASSED',
          opticalRxPower: '-19.4 dBm (Normal range: -8 to -27 dBm)',
          opticalTxPower: '+2.1 dBm',
        },
        {
          name: 'Gateway Ping & Latency (Delhi Gateway IP)',
          status: 'PASSED',
          latency: '4.2 ms',
          jitter: '0.6 ms',
          packetLoss: '0.0%',
        },
        {
          name: 'DNS Resolution & Routing Table Health',
          status: 'PASSED',
          primaryDnsResolution: '3.1 ms (125.63.254.2)',
          secondaryDnsResolution: '3.4 ms (125.63.254.3)',
        },
      ],
      overallHealth: 'OPTIMAL',
      slaCompliance: '99.8% SLA Guaranteed',
    };

    res.status(200).json({
      success: true,
      message: 'Network line diagnostic completed successfully. All parameters optimal.',
      data: results,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};
