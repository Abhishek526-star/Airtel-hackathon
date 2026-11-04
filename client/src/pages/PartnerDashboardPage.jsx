import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { 
  Users, 
  AlertTriangle, 
  FileX, 
  CheckCircle2, 
  PhoneCall, 
  ShieldCheck, 
  Calendar, 
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';

const PartnerDashboardPage = () => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ kycIssuesCount: 0, abandonedQuotesCount: 0, activeLeadsCount: 0 });
  const [selectedLead, setSelectedLead] = useState(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('Partner verified physical original partnership deed and trade license on site.');
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPartnerLeads();
  }, [filterStatus]);

  const fetchPartnerLeads = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (filterStatus) queryParams.append('status', filterStatus);
      if (searchQuery) queryParams.append('search', searchQuery);

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
                Channel Partner Assisted Portal
              </h1>
              <Badge variant="brand">Assisted Selling Co-Pilot</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Field Agent: <strong>Amit Verma</strong> &bull; Accel Enterprise Channel Partner &bull; Delhi NCR
            </p>
          </div>
          <div className="text-xs text-slate-400">
            Real-time pipeline &bull; Reducing MSME lead churn
          </div>
        </div>

        {/* Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div 
            onClick={() => setFilterStatus('KYC Dropped')}
            className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all ${
              filterStatus === 'KYC Dropped' ? 'bg-red-50 border-red-300 ring-2 ring-red-500/20' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">KYC Exceptions</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl font-extrabold text-red-600 mt-2">{stats.kycIssuesCount || 18}</div>
            <p className="text-[11px] text-slate-500 mt-1">Leads stuck at document verification</p>
          </div>

          <div 
            onClick={() => setFilterStatus('Quote Abandoned')}
            className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all ${
              filterStatus === 'Quote Abandoned' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Abandoned Quotes</span>
              <FileX className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-amber-600 mt-2">{stats.abandonedQuotesCount || 14}</div>
            <p className="text-[11px] text-slate-500 mt-1">Ready for 1-click WhatsApp follow-up</p>
          </div>

          <div 
            onClick={() => setFilterStatus('')}
            className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all ${
              filterStatus === '' ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Active Leads</span>
              <Users className="w-5 h-5 text-slate-700" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{leads.length}</div>
            <p className="text-[11px] text-slate-500 mt-1">Assigned in your territory</p>
          </div>
        </div>

        {/* Lead Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Table Header Filter Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search business name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchPartnerLeads()}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 font-medium">Filter Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 font-semibold"
              >
                <option value="">All Statuses</option>
                <option value="KYC Dropped">KYC Dropped</option>
                <option value="Quote Abandoned">Quote Abandoned</option>
                <option value="Activated">Activated</option>
              </select>
            </div>
          </div>

          {/* Leads Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Lead ID & Business</th>
                  <th className="py-3 px-4">Segment</th>
                  <th className="py-3 px-4">City Tier</th>
                  <th className="py-3 px-4">Status & Diagnostic</th>
                  <th className="py-3 px-4">Propensity</th>
                  <th className="py-3 px-4 text-right">Assisted Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">Loading assigned leads...</td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">No leads found matching criteria.</td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.leadId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{lead.businessName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{lead.leadId}</div>
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
                              className={`h-full ${lead.hasGstin ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                              style={{ width: `${lead.propensityScore || 75}%` }}
                            />
                          </div>
                          <span className="font-bold text-[11px] text-slate-800">{lead.propensityScore || 75}/100</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
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
                            Assist KYC
                          </Button>
                        ) : lead.status === 'Quote Abandoned' ? (
                          <a
                            href={`https://wa.me/?text=Hello%20${encodeURIComponent(lead.businessName)},%20your%20Accel%20Business%20quote%20is%20ready%20for%201-click%20activation!`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold"
                          >
                            <span>WhatsApp</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Live</span>
                          </span>
                        )}
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
              <h3 className="font-bold text-base">Assisted KYC Verification</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Customer <strong>{selectedLead.businessName}</strong> ({selectedLead.leadId}) encountered a document verification exception.
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
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleOverrideKYC}
              >
                Approve & Unblock Lead
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PartnerDashboardPage;

