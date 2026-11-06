import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
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
  ArrowUpDown,
  Phone
} from 'lucide-react';

const PartnerDashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
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

  useEffect(() => {
    fetchPartnerLeads();
  }, [filterStatus, sortBy]);

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
        
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {t('partner.title', 'Channel Partner Assisted Portal')}
              </h1>
              <Badge variant="brand">{t('partner.badge', 'Assisted Selling Co-Pilot')}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
              <span>Field Agent:</span>
              <span className="font-semibold text-slate-800">{user?.fullName || 'Amit Verma'}</span>
              <span>•</span>
              <span className="font-semibold text-slate-800">{user?.agencyName || 'Accel Enterprise Channel Partner'}</span>
              <span>•</span>
              <span className="text-airtel-700 font-semibold">{user?.territoryCircle || 'Delhi NCR'}</span>
              {user?.partnerCode && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-700">
                  ID: {user.partnerCode}
                </span>
              )}
            </p>
          </div>
          <div className="text-xs text-slate-400">
            {t('partner.pipelineTag', 'Real-time pipeline • Reducing MSME lead churn')}
          </div>
        </div>

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
                          {/* Direct Call Button */}
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

    </div>
  );
};

export default PartnerDashboardPage;
