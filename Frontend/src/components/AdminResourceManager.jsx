import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import api from '../services/api';
import { buildImageUrl, formatDate } from '../utils/helpers';
import SectionHeading from './SectionHeading';

const initialForms = {
  services: { id: null, title: '', description: '', icon: '', key_features: '', image_url: '', featured: false, image: null },
  projects: { id: null, title: '', description: '', live_demo_url: '', tags: '', featured: false, image: null, image_url: '', remove_image: false },
  team: { id: null, name: '', designation: '', featured: false, image: null, image_url: '', remove_image: false },
  blogs: { id: null, title: '', excerpt: '', content: '', category: '', published_at: '', image: null },
  testimonials: { id: null, name: '', designation: '', review: '', rating: 5, photo_url: '', photo: null }
};

const endpoints = {
  services: '/services',
  projects: '/projects',
  team: '/team',
  blogs: '/blogs',
  testimonials: '/testimonials',
  contacts: '/contact'
};

function TableHeader({ columns }) {
  return (
    <thead className="bg-[#edf4ff] text-left text-xs uppercase tracking-[0.2em] text-[#2f5ea8]">
      <tr>
        {columns.map((column) => (
          <th key={column} className="px-4 py-3 font-semibold">{column}</th>
        ))}
      </tr>
    </thead>
  );
}

