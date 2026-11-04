const advisorService = require('../services/ai/advisorService');

// Dynamic question steps for conversational advisor
const ADVISOR_QUESTIONS = [
  {
    step: 1,
    id: 'segment',
    question: {
      en: 'What kind of business do you run?',
      hi: 'आप किस प्रकार का व्यवसाय चलाते हैं?',
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
