import { useState } from 'react';
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
        setErrorMessage('Server is unreachable. Please try again later.');
      } else {
        setErrorMessage(error?.response?.data?.message || 'We could not send your message right now. Please try again.');
      }
    }
  };

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
