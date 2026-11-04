const advisorService = require('../services/ai/advisorService');

// Dynamic question steps for conversational advisor across all 10 Indian languages
const ADVISOR_QUESTIONS = [
  {
    step: 1,
    id: 'segment',
    question: {
      en: 'What kind of business do you run?',
      hi: 'आप किस प्रकार का व्यवसाय चलाते हैं?',
      ta: 'நீங்கள் என்ன வகையான வணிகத்தை நடத்துகிறீர்கள்?',
      te: 'మీరు ఏ రకమైన వ్యాపారాన్ని నిర్వహిస్తున్నారు?',
      mr: 'आपण कोणत्या प्रकारचा व्यवसाय चालवता?',
      bn: 'আপনি কী ধরনের ব্যবসা পরিচালনা করেন?',
      gu: 'તમે કયા પ્રકારનો વ્યવસાય ચલાવો છો?',
      kn: 'ನೀವು ಯಾವ ರೀತಿಯ ವ್ಯವಹಾರವನ್ನು ನಡೆಸುತ್ತಿದ್ದೀರಿ?',
      ml: 'നിങ്ങൾ ഏതുതരം ബിസിനസ്സാണ് നടത്തുന്നത്?',
      pa: 'ਤੁਸੀਂ ਕਿਸ ਤਰ੍ਹਾਂ ਦਾ ਕਾਰੋਬਾਰ ਚਲਾਉਂਦੇ ਹੋ?',
    },
    options: [
      { label: 'Retail Store / Supermarket (Kirana)', value: 'Micro Retail and Services' },
      { label: 'Professional Office (Law, CA, Clinic, Tech)', value: 'Professional Offices' },
      { label: 'Multi-Branch Business (Retail/Logistics)', value: 'Small Multi-site Businesses' },
      { label: 'Manufacturing Workshop / Tooling Unit', value: 'Small Manufacturers' },
    ],
  },
  {
    step: 2,
    id: 'employees',
    question: {
      en: 'How many employees or team members work in your business?',
      hi: 'आपके व्यवसाय में कुल कितने कर्मचारी या सहयोगी काम करते हैं?',
      ta: 'உங்கள் நிறுவனத்தில் எத்தனை ஊழியர்கள் அல்லது குழு உறுப்பினர்கள் பணியாற்றுகிறார்கள்?',
      te: 'మీ వ్యాపారంలో ఎంతమంది ఉద్యోగులు పనిచేస్తున్నారు?',
      mr: 'आपल्या व्यवसायात किती कर्मचारी किंवा सहकारी काम करतात?',
      bn: 'আপনার প্রতিষ্ঠানে কতজন কর্মী বা দলীয় সদস্য রয়েছেন?',
      gu: 'તમારા વ્યવસાયમાં કેટલા કર્મચારીઓ કે ટીમ સભ્યો કામ કરે છે?',
      kn: 'ನಿಮ್ಮ ಉದ್ಯಮದಲ್ಲಿ ಎಷ್ಟು ಉದ್ಯೋಗಿಗಳು ಅಥವಾ ತಂಡದ ಸದಸ್ಯರು ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಾರೆ?',
      ml: 'നിങ്ങളുടെ സ്ഥാപനത്തിൽ എത്ര ജീവനക്കാർ ജോലി ചെയ്യുന്നു?',
      pa: 'ਤੁਹਾਡੇ ਕਾਰੋਬਾਰ ਵਿੱਚ ਕਿੰਨੇ ਕਰਮਚਾਰੀ ਜਾਂ ਟੀਮ ਮੈਂਬਰ ਕੰਮ ਕਰਦੇ ਹਨ?',
    },
    options: [
      { label: 'Solo / 1-2 Staff', value: 2 },
      { label: '3 to 5 Employees', value: 4 },
      { label: '6 to 15 Employees', value: 10 },
      { label: '16+ Employees', value: 25 },
    ],
  },
  {
    step: 3,
    id: 'requiresPaymentPos',
    question: {
      en: 'Do you accept digital payments via QR codes or POS swipe machines?',
      hi: 'क्या आप UPI QR कोड या POS स्वाइप मशीन द्वारा पेमेंट स्वीकार करते हैं?',
      ta: 'நீங்கள் UPI QR குறியீடு அல்லது POS இயந்திரம் மூலம் கொடுப்பனவுகளை ஏற்றுக்கொள்கிறீர்களா?',
      te: 'మీరు QR కోడ్ లేదా POS మెషిన్ ద్వారా డిజిటల్ చెల్లింపులు స్వీకరిస్తారా?',
      mr: 'आपण QR कोड किंवा POS मशीनद्वारे डिजिटल पेमेंट स्वीकारता का?',
      bn: 'আপনি কি QR কোড বা POS মেশিনের মাধ্যমে ডিজিটাল পেমেন্ট নেন?',
      gu: 'શું તમે QR કોડ અથવા POS મશીન દ્વારા ડિજિટલ પેમેન્ટ સ્વીકારો છો?',
      kn: 'ನೀವು QR ಕೋಡ್ ಅಥವಾ POS ಯಂತ್ರದ ಮೂಲಕ ಡಿಜಿಟಲ್ ಪಾವತಿಗಳನ್ನು ಸ್ವೀಕರಿಸುತ್ತೀರಾ?',
      ml: 'QR കോഡ് അല്ലെങ്കിൽ POS മെഷീൻ വഴി നിങ്ങൾ ഡിജിറ്റൽ പേയ്‌മെന്റുകൾ സ്വീകരിക്കുന്നുണ്ടോ?',
      pa: 'ਕੀ ਤੁਸੀਂ QR ਕੋਡ ਜਾਂ POS ਮਸ਼ੀਨ ਰਾਹੀਂ ਡਿਜੀਟਲ ਭੁਗਤਾਨ ਲੈਂਦੇ ਹੋ?',
    },
    options: [
      { label: 'Yes, heavy UPI & Card payments daily', value: true },
      { label: 'Occasional / Primarily cash', value: false },
    ],
  },
  {
    step: 4,
    id: 'requiresWhatsapp',
    question: {
      en: 'Do you interact with customers or send order receipts via WhatsApp?',
      hi: 'क्या आप ग्राहकों से बातचीत या बिल भेजने के लिए WhatsApp का उपयोग करते हैं?',
      ta: 'வாடிக்கையாளர்களுடன் தொடர்பு கொள்ள வாட்ஸ்அப் பயன்படுத்துகிறீர்களா?',
      te: 'మీరు కస్టమర్లతో సంభాషించడానికి వాట్సాప్ ఉపయోగిస్తున్నారా?',
      mr: 'आपण ग्राहकांशी संवादासाठी व्हॉट्सअ‍ॅप वापरता का?',
      bn: 'আপনি কি গ্রাহকদের সাথে যোগাযোগে হোয়াটসঅ্যাপ ব্যবহার করেন?',
      gu: 'શું તમે ગ્રાહકો સાથે સંવાદ માટે વોટ્સએપ વાપરો છો?',
      kn: 'ಗ್ರಾಹಕರೊಂದಿಗೆ ಸಂವಹನ ನಡೆಸಲು ನೀವು ವಾಟ್ಸಾಪ್ ಬಳಸುತ್ತೀರಾ?',
      ml: 'ഉപഭോക്താക്കളുമായി ആശയവിനിമയം നടത്താൻ വാട്ട്‌സ്ആപ്പ് ഉപയോഗിക്കുന്നുണ്ടോ?',
      pa: 'ਕੀ ਤੁਸੀਂ ਗਾਹਕਾਂ ਨਾਲ ਸੰਪਰਕ ਕਰਨ ਲਈ ਵਟਸਐਪ ਵਰਤਦੇ ਹੋ?',
    },
    options: [
      { label: 'Yes, need automated WhatsApp updates', value: true },
      { label: 'No / Handled on personal phone', value: false },
    ],
  },
  {
    step: 5,
    id: 'monthlyBudget',
    question: {
      en: 'What is your approximate monthly budget for telecom & digital services?',
      hi: 'टेलीकॉम और डिजिटल सेवाओं के लिए आपका अनुमानित मासिक बजट क्या है?',
      ta: 'தொலைத்தொடர்பு மற்றும் டிஜிட்டਲ சேவைகளுக்கான மாதாந்திர பட்ஜெட் என்ன?',
      te: 'టెలికాం & డిజిటల్ సేవల కోసం మీ సుమారు నెలవారీ బడ్జెట్ ఎంత?',
      mr: 'टेलिकॉम आणि डिजिटल सेवांसाठी आपले अंदाजे मासिक बजेट किती आहे?',
      bn: 'টেলিকম ও ডিজিটাল সেবার জন্য আপনার আনুমানিক মাসিক বাজেট কত?',
      gu: 'ટેલિકોમ અને ડિજિટલ સેવાઓ માટે તમારું અંદાજિત માસિક બજેટ કેટલું છે?',
      kn: 'ಟೆಲಿಕಾಂ ಮತ್ತು ಡಿಜಿಟಲ್ ಸೇವೆಗಳಿಗಾಗಿ ನಿಮ್ಮ ಅಂದಾಜು ಮಾಸಿಕ ಬಜೆಟ್ ಎಷ್ಟು?',
      ml: 'ടെലികോം സേവനങ്ങൾക്കായി നിങ്ങളുടെ ഏകദേശ പ്രതിമാസ ബജറ്റ് എത്രയാണ്?',
      pa: 'ਟੈਲੀਕਾਮ ਸੇਵਾਵਾਂ ਲਈ ਤੁਹਾਡਾ ਅੰਦਾਜ਼ਨ ਮਹੀਨਾਵਾਰ ਬਜਟ ਕਿੰਨਾ ਹੈ?',
    },
    options: [
      { label: '₹1,000 – ₹1,800 / month (Value Tier)', value: 1500 },
      { label: '₹1,800 – ₹3,000 / month (Standard Business)', value: 2500 },
      { label: '₹3,000 – ₹6,000 / month (Performance Pro)', value: 4500 },
    ],
  },
];

