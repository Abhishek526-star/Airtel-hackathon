import en from './en.js';
import hi from './hi.js';
import ta from './ta.js';
import te from './te.js';
import mr from './mr.js';
import bn from './bn.js';
import gu from './gu.js';
import kn from './kn.js';
import ml from './ml.js';
import pa from './pa.js';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English', region: 'All India' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिंदी', region: 'North / Central India' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', region: 'Tamil Nadu' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', region: 'Andhra & Telangana' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी', region: 'Maharashtra' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', region: 'West Bengal' },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી', region: 'Gujarat' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'Karnataka' },
  { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം', region: 'Kerala' },
  { code: 'pa', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'Punjab' },
];

export const translations = {
  en,
  hi,
  ta,
  te,
  mr,
  bn,
  gu,
  kn,
  ml,
  pa,
};

export default translations;

