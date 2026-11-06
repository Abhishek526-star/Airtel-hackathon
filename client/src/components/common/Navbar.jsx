import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import { 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  LogOut, 
  LogIn, 
  Menu, 
  X,
  ChevronDown,
  ShoppingBag
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, switchDemoPersona } = useAuth();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSwitchPersona = async (role) => {
    try {
      await switchDemoPersona(role);
      setPersonaDropdownOpen(false);
      if (role === 'admin') navigate('/admin');
      else if (role === 'partner') navigate('/partner');
      else navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { label: t('navbar.advisor', 'AI Advisor'), path: '/advisor', icon: Sparkles },
    { label: t('navbar.quote', 'Quote Builder'), path: '/quote', icon: FileText },
    { label: t('navbar.kyc', 'Smart KYC'), path: '/kyc', icon: ShieldCheck },
    { label: t('navbar.catalogue', 'Catalogue'), path: '/catalogue', icon: ShoppingBag },
  ];

  if (isAuthenticated) {
    if (user?.role === 'customer') {
      navLinks.push({ label: t('navbar.myBusiness', 'My Business'), path: '/dashboard', icon: LayoutDashboard });
    } else if (user?.role === 'partner') {
      navLinks.push({ label: t('navbar.partnerPortal', 'Partner Portal'), path: '/partner', icon: Users });
    } else if (user?.role === 'admin') {
      navLinks.push({ label: t('navbar.adminAnalytics', 'Executive Analytics'), path: '/admin', icon: BarChart3 });
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-airtel-700 to-airtel-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-lg tracking-wider">A</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">Project Udyam</span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-airtel-700">DIGITAL</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">{t('common.brandTagline', 'Accel Business | Airtel SYNC 2026')}</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-red-50 text-airtel-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-airtel-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Language Selector Dropdown */}
            <LanguageSelector />

            {/* Quick Enterprise Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
                title="Switch active enterprise profile"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{t('common.demoRole', 'Profile')}: <strong className="capitalize">{user ? user.role : t('common.guest', 'Guest')}</strong></span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {personaDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {t('navbar.quickSwitchPersona', 'Quick Switch Persona')}
                  </div>
                  <button
                    onClick={() => handleSwitchPersona('customer')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 hover:text-airtel-700 flex flex-col"
                  >
                    <span className="font-bold text-slate-800">{t('navbar.kiranaOwner', 'Rajesh Gupta (Micro Retail)')}</span>
                    <span className="text-[11px] text-slate-500">{t('navbar.kiranaOwnerDesc', 'Owner, Gupta Supermart (Kirana)')}</span>
                  </button>
                  <button
                    onClick={() => handleSwitchPersona('partner')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 hover:text-airtel-700 flex flex-col"
                  >
                    <span className="font-bold text-slate-800">{t('navbar.salesPartner', 'Amit Verma (Channel Partner)')}</span>
                    <span className="text-[11px] text-slate-500">{t('navbar.salesPartnerDesc', 'Airtel Assisted Sales & KYC')}</span>
                  </button>
                  <button
                    onClick={() => handleSwitchPersona('admin')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 hover:text-airtel-700 flex flex-col"
                  >
                    <span className="font-bold text-slate-800">{t('navbar.executiveAdmin', 'Priya Nair (Executive Admin)')}</span>
                    <span className="text-[11px] text-slate-500">{t('navbar.executiveAdminDesc', 'SME Growth Head & Analytics')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Auth Button */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-slate-700 truncate max-w-[120px]">
                  {user?.fullName?.split(' ')[0]}
                </span>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title={t('common.signOut', 'Sign Out')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 px-4 py-2 rounded-lg text-xs font-semibold bg-airtel-600 text-white hover:bg-airtel-700 shadow-sm transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('common.signIn', 'Sign In')}</span>
              </Link>
            )}
          </div>

          {/* Mobile Right Bar: Language + Menu */}
          <div className="flex md:hidden items-center space-x-2">
            <LanguageSelector compact={true} />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-airtel-700"
                >
                  <Icon className="w-5 h-5 text-slate-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t('navbar.quickSwitchPersona', 'Select Demo Persona')}
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <button
                onClick={() => { handleSwitchPersona('customer'); setMobileMenuOpen(false); }}
                className="p-2 rounded bg-slate-100 text-[11px] font-semibold text-slate-700 hover:bg-red-100"
              >
                Kirana Owner
              </button>
              <button
                onClick={() => { handleSwitchPersona('partner'); setMobileMenuOpen(false); }}
                className="p-2 rounded bg-slate-100 text-[11px] font-semibold text-slate-700 hover:bg-red-100"
              >
                Partner
              </button>
              <button
                onClick={() => { handleSwitchPersona('admin'); setMobileMenuOpen(false); }}
                className="p-2 rounded bg-slate-100 text-[11px] font-semibold text-slate-700 hover:bg-red-100"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