// @desc    Get dynamic conversational question or next step
// @route   POST /api/advisor/chat
// @access  Public
exports.chat = async (req, res, next) => {
  try {
    const { currentStep = 0, answers = {}, language = 'en' } = req.body;

    // Check if questionnaire is complete
    if (currentStep >= ADVISOR_QUESTIONS.length) {
      // Generate recommendation
      const profile = {
        ...answers,
        language,
      };
      const recommendation = await advisorService.recommendBundle(profile);

      return res.status(200).json({
        success: true,
        message: 'Recommendation generated.',
        data: {
          isComplete: true,
          recommendation,
        },
        error: null,
      });
    }

    const nextQuestion = ADVISOR_QUESTIONS[currentStep];

    res.status(200).json({
      success: true,
      message: 'Next question retrieved.',
      data: {
        isComplete: false,
        stepIndex: currentStep,
        totalSteps: ADVISOR_QUESTIONS.length,
        question: {
          id: nextQuestion.id,
          text: nextQuestion.question[language] || nextQuestion.question.en,
          options: nextQuestion.options,
        },
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Direct recommendation from profile
// @route   POST /api/advisor/recommend
// @access  Public
exports.recommend = async (req, res, next) => {
  try {
    const profile = req.body;
    const recommendation = await advisorService.recommendBundle(profile);

    res.status(200).json({
      success: true,
      message: 'Bundle recommendation calculated successfully.',
      data: recommendation,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};
