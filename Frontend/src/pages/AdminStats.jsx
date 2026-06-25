import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../layouts/AdminLayout';
import SectionHeading from '../components/SectionHeading';
import api from '../services/api';

const initialForm = {
  projects_completed: '',
  happy_clients: '',
  years_experience: '',
  team_members: ''
};

export default function AdminStats() {
  const [form, setForm] = useState(initialForm);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/stats')
      .then((response) => {
        setForm({
          projects_completed: response.data.projects_completed || '156+',
          happy_clients: response.data.happy_clients || '200+',
          years_experience: response.data.years_experience || '8+',
          team_members: response.data.team_members || '14'
        });
      })
      .catch(() => toast.error('Failed to load stats'));
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await api.put('/stats', form);
      const stamp = String(Date.now());
      try {
        localStorage.setItem('anova:data-updated', stamp);
      } catch {
        // Ignore localStorage errors
      }
      window.dispatchEvent(new CustomEvent('anova:data-updated', { detail: { resource: 'stats', stamp } }));
      toast.success('Stats updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update stats');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Admin Panel"
          title="Manage About Stats"
          description="Update the four counters shown in the About page stats strip."
        />

        <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-[#d9e7ff] bg-white p-5 shadow-[0_12px_28px_rgba(47,109,247,0.08)] md:grid-cols-2">
          <input
            className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none"
            value={form.projects_completed}
            onChange={(event) => setForm((current) => ({ ...current, projects_completed: event.target.value }))}
            placeholder="Projects Completed (e.g. 156+)"
            required
          />
          <input
            className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none"
            value={form.happy_clients}
            onChange={(event) => setForm((current) => ({ ...current, happy_clients: event.target.value }))}
            placeholder="Happy Clients (e.g. 200+)"
            required
          />
          <input
            className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none"
            value={form.years_experience}
            onChange={(event) => setForm((current) => ({ ...current, years_experience: event.target.value }))}
            placeholder="Years Experience (e.g. 8+)"
            required
          />
          <input
            className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none"
            value={form.team_members}
            onChange={(event) => setForm((current) => ({ ...current, team_members: event.target.value }))}
            placeholder="Team Members (e.g. 14)"
            required
          />

          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center rounded-xl bg-[#2f6df7] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2458d0] disabled:opacity-50 md:col-span-2"
          >
            {busy ? 'Saving...' : 'Save Stats'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
