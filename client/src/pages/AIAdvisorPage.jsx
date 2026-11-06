import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import api from '../services/api';
import Stepper from '../components/common/Stepper';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { 
  Sparkles, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  Mic, 
  MicOff, 
  Volume2, 
  MessageSquare, 
  Smartphone,
  Check,
  Send
} from 'lucide-react';

const AIAdvisorPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setBundleFromAdvisor, setCurrentStep } = useOnboarding();
  const { t, language } = useTranslation();

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
  
  // Stretch Goal #1: View Mode (Wizard vs. WhatsApp Bot) & Voice Assistant
  const [viewMode, setViewMode] = useState('wizard'); // 'wizard' | 'whatsapp'
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const chatBottomRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isEvaluating, recommendation]);

  // Voice Assistant: Text-to-Speech
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Voice Assistant: Speech-to-Text Recognition
  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please try on Google Chrome or Microsoft Edge.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      if (currentQuestion && currentQuestion.options) {
        const matched = currentQuestion.options.find(opt => 
          transcript.includes(String(opt.label).toLowerCase()) || 
          transcript.includes(String(opt.value).toLowerCase())
        );
        if (matched) {
          handleSelectOption(currentQuestion.id, matched.value, matched.label);
        } else {
          // If no exact match, select the first option matching partial intent
          handleSelectOption(currentQuestion.id, currentQuestion.options[0].value, currentQuestion.options[0].label);
        }
      }
    };

    recognition.start();
  };

  // Fetch question whenever active language or step changes
  useEffect(() => {
    fetchNextQuestion(currentStepIndex, answers, true);
  }, [language]);

  const fetchNextQuestion = async (step, currentAnswers, isInitial = false) => {
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
          // Append final bot message in WhatsApp mode
          setChatMessages(prev => [
            ...prev,
            {
              id: Date.now(),
              sender: 'bot',
              text: `🎉 Great! I have curated the ideal telecom & digital bundle: "${res.data.recommendation.bundleName}" for ₹${res.data.recommendation.estimatedMonthlyPrice}/month.`,
              isRecommendation: true,
              data: res.data.recommendation,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        } else {
          setCurrentQuestion(res.data.question);
          setCurrentStepIndex(res.data.stepIndex);
          // Append question to WhatsApp chat history
          setChatMessages(prev => [
            ...prev,
            {
              id: Date.now(),
              sender: 'bot',
              text: res.data.question.text,
              question: res.data.question,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error communicating with AI Advisor.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSelectOption = (questionId, value, label = '') => {
    const displayLabel = label || String(value);
    // Append user selection message in WhatsApp mode
    setChatMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: 'user',
        text: displayLabel,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    const updatedAnswers = { ...answers, [questionId]: value };
    setAnswers(updatedAnswers);
    fetchNextQuestion(currentStepIndex + 1, updatedAnswers);
  };

  const handleRestart = () => {
    setRecommendation(null);
    setCurrentStepIndex(0);
    setChatMessages([]);
    fetchNextQuestion(0, {}, true);
  };

  const handleProceedToQuote = () => {
    if (recommendation) {
      setBundleFromAdvisor(recommendation);
      setCurrentStep(2);
      navigate('/quote');
    }
  };

  // Helper to get translated option label if available
  const getOptionLabel = (qId, optionIdx, defaultLabel) => {
    const key = `${qId === 'segment' ? 'q1' : qId === 'employees' ? 'q2' : qId === 'requiresPaymentPos' ? 'q3' : qId === 'requiresWhatsapp' ? 'q4' : 'q5'}_opt${optionIdx + 1}`;
    return t(`advisor.${key}`, defaultLabel);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Stepper currentStep={1} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-airtel-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900">{t('advisor.title', 'AI Business Telecom Advisor')}</h1>
                <Badge variant="brand">GenAI Powered</Badge>
              </div>
              <p className="text-xs text-slate-500">{t('advisor.subtitle', 'Intelligent bundling matching your operational footprint')}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Switcher: Web Guided vs WhatsApp Simulator (Stretch Goal #1) */}
            <div className="bg-slate-200/80 p-1 rounded-xl flex items-center space-x-1 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('wizard')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                  viewMode === 'wizard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Web Guided</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('whatsapp')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                  viewMode === 'whatsapp' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Bot</span>
              </button>
            </div>

            <button
              onClick={handleRestart}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 text-xs font-semibold"
              title="Restart Advisor"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('advisor.adjustReq', 'Restart')}</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* VIEW MODE 1: WEB GUIDED WIZARD */}
        {viewMode === 'wizard' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            
            {/* Active Question Dialog Flow */}
            {!recommendation && currentQuestion && (
              <div className="space-y-6">
                
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 pb-3">
                  <span className="font-semibold uppercase tracking-wider text-airtel-700">
                    {t('advisor.questionProgress', 'Question {current} of {total}', { current: currentStepIndex + 1, total: 5 })}
                  </span>
                  <div className="flex items-center space-x-3">
                    {/* Voice Assistant Buttons */}
                    <button
                      type="button"
                      onClick={() => speakText(currentQuestion.text)}
                      className="inline-flex items-center space-x-1 text-slate-600 hover:text-airtel-600 text-xs font-semibold"
                      title="Listen to question"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-airtel-600" />
                      <span>Listen</span>
                    </button>
                    <button
                      type="button"
                      onClick={startVoiceInput}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        isListening
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-airtel-600'
                      }`}
                      title="Speak your answer"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
                    </button>
                    <span>{Math.round(((currentStepIndex + 1) / 5) * 100)}%</span>
                  </div>
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
                      onClick={() => handleSelectOption(currentQuestion.id, option.value, option.label)}
                      className="w-full text-left p-3.5 rounded-xl border border-slate-200 bg-white hover:border-airtel-500 hover:bg-red-50/40 text-slate-800 text-xs sm:text-sm font-semibold transition-all flex items-center justify-between group active:scale-[0.99]"
                    >
                      <span>{getOptionLabel(currentQuestion.id, idx, option.label)}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-airtel-600 transition-colors" />
                    </button>
                  ))}
                </div>

                {isEvaluating && (
                  <div className="pl-11 flex items-center space-x-2 text-xs text-slate-400 italic">
                    <div className="w-2 h-2 rounded-full bg-airtel-600 animate-ping"></div>
                    <span>{t('advisor.evaluatingText', 'Accel AI Advisor analyzing catalogue dependencies & tier rules...')}</span>
                  </div>
                )}

              </div>
            )}

            {/* Recommendation Presentation Card */}
            {recommendation && (
              <div className="space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <Badge variant="brand" className="mb-1">{t('advisor.recBadge', 'Recommended Bundle')}</Badge>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {recommendation.bundleName}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Curated for: {recommendation.businessSummary}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">{t('advisor.estMonthly', 'Estimated Monthly')}</span>
                    <div className="text-2xl font-extrabold text-airtel-700">
                      ₹{recommendation.estimatedMonthlyPrice.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-slate-500">/mo</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{t('advisor.plusGst', '+ 18% GST (Input Credit)')}</span>
                  </div>
                </div>

                {/* Justification Reasoning */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-airtel-600" />
                      <span>{t('advisor.whyFits', 'Why This Bundle Fits Your Operations')}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => speakText(`Here is your curated bundle: ${recommendation.bundleName}. ${recommendation.reasoning.join('. ')}`)}
                      className="inline-flex items-center space-x-1 text-slate-600 hover:text-airtel-600 text-xs font-semibold"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-airtel-600" />
                      <span>Listen to Advisor</span>
                    </button>
                  </div>
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
                    {t('advisor.includedServices', 'Included Services')} ({recommendation.recommendedProducts.length})
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
                    {t('advisor.adjustReq', 'Adjust Requirements')}
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleProceedToQuote}
                    icon={ArrowRight}
                    className="w-full sm:w-auto text-sm px-6"
                  >
                    {t('advisor.acceptBundle', 'Accept Bundle & Customize Quote')}
                  </Button>
                </div>

              </div>
            )}

          </div>
        )}

        {/* VIEW MODE 2: WHATSAPP BOT SIMULATOR (Stretch Goal #1) */}
        {viewMode === 'whatsapp' && (
          <div className="max-w-md mx-auto bg-slate-900 rounded-3xl shadow-2xl border-4 border-slate-800 overflow-hidden flex flex-col h-[650px]">
            {/* WhatsApp Header */}
            <div className="bg-[#075E54] text-white p-3 flex items-center justify-between shadow-md">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-airtel-600 flex items-center justify-center font-bold text-white text-sm border-2 border-white/50">
                  AB
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-xs">Accel Business Bot</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 text-[#075E54] flex items-center justify-center text-[9px] font-black" title="Verified Enterprise Account">✓</span>
                  </div>
                  <div className="text-[10px] text-emerald-200">Official • Typically replies instantly</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-white/80">
                <button
                  type="button"
                  onClick={startVoiceInput}
                  className={`p-1.5 rounded-full hover:bg-white/10 ${isListening ? 'text-red-300 animate-pulse' : ''}`}
                  title="Voice input"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="p-1.5 rounded-full hover:bg-white/10 text-xs"
                  title="Restart chat"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#E5DDD5]">
              {/* DPDP Act 2023 End-to-End Encryption Notice */}
              <div className="text-center my-2">
                <span className="inline-block px-3 py-1 rounded-lg bg-[#FCF4CB] text-[10px] text-slate-700 shadow-xs border border-amber-200/50">
                  🔒 Messages are end-to-end encrypted under DPDP Act 2023.
                </span>
              </div>

              {/* Message History */}
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs relative ${
                      msg.sender === 'user'
                        ? 'bg-[#DCF8C6] text-slate-900 rounded-tr-none'
                        : 'bg-white text-slate-900 rounded-tl-none'
                    }`}
                  >
                    <div className="leading-relaxed">{msg.text}</div>

                    {/* Interactive Bundle Card inside WhatsApp when Complete */}
                    {msg.isRecommendation && msg.data && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="font-extrabold text-slate-900 text-xs">{msg.data.bundleName}</div>
                        <div className="text-base font-black text-airtel-700">₹{msg.data.estimatedMonthlyPrice}/mo <span className="text-[10px] text-slate-500 font-normal">+ 18% GST</span></div>
                        <div className="text-[10px] text-slate-600">Includes: {msg.data.recommendedProducts.map(p => p.productName).join(', ')}</div>
                        <button
                          type="button"
                          onClick={handleProceedToQuote}
                          className="w-full mt-2 py-2 rounded-lg bg-airtel-600 hover:bg-airtel-700 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-1"
                        >
                          <span>Proceed to Quote & Checkout</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-end space-x-1 mt-1 text-[9px] text-slate-400">
                      <span>{msg.time}</span>
                      {msg.sender === 'user' && (
                        <span className="text-sky-500 font-bold">✓✓</span>
                      )}
                    </div>
                  </div>

                  {/* Interactive Quick-Reply Option Pills for current active question */}
                  {msg.question && !recommendation && (
                    <div className="mt-2 space-y-1.5 w-[85%]">
                      {msg.question.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          disabled={isEvaluating}
                          onClick={() => handleSelectOption(msg.question.id, opt.value, opt.label)}
                          className="w-full text-left px-3 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold hover:bg-emerald-50 active:scale-95 transition shadow-xs flex items-center justify-between cursor-pointer"
                        >
                          <span>{opt.label}</span>
                          <ArrowRight className="w-3 h-3 text-emerald-600" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isEvaluating && (
                <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-2xl rounded-tl-none max-w-[60%] text-xs text-slate-500 italic shadow-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></div>
                  <span>Accel Bot typing...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* WhatsApp Input Bar */}
            <div className="bg-[#F0F2F5] p-2.5 flex items-center space-x-2 border-t border-slate-200">
              <div className="flex-1 bg-white rounded-full px-3.5 py-1.5 text-xs text-slate-400 border border-slate-300">
                {recommendation ? 'Bundle recommended above' : 'Tap an option above or speak...'}
              </div>
              <button
                type="button"
                onClick={startVoiceInput}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all ${
                  isListening ? 'bg-red-600 animate-pulse ring-2 ring-red-400' : 'bg-[#128C7E] hover:bg-[#075E54]'
                }`}
                title="Tap to speak"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AIAdvisorPage;
