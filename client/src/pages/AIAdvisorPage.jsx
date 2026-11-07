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
  Volume2, 
  Building2, 
  Check, 
  Send, 
  Layers, 
  Bot, 
  Zap, 
  RefreshCw, 
  AlertCircle,
  Store,
  Briefcase,
  Factory,
  Network,
  HelpCircle,
  Clock,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const AIAdvisorPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setBundleFromAdvisor, setCurrentStep } = useOnboarding();
  const { t, language } = useTranslation();

  // Chat message stream: [{ id, sender: 'bot'|'user', text, bundle, alternatives, followUpQuestions, suggestedQuickReplies, time }]
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isConsulting, setIsConsulting] = useState(false);
  const [currentBundle, setCurrentBundle] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Voice Assistant: Speech-to-Text & Text-to-Speech
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatBottomRef = useRef(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isConsulting]);

  // Voice Assistant: Text-to-Speech
  const speakText = (textToSpeak) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak.replace(/[*#_]/g, ''));
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
      const transcript = event.results[0][0].transcript;
      if (transcript && transcript.trim()) {
        handleSendMessage(transcript.trim());
      }
    };

    recognition.start();
  };

  // Quick Starter Prompts
  const quickStarters = [
    {
      icon: Store,
      title: 'Retail Store / Supermarket',
      prompt: 'I run a busy grocery and retail store with 4 staff members. We face Wi-Fi dropouts during peak UPI/QR code billing, and we want to send customer billing receipts on WhatsApp. Our budget is around ₹2,500/month.',
      tag: 'UPI & WhatsApp POS',
    },
    {
      icon: Briefcase,
      title: 'Professional Office / Clinic',
      prompt: 'We are a 10-person professional consulting & legal office. We need 300 Mbps high-speed fiber for client video conferencing, corporate email for our team, and cloud telephony for our receptionist.',
      tag: 'Video & Cloud Phone',
    },
    {
      icon: Factory,
      title: 'Manufacturing Workshop',
      prompt: 'Small manufacturing workshop with 8 workers and delivery vans. We need reliable fiber broadband, Cloud CCTV surveillance for the shopfloor, and automated cloud backup for our Tally ERP archives.',
      tag: 'CCTV & Tally Backup',
    },
    {
      icon: Network,
      title: 'Multi-Branch Connected Business',
      prompt: 'We operate 3 retail branches in the city. We need seamless SD-WAN connectivity, dedicated static IP, and automatic 4G/5G failover backup so billing never stops during cable cuts.',
      tag: 'SD-WAN & 4G Failover',
    },
  ];

  // Send message to Conversational Advisor
  const handleSendMessage = async (textToSend) => {
    const msg = (textToSend || inputText).trim();
    if (!msg || isConsulting) return;

    setInputText('');
    setErrorMsg('');

    // Append user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsConsulting(true);

    try {
      // Prepare history payload for API
      const historyPayload = newHistory.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await api.post('/advisor/chat', {
        message: msg,
        history: historyPayload,
        currentBundle,
        language,
      });

      if (res.success && res.data) {
        const botData = res.data;
        const botMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: botData.reply || 'Here is my recommendation based on your operational requirements.',
          bundle: botData.bundle || null,
          alternatives: botData.alternatives || [],
          followUpQuestions: botData.followUpQuestions || [],
          suggestedQuickReplies: botData.suggestedQuickReplies || [],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        if (botData.bundle) {
          setCurrentBundle(botData.bundle);
        }

        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error communicating with AI Advisor.');
    } finally {
      setIsConsulting(false);
    }
  };

  const handleSelectQuickReply = (chipText) => {
    handleSendMessage(chipText);
  };

  const handleSelectAlternative = (altBundle) => {
    setCurrentBundle(altBundle);
    const switchMsg = {
      id: Date.now(),
      sender: 'user',
      text: `Switched to alternative tier: ${altBundle.bundleName}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const confirmationMsg = {
      id: Date.now() + 1,
      sender: 'bot',
      text: `Updated your primary bundle recommendation to **${altBundle.bundleName}** at ₹${altBundle.estimatedMonthlyPrice}/month. All services and discounts have been recalculated.`,
      bundle: altBundle,
      alternatives: [],
      suggestedQuickReplies: ['Accept bundle & proceed to quote', 'Can we adjust anything else?'],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, switchMsg, confirmationMsg]);
  };

  const handleProceedToQuote = () => {
    if (currentBundle) {
      setBundleFromAdvisor(currentBundle);
      setCurrentStep(2);
      navigate('/quote');
    }
  };

  const handleRestart = () => {
    setMessages([]);
    setCurrentBundle(null);
    setInputText('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Stepper currentStep={1} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 flex flex-col">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {t('advisor.title', 'AI Business Telecom Advisor')}
                </h1>
                <Badge variant="brand">GenAI Consultant</Badge>
              </div>
              <p className="text-xs text-slate-500">
                Natural consultative analysis grounded strictly in the official 25-product telecom catalogue.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleRestart}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-300 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs"
              title="Restart Consultation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Chat Conversation Container */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col min-h-[550px] overflow-hidden">
          
          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
            
            {/* Initial Welcome Screen with Quick Starter Prompt Cards */}
            {messages.length === 0 && (
              <div className="space-y-6 py-4 animate-fadeIn">
                <div className="max-w-2xl bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center space-x-2 text-red-600">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-extrabold text-xs uppercase tracking-wider">Consultative Intelligence</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Welcome to Accel Telecom Solutions. How can I assist your business today?
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tell me about your business in your own words—your industry, team size, daily digital needs (like fast UPI checkout, automated customer WhatsApp bills, CCTV surveillance, or cloud accounting backup), and any budget limits. I will curate the ideal telecom bundle tailored to your operations.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pl-1">
                    Or choose a common business scenario to start:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {quickStarters.map((starter, idx) => {
                      const Icon = starter.icon;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSendMessage(starter.prompt)}
                          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-red-500 hover:shadow-md transition-all cursor-pointer group space-y-2 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center space-x-2">
                                <div className="p-1.5 rounded-lg bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-xs text-slate-900 group-hover:text-red-600 transition-colors">
                                  {starter.title}
                                </h3>
                              </div>
                              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                {starter.tag}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              "{starter.prompt}"
                            </p>
                          </div>
                          <div className="flex items-center justify-end text-[11px] font-bold text-red-600 group-hover:translate-x-1 transition-transform">
                            <span>Start Consultation</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Chat Message Stream */}
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-3">
                {/* User Message */}
                {msg.sender === 'user' ? (
                  <div className="flex justify-end">
                    <div className="max-w-xl bg-slate-900 text-white p-4 rounded-3xl rounded-tr-xs text-xs font-medium leading-relaxed shadow-xs">
                      <div>{msg.text}</div>
                      <div className="text-[10px] text-slate-400 text-right mt-1.5 font-mono">{msg.time}</div>
                    </div>
                  </div>
                ) : (
                  /* Consultant Message */
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm mt-1">
                      AI
                    </div>
                    
                    <div className="space-y-4 max-w-2xl flex-1">
                      {/* Consultant Message Bubble */}
                      <div className="bg-white p-4 sm:p-5 rounded-3xl rounded-tl-xs border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed shadow-xs space-y-2">
                        <div className="whitespace-pre-line font-medium text-slate-800">{msg.text}</div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                          <button
                            type="button"
                            onClick={() => speakText(msg.text)}
                            className="inline-flex items-center space-x-1 text-slate-500 hover:text-red-600 font-bold transition-colors"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen to Consultant</span>
                          </button>
                          <span className="font-mono">{msg.time}</span>
                        </div>
                      </div>

                      {/* Interactive Recommended Bundle Card (if provided by bot) */}
                      {msg.bundle && (
                        <div className="bg-white rounded-3xl border-2 border-red-500/80 p-5 sm:p-6 shadow-md space-y-5 animate-fadeIn">
                          {/* Card Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge variant="brand">Curated Telecom Bundle</Badge>
                                <span className="text-[10px] font-mono text-slate-400">Official Catalogue</span>
                              </div>
                              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                {msg.bundle.bundleName}
                              </h3>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {msg.bundle.businessSummary}
                              </p>
                            </div>

                            <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl">
                              <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Plan Rate</span>
                              <div className="text-2xl font-extrabold text-red-600">
                                ₹{msg.bundle.estimatedMonthlyPrice?.toLocaleString('en-IN')}
                                <span className="text-xs font-normal text-slate-500">/mo</span>
                              </div>
                              <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                                ₹1,000 One-Time Setup Policy &bull; + 18% GST Credit
                              </div>
                            </div>
                          </div>

                          {/* Consultative Reasoning Breakdown */}
                          {msg.bundle.reasoning && msg.bundle.reasoning.length > 0 && (
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                                <span>Why This Bundle Fits Your Operations</span>
                              </h4>
                              <ul className="space-y-1.5 text-xs text-slate-600">
                                {msg.bundle.reasoning.map((reason, rIdx) => (
                                  <li key={rIdx} className="flex items-start space-x-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>{reason}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Included Products Grid */}
                          <div className="space-y-2.5">
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                              <span>Included Services & Official Products ({msg.bundle.recommendedProducts?.length || 0})</span>
                              <span className="text-[10px] text-slate-400 font-normal">Grounded in database</span>
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {msg.bundle.recommendedProducts?.map((prod) => (
                                <div
                                  key={prod.productId}
                                  className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-start justify-between gap-2 shadow-2xs"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-1.5">
                                      <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] font-bold text-slate-700">
                                        {prod.productId}
                                      </span>
                                      <span className="text-xs font-bold text-slate-900">{prod.productName}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                      {prod.speedBandwidth || prod.category}
                                    </div>
                                  </div>
                                  <div className="text-right text-xs font-extrabold text-slate-800 whitespace-nowrap">
                                    ₹{prod.monthlyPrice}/mo
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Alternative Bundles Toggle Section */}
                          {msg.alternatives && msg.alternatives.length > 0 && (
                            <div className="pt-2 border-t border-slate-100 space-y-2">
                              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Alternative Bundle Options
                              </h4>
                              <div className="space-y-2">
                                {msg.alternatives.map((alt, aIdx) => (
                                  <div
                                    key={aIdx}
                                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                  >
                                    <div>
                                      <div className="font-extrabold text-xs text-slate-900">{alt.bundleName}</div>
                                      <p className="text-[11px] text-slate-500">{alt.difference}</p>
                                    </div>
                                    <div className="flex items-center space-x-3 shrink-0">
                                      <span className="font-extrabold text-xs text-slate-900">
                                        ₹{alt.estimatedMonthlyPrice}/mo
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleSelectAlternative(alt)}
                                        className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all shadow-2xs"
                                      >
                                        Switch to this Bundle
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Card Action Buttons */}
                          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <span className="text-[11px] text-slate-500">
                              Instant checkout with 12, 24, or 36-month tenure discounts.
                            </span>

                            <Button
                              variant="primary"
                              size="md"
                              onClick={handleProceedToQuote}
                              icon={ArrowRight}
                              className="w-full sm:w-auto text-xs px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold shadow-md shadow-red-600/20"
                            >
                              Accept Bundle & Proceed to Quote
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Interactive Suggestion Chips (rendered below consultant reply) */}
                      {msg.suggestedQuickReplies && msg.suggestedQuickReplies.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                            Suggested Quick Actions:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {msg.suggestedQuickReplies.map((chip, cIdx) => (
                              <button
                                key={cIdx}
                                type="button"
                                disabled={isConsulting}
                                onClick={() => handleSelectQuickReply(chip)}
                                className="px-3.5 py-1.5 rounded-full border border-slate-300 bg-white hover:border-red-500 hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs font-semibold transition-all shadow-2xs active:scale-95 text-left"
                              >
                                {chip}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Consultant Typing / Thinking Indicator */}
            {isConsulting && (
              <div className="flex items-center space-x-3 animate-fadeIn">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  AI
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-xs border border-slate-200 text-xs text-slate-500 font-medium flex items-center space-x-2 shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  <span>Accel Telecom Consultant analyzing requirements & official catalogue...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputText}
                  disabled={isConsulting}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Tell me about your business, team size, internet problems, or budget..."
                  className="w-full pl-4 pr-10 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all shadow-inner"
                />

                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={startVoiceInput}
                  disabled={isConsulting}
                  className={`absolute right-2 top-2 p-1.5 rounded-xl transition-all ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'text-slate-400 hover:text-red-600 hover:bg-slate-100'
                  }`}
                  title="Speak your requirements"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() || isConsulting}
                className="p-3 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold transition-all shadow-md shadow-red-600/20 active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Grounded in official 25-product enterprise catalogue</span>
              </span>
              <span>Tap microphone for hands-free voice consultation</span>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default AIAdvisorPage;
