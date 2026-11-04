import React from 'react';
import { Check, Sparkles, FileText, ShieldCheck, ShoppingCart, Activity } from 'lucide-react';

const Stepper = ({ currentStep = 1, onStepClick }) => {
  const steps = [
    { number: 1, label: 'AI Advisor', icon: Sparkles },
    { number: 2, label: 'Quote Builder', icon: FileText },
    { number: 3, label: 'Smart KYC', icon: ShieldCheck },
    { number: 4, label: 'Checkout', icon: ShoppingCart },
    { number: 5, label: 'Live Tracker', icon: Activity },
  ];

  return (
    <div className="w-full bg-white border-b border-slate-200 py-3 px-4 shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {steps.map((s, idx) => {
          const isCompleted = currentStep > s.number;
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
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-airtel-600 text-white ring-4 ring-red-100 shadow-md shadow-red-500/20'
                      : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="hidden sm:block text-left">
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${
                    isCurrent ? 'text-airtel-700' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                  }`}>
                    Step {s.number}
                  </div>
                  <div className={`text-xs font-semibold ${
                    isCurrent ? 'text-slate-900 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
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

