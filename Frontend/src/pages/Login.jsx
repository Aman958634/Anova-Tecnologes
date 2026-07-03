import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Logged in successfully');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="section-shell flex min-h-[80vh] items-center justify-center py-16"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.05, ease: 'easeOut' }}
        className="w-full max-w-md rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,37,91,0.96),rgba(14,44,104,0.96))] p-8 shadow-[0_28px_80px_rgba(5,20,50,0.35)]"
      >
        <div className="mb-6 flex items-center gap-3">
          <img src="/logoanova-white.png" alt="Anova Technologies" className="h-12 w-auto object-contain" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Admin Access</p>
            <p className="text-xl font-semibold text-white">Anova Technologies</p>
          </div>
        </div>
        <h1 className="text-3xl font-semibold text-white">Sign in to the dashboard</h1>
        <p className="mt-3 text-sm leading-6 text-white/70">Use your admin email and password to access the dashboard.</p>

        <form onSubmit={submit} className="mt-8 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-white/85">
            Email
            <input
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="admin@anova.com"
              autoComplete="email"
              className="input-field"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-white/85">
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Your password"
              autoComplete="current-password"
              className="input-field"
            />
          </label>
          <button className="btn-primary justify-center" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        </form>
        <p className="mt-4 text-sm text-slate-300">Default admin credentials are seeded from the backend .env file.</p>
      </motion.div>
    </motion.div>
  );
}
