'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Plus, Edit, Trash2, MoveUp, MoveDown, Save, X, Loader2,
  AlertTriangle, Wrench, Sparkles, Building2, Palette, Landmark,
  Paintbrush, Shield, Eye, Cuboid,
} from 'lucide-react';

interface Service {
  id: string;
  title: { ar: string; kurd: string; en: string };
  description: { ar: string; kurd: string; en: string };
  longDescription: { ar: string; kurd: string; en: string };
  icon: string;
  image: string;
  order: number;
  features: { ar: string; kurd: string; en: string }[];
}

const iconOptions = [
  'Shield', 'Building2', 'Palette', 'Landmark', 'Paintbrush',
  'Wrench', 'Cuboid', 'Eye', 'Sparkles', 'Star', 'Home', 'Zap',
];

const iconComponents: Record<string, React.ReactNode> = {
  Shield: <Shield className="w-4 h-4" />,
  Building2: <Building2 className="w-4 h-4" />,
  Palette: <Palette className="w-4 h-4" />,
  Landmark: <Landmark className="w-4 h-4" />,
  Paintbrush: <Paintbrush className="w-4 h-4" />,
  Wrench: <Wrench className="w-4 h-4" />,
  Cuboid: <Cuboid className="w-4 h-4" />,
  Eye: <Eye className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,

  Home: <HomeIcon className="w-4 h-4" />,
  Zap: <ZapIcon className="w-4 h-4" />,
};

function HomeIcon({ className }: { className?: string }) {
  return <Building2 className={className} />;
}
function ZapIcon({ className }: { className?: string }) {
  return <Sparkles className={className} />;
}

