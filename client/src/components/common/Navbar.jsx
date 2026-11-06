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
  ShoppingBag
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

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
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                {t('common.brandTagline', 'Airtel Business | Enterprise Digital Solutions')}
              </p>
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

            {/* Auth Actions */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {user?.fullName || 'User'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    {user?.role === 'customer'
                      ? 'MSME Customer'
                      : user?.role === 'partner'
                      ? 'Sales Partner'
                      : 'Executive Admin'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all"
                  title={t('common.signOut', 'Sign Out')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
                >
                  {t('common.signIn', 'Sign In')}
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-bold bg-airtel-600 text-white hover:bg-airtel-700 shadow-sm shadow-red-500/20 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
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
            {isAuthenticated ? (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-900">{user?.fullName}</div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    {user?.role === 'customer'
                      ? 'MSME Customer'
                      : user?.role === 'partner'
                      ? 'Sales Partner'
                      : 'Executive Admin'}
                  </div>
                </div>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-red-600 font-bold text-xs hover:bg-red-50"
                >
                  {t('common.signOut', 'Sign Out')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-center">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  {t('common.signIn', 'Sign In')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-airtel-600 text-white text-xs font-bold shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
