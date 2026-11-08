import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { useSocket } from '../../context/SocketContext';
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
  ShoppingBag, 
  User,
  ChevronRight,
  ArrowRight,
  HardHat
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isConnected } = useSocket();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Core subscriber journey navigation
  const navLinks = [
    { label: t('navbar.advisor', 'AI Advisor'), path: '/advisor', icon: Sparkles },
    { label: t('navbar.quote', 'Quote Builder'), path: '/quote', icon: FileText },
    { label: t('navbar.kyc', 'Smart KYC'), path: '/kyc', icon: ShieldCheck },
    { label: t('navbar.catalogue', 'Catalogue'), path: '/catalogue', icon: ShoppingBag },
  ];

  // Contextual authenticated workspace
  if (isAuthenticated) {
    if (user?.role === 'customer') {
      navLinks.push({ label: t('navbar.myBusiness', 'My Business'), path: '/dashboard', icon: LayoutDashboard });
    } else if (user?.role === 'partner') {
      navLinks.push({ label: t('navbar.partnerPortal', 'Partner Workspace'), path: '/partner', icon: Users });
    } else if (user?.role === 'technician') {
      navLinks.push({ label: t('navbar.fieldTasks', 'Field Tasks'), path: '/technician', icon: HardHat });
    } else if (user?.role === 'admin') {
      navLinks.push({ label: t('navbar.adminAnalytics', 'Executive Analytics'), path: '/admin', icon: BarChart3 });
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Identity */}
          <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-airtel-700 via-red-600 to-rose-600 flex items-center justify-center text-white shadow-md shadow-red-500/25 group-hover:scale-105 transition-transform">
              <span className="font-black text-lg tracking-wider">A</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-slate-900 tracking-tight text-base sm:text-lg">
                  Airtel <span className="text-airtel-600">Business</span>
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-red-50 text-airtel-700 border border-red-200/60 uppercase tracking-wider">
                  UDYAM
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                Enterprise Digital Solutions
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all ${
                    isActive
                      ? 'bg-red-50 text-airtel-700 font-extrabold border border-red-200/70 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-semibold'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-airtel-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Real-time synchronization indicator */}
            {isConnected && (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs" title="Connected to Real-Time Synchronizer">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Sync</span>
              </span>
            )}

            {/* Language Selector Dropdown */}
            <LanguageSelector />

            {/* Auth Actions */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 pl-3 border-l border-slate-200">
                {/* User Profile Pill Card */}
                <Link
                  to="/profile"
                  className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all group"
                  title="View & Edit Profile"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center font-black text-xs shadow-xs group-hover:scale-105 transition-transform">
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 leading-tight group-hover:text-airtel-700 transition-colors truncate max-w-[120px]">
                      {user?.fullName || 'User'}
                    </span>
                    <span className="text-[10px] font-semibold flex items-center space-x-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        user?.role === 'customer'
                          ? 'bg-emerald-500'
                          : user?.role === 'partner'
                          ? 'bg-red-500'
                          : user?.role === 'technician'
                          ? 'bg-amber-500'
                          : 'bg-indigo-500'
                      }`} />
                      <span className={
                        user?.role === 'customer'
                          ? 'text-emerald-700 font-bold'
                          : user?.role === 'partner'
                          ? 'text-red-700 font-bold'
                          : user?.role === 'technician'
                          ? 'text-amber-700 font-bold'
                          : 'text-indigo-700 font-bold'
                      }>
                        {user?.role === 'customer'
                          ? 'MSME Client'
                          : user?.role === 'partner'
                          ? 'Sales Partner'
                          : user?.role === 'technician'
                          ? 'Field Engineer'
                          : 'Admin'}
                      </span>
                    </span>
                  </div>
                </Link>

                {/* Sign Out Button */}
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200/80 hover:border-red-200 transition-all shadow-xs"
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

          {/* Mobile Right Bar: Language + Menu Toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <LanguageSelector compact={true} />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-4 shadow-xl">
          
          {/* Section 1: Enterprise Journey */}
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
              Enterprise Solutions
            </div>
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-red-50 text-airtel-700 font-extrabold border border-red-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-airtel-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </Link>
              );
            })}
          </div>

          {/* Section 2: Account & Operations */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3">
              My Account
            </div>

            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center font-bold text-xs">
                      {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{user?.fullName}</div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                        {user?.role === 'customer'
                          ? 'MSME Customer'
                          : user?.role === 'partner'
                          ? 'Sales Partner'
                          : user?.role === 'technician'
                          ? 'Field Engineer'
                          : 'Executive Admin'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-airtel-700 flex items-center space-x-1">
                    <span>Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>

                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 rounded-xl bg-white border border-slate-200 text-red-600 font-bold text-xs hover:bg-red-50 transition-colors"
                >
                  {t('common.signOut', 'Sign Out')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
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
