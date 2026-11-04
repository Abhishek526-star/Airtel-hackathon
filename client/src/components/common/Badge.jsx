import React from 'react';

const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const variantStyles = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    brand: 'bg-red-50 text-airtel-700 border-red-200 font-semibold',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
    danger: 'bg-red-50 text-red-700 border-red-200 font-medium',
    info: 'bg-sky-50 text-sky-700 border-sky-200 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${
        variantStyles[variant] || variantStyles.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;

