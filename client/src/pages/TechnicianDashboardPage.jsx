import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { useRealtimeEvent } from '../context/SocketContext';
import api from '../services/api';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import {
  Wrench,
  HardHat,
  MapPin,
  Phone,
  PhoneCall,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Wifi,
  Radio,
  Server,
  Zap,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Info
} from 'lucide-react';

const TechnicianDashboardPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ totalAssigned: 0, scheduled: 0, inProgress: 0, activated: 0 });
  const [technicianInfo, setTechnicianInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'scheduled', 'inProgress', 'completed'
  const [searchQuery, setSearchQuery] = useState('');

  // Diagnostic & Provisioning Modal State
  const [selectedTask, setSelectedTask] = useState(null);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [rxPower, setRxPower] = useState(-19.2);
  const [txPower, setTxPower] = useState(2.4);
  const [ontSerial, setOntSerial] = useState('');
  const [staticIp, setStaticIp] = useState('');
  const [fieldNotes, setFieldNotes] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Availability status state
  const [availabilityStatus, setAvailabilityStatus] = useState(user?.availabilityStatus || 'AVAILABLE');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [liveToast, setLiveToast] = useState('');

  // Real-Time Event Handlers
  useRealtimeEvent('ORDER_CREATED', (payload) => {
    setLiveToast(`⚡ New Work Order Assigned: ${payload.orderId} (${payload.city || 'Operational Circle'})`);
    fetchTasks();
    setTimeout(() => setLiveToast(''), 6000);
  });

  useRealtimeEvent('TECHNICIAN_TASK_UPDATED', () => {
    fetchTasks();
  });

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const res = await api.get('/technician/tasks');
      if (res.success && res.data) {
        setTasks(res.data.tasks || []);
        setStats(res.data.stats || { totalAssigned: 0, scheduled: 0, inProgress: 0, activated: 0 });
        setTechnicianInfo(res.data.technician || null);
        if (res.data.technician?.availabilityStatus) {
          setAvailabilityStatus(res.data.technician.availabilityStatus);
        }
      }
    } catch (err) {
      console.error('[Technician Dashboard Fetch Error]', err);
      setErrorMsg(err.message || 'Failed to load assigned installation requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusToggle = async (newStatus) => {
    try {
      setIsUpdatingStatus(true);
      const res = await api.patch('/technician/availability', {
        availabilityStatus: newStatus,
        isAvailable: newStatus === 'AVAILABLE',
      });
      if (res.success) {
        setAvailabilityStatus(newStatus);
      }
    } catch (err) {
      console.error('[Availability Update Error]', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleStartInstallation = async (orderId) => {
    try {
      setIsLoading(true);
      const res = await api.patch(`/technician/tasks/${orderId}/status`, {
        nextStatus: 'INSTALLATION_IN_PROGRESS',
        notes: `Technician arrived on site. Optical cable pulled and ONT CPE installation begun.`,
      });
      if (res.success) {
        setActionSuccessMsg(`Order ${orderId} transitioned to On-Site Installation.`);
        await fetchTasks();
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to start installation.');
    } finally {
      setIsLoading(false);
    }
  };

  const openProvisionModal = (task) => {
    setSelectedTask(task);
    const orderNum = (task.orderId || '8921').replace(/[^0-9]/g, '').slice(-4) || '8921';
    setOntSerial(`ONT-NOKIA-XS-${Math.floor(100000 + Math.random() * 900000)}`);
    setStaticIp(`103.24.188.${Math.floor(20 + Math.random() * 200)}`);
    setRxPower(-19.2);
    setTxPower(2.4);
    setFieldNotes(`Optical drop terminated cleanly at DP Box. Nokia XS ONT powered on and synced at 1 Gbps. Signal within 99.8% SLA specifications.`);
  };

  const handleCompleteActivation = async () => {
    if (!selectedTask) return;
    try {
      setIsProvisioning(true);
      const res = await api.patch(`/technician/tasks/${selectedTask.orderId || selectedTask._id}/status`, {
        nextStatus: 'ACTIVATED',
        notes: fieldNotes,
        opticalPowerRx: parseFloat(rxPower),
        opticalPowerTx: parseFloat(txPower),
        cpeSerialNumber: ontSerial,
        staticIp: staticIp,
        circuitId: `ACCEL-FIBER-NCR-${(selectedTask.orderId || '8921').replace(/[^0-9]/g, '').slice(-4)}`,
      });

      if (res.success) {
        setActionSuccessMsg(`Success! Service activated live for ${selectedTask.businessProfile?.tradeName || 'customer'}.`);
        setSelectedTask(null);
        await fetchTasks();
        setTimeout(() => setActionSuccessMsg(''), 5000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to activate service.');
    } finally {
      setIsProvisioning(false);
    }
  };

  // Filter tasks based on tabs and search query
  const filteredTasks = tasks.filter((task) => {
    // Tab filter
    if (activeTab === 'scheduled' && !(task.orderStatus === 'INSTALLATION_SCHEDULED' || task.orderStatus === 'KYC_VERIFIED')) {
      return false;
    }
    if (activeTab === 'inProgress' && task.orderStatus !== 'INSTALLATION_IN_PROGRESS') {
      return false;
    }
    if (activeTab === 'completed' && task.orderStatus !== 'ACTIVATED') {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchOrderId = task.orderId?.toLowerCase().includes(q);
      const matchTrade = task.businessProfile?.tradeName?.toLowerCase().includes(q);
      const matchContact = task.installationDetails?.contactPerson?.toLowerCase().includes(q);
      const matchPhone = task.installationDetails?.contactPhone?.includes(q);
      const matchAddress = task.installationDetails?.installationAddress?.toLowerCase().includes(q);
      return matchOrderId || matchTrade || matchContact || matchPhone || matchAddress;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Technician Portal Top Bar */}
      <section className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">

          {/* Real-Time Work Order Alert */}
          {liveToast && (
            <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center justify-between shadow-xs animate-bounce">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span>{liveToast}</span>
              </div>
              <button onClick={() => setLiveToast('')} className="text-amber-300 hover:text-white text-xs">✕</button>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Technician Profile Card */}
            <div className="flex items-start sm:items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 font-black text-2xl flex-shrink-0">
                <HardHat className="w-7 h-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {technicianInfo?.fullName || user?.fullName || 'Field Technician'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Badge: {technicianInfo?.badgeId || user?.badgeId || 'ENG-DELHI-408'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    <span>Circle: <strong>{technicianInfo?.territoryCircle || user?.territoryCircle || 'Delhi NCR'}</strong></span>
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center space-x-1">
                    <Wrench className="w-3.5 h-3.5 text-amber-400" />
                    <span>{technicianInfo?.specialization || 'Fiber Splicing & CPE Provisioning'}</span>
                  </span>
                </p>
              </div>
            </div>

            {/* Live Duty Status Control */}
            <div className="flex items-center space-x-3 bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/80">
              <span className="text-xs font-semibold text-slate-300 pl-2">Duty Mode:</span>
              <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl">
                <button
                  onClick={() => handleStatusToggle('AVAILABLE')}
                  disabled={isUpdatingStatus}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    availabilityStatus === 'AVAILABLE'
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>Available</span>
                </button>
                <button
                  onClick={() => handleStatusToggle('ON_TASK')}
                  disabled={isUpdatingStatus}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    availabilityStatus === 'ON_TASK'
                      ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>On Site</span>
                </button>
                <button
                  onClick={() => handleStatusToggle('OFFLINE')}
                  disabled={isUpdatingStatus}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    availabilityStatus === 'OFFLINE'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Offline
                </button>
              </div>
            </div>

          </div>

          {/* Quick Metrics KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-800">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Assigned Orders</span>
              <span className="text-xl font-black text-white mt-0.5 block">{stats.totalAssigned}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">Scheduled Visits</span>
              <span className="text-xl font-black text-amber-300 mt-0.5 block">{stats.scheduled}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider block">In Progress</span>
              <span className="text-xl font-black text-sky-300 mt-0.5 block">{stats.inProgress}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">Active Services</span>
              <span className="text-xl font-black text-emerald-300 mt-0.5 block">{stats.activated}</span>
            </div>
          </div>

        </div>
      </section>

      {/* Main Task List Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Success / Error Alerts */}
        {actionSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button onClick={() => setActionSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="text-red-700 hover:text-red-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Toolbar: Filters, Search & Refresh */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Filter Tabs */}
          <div className="flex items-center space-x-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'scheduled'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Scheduled ({stats.scheduled})
            </button>
            <button
              onClick={() => setActiveTab('inProgress')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'inProgress'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              On-Site Active ({stats.inProgress})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Provisioned ({stats.activated})
            </button>
          </div>

          {/* Search Box & Refresh */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search order, client, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              onClick={fetchTasks}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-xs"
              title="Refresh Task Queue"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

        </div>

        {/* Tasks List Content */}
        {isLoading && tasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <RefreshCw className="w-6 h-6 text-amber-500 animate-spin mx-auto mb-2" />
            Loading assigned technician requests...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">No tasks found matching filter</p>
            <p>All assigned installation visits in this circle are up to date.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTasks.map((task) => {
              const isScheduled = task.orderStatus === 'INSTALLATION_SCHEDULED' || task.orderStatus === 'KYC_VERIFIED' || task.orderStatus === 'ORDER_PLACED';
              const isInProgress = task.orderStatus === 'INSTALLATION_IN_PROGRESS';
              const isActivated = task.orderStatus === 'ACTIVATED';

              return (
                <div
                  key={task._id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 sm:p-6 space-y-5"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                        isActivated
                          ? 'bg-emerald-50 text-emerald-600'
                          : isInProgress
                          ? 'bg-sky-50 text-sky-600 animate-pulse'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {isActivated ? <CheckCircle2 className="w-5 h-5" /> : isInProgress ? <Zap className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-slate-900 text-sm tracking-tight">
                            {task.businessProfile?.tradeName || task.user?.fullName || 'Enterprise Customer'}
                          </span>
                          <Badge variant={isActivated ? 'success' : isInProgress ? 'info' : 'warning'}>
                            {task.orderStatus}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Order ID: <strong className="font-mono text-slate-700">{task.orderId}</strong> &bull; Circle: <strong>{task.installationDetails?.city || 'Delhi NCR'}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Scheduled Slot Badge */}
                    <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 self-start sm:self-auto">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{task.installationDetails?.timeSlot || '10:00 AM - 01:00 PM'}</span>
                    </div>
                  </div>

                  {/* Site Address & Customer Contact Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    
                    {/* Site Location */}
                    <div className="space-y-1 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                      <span className="font-bold text-slate-700 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-airtel-600" />
                        <span>Installation Site</span>
                      </span>
                      <p className="font-medium text-slate-800 leading-snug">
                        {task.installationDetails?.installationAddress || 'Main Commercial Facility'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {task.installationDetails?.city} &bull; PIN {task.installationDetails?.pincode}
                      </p>
                    </div>

                    {/* Customer Contact */}
                    <div className="space-y-1 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                      <span className="font-bold text-slate-700 flex items-center space-x-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>On-Site Contact</span>
                      </span>
                      <p className="font-medium text-slate-800">
                        {task.installationDetails?.contactPerson || task.user?.fullName}
                      </p>
                      <div className="pt-1 flex items-center space-x-2">
                        <a
                          href={`tel:${task.installationDetails?.contactPhone || task.user?.phone}`}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Call: {task.installationDetails?.contactPhone || task.user?.phone}</span>
                        </a>
                      </div>
                    </div>

                    {/* Ordered Products & Bandwidth */}
                    <div className="space-y-1 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                      <span className="font-bold text-slate-700 flex items-center space-x-1">
                        <Server className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Hardware / Service Scope</span>
                      </span>
                      <div className="space-y-0.5">
                        {task.quote?.items?.map((item, i) => (
                          <div key={i} className="text-[11px] font-semibold text-slate-700 truncate">
                            &bull; {item.productName} ({item.quantity || 1}x)
                          </div>
                        )) || <div className="text-[11px] text-slate-500">Dedicated Enterprise High-Speed Internet</div>}
                      </div>
                    </div>

                  </div>

                  {/* Live Circuit Credentials (if already activated) */}
                  {isActivated && task.serviceActivation && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="text-emerald-900 font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Circuit Live:</span>
                        </span>
                        <span className="font-mono text-emerald-800">{task.serviceActivation.circuitId}</span>
                        <span className="text-emerald-700">&bull; Static IP: <strong className="font-mono">{task.serviceActivation.assignedStaticIp}</strong></span>
                        <span className="text-emerald-700">&bull; ONT CPE: <strong className="font-mono">{task.serviceActivation.cpeSerialNumber}</strong></span>
                        <span className="text-emerald-700">&bull; SLA: <strong>99.8%</strong></span>
                      </div>
                      <Badge variant="success">Provisioned & Verified</Badge>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    {isScheduled && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Wrench}
                        onClick={() => handleStartInstallation(task.orderId)}
                        className="bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                      >
                        Start On-Site Installation
                      </Button>
                    )}

                    {isInProgress && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Activity}
                        onClick={() => openProvisionModal(task)}
                        className="bg-airtel-600 hover:bg-airtel-700 text-white shadow-xs"
                      >
                        Launch Optical Diagnostics & Activate
                      </Button>
                    )}

                    {isActivated && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Info}
                        onClick={() => openProvisionModal(task)}
                        className="text-slate-700"
                      >
                        View Optical Diagnostics
                      </Button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Optical Power Meter & Service Provisioning Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-airtel-600 flex items-center justify-center font-bold">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    CPE Provisioning & Optical Calibration
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Order: <strong className="font-mono text-slate-700">{selectedTask.orderId}</strong> &bull; {selectedTask.businessProfile?.tradeName || 'Client'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Optical Power Meter */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Optical Power Meter (1310nm / 1490nm GPON)</span>
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LINK PASS
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Rx Power</span>
                  <span className="text-base font-black text-emerald-400">{rxPower} dBm</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Tx Power</span>
                  <span className="text-base font-black text-amber-300">+{txPower} dBm</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block">RTT Ping</span>
                  <span className="text-base font-black text-sky-300">3.8 ms</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Packet Loss</span>
                  <span className="text-base font-black text-emerald-400">0.00%</span>
                </div>
              </div>
            </div>

            {/* Provisioning Hardware & Static IP Details */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  CPE Hardware ONT Serial Number:
                </label>
                <input
                  type="text"
                  value={ontSerial}
                  onChange={(e) => setOntSerial(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Allocated Static IPv4 Subnet:
                </label>
                <input
                  type="text"
                  value={staticIp}
                  onChange={(e) => setStaticIp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Field Technician Commissioning Notes:
                </label>
                <textarea
                  rows={2}
                  value={fieldNotes}
                  onChange={(e) => setFieldNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTask(null)}
              >
                Cancel
              </Button>
              {selectedTask.orderStatus !== 'ACTIVATED' && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={CheckCircle2}
                  isLoading={isProvisioning}
                  onClick={handleCompleteActivation}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20"
                >
                  Confirm Live Activation
                </Button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default TechnicianDashboardPage;

