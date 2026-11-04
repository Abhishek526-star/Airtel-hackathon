import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Wifi, 
  PhoneCall, 
  Database, 
  Lock, 
  CreditCard,
  Building,
  Store,
  Layers,
  ChevronRight
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeSegment, setActiveSegment] = useState('retail');

  const segments = [
    {
      id: 'retail',
      title: 'Micro Retail & Kirana',
      share: '55% of MSMEs',
      desc: 'Supermarkets, pharmacies, apparel stores, and eateries needing continuous UPI payment connectivity and customer communication.',
      bundle: 'Retail Express Smart Connect (200 Mbps + POS SIM + WhatsApp API)',
      price: '₹1,999 / mo',
    },
    {
      id: 'office',
      title: 'Professional Offices',
      share: '25% of MSMEs',
      desc: 'CA firms, law consultancies, medical clinics, and design agencies requiring multi-associate phones and confidential client storage.',
      bundle: 'Office Pro Suite (500 Mbps + Cloud PBX + M365 Email + CyberShield)',
      price: '₹2,499 / mo',
    },
    {
      id: 'multisite',
      title: 'Multi-Site Businesses',
      share: '15% of MSMEs',
      desc: 'Branch retail chains, diagnostic centers, and regional courier offices requiring branch SD-WAN and pooled corporate SIMs.',
      bundle: 'Branch SD-WAN Gateway + 5 Pooled SIMs Pack',
      price: '₹4,999 / mo',
    },
    {
      id: 'manufacturing',
      title: 'Small Manufacturers',
      share: '5% of MSMEs',
      desc: 'Industrial machining, garment exporters, and tooling units needing automated Tally cloud backups and fleet vehicle GPS tracking.',
      bundle: 'Industrial Smart Workshop Connect (Static IP + Cloud Backup + GPS M2M)',
      price: '₹3,499 / mo',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-850 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>Airtel SYNC Hackathon 2026 &bull; Enterprise Track A</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Making Small Businesses Go Digital in <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-400">One Sitting</span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
            Eliminate 14-day manual paperwork delays. Discover tailored enterprise telecom bundles, obtain transparent itemized quotes, complete DPDP-compliant Smart KYC, and schedule field activation in under 10 minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate('/advisor')}
              icon={Sparkles}
              className="w-full sm:w-auto text-base px-8 py-3.5 shadow-xl shadow-red-600/30"
            >
              Start AI Business Consultation
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/catalogue')}
              className="w-full sm:w-auto text-base px-6 py-3.5 bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-750"
            >
              Explore 25-Product Catalogue
            </Button>
          </div>

          {/* Value Stat Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto border-t border-slate-800 text-left">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <div className="text-2xl font-extrabold text-white">10 Mins</div>
              <div className="text-xs text-slate-400">Quote to Activation Lock</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <div className="text-2xl font-extrabold text-emerald-400">Instant</div>
              <div className="text-xs text-slate-400">Smart OCR & Registry KYC</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <div className="text-2xl font-extrabold text-amber-400">99.8% SLA</div>
              <div className="text-xs text-slate-400">Enterprise Uptime Guarantee</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <div className="text-2xl font-extrabold text-sky-400">Zero</div>
              <div className="text-xs text-slate-400">Hidden Fees / Full Itemization</div>
            </div>
          </div>

        </div>
      </section>

      {/* Legacy Bottleneck vs Digital Platform Contrast */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="brand" className="mb-2">The Transformation</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Solving the MSME Telecom Onboarding Friction
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Why Accel Telecom's legacy sales funnel converted only 7.36% of leads and how Project Udyam Digital achieves over 22% conversion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Legacy Flow Card */}
          <div className="p-6 rounded-2xl bg-white border border-red-200/80 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500"></div>
            <div className="flex items-center space-x-2 text-red-700 font-bold text-sm mb-4">
              <Clock className="w-4 h-4" />
              <span>Current Legacy Process (Pain Points)</span>
            </div>
            <ul className="space-y-3.5 text-sm text-slate-600">
              <li className="flex items-start space-x-2.5">
                <span className="text-red-500 font-bold mt-0.5">&times;</span>
                <span><strong>3–5 Days Manual Quotation:</strong> Sales reps calculate custom prices manually via email or visits.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-red-500 font-bold mt-0.5">&times;</span>
                <span><strong>Physical Paperwork Bottlenecks:</strong> Manual courier of stamped GST and signatory documents.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-red-500 font-bold mt-0.5">&times;</span>
                <span><strong>10–14 Days Lead to Activation:</strong> Repeated follow-up calls (average 3+ calls per customer).</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-red-500 font-bold mt-0.5">&times;</span>
                <span><strong>High Acquisition Cost:</strong> ₹15,000 blended CAC with fragmented billing systems.</span>
              </li>
            </ul>
          </div>

          {/* Digital Udyam Flow Card */}
          <div className="p-6 rounded-2xl bg-white border border-emerald-200/80 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500"></div>
            <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm mb-4">
              <Zap className="w-4 h-4" />
              <span>Project Udyam Digital Solution (Digital-First)</span>
            </div>
            <ul className="space-y-3.5 text-sm text-slate-700">
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Real-Time AI Bundle Match:</strong> 4 simple questions recommend the optimal business bundle instantly.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>DPDP 2023 Smart KYC:</strong> Instant OCR & mock GSTIN/Udyam registry validation in seconds.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>&lt; 24h Field Installation:</strong> Direct technician assignment and real-time visual milestone tracking.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Optimized Blended CAC:</strong> Drops from ₹15,000 to ₹4,200 with single consolidated B2B bill.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* Target Customer Segments Interactive Tabs */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <Badge variant="brand" className="mb-2">Tailored by Industry</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Designed for India's 4 Core MSME Segments
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Every segment has unique operational needs. Explore how our recommendation engine creates purpose-built bundles.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8 max-w-4xl mx-auto">
            {segments.map((seg) => (
              <button
                key={seg.id}
                onClick={() => setActiveSegment(seg.id)}
                className={`py-3 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                  activeSegment === seg.id
                    ? 'bg-airtel-600 text-white shadow-md shadow-red-500/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <div>{seg.title}</div>
                <div className={`text-[10px] font-normal mt-0.5 ${activeSegment === seg.id ? 'text-red-100' : 'text-slate-500'}`}>
                  {seg.share}
                </div>
              </button>
            ))}
          </div>

          {/* Active Segment Feature Box */}
          {(() => {
            const current = segments.find((s) => s.id === activeSegment);
            return (
              <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-xl">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-lg text-slate-900">{current.title}</span>
                    <Badge variant="brand">{current.share}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{current.desc}</p>
                  <div className="pt-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Curated Recommendation:</div>
                    <div className="text-sm font-semibold text-slate-900 flex items-center space-x-2 mt-0.5">
                      <Sparkles className="w-4 h-4 text-airtel-600" />
                      <span>{current.bundle}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-200">
                  <div className="text-xs text-slate-500">Starting from</div>
                  <div className="text-2xl font-extrabold text-airtel-700">{current.price}</div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate('/advisor')}
                    className="mt-3 w-full"
                  >
                    Get This Bundle
                  </Button>
                </div>
              </div>
            );
          })()}

        </div>
      </section>

      {/* How It Works (One Sitting Flow) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="brand" className="mb-2">Friction-Free Journey</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How It Works in 4 Simple Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-airtel-700 flex items-center justify-center font-bold text-base">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900">AI Consultation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Answer 4 conversational questions about your business type, staff count, and payment setup in English or Hindi.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-airtel-700 flex items-center justify-center font-bold text-base">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900">Customize Quote</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Add optional static IP, corporate SIMs, or cloud backup. Transparent price breakdown shows MRC, setup fees, and 18% GST.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-airtel-700 flex items-center justify-center font-bold text-base">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900">Smart Digital KYC</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload your GST or Udyam certificate. Instant OCR and mock registry cross-checking verifies your business in seconds.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-airtel-700 flex items-center justify-center font-bold text-base">
              4
            </div>
            <h3 className="font-bold text-base text-slate-900">Track & Activate</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Confirm your installation slot. Track field engineer dispatch on a live visual milestone timeline with zero phone follow-ups.
            </p>
          </div>
        </div>

        {/* CTA Bar */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-airtel-700 via-airtel-600 to-red-600 text-white text-center space-y-4 shadow-xl shadow-red-600/20">
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to upgrade your enterprise connectivity?
          </h3>
          <p className="text-red-100 text-sm max-w-xl mx-auto">
            Join hundreds of retail stores, medical clinics, and professional consultancies going digital in one sitting.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/advisor')}
            className="bg-white text-airtel-700 hover:bg-red-50 border-transparent shadow-lg text-sm px-8"
          >
            Start Digital Onboarding Now
          </Button>
        </div>

      </section>

    </div>
  );
};

export default LandingPage;

