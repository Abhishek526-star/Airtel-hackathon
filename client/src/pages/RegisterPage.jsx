import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import Button from '../components/common/Button';
import { UserPlus, Building2, Briefcase, ShieldCheck, CheckCircle2 } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useTranslation();

  const [role, setRole] = useState('customer'); // 'customer' | 'partner'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    // Customer specific
    businessName: '',
    segment: 'Micro Retail and Services',
    cityTier: 'Tier 1',
    // Partner specific
    agencyName: '',
    territoryCircle: 'Delhi NCR',
    partnerCode: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorMsg('');

      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role,
        ...(role === 'customer'
          ? {
              businessName: formData.businessName.trim(),
              segment: formData.segment,
              cityTier: formData.cityTier,
            }
          : {
              agencyName: formData.agencyName.trim() || `${formData.fullName.trim()} Telecom Solutions`,
              territoryCircle: formData.territoryCircle,
              partnerCode: formData.partnerCode.trim(),
            }),
      };

      const registeredUser = await register(payload);

      if (registeredUser?.role === 'partner') {
        navigate('/partner');
      } else {
        navigate('/advisor');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check your information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-airtel-700 to-airtel-500 text-white font-extrabold flex items-center justify-center mx-auto text-xl shadow-md shadow-red-500/20">
          A
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {role === 'customer'
            ? t('auth.registerTitle', 'Create Enterprise Business Profile')
            : t('auth.partnerRegisterTitle', 'Register as Airtel Sales Partner')}
        </h2>
        <p className="text-xs text-slate-500">
          {role === 'customer'
            ? t('auth.subTitleRegister', 'Project Udyam Digital • Start your one-sitting onboarding')
            : t('auth.subTitlePartner', 'Airtel Assisted Sales Network • Empower MSMEs in your circle')}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white py-7 px-6 sm:px-8 shadow-sm border border-slate-200 rounded-3xl space-y-5">
          
          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 text-center">
              {t('auth.selectAccountType', 'Select Account Type')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange('customer')}
                className={`relative flex items-center p-3.5 rounded-2xl border text-left transition-all ${
                  role === 'customer'
                    ? 'border-airtel-600 bg-red-50/50 shadow-sm ring-1 ring-airtel-600'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <div className={`p-2 rounded-xl mr-3 ${role === 'customer' ? 'bg-airtel-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-bold ${role === 'customer' ? 'text-airtel-900' : 'text-slate-800'}`}>
                    {t('auth.roleCustomer', 'MSME Customer')}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {t('auth.roleCustomerDesc', 'Retail, offices & businesses')}
                  </div>
                </div>
                {role === 'customer' && (
                  <CheckCircle2 className="w-4 h-4 text-airtel-600 absolute top-2 right-2" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('partner')}
                className={`relative flex items-center p-3.5 rounded-2xl border text-left transition-all ${
                  role === 'partner'
                    ? 'border-airtel-600 bg-red-50/50 shadow-sm ring-1 ring-airtel-600'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <div className={`p-2 rounded-xl mr-3 ${role === 'partner' ? 'bg-airtel-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-bold ${role === 'partner' ? 'text-airtel-900' : 'text-slate-800'}`}>
                    {t('auth.rolePartner', 'Sales Partner')}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {t('auth.rolePartnerDesc', 'Assisted selling & field KYC')}
                  </div>
                </div>
                {role === 'partner' && (
                  <CheckCircle2 className="w-4 h-4 text-airtel-600 absolute top-2 right-2" />
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Common: Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {role === 'customer'
                  ? t('auth.fullNameLabel', 'Full Legal Name')
                  : t('auth.partnerNameLabel', 'Partner / Agent Legal Name')}
              </label>
              <input
                type="text"
                name="fullName"
                required
                placeholder={role === 'customer' ? 'e.g. Rajesh Gupta' : 'e.g. Amit Verma'}
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            {/* Role-specific: Business Name or Agency Name */}
            {role === 'customer' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('auth.tradeNameLabel', 'Trade or Business Name')}
                </label>
                <input
                  type="text"
                  name="businessName"
                  required
                  placeholder="e.g. Gupta Supermart"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('auth.agencyNameLabel', 'Partner Agency / Franchise Name')}
                </label>
                <input
                  type="text"
                  name="agencyName"
                  required
                  placeholder="e.g. Apex Enterprise Telecommunications"
                  value={formData.agencyName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            )}

            {/* Common: Mobile & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('auth.phoneLabel', 'Mobile Phone')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="10-digit number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('auth.emailLabel', 'Email Address')}
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder={role === 'customer' ? 'contact@biz.in' : 'agent@agency.in'}
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>

            {/* Customer: Segment & City Tier */}
            {role === 'customer' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('auth.segmentLabel', 'Business Segment')}
                  </label>
                  <select
                    name="segment"
                    value={formData.segment}
                    onChange={handleChange}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 outline-none"
                  >
                    <option value="Micro Retail and Services">Micro Retail / Kirana</option>
                    <option value="Professional Offices">Professional Office</option>
                    <option value="Small Multi-site Businesses">Multi-site Business</option>
                    <option value="Small Manufacturers">Small Manufacturer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('auth.tierLabel', 'City Location Tier')}
                  </label>
                  <select
                    name="cityTier"
                    value={formData.cityTier}
                    onChange={handleChange}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 outline-none"
                  >
                    <option value="Tier 1">Tier 1 (Metro)</option>
                    <option value="Tier 2">Tier 2</option>
                    <option value="Tier 3">Tier 3</option>
                  </select>
                </div>
              </div>
            )}

            {/* Partner: Operational Circle & Partner Code */}
            {role === 'partner' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('auth.circleLabel', 'Operational Telecom Circle')}
                  </label>
                  <select
                    name="territoryCircle"
                    value={formData.territoryCircle}
                    onChange={handleChange}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 outline-none"
                  >
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Mumbai Metro">Mumbai Metro</option>
                    <option value="Bengaluru Urban">Bengaluru Urban</option>
                    <option value="Pune Hub">Pune Hub</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Kolkata">Kolkata</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('auth.partnerCodeLabel', 'Channel Partner ID')}
                    <span className="text-[10px] text-slate-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="partnerCode"
                    placeholder="Auto-generated if blank"
                    value={formData.partnerCode}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Common: Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('auth.passwordLabel', 'Password')}
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              icon={UserPlus}
              className="w-full text-xs mt-3 shadow-md shadow-red-500/20"
            >
              {role === 'customer'
                ? t('auth.createAccountBtn', 'Create Account & Start Advisor')
                : t('auth.createPartnerBtn', 'Register Partner & Open Dashboard')}
            </Button>
          </form>

          {role === 'partner' && (
            <div className="flex items-start space-x-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>
                {t('auth.partnerDisclaimer', 'Channel Partner credentials provide immediate access to unclosed leads, KYC assisted overrides, and direct Airtel field dispatch in your circle.')}
              </span>
            </div>
          )}

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            {t('auth.alreadyRegistered', 'Already registered?')}{' '}
            <Link to="/login" className="font-bold text-airtel-700 hover:underline">
              {t('common.signIn', 'Sign In')}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
