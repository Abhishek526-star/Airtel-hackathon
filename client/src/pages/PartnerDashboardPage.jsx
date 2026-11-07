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
  PhoneCall,
  Phone,
  Inbox,
  Clock,
  MapPin,
  RefreshCw,
  Check,
  Building2,
  Calendar,
  AlertCircle
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

  // Historic / Funnel Leads
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ 
    kycIssuesCount: 0, 
    abandonedQuotesCount: 0, 
    unclosedLeadsCount: 0, 
    activeLeadsCount: 0 
  });
  const [selectedLead, setSelectedLead] = useState(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('Partner verified physical original partnership deed and trade license on site.');
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('propensity'); // 'propensity' | 'recent'

  // Smart KYC Request Approval Modal State
  const [selectedKycReq, setSelectedKycReq] = useState(null);
  const [kycApproveModalOpen, setKycApproveModalOpen] = useState(false);
  const [kycNotes, setKycNotes] = useState('Partner conducted physical on-site inspection of original statutory documents and verified signatory identity under DPDP Act 2023.');
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
  const [isApprovingKyc, setIsApprovingKyc] = useState(false);

  useEffect(() => {
    fetchPartnerStatus();
    fetchAssignedRequests();
  }, [requestFilter]);

  useEffect(() => {
    fetchPartnerLeads();
  }, [filterStatus, sortBy]);

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

  const fetchPartnerLeads = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (filterStatus) queryParams.append('status', filterStatus);
      if (searchQuery) queryParams.append('search', searchQuery);
      if (sortBy) queryParams.append('sortBy', sortBy);

      const res = await api.get(`/partner/leads?${queryParams.toString()}`);
      if (res.success && res.data) {
        setLeads(res.data.leads);
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverrideKYC = async () => {
    if (!selectedLead) return;
    try {
      const res = await api.post(`/partner/leads/${selectedLead.leadId}/assist-kyc`, {
        reason: overrideReason,
      });

      if (res.success) {
        setOverrideModalOpen(false);
        fetchPartnerLeads();
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
              <Badge variant="brand">{t('partner.badge', 'Assisted Selling Co-Pilot')}</Badge>
            </div>
            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
              <span>Field Agent:</span>
              <span className="font-semibold text-slate-800">{user?.fullName || 'Amit Verma'}</span>
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
            <span>Lead Recovery Pipeline ({stats.activeLeadsCount || leads.length})</span>
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

        {/* TAB 2: HISTORIC FUNNEL LEADS & UNCLOSED RECOVERY PIPELINE */}
        {activeTab === 'leads' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Metric KPI Cards (Stretch Goal #2: Unclosed Leads Dashboard) */}
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
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('partner.totalActiveLeadsTitle', 'Total Active Leads')}</span>
                  <Users className="w-5 h-5 text-slate-700" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 mt-2">{leads.length}</div>
                <p className="text-[11px] text-slate-500 mt-1">{t('partner.totalActiveLeadsDesc', 'Assigned in your territory')}</p>
              </div>
            </div>

            {/* Lead Table Container */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              
              {/* Table Header Filter Bar */}
              <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50">
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder={t('partner.searchPlaceholder', 'Search business or contact name...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchPartnerLeads()}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Stretch Goal #3: Propensity Priority Calling Toggle */}
                  <button
                    type="button"
                    onClick={() => setSortBy(sortBy === 'propensity' ? 'recent' : 'propensity')}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                      sortBy === 'propensity'
                        ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400/40'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                    title="Sort calling queue by highest MSME conversion propensity score"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Priority Call Queue (Propensity)</span>
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-500 font-medium">{t('partner.filterStatus', 'Filter:')}</span>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 font-semibold"
                    >
                      <option value="">{t('partner.allStatuses', 'All Statuses')}</option>
                      <option value="Advisor Drop-offs">Advisor Drop-Offs</option>
                      <option value="Quote Abandoned">Quote Abandoned</option>
                      <option value="KYC Dropped">KYC Dropped</option>
                      <option value="Activated">Activated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Leads Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-100 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">{t('partner.colBusiness', 'Lead ID & Business')}</th>
                      <th className="py-3 px-4">Contact / Phone</th>
                      <th className="py-3 px-4">{t('partner.colSegment', 'Segment')}</th>
                      <th className="py-3 px-4">{t('partner.colCity', 'City Tier')}</th>
                      <th className="py-3 px-4">{t('partner.colStatus', 'Status & Diagnostic')}</th>
                      <th className="py-3 px-4">{t('partner.colPropensity', 'Propensity')}</th>
                      <th className="py-3 px-4 text-right">{t('partner.colAction', 'Assisted Action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {isLoading ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-400">Loading assigned leads...</td>
                      </tr>
                    ) : leads.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-400">No leads found matching criteria.</td>
                      </tr>
                    ) : (
                      leads.map((lead) => (
                        <tr key={lead.leadId} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{lead.businessName}</div>
                            <div className="text-[11px] font-mono text-slate-400">{lead.leadId}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-slate-800 font-semibold">{lead.contactName || 'Owner / Manager'}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{lead.contactPhone || '9810123456'}</div>
                          </td>
                          <td className="py-3.5 px-4">{lead.segment}</td>
                          <td className="py-3.5 px-4">
                            <Badge variant="neutral">{lead.city} ({lead.cityTier})</Badge>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge
                              variant={
                                lead.status === 'Activated'
                                  ? 'success'
                                  : lead.status === 'KYC Dropped'
                                  ? 'danger'
                                  : 'warning'
                              }
                            >
                              {lead.status}
                            </Badge>
                            {lead.dropReason !== 'None' && (
                              <div className="text-[10px] text-slate-500 mt-0.5 max-w-xs truncate">
                                {lead.dropReason}
                              </div>
                            )}
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
                              <span className="font-bold text-[11px] text-slate-800">{lead.propensityScore || 75}/100</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <a
                                href={`tel:${lead.contactPhone || '9810123456'}`}
                                className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-bold"
                                title="Call customer directly"
                              >
                                <Phone className="w-3 h-3 text-slate-600" />
                                <span className="hidden sm:inline">Call</span>
                              </a>

                              {lead.status === 'KYC Dropped' ? (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedLead(lead);
                                    setOverrideModalOpen(true);
                                  }}
                                  className="text-[11px] py-1 px-2.5"
                                >
                                  {t('partner.assistKycBtn', 'Assist KYC')}
                                </Button>
                              ) : (
                                <a
                                  href={`https://wa.me/?text=Hello%20${encodeURIComponent(lead.contactName || lead.businessName)},%20your%20customized%20Accel%20Business%20telecom%20bundle%20is%20ready%20for%201-click%20activation!%20Tap%20here%20to%20review.`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold"
                                  title="Send 1-click recovery cart via WhatsApp"
                                >
                                  <span>{t('partner.whatsAppBtn', 'WhatsApp')}</span>
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Assisted KYC Override Modal */}
      {overrideModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center space-x-2 text-slate-900">
              <ShieldCheck className="w-5 h-5 text-airtel-600" />
              <h3 className="font-bold text-base">{t('partner.overrideTitle', 'Assisted KYC Verification')}</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {t('partner.overrideDesc', 'Customer encountered a document verification exception. Physical verification required.')}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('partner.overrideNoteLabel', 'Partner Physical Verification Note & Justification')}
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

    </div>
  );
};

export default PartnerDashboardPage;
