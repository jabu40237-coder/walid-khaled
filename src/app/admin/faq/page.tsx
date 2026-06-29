'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Plus, Edit, Trash2, MoveUp, MoveDown, Save, X, Loader2,
  AlertTriangle, HelpCircle, ChevronDown, ChevronUp,
} from 'lucide-react';

interface FAQ {
  id: string;
  question: { ar: string; kurd: string; en: string };
  answer: { ar: string; kurd: string; en: string };
  order: number;
}

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<FAQ> | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newFAQ, setNewFAQ] = useState({
    question: { ar: '', kurd: '', en: '' },
    answer: { ar: '', kurd: '', en: '' },
    order: 0,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchFAQs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/faqs');
      if (!res.ok) throw new Error('Failed');
      setFaqs(await res.json());
    } catch {
      setError('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFAQs(); }, [fetchFAQs]);

  const startEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setEditData({ question: { ...faq.question }, answer: { ...faq.answer }, order: faq.order });
  };

  const cancelEdit = () => { setEditingId(null); setEditData(null); };

  const saveEdit = async (id: string) => {
    if (!editData) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/faqs?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('FAQ updated');
      cancelEdit();
      fetchFAQs();
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const addFAQ = async () => {
    if (!newFAQ.question.ar || !newFAQ.question.en) {
      toast.error('Question in Arabic and English is required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newFAQ, order: faqs.length }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('FAQ added');
      setShowAdd(false);
      setNewFAQ({ question: { ar: '', kurd: '', en: '' }, answer: { ar: '', kurd: '', en: '' }, order: 0 });
      fetchFAQs();
    } catch {
      toast.error('Failed to add');
    } finally {
      setSaving(false);
    }
  };

  const deleteFAQ = async (id: string) => {
    try {
      const res = await fetch(`/api/faqs?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('FAQ deleted');
      setDeleteConfirm(null);
      fetchFAQs();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const moveFAQ = async (id: string, direction: 'up' | 'down') => {
    const idx = faqs.findIndex(f => f.id === id);
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= faqs.length) return;
    const updated = [...faqs];
    [updated[idx].order, updated[target].order] = [updated[target].order, updated[idx].order];
    try {
      await Promise.all([
        fetch(`/api/faqs?id=${updated[idx].id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: updated[idx].order }) }),
        fetch(`/api/faqs?id=${updated[target].id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: updated[target].order }) }),
      ]);
      fetchFAQs();
    } catch {
      toast.error('Failed to reorder');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">FAQ</h2>
          <p className="text-sm text-white/40 mt-1">{faqs.length} questions</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-gold text-primary font-semibold rounded-xl px-4 py-2.5 hover:bg-gold-400 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> {showAdd ? 'Cancel' : 'Add Question'}
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-primary-200 border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white">New FAQ</h3>
              {(['ar', 'kurd', 'en'] as const).map(lang => (
                <div key={lang} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1 capitalize">{lang} Question</label>
                    <input
                      type="text"
                      value={newFAQ.question[lang]}
                      onChange={e => setNewFAQ(prev => ({ ...prev, question: { ...prev.question, [lang]: e.target.value } }))}
                      className="w-full bg-primary/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50"
                      dir={lang === 'en' ? 'ltr' : 'rtl'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1 capitalize">{lang} Answer</label>
                    <textarea
                      value={newFAQ.answer[lang]}
                      onChange={e => setNewFAQ(prev => ({ ...prev, answer: { ...prev.answer, [lang]: e.target.value } }))}
                      rows={2}
                      className="w-full bg-primary/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 resize-none"
                      dir={lang === 'en' ? 'ltr' : 'rtl'}
                    />
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <button onClick={addFAQ} disabled={saving} className="flex items-center gap-2 bg-gold text-primary rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add FAQ
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error/Loading/Empty */}
      {error && <ErrorState message={error} onRetry={fetchFAQs} />}
      {loading && !error && <LoadingState />}
      {!loading && !error && faqs.length === 0 && !showAdd && (
        <div className="text-center py-16">
          <HelpCircle className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/40 mb-4">No FAQ items yet</p>
          <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 bg-gold/10 text-gold rounded-lg px-4 py-2 hover:bg-gold/20 text-sm">
            <Plus className="w-4 h-4" /> Add First FAQ
          </button>
        </div>
      )}

      {/* FAQ List */}
      {!loading && !error && faqs.length > 0 && (
        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div key={faq.id} className="bg-primary-200 border border-white/5 rounded-2xl overflow-hidden">
              {editingId === faq.id && editData ? (
                <div className="p-4 space-y-4">
                  {(['ar', 'kurd', 'en'] as const).map(lang => (
                    <div key={lang} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editData.question?.[lang] || ''}
                        onChange={e => setEditData(prev => prev ? { ...prev, question: { ...prev.question!, [lang]: e.target.value } } : null)}
                        placeholder={`Question (${lang})`}
                        className="bg-primary/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50"
                        dir={lang === 'en' ? 'ltr' : 'rtl'}
                      />
                      <textarea
                        value={editData.answer?.[lang] || ''}
                        onChange={e => setEditData(prev => prev ? { ...prev, answer: { ...prev.answer!, [lang]: e.target.value } } : null)}
                        placeholder={`Answer (${lang})`}
                        rows={2}
                        className="bg-primary/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/50 resize-none"
                        dir={lang === 'en' ? 'ltr' : 'rtl'}
                      />
                    </div>
                  ))}
                  <div className="flex gap-2 justify-end">
                    <button onClick={cancelEdit} className="px-3 py-2 text-sm text-white/60 hover:text-white rounded-lg">Cancel</button>
                    <button onClick={() => saveEdit(faq.id)} disabled={saving} className="flex items-center gap-2 bg-gold text-primary rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="p-4 flex items-center gap-3 cursor-pointer hover:bg-white/[0.02]" onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}>
                    <div className="flex flex-col items-center">
                      <button onClick={(e) => { e.stopPropagation(); moveFAQ(faq.id, 'up'); }} disabled={idx === 0} className="text-white/20 hover:text-white disabled:opacity-10">
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); moveFAQ(faq.id, 'down'); }} disabled={idx === faqs.length - 1} className="text-white/20 hover:text-white disabled:opacity-10">
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">{faq.question.en || faq.question.ar}</p>
                      <p className="text-xs text-white/40 truncate">{faq.answer.en || faq.answer.ar}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); startEdit(faq); }} className="p-1.5 text-white/40 hover:text-white rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(faq.id); }} className="p-1.5 text-red-400/50 hover:text-red-400 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {expandedId === faq.id ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedId === faq.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
                          {(['ar', 'kurd', 'en'] as const).map(lang => (
                            <div key={lang} className="bg-primary/30 rounded-xl p-3">
                              <p className="text-[10px] text-white/30 mb-0.5 uppercase">{lang}</p>
                              <p className="text-xs text-white/70 font-medium mb-1">{faq.question[lang]}</p>
                              <p className="text-xs text-white/50">{faq.answer[lang]}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-primary-200 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
              <AlertTriangle className="w-5 h-5 text-red-400 mb-3" />
              <h3 className="text-white font-semibold mb-2">Delete FAQ</h3>
              <p className="text-sm text-white/60 mb-6">Delete this FAQ item permanently?</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-white/60 hover:bg-white/5 rounded-lg">Cancel</button>
                <button onClick={() => deleteFAQ(deleteConfirm)} className="px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center py-12">
      <AlertTriangle className="w-10 h-10 text-gold/40 mb-3" />
      <p className="text-white/40 mb-3">{message}</p>
      <button onClick={onRetry} className="px-4 py-2 bg-gold/10 text-gold rounded-lg hover:bg-gold/20 text-sm">Try Again</button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-primary-200 border border-white/5 rounded-2xl p-4">
          <div className="w-64 h-4 skeleton mb-2" />
          <div className="w-96 h-3 skeleton" />
        </div>
      ))}
    </div>
  );
}