const emptyMultilingual = { ar: '', kurd: '', en: '' };

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Service> | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newService, setNewService] = useState({
    title: { ...emptyMultilingual },
    description: { ...emptyMultilingual },
    longDescription: { ...emptyMultilingual },
    icon: 'Sparkles',
    image: '',
    order: 0,
    features: [] as { ar: string; kurd: string; en: string }[],
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/services');
      if (!res.ok) throw new Error('Failed to fetch');
      setServices(await res.json());
    } catch {
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const startEdit = (service: Service) => {
    setEditingId(service.id);
    setEditData({
      title: { ...service.title },
      description: { ...service.description },
      longDescription: { ...service.longDescription },
      icon: service.icon,
      image: service.image,
      order: service.order,
      features: [...service.features],
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  const saveEdit = async (id: string) => {
    if (!editData) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success('Service updated');
      cancelEdit();
      fetchServices();
    } catch {
      toast.error('Failed to update service');
    } finally {
      setSaving(false);
    }
  };

  const addService = async () => {
    if (!newService.title.ar || !newService.title.en) {
      toast.error('Title in Arabic and English is required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService),
      });
      if (!res.ok) throw new Error('Failed to create');
      toast.success('Service added');
      setShowAddForm(false);
      setNewService({
        title: { ...emptyMultilingual },
        description: { ...emptyMultilingual },
        longDescription: { ...emptyMultilingual },
        icon: 'Sparkles',
        image: '',
        order: services.length,
        features: [],
      });
      fetchServices();
    } catch {
      toast.error('Failed to add service');
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async (id: string) => {
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Service deleted');
      setDeleteConfirm(null);
      fetchServices();
    } catch {
      toast.error('Failed to delete service');
    }
  };

  const moveService = async (id: string, direction: 'up' | 'down') => {
    const idx = services.findIndex(s => s.id === id);
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= services.length) return;

    const updated = [...services];
    [updated[idx].order, updated[target].order] = [updated[target].order, updated[idx].order];

    try {
      await Promise.all([
        fetch(`/api/services/${updated[idx].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: updated[idx].order }),
        }),
        fetch(`/api/services/${updated[target].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: updated[target].order }),
        }),
      ]);
      fetchServices();
    } catch {
      toast.error('Failed to reorder');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Services</h2>
          <p className="text-sm text-white/40 mt-1">{services.length} services</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-gold text-primary font-semibold rounded-xl px-4 py-2.5 hover:bg-gold-400 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Cancel' : 'Add Service'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center py-12">
          <AlertTriangle className="w-10 h-10 text-gold/40 mb-3" />
          <p className="text-white/40 mb-3">{error}</p>
          <button onClick={fetchServices} className="px-4 py-2 bg-gold/10 text-gold rounded-lg hover:bg-gold/20 text-sm">
            Try Again
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && !error && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-primary-200 border border-white/5 rounded-2xl p-4">
              <div className="w-48 h-4 skeleton mb-2" />
              <div className="w-96 h-3 skeleton" />
            </div>
          ))}
        </div>
      )}

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-primary-200 border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white">New Service</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['ar', 'kurd', 'en'] as const).map(lang => (
                  <div key={lang}>
                    <label className="block text-xs text-white/40 mb-1 capitalize">{lang}</label>
                    <input
                      type="text"
                      value={newService.title[lang]}
                      onChange={e => setNewService(prev => ({ ...prev, title: { ...prev.title, [lang]: e.target.value } }))}
                      placeholder={`Title (${lang})`}
                      className="w-full bg-primary/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50"
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['ar', 'kurd', 'en'] as const).map(lang => (
                  <div key={lang}>
                    <label className="block text-xs text-white/40 mb-1 capitalize">{lang}</label>
                    <textarea
                      value={newService.description[lang]}
                      onChange={e => setNewService(prev => ({ ...prev, description: { ...prev.description, [lang]: e.target.value } }))}
                      placeholder={`Description (${lang})`}
                      rows={2}
                      className="w-full bg-primary/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 resize-none"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1">Icon</label>
                  <select
                    value={newService.icon}
                    onChange={e => setNewService(prev => ({ ...prev, icon: e.target.value }))}
                    className="bg-primary/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50"
                  >
                    {iconOptions.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-white/40 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={newService.image}
                    onChange={e => setNewService(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://..."
                    className="w-full bg-primary/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={addService}
                  disabled={saving}
                  className="flex items-center gap-2 bg-gold text-primary font-semibold rounded-xl px-4 py-2 hover:bg-gold-400 transition-colors text-sm disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add Service
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Services List */}
      {!loading && !error && services.length > 0 && (
        <div className="space-y-3">
          {services.map((service, idx) => (
            <div
              key={service.id}
              className="bg-primary-200 border border-white/5 rounded-2xl p-4"
            >
              {editingId === service.id && editData ? (
                /* Edit Mode */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(['ar', 'kurd', 'en'] as const).map(lang => (
                      <div key={lang}>
                        <label className="block text-xs text-white/40 mb-1 capitalize">{lang} Title</label>
                        <input
                          type="text"
                          value={editData.title?.[lang] || ''}
                          onChange={e => setEditData(prev => prev ? { ...prev, title: { ...prev.title!, [lang]: e.target.value } } : null)}
                          className="w-full bg-primary/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(['ar', 'kurd', 'en'] as const).map(lang => (
                      <div key={lang}>
                        <label className="block text-xs text-white/40 mb-1 capitalize">{lang} Description</label>
                        <textarea
                          value={editData.description?.[lang] || ''}
                          onChange={e => setEditData(prev => prev ? { ...prev, description: { ...prev.description!, [lang]: e.target.value } } : null)}
                          rows={2}
                          className="w-full bg-primary/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 resize-none"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={editData.icon || 'Sparkles'}
                      onChange={e => setEditData(prev => prev ? { ...prev, icon: e.target.value } : null)}
                      className="bg-primary/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                    >
                      {iconOptions.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                    <input
                      type="text"
                      value={editData.image || ''}
                      onChange={e => setEditData(prev => prev ? { ...prev, image: e.target.value } : null)}
                      placeholder="Image URL"
                      className="flex-1 bg-primary/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={cancelEdit} className="px-3 py-2 text-sm text-white/60 hover:text-white rounded-lg transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={() => saveEdit(service.id)}
                      disabled={saving}
                      className="flex items-center gap-2 bg-gold text-primary rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveService(service.id, 'up')}
                      disabled={idx === 0}
                      className="text-white/20 hover:text-white disabled:opacity-10 transition-colors"
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveService(service.id, 'down')}
                      disabled={idx === services.length - 1}
                      className="text-white/20 hover:text-white disabled:opacity-10 transition-colors"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                    <div className="text-gold">{iconComponents[service.icon] || <Sparkles className="w-4 h-4" />}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{service.title.en || service.title.ar}</p>
                    <p className="text-xs text-white/40 truncate">{service.description.en || service.description.ar}</p>
                  </div>
                  <span className="text-xs text-white/20">#{service.order}</span>
                  <button
                    onClick={() => startEdit(service)}
                    className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(service.id)}
                    className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && services.length === 0 && !showAddForm && (
        <div className="text-center py-16">
          <Wrench className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/40 mb-4">No services added yet</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 bg-gold/10 text-gold rounded-lg px-4 py-2 hover:bg-gold/20 text-sm"
          >
            <Plus className="w-4 h-4" /> Add First Service
          </button>
        </div>
      )}

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-primary-200 border border-white/10 rounded-2xl p-6 max-w-sm w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-white font-semibold">Delete Service</h3>
              </div>
              <p className="text-sm text-white/60 mb-6">Are you sure you want to delete this service?</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg">
                  Cancel
                </button>
                <button onClick={() => deleteService(deleteConfirm)} className="px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
