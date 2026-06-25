import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Mail, Newspaper, Shapes, Star, Users } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import api from '../services/api';
import SectionHeading from '../components/SectionHeading';

const cards = [
  { label: 'Services', key: 'services', to: '/admin/services', icon: Shapes },
  { label: 'Projects', key: 'projects', to: '/admin/projects', icon: FolderKanban },
  { label: 'Team', key: 'team', to: '/admin/team', icon: Users },
  { label: 'Blogs', key: 'blogs', to: '/admin/blogs', icon: Newspaper },
  { label: 'Testimonials', key: 'testimonials', to: '/admin/testimonials', icon: Star },
  { label: 'Contacts', key: 'contacts', to: '/admin/contacts', icon: Mail }
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ services: 0, projects: 0, team: 0, blogs: 0, testimonials: 0, contacts: 0 });

  useEffect(() => {
    api.get('/admin/stats').then((response) => setStats(response.data)).catch(() => null);
  }, []);

  const totals = useMemo(
    () => cards.reduce((acc, card) => acc + (Number(stats[card.key]) || 0), 0),
    [stats]
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Admin Dashboard"
          title="Website Management"
          description="Use dedicated pages to add, edit, and delete all admin data in one clean workflow."
        />

        <div className="rounded-2xl border border-[#d9e7ff] bg-white p-5 text-[#163c88] shadow-[0_12px_28px_rgba(47,109,247,0.08)]">
          <p className="text-sm uppercase tracking-[0.22em] text-[#2f6df7]">Total Managed Records</p>
          <p className="mt-2 text-4xl font-semibold">{totals}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.key}
              to={card.to}
              className="rounded-2xl border border-[#d9e7ff] bg-white p-5 text-[#163c88] shadow-[0_12px_28px_rgba(47,109,247,0.08)] transition hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm uppercase tracking-[0.2em] text-[#2f6df7]">{card.label}</p>
                <card.icon className="h-5 w-5 text-[#2f6df7]" />
              </div>
              <p className="mt-3 text-3xl font-semibold">{stats[card.key] || 0}</p>
              <p className="mt-2 text-sm text-[#4a648f]">Open {card.label} page</p>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
