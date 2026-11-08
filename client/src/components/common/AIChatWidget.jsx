import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  X,
  Send,
  Bot,
  Phone,
  HardHat
} from 'lucide-react';

const AIChatWidget = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I am your **Accel Business AI Support Assistant**. 
I have live access to your enterprise services, optical diagnostics, active orders, and billing history.

How can I assist your business today?`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [escalatedTicket, setEscalatedTicket] = useState(null);
  const [suggestions, setSuggestions] = useState([
    'What is my current bill breakdown?',
    'When will my technician arrive?',
    'Run optical signal diagnostic',
    'How do I add a Static IP?',
    'Connect with Human Support',
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    setInputMessage('');

    // Append user message
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const history = newMessages
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await api.post('/support/chat', {
        message: text,
        history,
      });

      if (res.success && res.data) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: res.data.reply },
        ]);

        if (res.data.escalated && res.data.ticketInfo) {
          setEscalatedTicket(res.data.ticketInfo);
        }

        if (res.data.suggestions && res.data.suggestions.length > 0) {
          setSuggestions(res.data.suggestions);
        }
      } else {
        throw new Error('Unexpected empty response');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but I experienced a momentary connectivity delay with the AI service. If this is an urgent matter, please click **Connect with Human Support** below.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleEscalateDirectly = async () => {
    setIsTyping(true);
    try {
      const res = await api.post('/support/escalate', {
        reason: 'Customer requested human support dispatch from chat widget',
      });
      if (res.success && res.data) {
        setEscalatedTicket(res.data);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `I have escalated your request to our 24x7 Enterprise Network Operations Centre.
• **Ticket ID:** \`${res.data.ticketId}\`
• **Assigned Field Engineer:** **${res.data.assignedAgent}**
• **Phone:** ${res.data.assignedPhone}

A priority field engineer has been notified and will reach out to you within 30 minutes.`,
          },
        ]);
      }
    } catch (err) {
      console.warn('Escalation error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  // Basic formatting helper for bold and bullets
  const formatMessageText = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, idx) => {
      // Bold text replacement
      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
      return (
        <div key={idx} className={line.startsWith('• ') ? 'pl-2 text-slate-700' : 'mb-1'}>
          {parts.map((p, pIdx) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return <strong key={pIdx} className="font-extrabold text-slate-900">{p.slice(2, -2)}</strong>;
            }
            if (p.startsWith('`') && p.endsWith('`')) {
              return <code key={pIdx} className="px-1 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[11px]">{p.slice(1, -1)}</code>;
            }
            return p;
          })}
        </div>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center space-x-2.5 px-4 py-3 rounded-full bg-airtel-600 hover:bg-airtel-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Open AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-airtel-600 rounded-full animate-pulse" />
          </div>
          <span className="text-xs font-extrabold tracking-wide">
            AI Support Assistant
          </span>
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-airtel-700 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-extrabold text-sm text-white">Accel Business AI</h3>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-100 font-bold px-1.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    <span>Online</span>
                  </span>
                </div>
                <p className="text-[11px] text-red-100">
                  {isAuthenticated ? `Account: ${user?.fullName || 'Enterprise Client'}` : 'MSME Advisory & Support'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                title="Minimize Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Escalated Support Ticket Banner */}
          {escalatedTicket && (
            <div className="p-3 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-emerald-900">
                <HardHat className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <div>
                  <div className="font-bold">Engineer Dispatched: {escalatedTicket.assignedAgent}</div>
                  <div className="text-[10px] text-emerald-700 font-mono">Ref: {escalatedTicket.ticketId}</div>
                </div>
              </div>
              <a
                href={`tel:${escalatedTicket.phone || '+919811054321'}`}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center space-x-1 shadow-xs"
              >
                <Phone className="w-3 h-3" />
                <span>Call</span>
              </a>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs leading-relaxed'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="space-y-1">
                      {formatMessageText(msg.content)}
                    </div>
                  ) : (
                    <span>{msg.content}</span>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs p-3 shadow-xs flex items-center space-x-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-airtel-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-airtel-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-airtel-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[11px] text-slate-400 ml-1">Analyzing account records...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            {suggestions.slice(0, 4).map((sug, sIdx) => (
              <button
                key={sIdx}
                type="button"
                disabled={isTyping}
                onClick={() => handleSendMessage(sug)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-red-50 hover:text-airtel-700 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-colors flex-shrink-0"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Footer Input Area */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                placeholder="Ask about bills, technician, signal, or KYC..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isTyping}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="w-9 h-9 rounded-xl bg-airtel-600 hover:bg-airtel-700 disabled:opacity-40 text-white flex items-center justify-center shadow-sm transition-colors flex-shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400">
              <span className="truncate">Grounded in DPDP & DoT verified account data</span>
              <button
                type="button"
                onClick={handleEscalateDirectly}
                className="text-airtel-600 hover:text-airtel-700 font-bold hover:underline ml-1 whitespace-nowrap"
              >
                Connect Human
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AIChatWidget;

