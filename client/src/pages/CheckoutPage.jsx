import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import api from '../services/api';
import Stepper from '../components/common/Stepper';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { 
  ShoppingCart, 
  MapPin, 
  Calendar, 
  User, 
  CheckCircle2, 
  HardHat
} from 'lucide-react';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeQuote, setActiveOrder, setCurrentStep } = useOnboarding();
  const { t } = useTranslation();

  const [address, setAddress] = useState(user?.businessProfile?.address?.street || 'Shop 14, Main Market, Sector 18');
  const [city, setCity] = useState(user?.businessProfile?.address?.city || 'Noida');
  const [pincode, setPincode] = useState(user?.businessProfile?.address?.pincode || '201301');
  const [contactName, setContactName] = useState(user?.fullName || 'Rajesh Gupta');
  const [contactPhone, setContactPhone] = useState(user?.phone || '9810123456');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 01:00 PM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePlaceOrder = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const res = await api.post('/orders', {
        quoteId: activeQuote?.quoteId || 'ACCEL-Q-DEFAULT',
        installationAddress: address,
        city,
        pincode,
        contactPerson: contactName,
        contactPhone,
        timeSlot,
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      if (res.success && res.data) {
        setActiveOrder(res.data);
        setCurrentStep(5);
        navigate(`/orders/${res.data.orderId}`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Stepper currentStep={4} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        
        {/* Page Title */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-airtel-700 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{t('checkout.title', 'Service Checkout & Installation Scheduling')}</h1>
              <p className="text-xs text-slate-500">{t('checkout.subtitle', 'Confirm site location, field technician appointment, and complete business order')}</p>
            </div>
          </div>
          <Badge variant="brand">{t('checkout.simBadge', 'Enterprise Order Checkout')}</Badge>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Form Details (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Installation Address Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-airtel-600" />
                <span>{t('checkout.siteAddressTitle', 'Installation Site Address')}</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('checkout.streetLabel', 'Building / Shop / Street Address')}</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">{t('checkout.cityLabel', 'City / Region')}</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">{t('checkout.pincodeLabel', 'PIN Code')}</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Installation Slot & Field Engineer */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-airtel-600" />
                <span>{t('checkout.prefWindow', 'Preferred Installation Window')}</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { slot: '10:00 AM - 01:00 PM', label: t('checkout.slotMorning', 'Morning Slot (10:00 AM - 01:00 PM)') },
                  { slot: '02:00 PM - 05:00 PM', label: t('checkout.slotAfternoon', 'Afternoon Slot (02:00 PM - 05:00 PM)') },
                ].map((s) => (
                  <button
                    key={s.slot}
                    type="button"
                    onClick={() => setTimeSlot(s.slot)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      timeSlot === s.slot
                        ? 'border-airtel-600 bg-red-50 text-airtel-700 ring-2 ring-red-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{s.label}</div>
                  </button>
                ))}
              </div>

              {/* Assigned Engineer Preview */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                    <HardHat className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{t('checkout.fieldTechName', 'Ramesh Kumar (Enterprise Field Tech)')}</div>
                    <div className="text-[11px] text-slate-500">{t('checkout.fieldTechDesc', 'Badge: ENG-DELHI-408 • Fiber & CPE Specialist')}</div>
                  </div>
                </div>
                <Badge variant="success">{t('checkout.autoAssigned', 'Auto-Assigned')}</Badge>
              </div>
            </div>

            {/* Technical Contact Person */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <User className="w-4 h-4 text-airtel-600" />
                <span>{t('checkout.contactTitle', 'On-Site Technical Contact')}</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('checkout.contactNameLabel', 'Contact Person Name')}</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('checkout.contactPhoneLabel', 'Mobile Phone')}</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary (1 Col) */}
          <div className="space-y-4">
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 sticky top-24">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
                {t('checkout.orderSummary', 'Order Summary')}
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>{t('checkout.selectedBundle', 'Selected Bundle:')}</span>
                  <span className="font-semibold text-slate-800">
                    {activeQuote?.bundleName || 'Customized MSME Bundle'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t('checkout.contractLockin', 'Contract Lock-in:')}</span>
                  <span className="font-semibold text-slate-800">
                    {activeQuote?.contractDurationMonths || 12} Months
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t('checkout.recurringBill', 'Recurring Monthly Bill:')}</span>
                  <span className="font-bold text-airtel-700">
                    ₹{(activeQuote?.totalMonthlyAmount || 2351).toLocaleString('en-IN')}/mo
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-slate-900 text-sm">
                  <span>{t('checkout.dueToday', 'Total Due Today (Zero Deposit Setup):')}</span>
                  <span>₹{(activeQuote?.totalOneTimePayable || 2941).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Corporate Billing Notice */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                <strong>{t('checkout.simNoticeTitle', 'Enterprise B2B Billing Notice:')}</strong> {t('checkout.simNoticeDesc', 'Zero upfront deposit required on standard 12/24-month corporate contracts. Recurring charges are billed directly to your consolidated monthly telecom invoice upon service activation.')}
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  onClick={handlePlaceOrder}
                  icon={CheckCircle2}
                  className="w-full text-sm"
                >
                  {t('checkout.confirmOrderBtn', 'Confirm Order & Schedule')}
                </Button>
              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
};

export default CheckoutPage;
