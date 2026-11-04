import React from 'react';
import { Shield, Sparkles, Building2, PhoneCall } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-airtel-600 flex items-center justify-center text-white font-bold text-xs">
                A
              </div>
              <span className="text-white font-bold text-sm tracking-tight">Project Udyam Digital</span>
            </div>
            <p className="text-slate-400 text-[12px] leading-relaxed">
              Making Indian Small Businesses Go Digital in One Sitting. Instant tailored telecom bundles, transparent pricing, and smart KYC verification.
            </p>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold mb-3">MSME Solutions</h4>
            <ul className="space-y-2 text-[12px]">
              <li><a href="/catalogue" className="hover:text-white transition-colors">Business Fiber Broadband</a></li>
              <li><a href="/catalogue" className="hover:text-white transition-colors">Corporate Voice & Virtual PBX</a></li>
              <li><a href="/catalogue" className="hover:text-white transition-colors">WhatsApp Business API</a></li>
              <li><a href="/catalogue" className="hover:text-white transition-colors">POS & IoT Connectivity</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold mb-3">Digital Onboarding</h4>
            <ul className="space-y-2 text-[12px]">
              <li><a href="/advisor" className="hover:text-white transition-colors">AI Business Advisor</a></li>
              <li><a href="/quote" className="hover:text-white transition-colors">Instant Quote Builder</a></li>
              <li><a href="/kyc" className="hover:text-white transition-colors">DPDP 2023 Smart KYC</a></li>
              <li><a href="/dashboard" className="hover:text-white transition-colors">Customer Self-Care</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold mb-3">Compliance & Security</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-[12px] text-emerald-400">
                <Shield className="w-4 h-4" />
                <span>DPDP Act 2023 Aligned</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Encrypted document transmission, purpose-bound GST/Udyam verification, and zero third-party data monetization.
              </p>
            </div>
          </div>

        </div>

        {/* Disclaimer Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>
            &copy; 2026 Accel Telecom / Accel Business. Prototype created for <strong>Airtel SYNC Hackathon 2026 (Enterprise Track A)</strong>.
          </p>
          <div className="px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700 text-slate-400 text-[10px]">
            Demonstration Prototype &bull; Not connected to live production Airtel network switches
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
