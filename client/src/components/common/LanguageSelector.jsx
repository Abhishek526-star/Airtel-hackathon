import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

const LanguageSelector = ({ compact = false }) => {
  const { language, changeLanguage, currentLanguageInfo, supportedLanguages } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-red-600" />
        <span className="font-semibold text-slate-800">{currentLanguageInfo?.nativeName || 'English'}</span>
        {!compact && (
          <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
            ({currentLanguageInfo?.code?.toUpperCase()})
          </span>
        )}
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-60 rounded-xl bg-white shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-96 overflow-y-auto">
          <div className="px-3 py-1.5 border-b border-slate-100">
            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Choose Language / भाषा चुनें
            </p>
          </div>
          <div className="py-1">
            {supportedLanguages.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition ${
                    isSelected ? 'bg-red-50/80 text-red-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-900">{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-400">
                      {lang.label} • {lang.region}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;

