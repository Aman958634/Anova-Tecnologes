import { useEffect, useMemo, useState } from 'react';
import { MessageCircle, Send, X, Sparkles, Bot, User } from 'lucide-react';
import api from '../services/api';

const QUICK_ACTIONS = [
  'Website Development',
  'Web Application',
  'CRM & ERP',
  'E-commerce',
  'Pricing',
  'Book Free Consultation',
  'Contact Us'
];

const initialMessages = [
  {
    id: 1,
    role: 'assistant',
    text: '👋 Welcome to ANOVA Technology! How can we help you today?'
  }
];

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [sessionId] = useState(() => `site-${Math.random().toString(36).slice(2, 10)}`);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leadMode, setLeadMode] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    project_description: '',
    budget: ''
  });

  const canSubmitLead = useMemo(() => {
    return leadForm.name && leadForm.email && leadForm.project_description;
  }, [leadForm]);

  const appendMessage = (text, role = 'assistant') => {
    setMessages((current) => [...current, { id: Date.now() + Math.random(), role, text }]);
  };

  const handleQuickAction = async (action) => {
    setInput(action);
    await sendMessage(action);
  };

  const sendMessage = async (messageText = input) => {
    const text = (messageText || '').trim();
    if (!text) return;

    appendMessage(text, 'user');
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/chatbot/reply', { message: text, session_id: sessionId });
      const reply = response?.data?.reply || response?.data?.data?.reply || response?.data?.message;
      if (!reply) {
        throw new Error('Invalid chatbot response payload');
      }
      appendMessage(reply, 'assistant');

      if (['book', 'contact', 'consultation', 'project'].some((word) => text.toLowerCase().includes(word))) {
        setLeadMode(true);
        appendMessage('We can collect your project details now. Please share a few details so we can follow up.', 'assistant');
      }
    } catch (error) {
      console.error('Chatbot request failed:', {
        message: error.message,
        response: error?.response?.data || error?.response,
        request: error?.request
      });
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error;
      appendMessage(
        backendMessage || 'Sorry, I could not respond right now. Please try again or contact us directly.',
        'assistant'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const submitLead = async (event) => {
    event.preventDefault();
    if (!canSubmitLead) return;

    setIsLoading(true);

    try {
      const response = await api.post('/chatbot/lead', leadForm);
      appendMessage(response?.data?.message || 'Thanks! We received your project inquiry.', 'assistant');
      setLeadForm({ name: '', email: '', phone: '', company: '', project_description: '', budget: '' });
      setLeadMode(false);
    } catch (error) {
      appendMessage(error?.response?.data?.message || 'We could not save your inquiry right now.', 'assistant');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      const el = document.getElementById('chatbot-end');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 80);
    return () => clearTimeout(timer);
  }, [messages, isOpen]);

  return (
    <div className="fixed bottom-4 right-4 z-[60]">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 rounded-full bg-[#163c88] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(22,60,136,0.28)] transition hover:bg-[#102c66]"
        >
          <MessageCircle className="h-5 w-5" />
          <span>Talk to ANOVA</span>
        </button>
      ) : (
        <div className="w-[min(92vw,380px)] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-between bg-[#102c66] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-white/15">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">ANOVA Assistant</p>
                <p className="text-xs text-slate-200">Online now</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-full p-2 hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto bg-[#f7f9fc] p-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 ${message.role === 'user' ? 'bg-[#163c88] text-white' : 'bg-white text-slate-700 shadow-sm'}`}>
                  {message.text}
                </div>
              </div>
            ))}

            {isLoading ? (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
                  <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 animate-pulse" /> Thinking...</span>
                </div>
              </div>
            ) : null}

            {!leadMode ? (
              <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <button key={action} onClick={() => handleQuickAction(action)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-[#163c88] hover:text-[#163c88]">
                    {action}
                  </button>
                ))}
              </div>
            ) : null}

            <div id="chatbot-end" />
          </div>

          <form onSubmit={(event) => { event.preventDefault(); leadMode ? submitLead(event) : sendMessage(); }} className="border-t border-slate-200 bg-white p-3">
            {leadMode ? (
              <div className="mb-3 space-y-2 text-sm text-slate-600">
                <input value={leadForm.name} onChange={(event) => setLeadForm((current) => ({ ...current, name: event.target.value }))} placeholder="Your name" className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-[#163c88]" />
                <input type="email" value={leadForm.email} onChange={(event) => setLeadForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email address" className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-[#163c88]" />
                <input value={leadForm.phone} onChange={(event) => setLeadForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone" className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-[#163c88]" />
                <input value={leadForm.company} onChange={(event) => setLeadForm((current) => ({ ...current, company: event.target.value }))} placeholder="Company" className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-[#163c88]" />
                <textarea value={leadForm.project_description} onChange={(event) => setLeadForm((current) => ({ ...current, project_description: event.target.value }))} placeholder="Project description" rows="3" className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-[#163c88]" />
                <input value={leadForm.budget} onChange={(event) => setLeadForm((current) => ({ ...current, budget: event.target.value }))} placeholder="Budget (optional)" className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-[#163c88]" />
              </div>
            ) : null}

            <div className="flex items-center gap-2">
              <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={leadMode ? 'Project details...' : 'Type your message...'} className="w-full rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#163c88]" />
              <button type="submit" disabled={isLoading || (!leadMode && !input.trim()) || (leadMode && !canSubmitLead)} className="rounded-full bg-[#163c88] p-2.5 text-white disabled:cursor-not-allowed disabled:opacity-60">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ChatbotWidget;
