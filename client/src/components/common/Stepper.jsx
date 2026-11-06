import React from 'react';
import { Check, Sparkles, FileText, ShieldCheck, ShoppingCart, Activity } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

const Stepper = ({ currentStep = 1, isKycCompleted = false, onStepClick }) => {
  const { t } = useTranslation();

  const steps = [
    { number: 1, label: t('stepper.step1', 'AI Advisor'), icon: Sparkles },
    { number: 2, label: t('stepper.step2', 'Quote Builder'), icon: FileText },
    { number: 3, label: t('stepper.step3', 'Smart KYC'), icon: ShieldCheck },
    { number: 4, label: t('stepper.step4', 'Checkout'), icon: ShoppingCart },
    { number: 5, label: t('stepper.step5', 'Live Tracker'), icon: Activity },
  ];

  return (
    <div className="w-full bg-white border-b border-slate-200 py-3 px-4 shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {steps.map((s, idx) => {
          const isKycStepDone = s.number === 3 && isKycCompleted;
          const isCompleted = currentStep > s.number || (isKycStepDone && currentStep < 3);
          const isCurrent = currentStep === s.number;
          const Icon = s.icon;

          return (
            <React.Fragment key={s.number}>
              <div 
                className="flex items-center space-x-2 cursor-pointer group"
                onClick={() => onStepClick && onStepClick(s.number)}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted || isKycStepDone
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-100'
                      : isCurrent
                      ? 'bg-airtel-600 text-white ring-4 ring-red-100 shadow-md shadow-red-500/20'
                      : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                  }`}
                >
                  {isCompleted || isKycStepDone ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="hidden sm:block text-left">
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${
                    isKycStepDone ? 'text-emerald-700' : isCurrent ? 'text-airtel-700' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                  }`}>
                    Step {s.number}
                  </div>
                  <div className={`text-xs font-semibold ${
                    isKycStepDone ? 'text-emerald-900 font-bold' : isCurrent ? 'text-slate-900 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                  }`}>
                    {s.label}
                  </div>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-colors ${
                    currentStep > s.number ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
