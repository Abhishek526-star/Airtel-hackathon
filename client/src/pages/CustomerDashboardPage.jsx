import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import api from '../services/api';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { 
  Wifi, 
  FileText, 
  ShieldCheck, 
  Download, 
  Printer, 
  X,
  CheckCircle2,
  ExternalLink,
  UserCheck
} from 'lucide-react';
import RequestAssistanceModal from '../components/partner/RequestAssistanceModal';

const CustomerDashboardPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAssistanceModalOpen, setIsAssistanceModalOpen] = useState(false);

  useEffect(() => {
    fetchCustomerOrders();
  }, []);

  const fetchCustomerOrders = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/orders');
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId = null) => {
    try {
      setIsDownloading(true);
      const token = localStorage.getItem('udyam_token');
      
      const targetOrderId = orderId || (orders.length > 0 ? orders[0].orderId : null);
      const queryParam = targetOrderId ? `?orderId=${encodeURIComponent(targetOrderId)}` : '';
      const endpoint = `/api/invoices/download${queryParam}`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server returned ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const invoiceSeq = targetOrderId ? targetOrderId.replace(/[^0-9]/g, '') : '8921';
      a.download = `ACCEL-B2B-INVOICE-${invoiceSeq}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Invoice download error:', err);
      alert(`Could not download invoice PDF: ${err.message || 'Please ensure your session is active.'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const profile = user?.businessProfile;
  const activeOrder = orders.length > 0 ? orders[0] : null;
  const activeQuote = activeOrder?.quote;

  // Real ordered items from quote or fallback defaults
  const activeItems = activeQuote?.items && activeQuote.items.length > 0
    ? activeQuote.items
    : [
        { productName: 'Accel Fiber Business 200M', category: 'Connectivity', speedBandwidth: '200 Mbps', unitMonthlyPrice: 1999, quantity: 1 },
        { productName: 'POS Digital Gateway M2M SIM', category: 'Mobility', speedBandwidth: 'Unlimited CUG', unitMonthlyPrice: 299, quantity: 1 },
        { productName: 'WhatsApp Business API Starter', category: 'Digital', speedBandwidth: '1,000 sessions/mo', unitMonthlyPrice: 153, quantity: 1 },
      ];

  // Synchronized Financial Calculations (Matching Invoice, Checkout & DB)
  const monthlyRecurringCharge = activeQuote?.totalMonthlyAmount || 2351;
  const setupFee = activeQuote?.totalSetupFee || 0;
  const setupGst = activeQuote?.gstSetup || 0;

  const invoiceTaxable = (activeQuote?.discountedMrc || activeQuote?.baseMrc || 1992) + setupFee;
  const invoiceGst = (activeQuote?.gstMrc || 358.56) + setupGst;
  const invoiceCgst = parseFloat((invoiceGst / 2).toFixed(2));
  const invoiceSgst = parseFloat((invoiceGst / 2).toFixed(2));
  const invoiceTotalPaid = activeOrder?.paymentDetails?.paidAmount || activeQuote?.totalOneTimePayable || (invoiceTaxable + invoiceGst);

  const cleanOrderSeq = activeOrder?.orderId ? activeOrder.orderId.replace(/[^0-9]/g, '') : '8921';
  const invoiceNumber = `ACCEL/2026/B2B-INV-${cleanOrderSeq}`;
  const circuitId = activeOrder?.serviceActivation?.circuitId || 'ACCEL-FIBER-NCR-8912';
  const staticIp = activeOrder?.serviceActivation?.assignedStaticIp || '103.24.188.42';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {profile?.tradeName || activeOrder?.installationDetails?.contactPerson || 'Gupta Supermart'}
              </h1>
              <Badge variant="brand">{profile?.segment || 'Enterprise Client'}</Badge>
            </div>
            <p className="text-xs text-slate-500">
              Legal Entity: <strong>{profile?.legalName || user?.fullName || 'Gupta Enterprises Pvt Ltd'}</strong> &bull; {activeOrder?.installationDetails?.city || profile?.address?.city || 'Delhi NCR'}, {activeOrder?.installationDetails?.pincode || '110001'}
            </p>
            <div className="flex items-center space-x-3 pt-1 text-xs text-slate-600">
              <span className="flex items-center space-x-1 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>GSTIN: {profile?.gstin || (profile?.hasGstin ? 'Verified' : 'Unregistered MSME')}</span>
              </span>
              <span>&bull;</span>
              <span>Udyam: {profile?.udyamNumber || (profile?.hasUdyam ? 'Verified' : 'N/A')}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAssistanceModalOpen(true)}
              icon={UserCheck}
              className="text-xs"
            >
              Request Field Partner
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsPreviewOpen(true)}
              icon={Printer}
              className="text-xs"
            >
              View & Print
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isDownloading}
              onClick={() => handleDownloadInvoice()}
              icon={Download}
              className="text-xs flex-1 md:flex-none"
            >
              {downloadSuccess ? t('dashboard.downloadedAlert', 'Invoice Downloaded!') : t('dashboard.downloadPdfBtn', 'Download Official PDF Invoice')}
            </Button>
          </div>
        </div>

        {/* Telemetry & SLA Metric Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{t('dashboard.broadbandSla', 'Broadband SLA')}</div>
            <div className="text-2xl font-extrabold text-emerald-600">{activeOrder?.serviceActivation?.slaUptimePercent || 99.8}%</div>
            <div className="text-[11px] text-slate-500">{circuitId}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{t('dashboard.monthlyRecurring', 'Monthly Recurring')}</div>
            <div className="text-2xl font-extrabold text-slate-900">₹{monthlyRecurringCharge.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-slate-500">{t('dashboard.gstCredit', 'Includes 18% GST Credit')}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{t('dashboard.staticIpTitle', 'Static IPv4')}</div>
            <div className="text-xl font-bold font-mono text-slate-800">{staticIp}</div>
            <div className="text-[11px] text-slate-500">{t('dashboard.cctvServer', 'CCTV & Billing Server')}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{t('dashboard.activeServicesCount', 'Active Services')}</div>
            <div className="text-2xl font-extrabold text-airtel-700">{activeItems.length} Services</div>
            <div className="text-[11px] text-slate-500">{activeQuote?.bundleName || 'Curated MSME Pack'}</div>
          </div>
        </div>

        {/* Main Content Split: Active Services & Invoices */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Services List (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <Wifi className="w-4 h-4 text-airtel-600" />
                  <span>{t('dashboard.activeServicesTitle', 'Active Telecom & Digital Services')}</span>
                </h3>
                <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{t('dashboard.allOperational', 'All Systems Operational')}</span>
                </span>
              </div>

              <div className="space-y-3">
                {activeItems.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 text-airtel-700 flex items-center justify-center font-bold text-xs uppercase">
                        {(item.category || 'TEL').slice(0, 3)}
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900">{item.productName}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.speedBandwidth || item.category} &bull; Qty: {item.quantity || 1} &bull; ₹{(item.unitMonthlyPrice || item.rate || 0).toLocaleString('en-IN')}/mo
                        </div>
                      </div>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly B2B Invoicing Card (1 Col) */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-airtel-600" />
                <span>{t('dashboard.gstInvoiceTitle', 'Official B2B Tax Statement')}</span>
              </h3>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Invoice No:</span>
                  <span className="font-bold text-slate-800">{invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Billing Period:</span>
                  <span>01 Nov 2026 – 30 Nov 2026</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Net Taxable Value:</span>
                  <span>₹{invoiceTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>CGST (9%):</span>
                  <span>₹{invoiceCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>SGST (9%):</span>
                  <span>₹{invoiceSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-slate-900 text-xs">
                  <span>Total Amount Paid:</span>
                  <span className="text-airtel-700 font-extrabold">₹{invoiceTotalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-sans pt-1">
                  Monthly recurring from M2: ₹{monthlyRecurringCharge.toLocaleString('en-IN')}/mo
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  isLoading={isDownloading}
                  onClick={() => handleDownloadInvoice()}
                  icon={Download}
                  className="w-full text-xs shadow-md shadow-red-500/20"
                >
                  {downloadSuccess ? t('dashboard.downloadedAlert', 'Invoice Downloaded!') : t('dashboard.downloadPdfBtn', 'Download Official PDF Invoice')}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsPreviewOpen(true)}
                  icon={ExternalLink}
                  className="w-full text-xs"
                >
                  Inspect Invoice Document
                </Button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Invoice On-Screen Preview & Print Modal (Phase 3: Synchronized Figures) */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                  A
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Accel Telecom B2B Tax Invoice</h3>
                  <p className="text-[11px] text-slate-500">Invoice No: {invoiceNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoice Printable View */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-4 font-sans">
              
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                <div>
                  <span className="font-bold text-slate-400 text-[10px] uppercase">Supplier</span>
                  <div className="font-bold text-slate-900 mt-0.5">Accel Telecom Limited (B2B Division)</div>
                  <div className="text-[11px] text-slate-500">GSTIN: 07AAACA0123M1Z2 (Delhi Circle)</div>
                  <div className="text-[11px] text-slate-500">Airtel SYNC Technology Park, Gurgaon</div>
                </div>
                <div>
                  <span className="font-bold text-slate-400 text-[10px] uppercase">Billed To</span>
                  <div className="font-bold text-slate-900 mt-0.5">{profile?.tradeName || activeOrder?.installationDetails?.contactPerson || 'Gupta Supermart'}</div>
                  <div className="text-[11px] text-slate-500">GSTIN: {profile?.gstin || (profile?.hasGstin ? 'Verified' : 'Unregistered MSME')}</div>
                  <div className="text-[11px] text-slate-500">Udyam: {profile?.udyamNumber || (profile?.hasUdyam ? 'Verified' : 'N/A')}</div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <div className="font-bold text-slate-900 text-xs">Itemized B2B Telecom Services</div>
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 font-bold text-slate-600">
                      <tr>
                        <th className="p-2.5">Service</th>
                        <th className="p-2.5">SAC</th>
                        <th className="p-2.5 text-right">Taxable</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-medium">{item.productName} ({item.category || 'Monthly'})</td>
                          <td className="p-2.5 font-mono text-slate-500">{(item.category || '').toLowerCase().includes('voice') ? '998413' : '998412'}</td>
                          <td className="p-2.5 text-right font-bold">₹{((item.unitMonthlyPrice || item.rate || 0) * (item.quantity || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                      {setupFee > 0 && (
                        <tr>
                          <td className="p-2.5 font-medium text-slate-800">One-Time Optical Fiber Installation & ONT Setup</td>
                          <td className="p-2.5 font-mono text-slate-500">998419</td>
                          <td className="p-2.5 text-right font-bold text-slate-800">₹{setupFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tax totals */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Total Combined Taxable Value:</span>
                  <span>₹{invoiceTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>CGST (9.0%):</span>
                  <span>₹{invoiceCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>SGST (9.0%):</span>
                  <span>₹{invoiceSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-900">
                  <span>Grand Total Paid:</span>
                  <span className="text-red-600">₹{invoiceTotalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-center">
                Digitally authenticated document • No physical signature required under Rule 46 of CGST Rules
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => window.print()}
                icon={Printer}
                className="text-xs"
              >
                Print / Save via Browser
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={isDownloading}
                onClick={() => handleDownloadInvoice()}
                icon={Download}
                className="text-xs px-6"
              >
                Download Official PDF
              </Button>
            </div>

          </div>
        </div>
      )}

      <RequestAssistanceModal
        isOpen={isAssistanceModalOpen}
        onClose={() => setIsAssistanceModalOpen(false)}
        defaultType="FIELD_VISIT"
        initialNotes="MSME requests dedicated field site survey and in-person connectivity audit."
      />

    </div>
  );
};

export default CustomerDashboardPage;
