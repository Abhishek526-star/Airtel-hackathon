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
  ExternalLink
} from 'lucide-react';

const CustomerDashboardPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {profile?.tradeName || 'Gupta Supermart'}
              </h1>
              <Badge variant="brand">{profile?.segment || 'Micro Retail'}</Badge>
            </div>
            <p className="text-xs text-slate-500">
              Legal Entity: <strong>{profile?.legalName || 'Gupta Enterprises Pvt Ltd'}</strong> &bull; {profile?.address?.city || 'Noida'}, {profile?.address?.state || 'UP'}
            </p>
            <div className="flex items-center space-x-3 pt-1 text-xs text-slate-600">
              <span className="flex items-center space-x-1 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>GSTIN: {profile?.gstin || '07AAAAA0000A1Z5'} (Verified)</span>
              </span>
              <span>&bull;</span>
              <span>Udyam: {profile?.udyamNumber || 'UDYAM-UP-28-0012345'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
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
            <div className="text-2xl font-extrabold text-emerald-600">99.8%</div>
            <div className="text-[11px] text-slate-500">{t('dashboard.enterpriseActive', 'Enterprise Circuit Active')}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{t('dashboard.monthlyRecurring', 'Monthly Recurring')}</div>
            <div className="text-2xl font-extrabold text-slate-900">₹2,351</div>
            <div className="text-[11px] text-slate-500">{t('dashboard.gstCredit', 'Includes 18% GST Credit')}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{t('dashboard.staticIpTitle', 'Static IPv4')}</div>
            <div className="text-xl font-bold font-mono text-slate-800">103.24.188.42</div>
            <div className="text-[11px] text-slate-500">{t('dashboard.cctvServer', 'CCTV & Billing Server')}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{t('dashboard.activeServicesCount', 'Active Services')}</div>
            <div className="text-2xl font-extrabold text-airtel-700">4 Lines</div>
            <div className="text-[11px] text-slate-500">{t('dashboard.linesSummary', 'Broadband + SIM + WhatsApp')}</div>
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
                
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-airtel-700 flex items-center justify-center font-bold text-xs">
                      200M
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900">Accel Fiber Business 200M</div>
                      <div className="text-[11px] text-slate-500">Circuit ID: ACCEL-FIBER-NCR-8912 &bull; Unlimited Data</div>
                    </div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                      POS
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900">POS Digital Gateway M2M SIM</div>
                      <div className="text-[11px] text-slate-500">ICCID: 8991040291028301 &bull; Active in EDC Terminal</div>
                    </div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      WA
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900">WhatsApp Business API Starter</div>
                      <div className="text-[11px] text-slate-500">1,000 monthly automated receipts & promotions</div>
                    </div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>

              </div>
            </div>
          </div>

          {/* Monthly B2B Invoicing Card (1 Col) */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-airtel-600" />
                <span>{t('dashboard.gstInvoiceTitle', 'Monthly GST B2B Statement')}</span>
              </h3>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Invoice No:</span>
                  <span className="font-bold text-slate-800">ACCEL-INV-2026-8921</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Billing Cycle:</span>
                  <span>01 Nov 2026 – 30 Nov 2026</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Net Taxable Value:</span>
                  <span>₹1,992.00</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>CGST (9%):</span>
                  <span>₹179.28</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>SGST (9%):</span>
                  <span>₹179.28</span>
                </div>
                <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-slate-900 text-xs">
                  <span>Total Amount Paid:</span>
                  <span>₹2,350.56</span>
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

      {/* Invoice On-Screen Preview & Print Modal */}
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
                  <p className="text-[11px] text-slate-500">Invoice No: ACCEL/2026/B2B-INV-8921</p>
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
                  <div className="font-bold text-slate-900 mt-0.5">Accel Telecom Limited</div>
                  <div className="text-[11px] text-slate-500">GSTIN: 07AAACA0123M1Z2 (Delhi Circle)</div>
                  <div className="text-[11px] text-slate-500">Airtel SYNC Technology Park, Gurgaon</div>
                </div>
                <div>
                  <span className="font-bold text-slate-400 text-[10px] uppercase">Billed To</span>
                  <div className="font-bold text-slate-900 mt-0.5">{profile?.tradeName || 'Gupta Supermart'}</div>
                  <div className="text-[11px] text-slate-500">GSTIN: {profile?.gstin || '07AAAAA0000A1Z5'}</div>
                  <div className="text-[11px] text-slate-500">Udyam: {profile?.udyamNumber || 'UDYAM-UP-28-0012345'}</div>
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
                      <tr>
                        <td className="p-2.5 font-medium">Accel Biz Fibre 200M Broadband</td>
                        <td className="p-2.5 font-mono text-slate-500">998412</td>
                        <td className="p-2.5 text-right font-bold">₹1,899.00</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">POS Digital Gateway M2M Corporate SIM</td>
                        <td className="p-2.5 font-mono text-slate-500">998413</td>
                        <td className="p-2.5 text-right font-bold">₹299.00</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">WhatsApp Business API Starter</td>
                        <td className="p-2.5 font-mono text-slate-500">998422</td>
                        <td className="p-2.5 text-right font-bold">₹153.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tax totals */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Total Taxable Value:</span>
                  <span>₹2,351.00</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>CGST (9.0%):</span>
                  <span>₹211.59</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>SGST (9.0%):</span>
                  <span>₹211.59</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-900">
                  <span>Grand Total Payable:</span>
                  <span className="text-red-600">₹2,774.18</span>
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

    </div>
  );
};

export default CustomerDashboardPage;
