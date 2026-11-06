import React from 'react';
import { Shield } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-airtel-600 flex items-center justify-center text-white font-bold text-xs">
                A
              </div>
              <span className="text-white font-bold text-sm tracking-tight">{t('common.appName', 'Project Udyam Digital')}</span>
            </div>
            <p className="text-slate-400 text-[12px] leading-relaxed">
              {t('footer.desc', 'Making Indian Small Businesses Go Digital in One Sitting. Instant tailored telecom bundles, transparent pricing, and smart KYC verification.')}
            </p>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold mb-3">{t('footer.msmeSolutions', 'MSME Solutions')}</h4>
            <ul className="space-y-2 text-[12px]">
              <li><a href="/catalogue" className="hover:text-white transition-colors">{t('footer.fiberBroadband', 'Business Fiber Broadband')}</a></li>
              <li><a href="/catalogue" className="hover:text-white transition-colors">{t('footer.voicePbx', 'Corporate Voice & Virtual PBX')}</a></li>
              <li><a href="/catalogue" className="hover:text-white transition-colors">{t('footer.whatsappApi', 'WhatsApp Business API')}</a></li>
              <li><a href="/catalogue" className="hover:text-white transition-colors">{t('footer.posIot', 'POS & IoT Connectivity')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold mb-3">{t('footer.digitalOnboarding', 'Digital Onboarding')}</h4>
            <ul className="space-y-2 text-[12px]">
              <li><a href="/advisor" className="hover:text-white transition-colors">{t('navbar.advisor', 'AI Business Advisor')}</a></li>
              <li><a href="/quote" className="hover:text-white transition-colors">{t('navbar.quote', 'Instant Quote Builder')}</a></li>
              <li><a href="/kyc" className="hover:text-white transition-colors">{t('navbar.kyc', 'DPDP 2023 Smart KYC')}</a></li>
              <li><a href="/dashboard" className="hover:text-white transition-colors">{t('navbar.myBusiness', 'Customer Self-Care')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold mb-3">{t('footer.complianceSecurity', 'Compliance & Security')}</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-[12px] text-emerald-400">
                <Shield className="w-4 h-4" />
                <span>{t('footer.dpdpAligned', 'DPDP Act 2023 Aligned')}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                {t('footer.privacyNote', 'Encrypted document transmission, purpose-bound GST/Udyam verification, and zero third-party data monetization.')}
              </p>
            </div>
          </div>

        </div>

        {/* Regulatory & Enterprise Copyright Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>
            &copy; 2026 Airtel Business / Accel Enterprise Solutions. Empowering India's Micro, Small & Medium Enterprises.
          </p>
          <div className="px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700 text-slate-400 text-[10px]">
            {t('footer.disclaimer', 'Airtel Business Enterprise Portal • Licensed Unified Telecom Operator under DoT & TRAI Regulations')}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
