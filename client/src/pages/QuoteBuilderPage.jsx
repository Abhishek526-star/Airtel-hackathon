import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Stepper from '../components/common/Stepper';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { 
  FileText, 
  Plus, 
  Minus, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  ArrowRight,
  Info,
  CheckCircle2
} from 'lucide-react';

const QuoteBuilderPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const {
    cartItems,
    addItemToCart,
    removeItemFromCart,
    updateItemQuantity,
    contractDuration,
    setContractDuration,
    activeQuote,
    setActiveQuote,
    setCurrentStep,
  } = useOnboarding();

  const [pricing, setPricing] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Optional add-ons ready to add with 1 click
  const availableAddons = [
    { productId: 'PROD-IP-STAT', name: 'Static IP Address Add-on', price: 350, desc: 'Public IPv4 for remote CCTV monitoring and hosted servers' },
    { productId: 'PROD-SIM-VOICE1', name: 'Corporate Voice SIM (10GB)', price: 299, desc: 'Additional post-paid commercial SIM with unlimited CUG calls' },
    { productId: 'PROD-SEC-DNS', name: 'CyberShield DNS Protection', price: 199, desc: 'Router-level ransomware, malware, and phishing block' },
    { productId: 'PROD-CLD-BAK', name: 'Cloud Backup Vault (250GB)', price: 499, desc: 'Automated encrypted backup for Tally & accounting files' },
  ];

  // Recalculate price when cartItems or contractDuration changes
  useEffect(() => {
    if (cartItems.length > 0) {
      calculatePrice();
    }
  }, [cartItems, contractDuration]);

  const calculatePrice = async () => {
    try {
      setIsCalculating(true);
      setErrorMsg('');
      const res = await api.post('/quotes/calculate', {
        items: cartItems,
        contractDurationMonths: contractDuration,
      });

      if (res.success && res.data) {
        setPricing(res.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Pricing calculation failed.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleLockQuote = async () => {
    try {
      setIsLocking(true);
      setErrorMsg('');

      if (!isAuthenticated) {
        // If guest, auto-login with demo or redirect
        navigate('/login?redirect=/quote');
        return;
      }

      const res = await api.post('/quotes', {
        items: cartItems,
        contractDurationMonths: contractDuration,
        bundleName: 'Customized MSME Business Bundle',
      });

      if (res.success && res.data) {
        setActiveQuote(res.data);
        setCurrentStep(3);
        navigate('/kyc');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to lock quote.');
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Stepper currentStep={2} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        
        {/* Page Title */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-airtel-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Interactive Quote Builder</h1>
              <p className="text-xs text-slate-500">Customize services, select commitment term, and review 100% transparent pricing</p>
            </div>
          </div>
          <Badge variant="brand">Server-Authoritative Pricing</Badge>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Product Customizer & Add-ons (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Selected Products List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-800">
                  Configured Services ({cartItems.length})
                </h3>
                <span className="text-xs text-slate-400">Official Accel Business Catalogue</span>
              </div>

              {cartItems.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Your cart is empty. Please add at least one business service below.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {cartItems.map((item) => {
                    const priceItem = pricing?.items?.find((p) => p.productId === item.productId);
                    return (
                      <div key={item.productId} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="font-bold text-xs sm:text-sm text-slate-900">
                            {priceItem?.productName || item.productId}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {priceItem?.category} &bull; ₹{priceItem?.unitMonthlyPrice || 0}/mo each
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                            className="p-1 rounded-md border border-slate-300 hover:bg-slate-100 text-slate-600"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold text-xs w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                            className="p-1 rounded-md border border-slate-300 hover:bg-slate-100 text-slate-600"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeItemFromCart(item.productId)}
                            className="p-1 rounded-md text-slate-400 hover:text-red-600 ml-2"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Contract Duration Selector */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-800">Contract Lock-in Period</h3>
                <span className="text-xs text-slate-400">Term Commitment Discount</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { months: 12, discount: '0%', label: 'Standard (12 Mo)' },
                  { months: 24, discount: '5% OFF MRC', label: 'Recommended (24 Mo)' },
                  { months: 36, discount: '10% OFF MRC', label: 'Maximum Saver (36 Mo)' },
                ].map((term) => (
                  <button
                    key={term.months}
                    onClick={() => setContractDuration(term.months)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      contractDuration === term.months
                        ? 'border-airtel-600 bg-red-50/50 text-airtel-800 ring-2 ring-red-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{term.label}</div>
                    <div className={`text-[11px] font-semibold mt-1 ${
                      contractDuration === term.months ? 'text-airtel-600' : 'text-emerald-600'
                    }`}>
                      {term.discount}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recommended Add-ons Drawer */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
              <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-airtel-600" />
                <span>Recommended Business Add-ons</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableAddons.map((addon) => {
                  const isAlreadyInCart = cartItems.some((i) => i.productId === addon.productId);
                  return (
                    <div
                      key={addon.productId}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-900">{addon.name}</div>
                        <p className="text-[11px] text-slate-500 leading-tight">{addon.desc}</p>
                        <div className="text-xs font-bold text-airtel-700 mt-1">₹{addon.price}/mo</div>
                      </div>
                      <button
                        disabled={isAlreadyInCart}
                        onClick={() => addItemToCart(addon.productId)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 transition-colors ${
                          isAlreadyInCart
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-white hover:bg-red-50 text-airtel-700 border border-slate-300'
                        }`}
                      >
                        {isAlreadyInCart ? 'Added' : '+ Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Transparent Pricing Summary Card (1 Col) */}
          <div className="space-y-4">
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900">Price Breakdown</h3>
                <Badge variant="brand">100% Itemized</Badge>
              </div>

              {pricing ? (
                <div className="space-y-3 text-xs">
                  
                  <div className="flex justify-between text-slate-600">
                    <span>Base Monthly Charges (MRC):</span>
                    <span className="font-semibold text-slate-800">₹{pricing.baseMrc.toLocaleString('en-IN')}</span>
                  </div>

                  {pricing.contractDiscountPercent > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Term Discount ({pricing.contractDiscountPercent}% on {pricing.contractDurationMonths} mo):</span>
                      <span>-₹{pricing.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Net Monthly Charges:</span>
                    <span className="font-semibold text-slate-800">₹{pricing.discountedMrc.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>GST (18% Input Tax Credit):</span>
                    <span className="font-semibold text-slate-800">₹{pricing.gstMrc.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 text-sm">Total Monthly Bill:</span>
                    <span className="font-extrabold text-airtel-700 text-lg">
                      ₹{pricing.totalMonthlyAmount.toLocaleString('en-IN')}
                      <span className="text-[10px] text-slate-500 font-normal">/mo</span>
                    </span>
                  </div>

                  {/* One-Time Payable Details */}
                  <div className="pt-3 border-t border-dashed border-slate-200 space-y-1.5 text-[11px] text-slate-500">
                    <div className="flex justify-between">
                      <span>Setup & Installation Fee:</span>
                      <span>₹{pricing.totalSetupFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Setup GST (18%):</span>
                      <span>₹{pricing.gstSetup.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-800 text-xs pt-1">
                      <span>Total One-Time Payable:</span>
                      <span>₹{pricing.totalOneTimePayable.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs animate-pulse">
                  Calculating real-time rates...
                </div>
              )}

              {/* Lock Quote Action */}
              <div className="pt-4 border-t border-slate-100">
                <Button
                  variant="primary"
                  size="lg"
                  isLoading={isLocking}
                  disabled={cartItems.length === 0}
                  onClick={handleLockQuote}
                  icon={ArrowRight}
                  className="w-full text-sm"
                >
                  Lock Quote & Proceed to Smart KYC
                </Button>
                <p className="text-[10px] text-slate-400 text-center mt-2">
                  Quote is valid for 14 days &bull; No upfront card payment required
                </p>
              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
};

export default QuoteBuilderPage;

