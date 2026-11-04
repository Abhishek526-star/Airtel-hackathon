import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Stepper from '../components/common/Stepper';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { 
  Sparkles, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  Wifi, 
  Phone, 
  Cloud, 
  ShieldCheck, 
  HelpCircle,
  Languages,
  UserCheck
} from 'lucide-react';

const AIAdvisorPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setBundleFromAdvisor, setCurrentStep } = useOnboarding();

  const [language, setLanguage] = useState('en');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState({
    segment: 'Micro Retail and Services',
    employees: 3,
    requiresPaymentPos: true,
    requiresWhatsapp: true,
    monthlyBudget: 2500,
  });
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch initial question
  useEffect(() => {
    fetchNextQuestion(0, answers);
  }, [language]);

  const fetchNextQuestion = async (step, currentAnswers) => {
    try {
      setIsEvaluating(true);
      setErrorMsg('');
      const res = await api.post('/advisor/chat', {
        currentStep: step,
        answers: currentAnswers,
        language,
      });

      if (res.success && res.data) {
        if (res.data.isComplete) {
          setRecommendation(res.data.recommendation);
          setCurrentQuestion(null);
        } else {
          setCurrentQuestion(res.data.question);
          setCurrentStepIndex(res.data.stepIndex);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error communicating with AI Advisor.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSelectOption = (questionId, value) => {
    const updatedAnswers = { ...answers, [questionId]: value };
    setAnswers(updatedAnswers);
    fetchNextQuestion(currentStepIndex + 1, updatedAnswers);
  };

  const handleRestart = () => {
    setRecommendation(null);
    setCurrentStepIndex(0);
    fetchNextQuestion(0, {});
  };

  const handleProceedToQuote = () => {
    if (recommendation) {
      setBundleFromAdvisor(recommendation);
      setCurrentStep(2);
      navigate('/quote');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Stepper currentStep={1} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-airtel-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">AI Business Telecom Advisor</h1>
              <p className="text-xs text-slate-500">Intelligent bundling matching your operational footprint</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700"
            >
              <Languages className="w-3.5 h-3.5 text-airtel-600" />
              <span>{language === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}</span>
            </button>
            <button
              onClick={handleRestart}
              className="p-1.5 rounded-lg border border-slate-300 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50"
              title="Restart Advisor"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Advisor Main Interaction Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          
          {/* Active Question Dialog Flow */}
          {!recommendation && currentQuestion && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 pb-3">
                <span className="font-semibold uppercase tracking-wider text-airtel-700">Question {currentStepIndex + 1} of 5</span>
                <span>{Math.round(((currentStepIndex + 1) / 5) * 100)}% Completed</span>
              </div>

              {/* Assistant Message Bubble */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  AI
                </div>
                <div className="bg-slate-100 rounded-2xl rounded-tl-none p-4 max-w-xl text-slate-800 text-sm font-medium leading-relaxed">
                  {currentQuestion.text}
                </div>
              </div>

              {/* Clickable Option Pills */}
              <div className="pt-2 pl-11 space-y-2.5 max-w-xl">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    disabled={isEvaluating}
                    onClick={() => handleSelectOption(currentQuestion.id, option.value)}
                    className="w-full text-left p-3.5 rounded-xl border border-slate-200 bg-white hover:border-airtel-500 hover:bg-red-50/40 text-slate-800 text-xs sm:text-sm font-semibold transition-all flex items-center justify-between group active:scale-[0.99]"
                  >
                    <span>{option.label}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-airtel-600 transition-colors" />
                  </button>
                ))}
              </div>

              {isEvaluating && (
                <div className="pl-11 flex items-center space-x-2 text-xs text-slate-400 italic">
                  <div className="w-2 h-2 rounded-full bg-airtel-600 animate-ping"></div>
                  <span>Accel AI Advisor analyzing catalogue dependencies & tier rules...</span>
                </div>
              )}

            </div>
          )}

          {/* Recommendation Presentation Card */}
          {recommendation && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <Badge variant="brand" className="mb-1">Recommended Bundle</Badge>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {recommendation.bundleName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Curated for: {recommendation.businessSummary}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Estimated Monthly</span>
                  <div className="text-2xl font-extrabold text-airtel-700">
                    ₹{recommendation.estimatedMonthlyPrice.toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-slate-500">/mo</span>
                  </div>
                  <span className="text-[10px] text-slate-400">+ 18% GST (Input Credit)</span>
                </div>
              </div>

              {/* Justification Reasoning */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-airtel-600" />
                  <span>Why This Bundle Fits Your Operations</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {recommendation.reasoning.map((reason, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Product Breakdown Grid */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Included Services ({recommendation.recommendedProducts.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendation.recommendedProducts.map((prod) => (
                    <div
                      key={prod.productId}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:shadow-sm transition-shadow flex items-start justify-between"
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-900">{prod.productName}</div>
                        <div className="text-[11px] text-slate-500">{prod.speedBandwidth} &bull; {prod.category}</div>
                        <Badge variant="neutral" className="text-[10px]">{prod.productId}</Badge>
                      </div>
                      <div className="text-right text-xs font-bold text-slate-800">
                        ₹{prod.monthlyPrice}/mo
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleRestart}
                  icon={RotateCcw}
                  className="w-full sm:w-auto text-xs"
                >
                  Adjust Requirements
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleProceedToQuote}
                  icon={ArrowRight}
                  className="w-full sm:w-auto text-sm px-6"
                >
                  Accept Bundle & Customize Quote
                </Button>
              </div>

            </div>
          )}

        </div>

      </main>
    </div>
  );
};

export default AIAdvisorPage;