export default function AdminResourceManager({ resource, title, description }) {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [query, setQuery] = useState('');
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [form, setForm] = useState(initialForms[resource] || {});
  const [isFormOpen, setIsFormOpen] = useState(false);

  const endpoint = endpoints[resource];
  const supportsForm = resource !== 'contacts';
  const supportsPagination = resource !== 'testimonials';

  const totalPages = useMemo(() => {
    if (!supportsPagination) return 1;
    return Math.max(1, Math.ceil(meta.total / meta.limit));
  }, [meta.limit, meta.total, supportsPagination]);

  const resetForm = () => setForm(initialForms[resource] || {});

  const openNewForm = () => {
    resetForm();
    setPreviewUrl(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    resetForm();
    if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setIsFormOpen(false);
  };

  const notifyDataUpdated = () => {
    const stamp = String(Date.now());
    try {
      localStorage.setItem('anova:data-updated', stamp);
    } catch {
      // Ignore localStorage errors in private mode or restricted environments.
    }
    window.dispatchEvent(new CustomEvent('anova:data-updated', { detail: { resource, stamp } }));
  };

  const fetchRows = async () => {
    try {
      const params = {
        search: query || undefined,
        page: supportsPagination ? meta.page : undefined,
        limit: supportsPagination ? meta.limit : undefined
      };
      const response = await api.get(endpoint, { params });
      const data = response.data?.data || [];
      setRows(data);
      if (supportsPagination) {
        setMeta((current) => ({
          ...current,
          total: response.data?.meta?.total || 0
        }));
      } else {
        setMeta((current) => ({ ...current, total: data.length }));
      }
    } catch {
      toast.error(`Failed to load ${resource}`);
    }
  };

  useEffect(() => {
    resetForm();
    setIsFormOpen(false);
    setQuery('');
    setMeta((current) => ({ ...current, page: 1 }));
  }, [resource]);

  useEffect(() => {
    fetchRows();
  }, [resource, meta.page, query]);

  const onEdit = (row) => {
    if (resource === 'projects') {
      setForm({
        ...row,
        tags: Array.isArray(row.tags) ? row.tags.join(', ') : row.tags || '',
        image: null,
        remove_image: false
      });
      setPreviewUrl(row.image_url ? buildImageUrl(row.image_url) : null);
      setIsFormOpen(true);
      return;
    }
    if (resource === 'team') {
      setForm({ ...row, image: null, remove_image: false });
      setIsFormOpen(true);
      return;
    }
    if (resource === 'blogs') {
      setForm({ ...row, image: null, published_at: row.published_at ? String(row.published_at).slice(0, 10) : '' });
      setIsFormOpen(true);
      return;
    }
    if (resource === 'services') {
      setForm({ ...row, key_features: Array.isArray(row.key_features) ? row.key_features.join(', ') : row.key_features || '', image: null });
      setPreviewUrl(row.image_url ? buildImageUrl(row.image_url) : null);
      setIsFormOpen(true);
      return;
    }
    if (resource === 'testimonials') {
      setForm({ ...row, photo_url: row.photo_url || '', photo: null });
      setPreviewUrl(row.photo_url ? buildImageUrl(row.photo_url) : null);
      setIsFormOpen(true);
    }
  };

  const isPlaceholderImageUrl = (value) => {
    if (!value) return false;
    return typeof value === 'string' && value.includes('images.unsplash.com');
  };

  const buildPayload = () => {
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'id' || value === null || value === undefined) return;
      if (key === 'image' && value) {
        payload.append('image', value);
        return;
      }
      if (key === 'photo' && value) {
        payload.append('photo', value);
        return;
      }
      if ((key === 'image_url' || key === 'photo_url') && isPlaceholderImageUrl(value)) {
        return;
      }
      // Ensure tags and key_features are sent as JSON arrays when provided as comma-separated strings
      if (key === 'tags' && typeof value === 'string') {
        const arr = value.split(',').map((s) => s.trim()).filter(Boolean);
        payload.append('tags', JSON.stringify(arr));
        return;
      }
      if (key === 'key_features' && typeof value === 'string') {
        const arr = value.split(',').map((s) => s.trim()).filter(Boolean);
        payload.append('key_features', JSON.stringify(arr));
        return;
      }
      payload.append(key, typeof value === 'boolean' ? String(value) : value);
    });
    return payload;
  };

  const buildFormDataFrom = (obj) => {
    const payload = new FormData();
    Object.entries(obj).forEach(([key, value]) => {
      if (key === 'id' || value === null || value === undefined) return;
      if (key === 'image' && value) {
        payload.append('image', value);
        return;
      }
      if (key === 'photo' && value) {
        payload.append('photo', value);
        return;
      }
      if ((key === 'image_url' || key === 'photo_url') && isPlaceholderImageUrl(value)) {
        return;
      }
      if (key === 'tags' && typeof value === 'string') {
        const arr = value.split(',').map((s) => s.trim()).filter(Boolean);
        payload.append('tags', JSON.stringify(arr));
        return;
      }
      if (key === 'key_features' && typeof value === 'string') {
        const arr = value.split(',').map((s) => s.trim()).filter(Boolean);
        payload.append('key_features', JSON.stringify(arr));
        return;
      }
      payload.append(key, typeof value === 'boolean' ? String(value) : value);
    });
    return payload;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!supportsForm) return;

    setBusy(true);
    try {
      const method = form.id ? 'put' : 'post';
      const url = `${endpoint}${form.id ? `/${form.id}` : ''}`;
      // Let the browser set `Content-Type` with proper boundary for FormData.
      const response = await api[method](url, buildPayload());
      // store image override so public pages show the newly uploaded image immediately after refresh
      // no persistent preview override — do not store preview across refresh
      toast.success(`${title} saved successfully`);
      closeForm();
      fetchRows();
      notifyDataUpdated();
      // update preview if server returned image url
      const returnedImageUrl = response?.data?.image_url || response?.data?.data?.image_url || response?.data?.image_url;
      if (returnedImageUrl) {
        setPreviewUrl(buildImageUrl(returnedImageUrl));
      }
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id) => {
    try {
      await api.delete(`${endpoint}/${id}`);
      toast.success('Deleted successfully');
      fetchRows();
      notifyDataUpdated();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleRemoveImage = async () => {
    // If new form (no id), just clear preview and mark remove_image
    if (!form.id) {
      if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setForm((current) => ({ ...current, image: null, remove_image: true }));
      return;
    }

    // For existing resource, send update with remove_image = true
    try {
      setBusy(true);
      const payloadObj = { ...form, remove_image: true, image: null };
      const payload = buildFormDataFrom(payloadObj);
      const response = await api.put(`${endpoint}/${form.id}`, payload);
      toast.success('Image removed');
      // update local form state to reflect removed image
      setForm((current) => ({ ...current, image_url: response.data.image_url || null, remove_image: false, image: null }));
      if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      fetchRows();
      notifyDataUpdated();
    } catch (e) {
      toast.error('Failed to remove image');
    } finally {
      setBusy(false);
    }
  };

  const tableColumns = {
    services: [
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description' },
      { key: 'icon', label: 'Icon' },
      { key: 'key_features', label: 'Features' },
      { key: 'image_url', label: 'Image URL' },
      { key: 'featured', label: 'Featured' }
    ],
    projects: [
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description' },
      { key: 'live_demo_url', label: 'Demo URL' },
      { key: 'tags', label: 'Tags' },
      { key: 'featured', label: 'Featured' }
    ],
    team: [
      { key: 'name', label: 'Name' },
      { key: 'designation', label: 'Designation' },
      { key: 'featured', label: 'Featured' }
    ],
    blogs: [
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'published_at', label: 'Published At' },
      { key: 'excerpt', label: 'Excerpt' }
    ],
    testimonials: [
      { key: 'name', label: 'Name' },
      { key: 'designation', label: 'Designation' },
      { key: 'rating', label: 'Rating' },
      { key: 'review', label: 'Review' }
    ],
    contacts: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'subject', label: 'Subject' },
      { key: 'created_at', label: 'Date' }
    ]
  };

  const columns = tableColumns[resource] || [];

  const renderCellValue = (column, row) => {
    const value = row[column.key];

    switch (column.key) {
      case 'featured':
        return value ? 'Yes' : 'No';
      case 'tags':
        return Array.isArray(value) ? value.join(', ') : String(value || '');
      case 'key_features':
        return Array.isArray(value) ? value.join(', ') : String(value || '');
      case 'published_at':
        return value ? formatDate(value) : '-';
      case 'created_at':
        return value ? formatDate(value) : '-';
      case 'live_demo_url':
        return value ? <a className="text-blue-600 hover:underline" href={String(value)} target="_blank" rel="noreferrer">{String(value)}</a> : '-';
      case 'image_url':
        return value ? (
          <a href={buildImageUrl(value)} target="_blank" rel="noreferrer">
            <img
              src={buildImageUrl(value)}
              alt={row.title || 'image'}
              onError={(e) => { e.currentTarget.src = buildImageUrl(null); }}
              className="h-16 w-24 rounded-md object-cover bg-[#f3f7ff]"
            />
          </a>
        ) : '-';
      case 'email':
        return value ? <a className="text-blue-600 hover:underline" href={`mailto:${String(value)}`}>{String(value)}</a> : '-';
      case 'subject':
        return value ? String(value) : '-';
      default:
        return value !== null && value !== undefined ? String(value) : '-';
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Admin Panel"
        title={title}
        description={description}
      />

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#d9e7ff] bg-white p-4 shadow-[0_12px_28px_rgba(47,109,247,0.08)]">
        <Search className="h-4 w-4 text-[#2f6df7]" />
        <input
          value={query}
          onChange={(event) => {
            setMeta((current) => ({ ...current, page: 1 }));
            setQuery(event.target.value);
          }}
          placeholder={`Search ${resource}`}
          className="min-w-[220px] flex-1 rounded-xl border border-[#dbe7ff] bg-[#f8fbff] px-3 py-2 text-sm text-[#163c88] outline-none focus:border-[#2f6df7]"
        />
        {supportsForm ? (
          <button
            type="button"
            onClick={openNewForm}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2f6df7] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2458d0]"
          >
            <Plus className="h-4 w-4" /> New
          </button>
        ) : null}
      </div>

      {supportsForm && isFormOpen ? (
        <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-[#d9e7ff] bg-white p-5 shadow-[0_12px_28px_rgba(47,109,247,0.08)] md:grid-cols-2">
          {resource === 'services' ? (
            <>
              <input className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none" value={form.title || ''} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Service title" required />
              <input className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none" value={form.icon || ''} onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))} placeholder="Icon name" />
              <textarea className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none md:col-span-2" rows="4" value={form.description || ''} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" required />
              <input className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none md:col-span-2" value={form.key_features || ''} onChange={(event) => setForm((current) => ({ ...current, key_features: event.target.value }))} placeholder="Key features (comma separated)" />
              <input type="url" className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none" value={form.image_url || ''} onChange={(event) => setForm((current) => ({ ...current, image_url: event.target.value }))} placeholder="Image URL (https://...)" />
              <button type="button" className="ml-2 text-sm text-[#1e4db8] underline" onClick={() => {
                if (form.image_url) setPreviewUrl(buildImageUrl(form.image_url));
              }}>Preview URL</button>
              <input type="file" accept="image/*" onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setForm((current) => ({ ...current, image: file, remove_image: false }));
                if (file) {
                  const url = URL.createObjectURL(file);
                  setPreviewUrl((old) => {
                    if (old && old.startsWith('blob:')) URL.revokeObjectURL(old);
                    return url;
                  });
                }
              }} className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88]" />
              {previewUrl ? (
                <div className="md:col-span-2 mt-2 relative">
                  <button type="button" onClick={handleRemoveImage} className="absolute right-2 top-2 z-10 inline-flex items-center gap-2 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100">Delete image</button>
                  <img src={previewUrl} alt="preview" onError={(e) => { e.currentTarget.src = buildImageUrl(null); }} className="h-32 w-full rounded-md object-cover bg-white" />
                </div>
              ) : null}
              <label className="flex items-center gap-2 text-sm text-[#163c88]"><input type="checkbox" checked={Boolean(form.featured)} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} /> Featured</label>
            </>
          ) : null}

          {resource === 'projects' ? (
            <>
              <input className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none" value={form.title || ''} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Project title" required />
              <input className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none" value={form.live_demo_url || ''} onChange={(event) => setForm((current) => ({ ...current, live_demo_url: event.target.value }))} placeholder="Live demo URL" />
              <textarea className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none md:col-span-2" rows="4" value={form.description || ''} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" required />
              <input className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none md:col-span-2" value={form.tags || ''} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="Tags (comma separated)" />
              <input type="file" accept="image/*" onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setForm((current) => ({ ...current, image: file, remove_image: false }));
                if (file) {
                  const url = URL.createObjectURL(file);
                  setPreviewUrl((old) => {
                    if (old && old.startsWith('blob:')) URL.revokeObjectURL(old);
                    return url;
                  });
                }
              }} className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88]" />
              {previewUrl ? (
                <div className="md:col-span-2 mt-2 relative">
                  <button type="button" onClick={handleRemoveImage} className="absolute right-2 top-2 z-10 inline-flex items-center gap-2 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100">Delete image</button>
                  <img src={previewUrl} alt="preview" onError={(e) => { e.currentTarget.src = buildImageUrl(null); }} className="h-32 w-full rounded-md object-cover bg-white" />
                </div>
              ) : null}
              <label className="flex items-center gap-2 text-sm text-[#163c88]"><input type="checkbox" checked={Boolean(form.featured)} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} /> Featured</label>
              {form.id ? (
                <label className="flex items-center gap-2 text-sm text-[#163c88] md:col-span-2"><input type="checkbox" checked={Boolean(form.remove_image)} onChange={(event) => setForm((current) => ({ ...current, remove_image: event.target.checked }))} /> Remove current image</label>
              ) : null}
            </>
          ) : null}

          {resource === 'team' ? (
            <>
              <input className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none" value={form.name || ''} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Member name" required />
              <input className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none" value={form.designation || ''} onChange={(event) => setForm((current) => ({ ...current, designation: event.target.value }))} placeholder="Designation" required />
              <input type="file" accept="image/*" onChange={(event) => setForm((current) => ({ ...current, image: event.target.files?.[0] || null, remove_image: false }))} className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] md:col-span-2" />
              <label className="flex items-center gap-2 text-sm text-[#163c88]"><input type="checkbox" checked={Boolean(form.featured)} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} /> Featured</label>
              {form.id ? (
                <label className="flex items-center gap-2 text-sm text-[#163c88]"><input type="checkbox" checked={Boolean(form.remove_image)} onChange={(event) => setForm((current) => ({ ...current, remove_image: event.target.checked }))} /> Remove current image</label>
              ) : null}
            </>
          ) : null}

          {resource === 'blogs' ? (
            <>
              <input className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none" value={form.title || ''} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Blog title" required />
              <input className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none" value={form.category || ''} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} placeholder="Category" required />
              <input type="date" className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none" value={form.published_at || ''} onChange={(event) => setForm((current) => ({ ...current, published_at: event.target.value }))} />
              <input type="file" accept="image/*" onChange={(event) => setForm((current) => ({ ...current, image: event.target.files?.[0] || null }))} className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88]" />
              <textarea className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none md:col-span-2" rows="3" value={form.excerpt || ''} onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))} placeholder="Excerpt" required />
              <textarea className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none md:col-span-2" rows="5" value={form.content || ''} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} placeholder="Content" />
            </>
          ) : null}

          {resource === 'testimonials' ? (
            <>
              <input className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none" value={form.name || ''} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Name" required />
              <input className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none" value={form.designation || ''} onChange={(event) => setForm((current) => ({ ...current, designation: event.target.value }))} placeholder="Designation" required />
              <input type="number" min="1" max="5" className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none" value={form.rating || 5} onChange={(event) => setForm((current) => ({ ...current, rating: event.target.value }))} placeholder="Rating" />
              <input type="url" className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none" value={form.photo_url || ''} onChange={(event) => setForm((current) => ({ ...current, photo_url: event.target.value }))} placeholder="Client photo URL (https://...)" />
              <input type="file" accept="image/*" onChange={(event) => setForm((current) => ({ ...current, photo: event.target.files?.[0] || null }))} className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88]" />
              <textarea className="rounded-xl border border-[#dbe7ff] px-3 py-2 text-sm text-[#163c88] outline-none md:col-span-2" rows="4" value={form.review || ''} onChange={(event) => setForm((current) => ({ ...current, review: event.target.value }))} placeholder="Review" required />
            </>
          ) : null}

          <div className="flex gap-2 md:col-span-2">
            <button type="submit" disabled={busy} className="inline-flex flex-1 items-center justify-center rounded-xl bg-[#2f6df7] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2458d0] disabled:opacity-50">
              {busy ? 'Saving...' : form.id ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={closeForm} className="inline-flex items-center justify-center rounded-xl border border-[#d9e7ff] bg-[#f2f7ff] px-4 py-2 text-sm font-semibold text-[#1e4db8] transition hover:bg-[#e8f1ff]">
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-[#d9e7ff] bg-white shadow-[0_12px_28px_rgba(47,109,247,0.08)]">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#4a648f]">
            No records found. Click + New to add data for this section.
          </div>
        ) : (
          <table className="min-w-full text-sm text-[#163c88]">
            <TableHeader columns={[...columns.map((column) => column.label), 'Actions']} />
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-[#e6efff] hover:bg-[#f8fbff]">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 align-top max-w-[260px] break-words">
                      {renderCellValue(column, row)}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    {supportsForm ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => onEdit(row)} className="inline-flex items-center gap-1 rounded-lg bg-[#edf4ff] px-3 py-2 text-sm text-[#2f6df7] transition hover:bg-[#dceaff]">
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                        <button onClick={() => onDelete(row.id)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 transition hover:bg-red-100">
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => onDelete(row.id)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 transition hover:bg-red-100">
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {supportsPagination ? (
        <div className="flex items-center justify-between rounded-2xl border border-[#d9e7ff] bg-white p-4 text-sm text-[#163c88] shadow-[0_12px_28px_rgba(47,109,247,0.08)]">
          <button
            type="button"
            disabled={meta.page <= 1}
            onClick={() => setMeta((current) => ({ ...current, page: current.page - 1 }))}
            className="rounded-lg bg-[#edf4ff] px-3 py-2 disabled:opacity-40"
          >
            Previous
          </button>
          <span>Page {meta.page} of {totalPages}</span>
          <button
            type="button"
            disabled={meta.page >= totalPages}
            onClick={() => setMeta((current) => ({ ...current, page: current.page + 1 }))}
            className="rounded-lg bg-[#edf4ff] px-3 py-2 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}