import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Stepper from '../components/common/Stepper';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  PhoneCall, 
  HardHat, 
  Wifi, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Zap
} from 'lucide-react';

const OrderTrackerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const res = await api.get(`/orders/${id}`);
      if (res.success && res.data) {
        setOrder(res.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load order details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdvanceStatus = async (nextStatus) => {
    try {
      setIsAdvancing(true);
      const res = await api.patch(`/orders/${id}/status`, {
        nextStatus,
        notes: nextStatus === 'ACTIVATED'
          ? 'Fiber optical link spliced, CPE router provisioned, signal levels verified (-19.2 dBm).'
          : `Technician arrived on-site at ${order?.installationDetails?.installationAddress}.`,
      });

      if (res.success && res.data) {
        setOrder(res.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Status transition failed.');
    } finally {
      setIsAdvancing(false);
    }
  };

  const getStepProgress = (status) => {
    const progression = [
      'ORDER_PLACED',
      'KYC_VERIFIED',
      'INSTALLATION_SCHEDULED',
      'INSTALLATION_IN_PROGRESS',
      'ACTIVATED',
    ];
    return progression.indexOf(status);
  };

  const currentProgIndex = order ? getStepProgress(order.orderStatus) : 0;

  const timelineSteps = [
    { title: 'Order Placed & Confirmed', desc: 'Accepted quote locked and service order created.' },
    { title: 'Smart KYC Verified', desc: 'Mock GSTIN / Udyam credentials cross-checked successfully.' },
    { title: 'Field Technician Assigned', desc: 'Engineer Ramesh Kumar dispatched for on-site CPE setup.' },
    { title: 'Installation In Progress', desc: 'Optical fiber pulled to premises, router connected.' },
    { title: 'Service Activated & Live', desc: 'Static IP routed, 99.8% SLA telemetry monitoring live.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Stepper currentStep={5} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-airtel-700 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900">Live Order Lifecycle Tracker</h1>
                <Badge variant={order?.orderStatus === 'ACTIVATED' ? 'success' : 'brand'}>
                  {order?.orderStatus || 'ORDER_PLACED'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">Order ID: <strong className="font-mono text-slate-800">{id}</strong></p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {order?.orderStatus === 'ACTIVATED' ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/dashboard')}
                icon={ArrowRight}
                className="text-xs"
              >
                Go to Business Dashboard
              </Button>
            ) : (
              /* Reviewer Demo Shortcut Button */
              <Button
                variant="accent"
                size="sm"
                isLoading={isAdvancing}
                onClick={() => handleAdvanceStatus(currentProgIndex < 3 ? 'INSTALLATION_IN_PROGRESS' : 'ACTIVATED')}
                icon={Zap}
                className="text-xs bg-slate-800 hover:bg-slate-700"
              >
                {currentProgIndex < 3 ? 'Demo: Start Installation' : 'Demo: Complete & Activate'}
              </Button>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading order timeline...</div>
        ) : order ? (
          <div className="space-y-6">
            
            {/* Live Activation Banner if activated */}
            {order.orderStatus === 'ACTIVATED' && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Wifi className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg">Your Enterprise Business Services Are Live!</h3>
                    <p className="text-xs text-emerald-100">Zero physical follow-up calls needed. Provisioned in one sitting.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-black/20">
                    <div className="text-[10px] text-emerald-200 uppercase font-bold">Circuit ID</div>
                    <div className="font-mono font-bold">{order.serviceActivation?.circuitId || 'ACCEL-NCR-9912'}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/20">
                    <div className="text-[10px] text-emerald-200 uppercase font-bold">Assigned Static IP</div>
                    <div className="font-mono font-bold">{order.serviceActivation?.assignedStaticIp || '103.24.188.42'}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/20">
                    <div className="text-[10px] text-emerald-200 uppercase font-bold">CPE Router S/N</div>
                    <div className="font-mono font-bold">{order.serviceActivation?.cpeSerialNumber || 'ONT-NOKIA-XS'}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/20">
                    <div className="text-[10px] text-emerald-200 uppercase font-bold">SLA Health</div>
                    <div className="font-bold text-emerald-300">99.8% Guaranteed</div>
                  </div>
                </div>
              </div>
            )}

            {/* Visual Milestones Timeline Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
                Provisioning Milestones
              </h3>

              <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {timelineSteps.map((step, idx) => {
                  const isDone = currentProgIndex >= idx;
                  const isCurrent = currentProgIndex === idx;

                  return (
                    <div key={idx} className="relative flex items-start space-x-4">
                      {/* Milestone Dot */}
                      <div
                        className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isDone
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                            : isCurrent
                            ? 'bg-airtel-600 text-white ring-4 ring-red-100 animate-pulse'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                      </div>

                      <div className="space-y-0.5">
                        <div className={`text-xs font-bold ${isDone ? 'text-slate-900' : 'text-slate-500'}`}>
                          {step.title}
                        </div>
                        <p className="text-[11px] text-slate-500">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Field Technician & Site Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                  <HardHat className="w-4 h-4 text-amber-500" />
                  <span>Assigned Field Technician</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-slate-800">{order.installationDetails?.assignedEngineer?.name}</div>
                  <div className="text-slate-500">Badge: {order.installationDetails?.assignedEngineer?.badgeId}</div>
                  <div className="text-slate-500">Scheduled: Tomorrow ({order.installationDetails?.timeSlot})</div>
                </div>
                <div className="pt-2 flex items-center space-x-2">
                  <a
                    href={`tel:${order.installationDetails?.assignedEngineer?.phone}`}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <PhoneCall className="w-3 h-3 text-emerald-600" />
                    <span>Call Engineer</span>
                  </a>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                  <MapPin className="w-4 h-4 text-airtel-600" />
                  <span>Installation Site</span>
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="font-semibold text-slate-800">{order.installationDetails?.installationAddress}</div>
                  <div>{order.installationDetails?.city} &bull; PIN {order.installationDetails?.pincode}</div>
                  <div>On-Site Contact: {order.installationDetails?.contactPerson} ({order.installationDetails?.contactPhone})</div>
                </div>
              </div>

            </div>

          </div>
        ) : null}

      </main>
    </div>
  );
};

export default OrderTrackerPage;

