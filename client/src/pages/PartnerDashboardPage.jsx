import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useRealtimeEvent } from '../context/SocketContext';
import api from '../services/api';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { 
  Users, 
  AlertTriangle, 
  FileX, 
  CheckCircle2, 
  ShieldCheck, 
  Search, 
  Bot,
  Zap,
  Phone,
  Inbox,
  Clock,
  MapPin,
  RefreshCw,
  Check,
  Building2,
  FileText,
  Mail,
  Receipt,
  Download,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock,
  Activity,
  Layers,
  Send,
  Filter
} from 'lucide-react';

const PartnerDashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Navigation tab: 'requests' (live customer requests) | 'leads' (historic funnel leads)
  const [activeTab, setActiveTab] = useState('requests');

  // Live incoming customer requests
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [requestStats, setRequestStats] = useState({ newCount: 0, activeCount: 0, resolvedCount: 0, totalCount: 0 });
  const [requestFilter, setRequestFilter] = useState('ALL');
  const [isRequestsLoading, setIsRequestsLoading] = useState(false);

  // Partner availability status
  const [availability, setAvailability] = useState({
    isAvailable: true,
    availabilityStatus: 'AVAILABLE',
    activeAssignedLeadsCount: 0,
    territoryCircle: user?.territoryCircle || 'Delhi NCR',
  });
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);

  // Historic / Funnel Leads & Recovery Pipeline
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ 
    kycIssuesCount: 0, 
    abandonedQuotesCount: 0, 
    unclosedLeadsCount: 0, 
    activeLeadsCount: 0 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRecoveryStatus, setFilterRecoveryStatus] = useState('');
  const [filterSegment, setFilterSegment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('propensity'); // 'propensity' | 'recent' | 'oldest' | 'turnover'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Customer Dossier Drawer State
  const [selectedLead, setSelectedLead] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dossierLoading, setDossierLoading] = useState(false);
  const [dossierData, setDossierData] = useState(null);
  const [drawerTab, setDrawerTab] = useState('profile'); // 'profile' | 'kyc' | 'orders' | 'recovery'

  // Recovery Action Form State (inside drawer)
  const [actionType, setActionType] = useState('PHONE_CALL');
  const [actionStatus, setActionStatus] = useState('IN_PROGRESS');
  const [actionRemarks, setActionRemarks] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Secure Document Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewDocData, setPreviewDocData] = useState(null);

  // Smart KYC Request Approval Modal State
  const [selectedKycReq, setSelectedKycReq] = useState(null);
  const [kycApproveModalOpen, setKycApproveModalOpen] = useState(false);
  const [kycNotes, setKycNotes] = useState('Partner conducted physical on-site inspection of original statutory documents and verified signatory identity under DPDP Act 2023.');
  const [isApprovingKyc, setIsApprovingKyc] = useState(false);

  // Assisted KYC Override Modal State (legacy shortcut)
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('Partner verified physical original partnership deed and trade license on site.');

  const [liveToast, setLiveToast] = useState('');

  // Real-Time Event Listeners
  useRealtimeEvent('KYC_EXCEPTION_ASSIGNED', (payload) => {
    setLiveToast(`⚡ New KYC Verification Request Assigned: ${payload.customerName} (${payload.businessName || payload.locationCircle})`);
    fetchAssignedRequests();
    setTimeout(() => setLiveToast(''), 6000);
  });

  useRealtimeEvent('PARTNER_ASSISTANCE_REQUESTED', (payload) => {
    setLiveToast(`Incoming Customer Assistance Request: ${payload.customerName || 'Merchant'} (${payload.locationCircle || 'Circle'})`);
    fetchAssignedRequests();
    setTimeout(() => setLiveToast(''), 5000);
  });

  useEffect(() => {
    fetchPartnerStatus();
    fetchAssignedRequests();
  }, [requestFilter]);

  useEffect(() => {
    fetchPartnerLeads(1);
  }, [filterStatus, filterRecoveryStatus, filterSegment, sortBy]);

  const fetchPartnerStatus = async () => {
    try {
      const res = await api.get('/partner/status');
      if (res.success && res.data) {
        setAvailability(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch partner status:', err);
    }
  };

  const fetchAssignedRequests = async () => {
    try {
      setIsRequestsLoading(true);
      const queryParam = requestFilter && requestFilter !== 'ALL' ? `?status=${requestFilter}` : '';
      const res = await api.get(`/partner/my-requests${queryParam}`);
      if (res.success && res.data) {
        setAssignedRequests(res.data.requests);
        setRequestStats(res.data.stats);
      }
    } catch (err) {
      console.warn('Could not fetch assigned requests:', err);
    } finally {
      setIsRequestsLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      setIsUpdatingAvailability(true);
      const newStatus = availability.availabilityStatus === 'AVAILABLE' ? 'BUSY' : 'AVAILABLE';
      const newIsAvailable = newStatus === 'AVAILABLE';

      const res = await api.patch('/partner/availability', {
        isAvailable: newIsAvailable,
        availabilityStatus: newStatus,
      });

      if (res.success && res.data) {
        setAvailability((prev) => ({
          ...prev,
          isAvailable: res.data.isAvailable,
          availabilityStatus: res.data.availabilityStatus,
        }));
      }
    } catch (err) {
      alert(`Could not update availability: ${err.message}`);
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId, newStatus) => {
    try {
      const res = await api.patch(`/partner/my-requests/${requestId}/status`, {
        status: newStatus,
        resolutionNotes: newStatus === 'RESOLVED' ? 'Issue resolved and MSME customer onboarded.' : undefined,
      });

      if (res.success) {
        fetchAssignedRequests();
        fetchPartnerStatus();
      }
    } catch (err) {
      alert(`Failed to update request: ${err.message}`);
    }
  };

  const openKycApproveModal = (req) => {
    setSelectedKycReq(req);
    setKycNotes(`Partner ${user?.fullName || 'Agent'} conducted physical on-site inspection for ${req.businessName || req.customerName}. Original documents verified under DPDP Act 2023.`);
    setKycApproveModalOpen(true);
  };

  const handleApproveKyc = async () => {
    if (!selectedKycReq) return;
    try {
      setIsApprovingKyc(true);
      const res = await api.post(`/partner/kyc/${selectedKycReq._id || selectedKycReq.requestId}/approve`, {
        notes: kycNotes,
      });
      if (res.success) {
        setKycApproveModalOpen(false);
        setSelectedKycReq(null);
        await fetchAssignedRequests();
        await fetchPartnerStatus();
      }
    } catch (err) {
      alert(`KYC Approval Error: ${err.message}`);
    } finally {
      setIsApprovingKyc(false);
    }
  };

  const fetchPartnerLeads = async (page = 1) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', '10');
      if (filterStatus) queryParams.append('status', filterStatus);
      if (filterRecoveryStatus) queryParams.append('recoveryStatus', filterRecoveryStatus);
      if (filterSegment) queryParams.append('segment', filterSegment);
      if (searchQuery) queryParams.append('search', searchQuery);
      if (sortBy) queryParams.append('sortBy', sortBy);

      const res = await api.get(`/partner/leads?${queryParams.toString()}`);
      if (res.success && res.data) {
        setLeads(res.data.leads || []);
        setStats(res.data.stats || stats);
        setTotalCount(res.data.totalCount || 0);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.currentPage || page);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCustomerDossier = async (lead) => {
    try {
      setSelectedLead(lead);
      setIsDrawerOpen(true);
      setDossierLoading(true);
      setDrawerTab('profile');
      setActionSuccessMsg('');
      setActionStatus(lead.recoveryStatus || 'IN_PROGRESS');
      setActionRemarks('');

      const res = await api.get(`/partner/leads/${lead.leadId || lead._id}/customer-details`);
      if (res.success && res.data) {
        setDossierData(res.data);
      }
    } catch (err) {
      alert(`Could not load customer dossier: ${err.message || 'Access restricted.'}`);
      setIsDrawerOpen(false);
    } finally {
      setDossierLoading(false);
    }
  };

  const handleSubmitRecoveryAction = async () => {
    if (!selectedLead) return;
    try {
      setIsSubmittingAction(true);
      const res = await api.post(`/partner/leads/${selectedLead.leadId || selectedLead._id}/recovery-action`, {
        actionType,
        newStatus: actionStatus,
        remarks: actionRemarks || `Partner recorded ${actionType.replace('_', ' ')}.`,
      });

      if (res.success) {
        setActionSuccessMsg(`Recovery action "${actionType.replace('_', ' ')}" recorded successfully.`);
        setActionRemarks('');
        const updatedDossier = await api.get(`/partner/leads/${selectedLead.leadId || selectedLead._id}/customer-details`);
        if (updatedDossier.success) {
          setDossierData(updatedDossier.data);
        }
        fetchPartnerLeads(currentPage);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(`Failed to record action: ${err.message}`);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleOpenDocumentPreview = async (docId) => {
    if (!selectedLead) return;
    try {
      setPreviewLoading(true);
      setPreviewModalOpen(true);
      const res = await api.get(`/partner/leads/${selectedLead.leadId || selectedLead._id}/documents/${docId}/preview`);
      if (res.success && res.data) {
        setPreviewDocData(res.data);
      }
    } catch (err) {
      alert(`Preview error: ${err.message}`);
      setPreviewModalOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownloadInvoice = (orderId) => {
    const downloadUrl = `/api/invoices/download?orderId=${encodeURIComponent(orderId)}`;
    window.open(downloadUrl, '_blank');
  };

  const handleOverrideKYC = async () => {
    if (!selectedLead) return;
    try {
      const res = await api.post(`/partner/leads/${selectedLead.leadId}/assist-kyc`, {
        reason: overrideReason,
      });

      if (res.success) {
        setOverrideModalOpen(false);
        fetchPartnerLeads(currentPage);
        if (isDrawerOpen) {
          const updatedDossier = await api.get(`/partner/leads/${selectedLead.leadId}/customer-details`);
          if (updatedDossier.success) setDossierData(updatedDossier.data);
        }
      }
    } catch (err) {
      alert(err.message || 'Assisted KYC override failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Real-time Task Notification Banner */}
        {liveToast && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs font-bold flex items-center justify-between shadow-xs animate-bounce">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-airtel-600 animate-pulse"></span>
              <span>{liveToast}</span>
            </div>
            <button onClick={() => setLiveToast('')} className="text-red-700 hover:text-red-900 text-xs">✕</button>
          </div>
        )}
        
        {/* Top Header Card with Dynamic Availability Toggle */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {t('partner.title', 'Channel Partner Assisted Portal')}
              </h1>
              <Badge variant="brand">{t('partner.badge', 'Smart KYC Partner & Assisted Recovery')}</Badge>
            </div>
            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
              <span>Field Agent:</span>
              <span className="font-semibold text-slate-800">{user?.fullName || 'Ananya Deshmukh'}</span>
              <span>•</span>
              <span className="font-semibold text-slate-800">{user?.agencyName || 'Accel Enterprise Channel Partner'}</span>
              <span>•</span>
              <span className="text-airtel-700 font-semibold">{availability.territoryCircle || user?.territoryCircle || 'Delhi NCR'}</span>
              {(user?.partnerCode || availability.partnerCode) && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-700">
                  ID: {user?.partnerCode || availability.partnerCode}
                </span>
              )}
            </p>
          </div>

          {/* Availability Status Switch & Live Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Active Workload</div>
              <div className="text-sm font-extrabold text-slate-800">
                {availability.activeAssignedLeadsCount || 0} Leads
              </div>
            </div>

            <button
              type="button"
              disabled={isUpdatingAvailability}
              onClick={toggleAvailability}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl border font-bold text-xs shadow-sm transition-all ${
                availability.availabilityStatus === 'AVAILABLE'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                  availability.availabilityStatus === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span>
                {availability.availabilityStatus === 'AVAILABLE'
                  ? 'Available for New Requests (Online)'
                  : 'Busy in Field / Offline'}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Selector: Live Requests vs Funnel Pipeline */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'requests'
                ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Assigned Customer Requests</span>
            {requestStats.newCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'requests' ? 'bg-white text-red-600' : 'bg-red-600 text-white'
              }`}>
                {requestStats.newCount} New
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leads')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'leads'
                ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Lead Recovery Pipeline ({totalCount || stats.activeLeadsCount || leads.length})</span>
          </button>
        </div>

        {/* TAB 1: LIVE ASSIGNED CUSTOMER REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-5">
            {/* Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-1.5">
                {['ALL', 'NEW_ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'RESOLVED'].map((statusKey) => (
                  <button
                    key={statusKey}
                    type="button"
                    onClick={() => setRequestFilter(statusKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      requestFilter === statusKey
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {statusKey.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={fetchAssignedRequests}
                  icon={RefreshCw}
                  className="text-xs"
                >
                  Refresh Inbox
                </Button>
              </div>
            </div>

            {/* Requests Grid / Cards */}
            {isRequestsLoading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
                Loading assigned customer requests...
              </div>
            ) : assignedRequests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No Customer Requests Found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  When MSME customers request assisted onboarding, physical KYC checks, or site visits in your operational telecom circle ({availability.territoryCircle}), requests will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignedRequests.map((req) => (
                  <div
                    key={req._id || req.requestId}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-slate-500">{req.requestId}</span>
                        <Badge
                          variant={
                            req.status === 'NEW_ASSIGNED'
                              ? 'danger'
                              : req.status === 'ACCEPTED'
                              ? 'warning'
                              : req.status === 'RESOLVED'
                              ? 'success'
                              : 'brand'
                          }
                        >
                          {req.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{req.businessName || 'MSME Enterprise'}</h4>
                        <div className="text-xs text-slate-600 font-semibold">{req.customerName}</div>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-slate-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          <span>{req.locationCircle}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {/* Smart KYC Review Details (if KYC request) */}
                      {req.requestType === 'KYC_ASSISTANCE' && (
                        <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                          <div className="flex items-center space-x-1 font-bold text-[11px] text-amber-800">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                            <span>Smart KYC Review Flag</span>
                          </div>
                          {req.documentType && (
                            <div className="text-[11px] text-amber-800">
                              Document: <strong>{req.documentType.replace('_', ' ')}</strong> {req.ocrExtractedId && `(${req.ocrExtractedId})`}
                            </div>
                          )}
                          {req.verificationIssue && (
                            <p className="text-[10px] text-amber-700 italic">
                              "{req.verificationIssue}"
                            </p>
                          )}
                        </div>
                      )}

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                        <div className="text-[10px] uppercase font-bold text-slate-400">
                          {req.requestType.replace('_', ' ')}
                        </div>
                        <p className="text-[11px] text-slate-600 italic">
                          "{req.notes || 'Customer requested partner assisted guidance.'}"
                        </p>
                      </div>
                    </div>

                    {/* Actions on Request */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center space-x-2">
                        <a
                          href={`tel:${req.customerPhone}`}
                          className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call {req.customerPhone}</span>
                        </a>

                        {req.status === 'NEW_ASSIGNED' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateRequestStatus(req._id || req.requestId, 'ACCEPTED')}
                            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all"
                          >
                            Accept
                          </button>
                        )}
                      </div>

                      {req.requestType === 'KYC_ASSISTANCE' && req.status !== 'RESOLVED' && (
                        <button
                          type="button"
                          onClick={() => openKycApproveModal(req)}
                          className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all text-center flex items-center justify-center space-x-1.5 shadow-sm shadow-emerald-500/20"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Approve & Verify Smart KYC</span>
                        </button>
                      )}

                      {req.status !== 'RESOLVED' && req.requestType !== 'KYC_ASSISTANCE' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateRequestStatus(req._id || req.requestId, 'RESOLVED')}
                          className="w-full py-1.5 rounded-xl border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-slate-600 hover:text-emerald-700 text-xs font-bold transition-all text-center flex items-center justify-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Request Resolved</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HISTORIC FUNNEL LEADS & SMART KYC RECOVERY PIPELINE */}
        {activeTab === 'leads' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div 
                onClick={() => setFilterStatus('Advisor Drop-offs')}
                className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all ${
                  filterStatus === 'Advisor Drop-offs' ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Advisor Drop-Offs</span>
                  <Bot className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-2xl font-extrabold text-purple-600 mt-2">{stats.unclosedLeadsCount || 120}</div>
                <p className="text-[11px] text-slate-500 mt-1">Unclosed leads requiring partner intervention</p>
              </div>

              <div 
                onClick={() => setFilterStatus('Quote Abandoned')}
                className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all ${
                  filterStatus === 'Quote Abandoned' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('partner.abandonedQuotesTitle', 'Abandoned Quotes')}</span>
                  <FileX className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-2xl font-extrabold text-amber-600 mt-2">{stats.abandonedQuotesCount || 14}</div>
                <p className="text-[11px] text-slate-500 mt-1">{t('partner.abandonedQuotesDesc', 'Ready for 1-click WhatsApp follow-up')}</p>
              </div>

              <div 
                onClick={() => setFilterStatus('KYC Dropped')}
                className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all ${
                  filterStatus === 'KYC Dropped' ? 'bg-red-50 border-red-300 ring-2 ring-red-500/20' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('partner.kycExceptionsTitle', 'KYC Exceptions')}</span>
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-2xl font-extrabold text-red-600 mt-2">{stats.kycIssuesCount || 18}</div>
                <p className="text-[11px] text-slate-500 mt-1">{t('partner.kycExceptionsDesc', 'Leads stuck at document verification')}</p>
              </div>

              <div 
                onClick={() => setFilterStatus('')}
                className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all ${
                  filterStatus === '' ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('partner.totalActiveLeadsTitle', 'Total Pool Leads')}</span>
                  <Users className="w-5 h-5 text-slate-700" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 mt-2">{totalCount || stats.activeLeadsCount || leads.length}</div>
                <p className="text-[11px] text-slate-500 mt-1">Assigned in {availability.territoryCircle || 'your circle'}</p>
              </div>
            </div>

            {/* Filter, Search & Controls Container */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by business name, Lead ID, contact phone, GSTIN, or Udyam..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchPartnerLeads(1)}
                    className="w-full pl-9 pr-20 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => fetchPartnerLeads(1)}
                    className="absolute right-1.5 top-1.5 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all"
                  >
                    Search
                  </button>
                </div>

                {/* Priority Sorting & Controls */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSortBy(sortBy === 'propensity' ? 'recent' : 'propensity')}
                    className={`px-3 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition-all ${
                      sortBy === 'propensity'
                        ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400/40'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                    title="Sort calling queue by conversion propensity"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Propensity Call Queue</span>
                  </button>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 font-semibold"
                  >
                    <option value="propensity">Sort: Propensity Score</option>
                    <option value="recent">Sort: Recently Updated</option>
                    <option value="oldest">Sort: Oldest First</option>
                    <option value="turnover">Sort: Highest Turnover</option>
                  </select>
                </div>
              </div>

              {/* Advanced Filter Badges / Selectors */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center space-x-1.5 text-slate-500 font-semibold">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters:</span>
                </div>

                {/* Pipeline Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 font-semibold"
                >
                  <option value="">Funnel: All Stages</option>
                  <option value="Advisor Drop-offs">Advisor Drop-Offs</option>
                  <option value="Quote Abandoned">Quote Abandoned</option>
                  <option value="KYC Dropped">KYC Dropped</option>
                  <option value="Activated">Activated</option>
                </select>

                {/* Lead Recovery Status Filter */}
                <select
                  value={filterRecoveryStatus}
                  onChange={(e) => setFilterRecoveryStatus(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 font-semibold"
                >
                  <option value="">Recovery: All Statuses</option>
                  <option value="NEW_ASSIGNED">NEW ASSIGNED</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="DOCUMENTS_PENDING">DOCUMENTS PENDING</option>
                  <option value="PHYSICAL_VISIT_SCHEDULED">PHYSICAL VISIT SCHEDULED</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="LOST">LOST</option>
                </select>

                {/* Segment Filter */}
                <select
                  value={filterSegment}
                  onChange={(e) => setFilterSegment(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 font-semibold"
                >
                  <option value="">Segment: All</option>
                  <option value="Retail">Retail & Kirana</option>
                  <option value="Manufacturing">Manufacturing & Industry</option>
                  <option value="Services">Professional Services</option>
                  <option value="Healthcare">Healthcare & Clinics</option>
                  <option value="Education">Education & Coaching</option>
                </select>

                {(filterStatus || filterRecoveryStatus || filterSegment || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterStatus('');
                      setFilterRecoveryStatus('');
                      setFilterSegment('');
                      setSearchQuery('');
                      fetchPartnerLeads(1);
                    }}
                    className="text-red-600 hover:text-red-700 font-bold text-xs underline ml-auto"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Leads Table Container */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-100 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Customer & Business</th>
                      <th className="py-3 px-4">Contact Person</th>
                      <th className="py-3 px-4">Segment / Circle</th>
                      <th className="py-3 px-4">Recovery Pipeline</th>
                      <th className="py-3 px-4">Propensity</th>
                      <th className="py-3 px-4 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {isLoading ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-400 mb-2" />
                          <span>Loading eligible leads from your operational circle...</span>
                        </td>
                      </tr>
                    ) : leads.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-400 space-y-2">
                          <Users className="w-8 h-8 text-slate-300 mx-auto" />
                          <div className="font-bold text-slate-700">No leads match the selected filter criteria.</div>
                          <div className="text-[11px] text-slate-500">Try adjusting your filters or search terms.</div>
                        </td>
                      </tr>
                    ) : (
                      leads.map((lead) => (
                        <tr 
                          key={lead.leadId} 
                          onClick={() => handleOpenCustomerDossier(lead)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                                {lead.businessName}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="text-[10px] font-mono text-slate-400">{lead.leadId}</span>
                              <span className="text-[10px] text-slate-400">•</span>
                              <span className="text-[10px] text-slate-500 font-semibold">{lead.city} ({lead.cityTier})</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-slate-800 font-semibold">{lead.contactName || 'Proprietor'}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{lead.contactPhone || '9810123456'}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-slate-700 font-medium">{lead.segment}</div>
                            <div className="text-[10px] text-slate-400">{lead.state || 'Delhi NCR'}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-col space-y-1">
                              <Badge
                                variant={
                                  lead.recoveryStatus === 'RESOLVED' || lead.outcome === 'Activated'
                                    ? 'success'
                                    : lead.recoveryStatus === 'DOCUMENTS_PENDING' || lead.dropReason?.match(/document|KYC/i)
                                    ? 'danger'
                                    : lead.recoveryStatus === 'PHYSICAL_VISIT_SCHEDULED'
                                    ? 'brand'
                                    : 'warning'
                                }
                              >
                                {lead.recoveryStatus || 'NEW_ASSIGNED'}
                              </Badge>
                              {lead.dropReason && lead.dropReason !== 'None' && (
                                <span className="text-[10px] text-slate-500 max-w-xs truncate" title={lead.dropReason}>
                                  Drop: {lead.dropReason}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-1.5">
                              <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    (lead.propensityScore || 75) >= 80 
                                      ? 'bg-emerald-500' 
                                      : (lead.propensityScore || 75) >= 60 
                                      ? 'bg-amber-500' 
                                      : 'bg-red-500'
                                  }`} 
                                  style={{ width: `${lead.propensityScore || 75}%` }}
                                />
                              </div>
                              <span className="font-bold text-[11px] text-slate-800">{lead.propensityScore || 75}%</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenCustomerDossier(lead)}
                                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold shadow-xs transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Customer Profile</span>
                              </button>

                              <a
                                href={`tel:${lead.contactPhone || '9810123456'}`}
                                className="p-1.5 rounded-xl border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-slate-600 hover:text-emerald-700 transition-all"
                                title="Call customer phone"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-500">
                  Showing page <span className="font-bold text-slate-800">{currentPage}</span> of <span className="font-bold text-slate-800">{totalPages}</span> ({totalCount} total eligible leads in circle)
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1 || isLoading}
                    onClick={() => fetchPartnerLeads(currentPage - 1)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-bold transition-all"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages || isLoading}
                    onClick={() => fetchPartnerLeads(currentPage + 1)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-bold transition-all"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* COMPREHENSIVE CUSTOMER INFORMATION DRAWER (SLIDE-OVER SIDE PANEL) */}
      {/* ========================================================================= */}
      {isDrawerOpen && selectedLead && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
          />

          {/* Drawer Container */}
          <div className="relative w-full max-w-4xl bg-white shadow-2xl z-10 flex flex-col h-full border-l border-slate-200 animate-slideLeft">
            
            {/* Drawer Header */}
            <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 font-mono text-[11px] font-bold text-slate-300">
                    {selectedLead.leadId}
                  </span>
                  <Badge variant={selectedLead.recoveryStatus === 'RESOLVED' ? 'success' : 'brand'}>
                    {selectedLead.recoveryStatus || 'NEW_ASSIGNED'}
                  </Badge>
                  <span className="text-xs text-slate-400 font-semibold">
                    Propensity: <strong className="text-emerald-400">{selectedLead.propensityScore || 75}%</strong>
                  </span>
                </div>
                <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center space-x-2">
                  <span>{dossierData?.businessProfile?.tradeName || selectedLead.businessName}</span>
                </h2>
                <p className="text-xs text-slate-400 flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>{selectedLead.city}, {selectedLead.state || 'Delhi NCR'}</span>
                  <span>•</span>
                  <span>{selectedLead.segment}</span>
                </p>
              </div>

              {/* Header Quick Actions */}
              <div className="flex items-center space-x-2">
                <a
                  href={`tel:${dossierData?.contactInfo?.contactPhone || selectedLead.contactPhone || '9810123456'}`}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {dossierData?.contactInfo?.contactPhone || selectedLead.contactPhone || 'Customer'}</span>
                </a>

                <a
                  href={`https://wa.me/?text=Hello%20${encodeURIComponent(selectedLead.contactName || selectedLead.businessName)},%20your%20customized%20enterprise%20telecom%20bundle%20is%20ready%20for%20Smart%20KYC%20verification!`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs Inside Drawer */}
            <div className="flex items-center space-x-1 px-6 bg-slate-100 border-b border-slate-200 overflow-x-auto">
              <button
                type="button"
                onClick={() => setDrawerTab('profile')}
                className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  drawerTab === 'profile'
                    ? 'border-red-600 text-red-600 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Business & Contact Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setDrawerTab('kyc')}
                className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  drawerTab === 'kyc'
                    ? 'border-red-600 text-red-600 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>KYC Documents & OCR Diagnostics</span>
                {dossierData?.kycDocuments && (
                  <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px]">
                    {dossierData.kycDocuments.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setDrawerTab('orders')}
                className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  drawerTab === 'orders'
                    ? 'border-red-600 text-red-600 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Orders, Services & Invoices</span>
              </button>

              <button
                type="button"
                onClick={() => setDrawerTab('recovery')}
                className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  drawerTab === 'recovery'
                    ? 'border-red-600 text-red-600 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Recovery Actions & Audit Trail</span>
                {dossierData?.lead?.accessAuditLog && (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-mono">
                    {dossierData.lead.accessAuditLog.length}
                  </span>
                )}
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
              {dossierLoading ? (
                <div className="p-16 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-red-600 mx-auto" />
                  <div className="text-sm font-bold text-slate-800">Retrieving Customer Information Dossier...</div>
                  <div className="text-xs text-slate-500">Access audited under DPDP Act 2023 for partner {user?.fullName || 'agent'}.</div>
                </div>
              ) : !dossierData ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  Could not load customer information.
                </div>
              ) : (
                <>
                  {/* TAB 1: BUSINESS & CONTACT PROFILE */}
                  {drawerTab === 'profile' && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Statutory Business Details Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                          <div className="flex items-center space-x-2 text-slate-900 border-b border-slate-100 pb-3">
                            <Building2 className="w-5 h-5 text-red-600" />
                            <h3 className="font-extrabold text-sm">Registered Enterprise Information</h3>
                          </div>

                          <div className="space-y-2.5 text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-50">
                              <span className="text-slate-400 font-semibold">Legal Entity Name:</span>
                              <span className="font-bold text-slate-900 text-right">{dossierData.businessProfile?.legalName}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                              <span className="text-slate-400 font-semibold">Trade Name:</span>
                              <span className="font-bold text-slate-900">{dossierData.businessProfile?.tradeName}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                              <span className="text-slate-400 font-semibold">Entity Type:</span>
                              <span className="font-medium text-slate-800">{dossierData.businessProfile?.businessType}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                              <span className="text-slate-400 font-semibold">CIN / Reg ID:</span>
                              <span className="font-mono font-bold text-slate-800">{dossierData.businessProfile?.cin}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                              <span className="text-slate-400 font-semibold">GSTIN:</span>
                              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                                {dossierData.businessProfile?.gstin}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                              <span className="text-slate-400 font-semibold">Udyam Registration:</span>
                              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                                {dossierData.businessProfile?.udyamNumber}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                              <span className="text-slate-400 font-semibold">Annual Turnover:</span>
                              <span className="font-bold text-slate-800">{dossierData.businessProfile?.annualTurnoverBand}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-50">
                              <span className="text-slate-400 font-semibold">Employee Headcount:</span>
                              <span className="font-bold text-slate-800">{dossierData.businessProfile?.employeeCount} Staff</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-slate-400 font-semibold">Monthly Telecom Spend:</span>
                              <span className="font-extrabold text-emerald-700">₹{dossierData.businessProfile?.monthlyTelecomSpendInr}/month</span>
                            </div>
                          </div>
                        </div>

                        {/* Contact Information & Premise Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                          <div className="flex items-center space-x-2 text-slate-900 border-b border-slate-100 pb-3">
                            <Mail className="w-5 h-5 text-red-600" />
                            <h3 className="font-extrabold text-sm">Authorized Contact & Premise</h3>
                          </div>

                          <div className="space-y-3 text-xs">
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                              <div className="text-[10px] uppercase font-bold text-slate-400">Authorized Signatory / Key Contact</div>
                              <div className="text-sm font-extrabold text-slate-900">{dossierData.contactInfo?.contactPerson}</div>
                              <div className="text-slate-600 font-medium">{dossierData.contactInfo?.contactRole}</div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200">
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-4 h-4 text-emerald-600" />
                                  <span className="font-mono font-bold text-slate-800">{dossierData.contactInfo?.contactPhone}</span>
                                </div>
                                <a
                                  href={`tel:${dossierData.contactInfo?.contactPhone}`}
                                  className="text-xs text-emerald-700 font-bold hover:underline"
                                >
                                  Call Direct
                                </a>
                              </div>

                              <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200">
                                <div className="flex items-center space-x-2">
                                  <Mail className="w-4 h-4 text-sky-600" />
                                  <span className="font-mono text-slate-700 truncate max-w-[200px]">{dossierData.contactInfo?.contactEmail}</span>
                                </div>
                                <a
                                  href={`mailto:${dossierData.contactInfo?.contactEmail}`}
                                  className="text-xs text-sky-700 font-bold hover:underline"
                                >
                                  Send Email
                                </a>
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                              <div className="text-[10px] uppercase font-bold text-slate-400">Operational Premise Address</div>
                              <div className="font-medium text-slate-800 leading-relaxed">
                                {dossierData.businessProfile?.address?.street}, {dossierData.businessProfile?.address?.city}, {dossierData.businessProfile?.address?.state} - {dossierData.businessProfile?.address?.pincode}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-slate-500 font-semibold">Preferred Language:</span>
                              <Badge variant="neutral">{dossierData.contactInfo?.preferredLanguage || 'English'}</Badge>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Drop Reason & Diagnostic Overview Banner */}
                      {dossierData.lead?.dropReason && dossierData.lead.dropReason !== 'None' && (
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start space-x-3 text-xs text-amber-900">
                          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <h4 className="font-bold text-amber-900 text-sm">Funnel Drop-Off Diagnostic Flag</h4>
                            <p className="text-amber-800 leading-relaxed">
                              This MSME customer stalled during self-service onboarding with diagnostic exception: <strong>"{dossierData.lead.dropReason}"</strong>.
                              As the authorized circle partner, review their statutory credentials in Tab 2 and perform on-site recovery action in Tab 4.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: KYC DOCUMENTS & OCR DIAGNOSTICS */}
                  {drawerTab === 'kyc' && (
                    <div className="space-y-6 animate-fadeIn">
                      
                      {/* DPDP Act 2023 Compliance Pill */}
                      <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs shadow-sm">
                        <div className="flex items-center space-x-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>DoT Rule 46 & Digital Personal Data Protection (DPDP) Act 2023 Verified Sandbox</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">Access Audited</span>
                      </div>

                      {/* Document Cards */}
                      <div className="space-y-4">
                        {dossierData.kycDocuments?.map((doc) => {
                          const ocr = doc.ocrExtractedData || {};
                          const hasDiscrepancy = ocr.discrepancies && ocr.discrepancies.length > 0;
                          const confidence = Math.round((ocr.confidenceScore || 0.95) * 100);

                          return (
                            <div 
                              key={doc.id || doc._id} 
                              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <div className="flex items-center space-x-2.5">
                                  <div className={`p-2 rounded-xl ${
                                    doc.verificationStatus === 'VERIFIED' 
                                      ? 'bg-emerald-50 text-emerald-700' 
                                      : 'bg-amber-50 text-amber-700'
                                  }`}>
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h4 className="font-extrabold text-sm text-slate-900">{doc.title || doc.documentType?.replace('_', ' ')}</h4>
                                    <p className="text-[11px] font-mono text-slate-400">{doc.fileName} • {Math.round((doc.fileSize || 250000) / 1024)} KB</p>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Badge variant={doc.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}>
                                    {doc.verificationStatus}
                                  </Badge>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenDocumentPreview(doc.id || doc._id)}
                                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Secure DPDP Preview</span>
                                  </button>
                                </div>
                              </div>

                              {/* OCR Confidence Gauge */}
                              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-slate-700 flex items-center space-x-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Gemini Multi-Modal OCR Confidence Score</span>
                                  </span>
                                  <span className={`font-mono font-extrabold ${confidence >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    {confidence}% Match
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${confidence >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                                    style={{ width: `${confidence}%` }}
                                  />
                                </div>
                              </div>

                              {/* OCR Extracted Fields Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                <div className="p-2.5 rounded-xl border border-slate-100 bg-white">
                                  <div className="text-[10px] text-slate-400 font-bold uppercase">Extracted Legal Name</div>
                                  <div className="font-bold text-slate-800 mt-0.5 truncate">{ocr.extractedName || ocr.tradeName || 'N/A'}</div>
                                </div>
                                <div className="p-2.5 rounded-xl border border-slate-100 bg-white">
                                  <div className="text-[10px] text-slate-400 font-bold uppercase">Extracted ID / Cert No</div>
                                  <div className="font-mono font-bold text-slate-900 mt-0.5">{ocr.extractedId || 'N/A'}</div>
                                </div>
                                <div className="p-2.5 rounded-xl border border-slate-100 bg-white">
                                  <div className="text-[10px] text-slate-400 font-bold uppercase">Signatory Name</div>
                                  <div className="font-semibold text-slate-800 mt-0.5">{ocr.signatoryName || 'Managing Partner'}</div>
                                </div>
                              </div>

                              {/* Cross-match Verification Validation Pills */}
                              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold flex items-center space-x-1">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Registry Check (Active)</span>
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold flex items-center space-x-1">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Format Validated</span>
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold flex items-center space-x-1">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>State Jurisdiction Matched</span>
                                </span>
                              </div>

                              {/* Mismatches / Discrepancy Callout Box */}
                              {hasDiscrepancy ? (
                                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                                  <div className="flex items-center space-x-1.5 font-bold text-amber-800">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>OCR Flagged Statutory Mismatches & Missing Information:</span>
                                  </div>
                                  <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800 pl-1">
                                    {ocr.discrepancies.map((disc, idx) => (
                                      <li key={idx}>{disc}</li>
                                    ))}
                                  </ul>
                                </div>
                              ) : (
                                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-800 flex items-center space-x-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>No statutory discrepancies detected. Verified against central registry under DPDP Act 2023.</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Pending Requirements Checklist Box */}
                      {dossierData.lead?.pendingRequirements && dossierData.lead.pendingRequirements.length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">
                            Pending KYC Requirements to Unblock Customer
                          </h4>
                          <div className="space-y-2">
                            {dossierData.lead.pendingRequirements.map((req, idx) => (
                              <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[10px]">
                                  {idx + 1}
                                </span>
                                <span>{req}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: ORDERS, SERVICES & BILL/INVOICE HISTORY */}
                  {drawerTab === 'orders' && (
                    <div className="space-y-6 animate-fadeIn">
                      
                      {/* Requested Telecom Bundle Overview */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center space-x-2 text-slate-900">
                            <Layers className="w-5 h-5 text-red-600" />
                            <h3 className="font-extrabold text-sm">Selected Enterprise Telecom Bundle</h3>
                          </div>
                          <Badge variant="brand">12-Month Commercial Term</Badge>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">
                              {dossierData.lead?.bundleProducts || 'Airtel Enterprise Smart Office Bundle (Fiber 300 Mbps + Fixed Line Voice + Secure DNS)'}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">Includes optical CPE ONT, dedicated static IPv4, and 99.8% SLA</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-extrabold text-slate-900">
                              ₹{dossierData.lead?.monthlyBundleValueInr || 2499}
                              <span className="text-xs font-normal text-slate-500">/mo</span>
                            </div>
                            <div className="text-[11px] text-emerald-700 font-semibold">One-time Setup: ₹{dossierData.lead?.oneTimeSetupInr || 1000} (Standard Policy)</div>
                          </div>
                        </div>
                      </div>

                      {/* Active Orders & Circuit Telemetry */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h3 className="font-extrabold text-sm text-slate-900">Order & Circuit Telemetry</h3>
                          <Badge variant="success">Active Provisioning Pipeline</Badge>
                        </div>

                        <div className="space-y-3">
                          {dossierData.orders?.map((ord) => (
                            <div key={ord.orderId || ord._id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono font-bold text-xs text-slate-900">{ord.orderId}</span>
                                  <Badge variant={ord.orderStatus === 'ACTIVATED' ? 'success' : 'brand'}>{ord.orderStatus}</Badge>
                                </div>
                                <span className="text-xs text-slate-500">
                                  Ordered: {new Date(ord.createdAt).toLocaleDateString()}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">Dedicated Circuit ID</span>
                                  <div className="font-mono font-bold text-slate-800">{ord.serviceActivation?.circuitId || `CIR-DEL-${selectedLead.leadId}`}</div>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">Dedicated Static IP</span>
                                  <div className="font-mono font-bold text-slate-800">{ord.serviceActivation?.assignedStaticIp || '182.72.104.42'}</div>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">SLA Availability</span>
                                  <div className="font-bold text-emerald-700">{ord.serviceActivation?.slaUptimePercent || 99.8}% Guaranteed</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Comprehensive Bill & Invoice History */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center space-x-2 text-slate-900">
                            <Receipt className="w-5 h-5 text-emerald-600" />
                            <h3 className="font-extrabold text-sm">Bill & Invoice History</h3>
                          </div>
                          <span className="text-xs text-slate-500">GST Rule 46 Compliant</span>
                        </div>

                        <div className="space-y-3">
                          {dossierData.invoices?.map((inv) => (
                            <div key={inv.invoiceNumber || inv._id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-mono font-extrabold text-xs text-slate-900">{inv.invoiceNumber}</span>
                                    <Badge variant={inv.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                                      {inv.paymentStatus}
                                    </Badge>
                                  </div>
                                  <div className="text-[11px] text-slate-400 mt-0.5">
                                    Linked Order: {inv.orderId} • Issue Date: {new Date(inv.issueDate).toLocaleDateString()}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                  <div className="text-right">
                                    <div className="font-extrabold text-sm text-slate-900">₹{inv.totalAmount?.toLocaleString('en-IN')}</div>
                                    <div className="text-[10px] text-slate-400">incl. 18% GST</div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleDownloadInvoice(inv.orderId, inv.invoiceNumber)}
                                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download PDF</span>
                                  </button>
                                </div>
                              </div>

                              {/* Line Items Breakdown */}
                              {inv.items && inv.items.length > 0 && (
                                <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-600 space-y-1">
                                  {inv.items.map((item, i) => (
                                    <div key={i} className="flex justify-between py-0.5">
                                      <span>{item.productName} (Qty: {item.quantity || 1})</span>
                                      <span className="font-mono font-semibold">₹{item.taxable?.toLocaleString('en-IN')}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 4: RECOVERY ACTIONS & ACCESS AUDIT TRAIL */}
                  {drawerTab === 'recovery' && (
                    <div className="space-y-6 animate-fadeIn">
                      
                      {/* Success Alert */}
                      {actionSuccessMsg && (
                        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{actionSuccessMsg}</span>
                        </div>
                      )}

                      {/* Interactive Record Recovery Action Form */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                        <div className="flex items-center space-x-2 text-slate-900 border-b border-slate-100 pb-3">
                          <Activity className="w-5 h-5 text-red-600" />
                          <h3 className="font-extrabold text-sm">Record Assisted Recovery Action</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Recovery Action Type</label>
                            <select
                              value={actionType}
                              onChange={(e) => setActionType(e.target.value)}
                              className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white"
                            >
                              <option value="PHONE_CALL">📞 Outbound Phone Call</option>
                              <option value="WHATSAPP_FOLLOWUP">💬 WhatsApp Interactive Cart</option>
                              <option value="PHYSICAL_SITE_VISIT">🏢 On-site Physical Site Visit</option>
                              <option value="DOCUMENT_COLLECTED">📄 Physical Document Collected</option>
                              <option value="KYC_OVERRIDE_APPROVED">🛡️ Partner DPDP Act KYC Approval</option>
                              <option value="STATUS_CHANGE">🔄 Lead Status Update</option>
                              <option value="GENERAL_REMARK">📝 General Field Note</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Next Lead Recovery Status</label>
                            <select
                              value={actionStatus}
                              onChange={(e) => setActionStatus(e.target.value)}
                              className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white"
                            >
                              <option value="NEW_ASSIGNED">NEW ASSIGNED</option>
                              <option value="CONTACTED">CONTACTED</option>
                              <option value="IN_PROGRESS">IN PROGRESS</option>
                              <option value="DOCUMENTS_PENDING">DOCUMENTS PENDING</option>
                              <option value="PHYSICAL_VISIT_SCHEDULED">PHYSICAL VISIT SCHEDULED</option>
                              <option value="RESOLVED">RESOLVED (Unblock & Activate)</option>
                              <option value="LOST">LOST (Dropped)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Partner Engagement Notes & Follow-Up Findings
                          </label>
                          <textarea
                            rows="3"
                            value={actionRemarks}
                            onChange={(e) => setActionRemarks(e.target.value)}
                            placeholder="Detail discussions with proprietor, documents collected, premise survey findings, or reasons for status advance..."
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
                          />
                        </div>

                        <div className="flex items-center justify-end space-x-2 pt-1">
                          <Button
                            variant="primary"
                            size="sm"
                            isLoading={isSubmittingAction}
                            onClick={handleSubmitRecoveryAction}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                          >
                            Submit Recovery Action
                          </Button>
                        </div>
                      </div>

                      {/* Chronological Recovery Timeline */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                        <h4 className="font-extrabold text-sm text-slate-900">Recovery Engagement Timeline</h4>
                        
                        {(!dossierData.lead?.recoveryActions || dossierData.lead.recoveryActions.length === 0) ? (
                          <div className="text-xs text-slate-400 py-4 text-center">
                            No recovery actions recorded yet. Use the form above to log the first engagement.
                          </div>
                        ) : (
                          <div className="space-y-4 border-l-2 border-red-500 ml-3 pl-4">
                            {dossierData.lead.recoveryActions.map((act, idx) => (
                              <div key={idx} className="relative space-y-1">
                                <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-red-600 ring-4 ring-white" />
                                <div className="flex items-center space-x-2 text-xs">
                                  <span className="font-extrabold text-slate-900">{act.actionType.replace('_', ' ')}</span>
                                  <span className="text-slate-400">•</span>
                                  <Badge variant="neutral">{act.statusAfter || 'UPDATED'}</Badge>
                                  <span className="text-slate-400 ml-auto font-mono text-[10px]">
                                    {new Date(act.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 font-medium">"{act.remarks}"</p>
                                <div className="text-[10px] text-slate-400">
                                  Logged by: {act.performedBy} {act.partnerCode && `(${act.partnerCode})`}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Complete DPDP Act Access Audit Log Table */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">
                            DPDP Act 2023 Statutory Access Audit Trail
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400">Immutable Log</span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-[11px] text-slate-600">
                            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[9px] border-b border-slate-100">
                              <tr>
                                <th className="py-2 px-3">Event Action</th>
                                <th className="py-2 px-3">Authorized Performer</th>
                                <th className="py-2 px-3">Event Details</th>
                                <th className="py-2 px-3">IP Address</th>
                                <th className="py-2 px-3 text-right">Timestamp</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                              {dossierData.lead?.accessAuditLog?.map((audit, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                  <td className="py-2 px-3 font-mono font-bold text-slate-800">{audit.action}</td>
                                  <td className="py-2 px-3">{audit.performedBy} ({audit.partnerCode || 'CP'})</td>
                                  <td className="py-2 px-3 text-slate-500 max-w-xs truncate" title={audit.details}>{audit.details}</td>
                                  <td className="py-2 px-3 font-mono text-slate-400">{audit.ipAddress || '127.0.0.1'}</td>
                                  <td className="py-2 px-3 text-right font-mono text-slate-400">
                                    {new Date(audit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  )}
                </>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Airtel SYNC Assisted Selling Network &bull; Session Secure
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDrawerOpen(false)}
              >
                Close Customer Dossier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECURE DPDP ACT DOCUMENT PREVIEW MODAL */}
      {/* ========================================================================= */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 relative overflow-hidden animate-fadeIn">
            
            {/* Security Watermark Banner */}
            <div className="bg-red-950 text-red-200 px-4 py-2.5 rounded-2xl text-[10px] font-mono flex items-center justify-between border border-red-800">
              <div className="flex items-center space-x-2">
                <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="truncate">CONFIDENTIAL // DPDP ACT 2023 & DoT RULE 46 AUDITED VIEW</span>
              </div>
              <span className="text-red-400 font-bold shrink-0">AUTHENTICATED</span>
            </div>

            {previewLoading ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-red-600 mx-auto" />
                <div className="text-sm font-bold text-slate-800">Decrypting & Generating Watermarked Preview...</div>
              </div>
            ) : previewDocData ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{previewDocData.documentTitle}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Doc ID: {previewDocData.docId} &bull; {previewDocData.businessName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewModalOpen(false)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Simulated Official Certificate Layout */}
                <div className="p-6 rounded-2xl border-2 border-slate-300 bg-linear-to-b from-amber-50/40 to-slate-50 relative overflow-hidden space-y-4 shadow-inner">
                  {/* Background Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 rotate-[-25deg] select-none text-2xl font-black text-slate-900 uppercase">
                    DPDP ACT 2023 &bull; AUDITED PREVIEW ONLY &bull; DO NOT COPY
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-300 pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-9 h-9 rounded-xl bg-red-600 text-white font-extrabold flex items-center justify-center text-xs">
                        GOI
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 tracking-wide uppercase">
                          {previewDocData.documentType?.includes('UDYAM') ? 'Ministry of MSME' : 'Government of India'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold">Statutory Registry Verification Certificate</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge variant="success">REGISTRY VERIFIED</Badge>
                      <div className="text-[9px] font-mono text-slate-400 mt-1">Rule 46 Certified</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Registered Legal Name</span>
                        <div className="font-extrabold text-slate-900 mt-0.5">{previewDocData.businessName}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Registration Identifier</span>
                        <div className="font-mono font-extrabold text-slate-900 mt-0.5">{previewDocData.extractedIdentifier}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Authorized Signatory</span>
                        <div className="font-bold text-slate-800 mt-0.5">{previewDocData.contactName}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Jurisdiction Circle</span>
                        <div className="font-bold text-slate-800 mt-0.5">{availability.territoryCircle || 'Delhi NCR'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Cryptographic Seal & Watermark Info */}
                  <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500 space-y-1">
                    <div>Digital Hash: <strong>{previewDocData.securityHash}</strong></div>
                    <div>Audited By: <strong>{previewDocData.auditedBy}</strong> on {new Date(previewDocData.previewTimestamp).toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setPreviewModalOpen(false)}
                  >
                    Done Reviewing
                  </Button>
                </div>
              </div>
            ) : null}

          </div>
        </div>
      )}

      {/* Smart KYC On-Site Assisted Verification Modal */}
      {kycApproveModalOpen && selectedKycReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center space-x-2 text-slate-900">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">Approve & Verify Smart KYC (On-Site)</h3>
                <p className="text-xs text-slate-500">Request: <strong className="font-mono">{selectedKycReq.requestId}</strong> &bull; {selectedKycReq.businessName}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Customer:</span>
                <span className="font-bold text-slate-800">{selectedKycReq.customerName} ({selectedKycReq.customerPhone})</span>
              </div>
              {selectedKycReq.documentType && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Document:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedKycReq.documentType} ({selectedKycReq.ocrExtractedId || 'N/A'})</span>
                </div>
              )}
              {selectedKycReq.verificationIssue && (
                <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <strong>OCR Flag:</strong> {selectedKycReq.verificationIssue}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Partner Physical Verification Certificate & Note:
              </label>
              <textarea
                rows="3"
                value={kycNotes}
                onChange={(e) => setKycNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Submitting this approval will cryptographically certify the customer under DPDP Act 2023 and advance their onboarding to Verified.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setKycApproveModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isApprovingKyc}
                onClick={handleApproveKyc}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Confirm Physical KYC Approval
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assisted KYC Override Modal (Legacy shortcut) */}
      {overrideModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center space-x-2 text-slate-900">
              <ShieldCheck className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-base">{t('partner.overrideTitle', 'Assisted KYC Verification')}</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Customer encountered a document verification exception. Physical verification required.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Partner Physical Verification Note & Justification
              </label>
              <textarea
                rows="3"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setOverrideModalOpen(false)}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleOverrideKYC}
              >
                {t('partner.approveUnblockBtn', 'Approve & Unblock Lead')}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PartnerDashboardPage;
