import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, FileText, ShieldCheck, ShoppingCart, Activity } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

const Stepper = ({ currentStep = 1, isKycCompleted = false, onStepClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const steps = [
    { number: 1, label: t('stepper.step1', 'AI Advisor'), icon: Sparkles, path: '/advisor' },
    { number: 2, label: t('stepper.step2', 'Quote Builder'), icon: FileText, path: '/quote' },
    { number: 3, label: t('stepper.step3', 'Smart KYC'), icon: ShieldCheck, path: '/kyc' },
    { number: 4, label: t('stepper.step4', 'Checkout'), icon: ShoppingCart, path: '/checkout' },
    { number: 5, label: t('stepper.step5', 'Live Tracker'), icon: Activity, path: '/dashboard' },
  ];

  const currentStepObj = steps.find((s) => s.number === currentStep) || steps[0];

  const handleStepClick = (step) => {
    if (onStepClick) {
      onStepClick(step.number);
      return;
    }

    // Default smart navigation for completed or current steps
    const isStepAccessible = step.number <= currentStep || (step.number === 3 && isKycCompleted);
    if (isStepAccessible && step.path) {
      navigate(step.path);
    }
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        
        {/* Desktop & Tablet Progress Track */}
        <div className="flex items-center justify-between relative">
          {steps.map((s, idx) => {
            const isKycStepDone = s.number === 3 && isKycCompleted;
            const isCompleted = currentStep > s.number || (isKycStepDone && currentStep < 3);
            const isCurrent = currentStep === s.number;
            const isAccessible = s.number <= currentStep || isCompleted || isKycStepDone;
            const Icon = s.icon;

            return (
              <React.Fragment key={s.number}>
                
                {/* Step Item Node */}
                <div
                  onClick={() => handleStepClick(s)}
                  className={`flex items-center space-x-2.5 z-10 transition-all ${
                    isAccessible ? 'cursor-pointer group' : 'cursor-default opacity-80'
                  }`}
                  title={isAccessible ? `Go to ${s.label}` : `${s.label} (Step ${s.number})`}
                >
                  {/* Step Node Icon Badge */}
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                      isCompleted || isKycStepDone
                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105'
                        : isCurrent
                        ? 'bg-gradient-to-tr from-airtel-700 via-red-600 to-rose-600 text-white ring-4 ring-red-100 shadow-md shadow-red-500/25 group-hover:scale-105'
                        : 'bg-white border-2 border-slate-200 text-slate-400 group-hover:border-slate-300 group-hover:text-slate-600'
                    }`}
                  >
                    {isCompleted || isKycStepDone ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                    ) : (
                      <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    )}
                  </div>

                  {/* Step Text Labels (Hidden on very small screens, visible from sm up) */}
                  <div className="hidden sm:block text-left">
                    <div className="flex items-center space-x-1">
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider ${
                          isKycStepDone
                            ? 'text-emerald-700'
                            : isCurrent
                            ? 'text-airtel-700'
                            : isCompleted
                            ? 'text-emerald-700'
                            : 'text-slate-400'
                        }`}
                      >
                        Step 0{s.number}
                      </span>
                      {isKycStepDone && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-black">
                          Verified
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-xs transition-colors ${
                        isCurrent
                          ? 'text-slate-900 font-extrabold'
                          : isCompleted || isKycStepDone
                          ? 'text-slate-800 font-bold'
                          : 'text-slate-400 font-medium'
                      }`}
                    >
                      {s.label}
                    </div>
                  </div>
                </div>

                {/* Connector Track Bar */}
                {idx < steps.length - 1 && (
                  <div className="flex-1 mx-2 sm:mx-3 h-1 rounded-full bg-slate-200/80 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        currentStep > s.number
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 w-full'
                          : isCurrent
                          ? 'bg-gradient-to-r from-airtel-600 to-red-400 w-1/2'
                          : 'w-0'
                      }`}
                    />
                  </div>
                )}

              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile-Only Active Step Bar (Ensures context without label clutter) */}
        <div className="sm:hidden mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-airtel-600 animate-pulse" />
            <span className="font-extrabold text-slate-900">
              Step {currentStepObj.number} of 5:
            </span>
            <span className="font-semibold text-airtel-700">
              {currentStepObj.label}
            </span>
          </div>
          {isKycCompleted && currentStep === 3 && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              KYC Verified
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

export default Stepper;
