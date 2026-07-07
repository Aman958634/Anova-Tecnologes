import { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AdminChatbotLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const response = await api.get('/chatbot/leads');
      setLeads(response?.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const deleteLead = async (id) => {
    try {
      await api.delete(`/chatbot/leads/${id}`);
      toast.success('Lead deleted');
      fetchLeads();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Chatbot Leads</h2>
        <p className="mt-2 text-sm text-slate-600">Manage project inquiries collected from the website chatbot.</p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading leads...</div>
      ) : leads.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">No chatbot leads yet.</div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div key={lead.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{lead.name}</p>
                  <p className="text-sm text-slate-600">{lead.email}</p>
                </div>
                <button onClick={() => deleteLead(lead.id)} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50">Delete</button>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <p><span className="font-medium">Phone:</span> {lead.phone || '—'}</p>
                <p><span className="font-medium">Company:</span> {lead.company || '—'}</p>
                <p><span className="font-medium">Budget:</span> {lead.budget || '—'}</p>
                <p><span className="font-medium">Source:</span> {lead.source || 'website_chat'}</p>
              </div>
              <p className="mt-3 text-sm text-slate-700"><span className="font-medium">Project:</span> {lead.project_description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  </AdminLayout>
  );
}
