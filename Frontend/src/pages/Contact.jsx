import { useState, useEffect } from 'react';
import {
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  User,
  FileText,
  MessageSquareText,
  PhoneCall,
  Send
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
};

const contactCards = [
  {
    icon: Mail,
    label: 'Email',
    value: 'anovatechnologies5@gmail.com'
  },
  {
    icon: PhoneCall,
    label: 'Phone',
    value: ['9586342070', '9313327727']
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'India, Gujarat'
  }
];

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const OUTBOX_KEY = 'anova:contact-outbox';

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await api.post('/contact', form);
      setForm(initialForm);
      if (response.data && response.data.mailSent === false) {
        setStatus('success');
        setErrorMessage('Message saved — email delivery failed. Admin can view messages in the dashboard.');
      } else {
        setStatus('success');
      }
    } catch (error) {
      console.error('Contact submit error:', error);
      setStatus('error');
      if (error?.request && !error?.response) {
        // Network error / timeout — enqueue message for retry
        enqueueOutbox(form);
        setErrorMessage('Server is unreachable. Message saved and will be retried when connection returns.');
      } else {
        setErrorMessage(error?.response?.data?.message || 'We could not send your message right now. Please try again.');
      }
    }
  };

  // Outbox helpers: store pending messages in localStorage and retry on focus
  function enqueueOutbox(payload) {
    try {
      const current = JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]');
      current.push({ id: Date.now(), payload, attempts: 0 });
      localStorage.setItem(OUTBOX_KEY, JSON.stringify(current));
    } catch (e) {
      console.error('Failed to enqueue outbox', e);
    }
  }

  async function resendOutbox() {
    try {
      const list = JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]');
      if (!Array.isArray(list) || list.length === 0) return;

      const remaining = [];
      for (const item of list) {
        try {
          await api.post('/contact', item.payload);
        } catch (err) {
          // increment attempts and keep for later (limit attempts to 5)
          item.attempts = (item.attempts || 0) + 1;
          if (item.attempts < 5) remaining.push(item);
        }
      }
      localStorage.setItem(OUTBOX_KEY, JSON.stringify(remaining));
      if (remaining.length === 0) {
        // notify user if any were delivered
        toast?.success?.('Pending messages delivered. Thank you.');
      }
    } catch (e) {
      console.error('Outbox resend failed', e);
    }
  }

  // Retry pending messages when window gains focus
  useEffect(() => {
    const onFocus = () => resendOutbox();
    window.addEventListener('focus', onFocus);
    // try once on mount
    resendOutbox();
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  return (
    <div className="bg-white text-slate-900">
      <section className="bg-white">
        <div className="bg-[#102c66] px-4 py-16 text-center text-white sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-3xl"
          >
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Get In Touch</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Ready to transform your business? Contact us today to discuss your digital needs. Our team is ready to help you succeed online.
            </p>
          </motion.div>
        </div>

        <div className="section-shell py-14 sm:py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start"
          >
            <aside>
              <p className="text-3xl font-semibold tracking-tight text-[#163c88] sm:text-[2.1rem]">Contact Info</p>
              <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
                Reach out to us using any of the following contact methods. We typically respond within 24 hours.
              </p>

              <div className="mt-8 space-y-4">
                {contactCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} className="card-animate flex items-start gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#eef4ff] text-[#2f6df7]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="pt-0.5">
                        <p className="text-sm font-semibold text-[#163c88]">{card.label}</p>
                        {Array.isArray(card.value) ? (
                          <div className="mt-1 space-y-0.5 text-sm leading-6 text-slate-600">
                            {card.value.map((line) => (
                              <p key={line}>{line}</p>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-1 text-sm leading-6 text-slate-600">{card.value}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            <div className="card-animate rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:p-8">
              <p className="text-3xl font-semibold tracking-tight text-[#163c88] sm:text-[2rem]">Send us a Message</p>

              <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldInput icon={User} label="Full Name*" placeholder="John Doe" value={form.name} onChange={updateField('name')} required />
                  <FieldInput icon={Mail} label="Email Address*" placeholder="john@example.com" value={form.email} onChange={updateField('email')} type="email" required />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldInput icon={Phone} label="Phone Number*" placeholder="+91 12345 67890" value={form.phone} onChange={updateField('phone')} required />
                  <FieldInput icon={FileText} label="Subject" placeholder="How can we help?" value={form.subject} onChange={updateField('subject')} />
                </div>

                <label className="grid gap-2 text-sm font-medium text-[#163c88]">
                  Message*
                  <textarea
                    value={form.message}
                    onChange={updateField('message')}
                    required
                    rows="6"
                    placeholder="Tell us about your project requirements..."
                    className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2f6df7] focus:ring-2 focus:ring-[#2f6df7]/10"
                  />
                </label>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#2f6df7] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#245fe0] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === 'loading' ? 'Sending Message...' : 'Send Message'}
                  <Send className="h-4 w-4" />
                </button>

                {status === 'success' ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Your message has been sent successfully. We will contact you shortly.</p> : null}
                {status === 'error' ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p> : null}
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function FieldInput({ className = '', icon: Icon, label, ...props }) {
  return (
    <label className={`grid gap-2 text-sm font-medium text-[#163c88] ${className}`}>
      <span>{label}</span>
      <div className="rounded-md border border-slate-200 bg-white px-3 py-2.5 transition focus-within:border-[#2f6df7] focus-within:ring-2 focus-within:ring-[#2f6df7]/10">
        <div className="flex items-center gap-3">
          {Icon ? <Icon className="h-4 w-4 shrink-0 text-[#2f6df7]" /> : null}
          <input
            {...props}
            className="w-full border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-0"
          />
        </div>
      </div>
    </label>
  );
}
