import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import api from '../services/api';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import {
  User,
  Building2,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Briefcase,
  Users,
  Edit3,
  X,
  Radio,
  FileCheck2,
  ExternalLink,
  Lock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Power
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfileLocally } = useAuth();
  const { t } = useTranslation();

  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});

  // Partner Availability Toggle Loading State
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const res = await api.get('/profile');
      if (res.success && res.data) {
        setProfileData(res.data);
        initFormData(res.data);
      }
    } catch (err) {
      console.error('[ProfilePage] Fetch error:', err);
      setErrorMsg(err.message || 'Failed to load profile details.');
    } finally {
      setIsLoading(false);
    }
  };

  const initFormData = (data) => {
    const bp = data?.businessProfile || data;
    const u = data?.user || user;
    setFormData({
      fullName: u?.fullName || '',
      phone: u?.phone || '',
      agencyName: u?.agencyName || bp?.tradeName || '',
      territoryCircle: u?.territoryCircle || bp?.address?.city || 'Delhi NCR',
      tradeName: bp?.tradeName || '',
      legalName: bp?.legalName || '',
      segment: bp?.segment || 'Micro Retail and Services',
      industry: bp?.industry || 'General Retail / Trading',
      employees: bp?.employees || 2,
      locations: bp?.locations || 1,
      street: bp?.address?.street || '',
      city: bp?.address?.city || 'Delhi NCR',
      state: bp?.address?.state || 'Delhi',
      pincode: bp?.address?.pincode || '110001',
      cityTier: bp?.address?.cityTier || 'Tier 1',
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        agencyName: formData.agencyName,
        territoryCircle: formData.territoryCircle,
        tradeName: formData.tradeName,
        legalName: formData.legalName,
        segment: formData.segment,
        industry: formData.industry,
        employees: Number(formData.employees),
        locations: Number(formData.locations),
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          cityTier: formData.cityTier,
        },
      };

      const res = await api.put('/profile', payload);
      if (res.success && res.data) {
        setProfileData(res.data);
        if (updateProfileLocally) {
          updateProfileLocally(res.data.businessProfile || res.data);
        }
        setSuccessMsg('Profile information updated successfully.');
        setIsEditModalOpen(false);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePartnerAvailability = async () => {
    if (user?.role !== 'partner' && profileData?.user?.role !== 'partner') return;
    try {
      setIsTogglingStatus(true);
      const currentAvailable = profileData?.user?.isAvailable ?? true;
      const nextAvailable = !currentAvailable;
      const nextStatus = nextAvailable ? 'AVAILABLE' : 'BUSY';

      // Call partner availability patch endpoint
      const res = await api.patch('/partner/availability', {
        isAvailable: nextAvailable,
        availabilityStatus: nextStatus,
      });

      if (res.success) {
        setProfileData((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            isAvailable: nextAvailable,
            availabilityStatus: nextStatus,
          },
        }));
        setSuccessMsg(`Operational status set to ${nextAvailable ? 'Available (Online)' : 'Busy (Offline)'}.`);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not update availability.');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const currentUser = profileData?.user || user;
  const business = profileData?.businessProfile || profileData || {};
  const kyc = profileData?.kyc || {
    status: business?.kycStatus || (business?.hasGstin || business?.hasUdyam ? 'VERIFIED' : 'NOT_STARTED'),
    isCompleted: Boolean(business?.kycStatus === 'VERIFIED' || business?.hasGstin || business?.hasUdyam),
    verifiedIdentifier: business?.kycVerifiedIdentifier || business?.gstin || business?.udyamNumber || '',
    documentType: business?.kycDocumentType || (business?.hasGstin ? 'GST_CERTIFICATE' : 'UDYAM_CERTIFICATE'),
  };

  const isCustomer = currentUser?.role === 'customer';
  const isPartner = currentUser?.role === 'partner';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Global Notifications */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
          </div>
        )}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </span>
            <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-airtel-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading profile credentials...</p>
          </div>
        ) : (
          <>
            {/* ========================================================= */}
            {/* HERO BANNER CARD                                         */}
            {/* ========================================================= */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 sm:px-8 py-8 text-white">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-extrabold text-2xl text-white shadow-inner">
                      {isPartner ? (
                        <Briefcase className="w-8 h-8 text-red-400" />
                      ) : isAdmin ? (
                        <Radio className="w-8 h-8 text-sky-400" />
                      ) : (
                        <Building2 className="w-8 h-8 text-emerald-400" />
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/15 text-slate-200 border border-white/10">
                          {isPartner ? 'Airtel Channel Partner' : isAdmin ? 'Airtel Executive Admin' : 'MSME Enterprise Customer'}
                        </span>
                        {kyc.isCompleted && isCustomer && (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center space-x-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>KYC Completed & Verified</span>
                          </span>
                        )}
                        {isPartner && (
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-400/30">
                            Partner Code: {currentUser?.partnerCode || 'CP-DEL-101'}
                          </span>
                        )}
                      </div>

                      <h1 className="text-2xl font-black tracking-tight text-white">
                        {isPartner
                          ? currentUser?.agencyName || `${currentUser?.fullName} Solutions`
                          : business?.tradeName || currentUser?.fullName || 'Business Profile'}
                      </h1>
                      
                      <p className="text-xs text-slate-300 flex flex-wrap items-center gap-3">
                        <span>Legal Entity: <strong>{isPartner ? currentUser?.fullName : (business?.legalName || currentUser?.fullName)}</strong></span>
                        <span>&bull;</span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{currentUser?.territoryCircle || business?.address?.city || 'Delhi NCR'}</span>
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Top CTA Actions */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                    {isPartner && (
                      <Button
                        variant={currentUser?.isAvailable ? 'primary' : 'secondary'}
                        size="sm"
                        isLoading={isTogglingStatus}
                        onClick={handleTogglePartnerAvailability}
                        icon={Power}
                        className={`text-xs ${currentUser?.isAvailable ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
                      >
                        {currentUser?.isAvailable ? '🟢 Online (Available)' : '🟡 Busy in Field'}
                      </Button>
                    )}

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsEditModalOpen(true)}
                      icon={Edit3}
                      className="text-xs bg-white/10 hover:bg-white/20 text-white border-white/20"
                    >
                      {isPartner ? 'Edit Partner Details' : 'Edit Business Profile'}
                    </Button>
                  </div>

                </div>
              </div>

              {/* Sub-header Navigation / Quick Stats Bar */}
              <div className="bg-slate-100/70 border-t border-slate-200 px-6 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center space-x-6 text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{currentUser?.email}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{currentUser?.phone}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {isCustomer ? (
                    <Link to="/dashboard" className="text-airtel-700 font-bold hover:underline flex items-center space-x-1">
                      <span>View Orders & Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : isPartner ? (
                    <Link to="/partner" className="text-airtel-700 font-bold hover:underline flex items-center space-x-1">
                      <span>Assisted Onboarding Portal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link to="/admin" className="text-airtel-700 font-bold hover:underline flex items-center space-x-1">
                      <span>Executive Admin Portal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* VIEW 1: MSME ENTERPRISE CUSTOMER PROFILE                  */}
            {/* ========================================================= */}
            {isCustomer && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: KYC Verification & Business Details */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Smart KYC Verification Status Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                          Smart KYC & Regulatory Verification
                        </h3>
                      </div>
                      <Badge variant={kyc.isCompleted ? 'success' : 'warning'}>
                        {kyc.isCompleted ? 'Completed & Verified' : 'Action Required'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* GSTIN Details */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                          <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Goods & Services Tax (GSTIN)</span>
                        </div>
                        <div className="font-mono font-bold text-sm text-slate-900">
                          {business?.gstin || (business?.hasGstin ? 'Verified' : 'Unregistered MSME')}
                        </div>
                        <p className="text-[11px] text-emerald-700 font-semibold">
                          {business?.hasGstin || business?.gstin ? '🟢 Active Taxpayer (GSTN Registry Verified)' : 'Unregistered Small Enterprise'}
                        </p>
                      </div>

                      {/* Udyam MSME Registration */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Udyam MSME Registry</span>
                        </div>
                        <div className="font-mono font-bold text-sm text-slate-900">
                          {business?.udyamNumber || (business?.hasUdyam ? 'Verified' : 'N/A')}
                        </div>
                        <p className="text-[11px] text-emerald-700 font-semibold">
                          {business?.hasUdyam || business?.udyamNumber ? '🟢 Ministry of MSME Verified' : 'Optional for micro entities'}
                        </p>
                      </div>
                    </div>

                    {/* DPDP Act 2023 Compliance Box */}
                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 flex items-start space-x-3 text-xs text-slate-600">
                      <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900">DPDP Act 2023 Digital Subscriber Consent Active</div>
                        <p className="text-[11px] text-slate-500">
                          Verified against statutory registry on file. Your business identity is certified for automated zero-touch telecom provisioning.
                        </p>
                      </div>
                    </div>

                    <div className="pt-1 flex justify-end">
                      <Link to="/kyc">
                        <Button variant="ghost" size="sm" icon={ExternalLink} className="text-xs text-airtel-700">
                          View KYC Verification Screen
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Business Operational Details */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-5 h-5 text-airtel-600" />
                        <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                          Business & Operational Details
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-500 font-medium">Customer Segment</span>
                        <div className="font-bold text-slate-900">{business?.segment || 'Micro Retail and Services'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 font-medium">Industry Sector</span>
                        <div className="font-bold text-slate-900">{business?.industry || 'General Retail / Trading'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 font-medium">Number of Employees</span>
                        <div className="font-bold text-slate-900">{business?.employees || 2} Active Staff</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 font-medium">Active Operating Locations</span>
                        <div className="font-bold text-slate-900">{business?.locations || 1} Branch / Office</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 font-medium">Current Internet Service Provider</span>
                        <div className="font-bold text-slate-900">{business?.currentIsp || 'Local Broadband / Hotspot'}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 font-medium">Monthly Telecom Budget</span>
                        <div className="font-bold text-slate-900">₹{business?.monthlyBudget?.toLocaleString('en-IN') || '2,000'} / month</div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right 1 Col: Registered Address & Authorized Contact */}
                <div className="space-y-6">
                  
                  {/* Installation / Billing Address Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
                    <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                      <MapPin className="w-4 h-4 text-airtel-600" />
                      <h3 className="font-bold text-sm text-slate-900">Registered Address</h3>
                    </div>
                    
                    <div className="text-xs text-slate-700 space-y-1">
                      <div className="font-semibold text-slate-900">{business?.tradeName || 'Enterprise Business'}</div>
                      <div>{business?.address?.street || 'Shop 14, Main Market, Sector 18'}</div>
                      <div>{business?.address?.city || 'Delhi NCR'}, {business?.address?.state || 'Delhi'}</div>
                      <div className="font-mono text-slate-600">PIN: {business?.address?.pincode || '110001'}</div>
                      <div className="pt-2">
                        <Badge variant="brand">{business?.address?.cityTier || 'Tier 1'}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Authorized Signatory Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
                    <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                      <User className="w-4 h-4 text-airtel-600" />
                      <h3 className="font-bold text-sm text-slate-900">Authorized Signatory</h3>
                    </div>
                    
                    <div className="text-xs space-y-2">
                      <div>
                        <span className="text-slate-500">Signatory Full Name</span>
                        <div className="font-bold text-slate-900">{currentUser?.fullName}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Registered Mobile</span>
                        <div className="font-mono font-semibold text-slate-800">{currentUser?.phone}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Corporate Email</span>
                        <div className="font-mono text-slate-800 break-all">{currentUser?.email}</div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Link to Orders */}
                  <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs space-y-2">
                    <div className="font-bold text-slate-900">Telecom Subscriptions</div>
                    <p className="text-slate-600 text-[11px]">
                      View all active Airtel Business broadband lines, IoT SIMs, and GST invoices.
                    </p>
                    <Link to="/dashboard">
                      <Button variant="secondary" size="sm" className="w-full text-xs mt-1">
                        Go to Orders & Invoices
                      </Button>
                    </Link>
                  </div>

                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW 2: CHANNEL SALES PARTNER PROFILE                     */}
            {/* ========================================================= */}
            {isPartner && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Accreditation, Operational Circle, Workload */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Agency & Accreditation Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-5 h-5 text-airtel-600" />
                        <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                          Agency Accreditation & Identification
                        </h3>
                      </div>
                      <Badge variant="brand">Airtel Authorized Partner</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Partner Code
                        </div>
                        <div className="font-mono font-black text-sm text-red-700">
                          {currentUser?.partnerCode || 'CP-DEL-101'}
                        </div>
                        <div className="text-[11px] text-slate-400">Unique System ID</div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Assigned Circle
                        </div>
                        <div className="font-bold text-sm text-slate-900">
                          {currentUser?.territoryCircle || 'Delhi NCR'}
                        </div>
                        <div className="text-[11px] text-slate-400">Operational Territory</div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Live Availability
                        </div>
                        <div className={`font-bold text-sm ${currentUser?.isAvailable ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {currentUser?.isAvailable ? 'Available (Online)' : 'Busy (Offline)'}
                        </div>
                        <div className="text-[11px] text-slate-400">Dynamic Dispatch Match</div>
                      </div>

                    </div>

                    {/* Operational Overview Notice */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                      <div className="font-bold text-slate-900">Dynamic Assisted Lead Dispatch</div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        When set to <strong>Available</strong>, customer requests for in-person KYC assistance or customized enterprise plan consultations within the <strong>{currentUser?.territoryCircle || 'Delhi NCR'}</strong> circle are automatically routed to your inbox based on active workload.
                      </p>
                    </div>
                  </div>

                  {/* Active Leads & Workload Metrics Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                          Active Workload & Field Performance
                        </h3>
                      </div>
                      <Link to="/partner">
                        <Button variant="ghost" size="sm" icon={ExternalLink} className="text-xs text-airtel-700">
                          Open Assisted Workspace
                        </Button>
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Active Assigned Customer Leads
                        </div>
                        <div className="text-3xl font-black text-slate-900">
                          {currentUser?.activeAssignedLeadsCount || 0}
                        </div>
                        <div className="text-[11px] text-slate-500">Currently in progress</div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Assisted KYC Verification Status
                        </div>
                        <div className="text-3xl font-black text-emerald-600">
                          Active
                        </div>
                        <div className="text-[11px] text-slate-500">Authorized for in-person override</div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right 1 Col: Agency Contact & Actions */}
                <div className="space-y-6">
                  
                  {/* Agency Details Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
                    <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                      <Building2 className="w-4 h-4 text-airtel-600" />
                      <h3 className="font-bold text-sm text-slate-900">Franchise & Agency</h3>
                    </div>
                    
                    <div className="text-xs space-y-2.5">
                      <div>
                        <span className="text-slate-500">Agency Name</span>
                        <div className="font-bold text-slate-900">{currentUser?.agencyName || 'Delhi Tech Distributors Ltd'}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Authorized Field Agent</span>
                        <div className="font-bold text-slate-900">{currentUser?.fullName}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Contact Number</span>
                        <div className="font-mono font-semibold text-slate-800">{currentUser?.phone}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Corporate Email</span>
                        <div className="font-mono text-slate-800 break-all">{currentUser?.email}</div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action: Open Inbox */}
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs space-y-2">
                    <div className="font-bold text-red-900">Channel Partner Assisted Portal</div>
                    <p className="text-red-700 text-[11px]">
                      Access your assigned customer leads, live assistance inbox, and offline KYC tools.
                    </p>
                    <Link to="/partner">
                      <Button variant="primary" size="sm" className="w-full text-xs mt-1">
                        Open Partner Inbox
                      </Button>
                    </Link>
                  </div>

                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW 3: EXECUTIVE ADMINISTRATOR PROFILE                   */}
            {/* ========================================================= */}
            {isAdmin && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">Airtel Business Executive Administrator</h3>
                    <p className="text-xs text-slate-500">Master Operations Control & Nationwide Lead Distribution</p>
                  </div>
                  <Badge variant="brand">Level 3 Clearance</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 font-medium">Administrator Name</span>
                    <div className="font-bold text-slate-900 mt-1">{currentUser?.fullName}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 font-medium">Corporate Email</span>
                    <div className="font-mono text-slate-900 mt-1">{currentUser?.email}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 font-medium">Operational Scope</span>
                    <div className="font-bold text-emerald-700 mt-1">Pan-India All Telecom Circles</div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link to="/admin">
                    <Button variant="primary" size="md" icon={ArrowRight}>
                      Open Executive Analytics & Circle Heatmap
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* ========================================================= */}
      {/* EDIT PROFILE MODAL                                        */}
      {/* ========================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-airtel-600" />
                <h3 className="font-bold text-base text-slate-900">
                  {isPartner ? 'Edit Channel Partner Details' : 'Edit Business Profile Details'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              
              {/* Agent / User Full Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isPartner ? 'Field Agent Full Name' : 'Authorized Signatory Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName || ''}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Registered Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono"
                />
              </div>

              {/* Partner-specific: Agency Name & Operational Circle */}
              {isPartner ? (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Agency / Franchise Name</label>
                    <input
                      type="text"
                      required
                      value={formData.agencyName || ''}
                      onChange={(e) => handleInputChange('agencyName', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Assigned Operational Circle</label>
                    <select
                      value={formData.territoryCircle || 'Delhi NCR'}
                      onChange={(e) => handleInputChange('territoryCircle', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium"
                    >
                      <option value="Delhi NCR">Delhi NCR</option>
                      <option value="Mumbai Metro">Mumbai Metro</option>
                      <option value="Bangalore Urban">Bangalore Urban</option>
                      <option value="Chennai Hub">Chennai Hub</option>
                      <option value="Kolkata City">Kolkata City</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Pune Region">Pune Region</option>
                      <option value="Ahmedabad Zone">Ahmedabad Zone</option>
                    </select>
                  </div>
                </>
              ) : (
                /* Customer-specific: Trade name, Segment, Address */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Business Trade Name</label>
                      <input
                        type="text"
                        required
                        value={formData.tradeName || ''}
                        onChange={(e) => handleInputChange('tradeName', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Legal Registered Entity</label>
                      <input
                        type="text"
                        value={formData.legalName || ''}
                        onChange={(e) => handleInputChange('legalName', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Employees Count</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.employees || 2}
                        onChange={(e) => handleInputChange('employees', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Operating Locations</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.locations || 1}
                        onChange={(e) => handleInputChange('locations', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={formData.street || ''}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        value={formData.city || ''}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">State</label>
                      <input
                        type="text"
                        value={formData.state || ''}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">PIN Code</label>
                      <input
                        type="text"
                        value={formData.pincode || ''}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSaving}
                >
                  Save Changes
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;

