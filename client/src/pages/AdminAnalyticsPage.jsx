import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Badge from '../components/common/Badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  IndianRupee, 
  ShieldCheck, 
  AlertCircle,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

const AdminAnalyticsPage = () => {
  const [overview, setOverview] = useState(null);
  const [funnel, setFunnel] = useState([]);
  const [cohort, setCohort] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const [resOverview, resFunnel, resCohort] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/funnel'),
        api.get('/analytics/cohort'),
      ]);

      if (resOverview.success) setOverview(resOverview.data);
      if (resFunnel.success) setFunnel(resFunnel.data);
      if (resCohort.success) setCohort(resCohort.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#E31E24', '#0284C7', '#16A34A', '#F59E0B', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Executive Acquisition & Funnel Analytics
              </h1>
              <Badge variant="brand">Case Study Cohort Analysis</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Data source: <strong>5,000 SMB Leads Cohort</strong> &bull; Accel Business vs Project Udyam Digital Impact
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Airtel SYNC Hackathon 2026 &bull; Enterprise Track A
          </div>
        </div>

        {/* 4 Metric Impact Cards: Legacy Baseline vs Digital Target */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lead Conversion Rate</div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-red-600">7.36%</span>
              <span className="text-xs font-bold text-emerald-600">&rarr; 22.4% Target</span>
            </div>
            <p className="text-[10px] text-slate-500">368 activations from 5,000 baseline leads</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Blended Acquisition Cost</div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-slate-900">₹15,000</span>
              <span className="text-xs font-bold text-emerald-600">&rarr; ₹4,200</span>
            </div>
            <p className="text-[10px] text-slate-500">72% CAC reduction via self-service KYC</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Lead-to-Activation</div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-amber-600">17.6 Days</span>
              <span className="text-xs font-bold text-emerald-600">&rarr; &lt; 2 Days</span>
            </div>
            <p className="text-[10px] text-slate-500">Eliminates 3-5 day quote turnaround</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customer Follow-Up Calls</div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-slate-900">3.2 Calls</span>
              <span className="text-xs font-bold text-emerald-600">&rarr; 0 Calls</span>
            </div>
            <p className="text-[10px] text-slate-500">Replaced by live visual order tracker</p>
          </div>
        </div>

        {/* Funnel Conversion Chart & GSTIN Disparity Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Conversion Funnel Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">6-Stage Acquisition Funnel</h3>
                <p className="text-[11px] text-slate-500">Drop-off distribution across 5,000 leads</p>
              </div>
              <Badge variant="brand">Legacy Drop Points</Badge>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnel} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" stroke="#94A3B8" fontSize={11} />
                  <YAxis dataKey="stage" type="category" stroke="#64748B" fontSize={11} width={130} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val) => [`${val} Leads`, 'Cohort Volume']}
                  />
                  <Bar dataKey="count" fill="#E31E24" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GSTIN Disparity Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">The GSTIN Conversion Disparity</h3>
                <p className="text-[11px] text-slate-500">Why GST-holding MSMEs convert 4.8x higher</p>
              </div>
              <Badge variant="neutral">9.6% vs 2.0%</Badge>
            </div>

            <div className="space-y-4 pt-2">
              {cohort?.gstinDisparity?.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-900">{item.cohort}</span>
                    <span className="font-extrabold text-sm text-airtel-700">{item.conversionRate}% Conv</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${idx === 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, item.conversionRate * 8)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Total Cohort: {item.totalLeads}</span>
                    <span>Activated: {item.activated}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200 text-slate-700 text-xs leading-relaxed">
              <strong>Udyam Digital Solution:</strong> Integrating the Udyam MSME Registry bridges this gap for micro-enterprises lacking GSTIN, raising non-GSTIN conversion from 2.0% to over 14%.
            </div>
          </div>

        </div>

        {/* Drop-off Root Causes & Segments Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Drop-off Root Causes */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
              Primary Lead Drop-off Causes (Case Study Data)
            </h3>

            <div className="space-y-2.5">
              {cohort?.dropOffReasons?.map((reason, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-medium">{reason.reason}</span>
                  <div className="text-right flex-shrink-0 ml-3">
                    <span className="font-bold text-slate-900">{reason.count}</span>
                    <span className="text-[10px] text-slate-400 ml-1">({reason.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Segment Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
              Customer Segment Performance
            </h3>

            <div className="space-y-3">
              {cohort?.segmentPerformance?.map((seg, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">{seg.segment}</span>
                    <span className="text-airtel-700 font-bold">{seg.conversionRate}% ({seg.activated}/{seg.total})</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-airtel-600" 
                      style={{ width: `${Math.min(100, seg.conversionRate * 10)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminAnalyticsPage;

