'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Download, Trash2, Eye, ChevronDown, ChevronUp, Loader2,
  AlertTriangle, MessageSquare, CheckCircle2, Circle, X,
  Phone, Mail, MapPin, Clock, Image as ImageIcon,
} from 'lucide-react';

interface ConsultationRequest {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  governorate: string;
  city: string;
  projectType: string;
  estimatedArea?: string;
  description: string;
  images: string[];
  videos: string[];
  preferredContactMethod: string;
  preferredContactTime: string;
  read: boolean;
  createdAt: string;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/requests');
      if (!res.ok) throw new Error('Failed to fetch');
      setRequests(await res.json());
    } catch {
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/requests?id=${id}&action=read`, { method: 'PATCH' });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, read: true } : r));
      toast.success('Marked as read');
    } catch {
      toast.error('Failed to update');
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      const res = await fetch(`/api/requests?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Request deleted');
      setDeleteConfirm(null);
      setExpandedId(null);
      fetchRequests();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const exportCSV = () => {
    const headers = 'Name,Phone,Email,Governorate,City,Project Type,Area,Contact Method,Contact Time,Read,Date\n';
    const rows = requests.map(r =>
      `"${r.fullName}","${r.phone}","${r.email || ''}","${r.governorate}","${r.city}","${r.projectType}","${r.estimatedArea || ''}","${r.preferredContactMethod}","${r.preferredContactTime}","${r.read ? 'Yes' : 'No'}","${r.createdAt}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const unreadCount = requests.filter(r => !r.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Consultation Requests</h2>
          <p className="text-sm text-white/40 mt-1">
            {requests.length} requests · {unreadCount} unread
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={requests.length === 0}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl px-4 py-2.5 transition-colors text-sm disabled:opacity-30"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center py-12">
          <AlertTriangle className="w-10 h-10 text-gold/40 mb-3" />
          <p className="text-white/40 mb-3">{error}</p>
          <button onClick={fetchRequests} className="px-4 py-2 bg-gold/10 text-gold rounded-lg hover:bg-gold/20 text-sm">
            Try Again
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && !error && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-primary-200 border border-white/5 rounded-2xl p-4">
              <div className="flex gap-4">
                <div className="w-2 h-2 skeleton rounded-full mt-2" />
                <div className="flex-1">
                  <div className="w-32 h-4 skeleton mb-2" />
                  <div className="w-48 h-3 skeleton" />
                </div>
                <div className="w-20 h-3 skeleton" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && requests.length === 0 && (
        <div className="text-center py-16">
          <MessageSquare className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/40">No consultation requests yet</p>
        </div>
      )}

      {/* Requests List */}
      {!loading && !error && requests.length > 0 && (
        <div className="space-y-2">
          {requests.map(req => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`bg-primary-200 border rounded-2xl overflow-hidden transition-colors ${
                !req.read ? 'border-gold/20' : 'border-white/5'
              }`}
            >
              {/* Summary Row */}
              <div
                onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                className="p-4 flex items-center gap-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
              >
                <div>
                  {req.read ? (
                    <CheckCircle2 className="w-5 h-5 text-white/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-gold fill-gold/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white font-medium">{req.fullName}</p>
                    {!req.read && (
                      <span className="text-[10px] bg-gold/20 text-gold px-1.5 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/40 truncate">
                    {req.projectType} · {req.governorate}
                  </p>
                </div>
                <div className="text-xs text-white/30 shrink-0">
                  {new Date(req.createdAt).toLocaleDateString()}
                </div>
                <div className="text-white/20">
                  {expandedId === req.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedId === req.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Detail label="Phone" value={req.phone} icon={<Phone className="w-3.5 h-3.5" />} />
                        {req.email && <Detail label="Email" value={req.email} icon={<Mail className="w-3.5 h-3.5" />} />}
                        <Detail label="Governorate" value={req.governorate} icon={<MapPin className="w-3.5 h-3.5" />} />
                        {req.city && <Detail label="City" value={req.city} />}
                        <Detail label="Project Type" value={req.projectType} />
                        {req.estimatedArea && <Detail label="Est. Area" value={req.estimatedArea} />}
                        <Detail label="Contact Via" value={req.preferredContactMethod} />
                        <Detail label="Best Time" value={req.preferredContactTime} icon={<Clock className="w-3.5 h-3.5" />} />
                      </div>

                      {req.description && (
                        <div>
                          <p className="text-xs text-white/30 mb-1">Description</p>
                          <p className="text-sm text-white/70 bg-primary/30 rounded-xl p-3">{req.description}</p>
                        </div>
                      )}

                      {/* Images */}
                      {req.images.length > 0 && (
                        <div>
                          <p className="text-xs text-white/30 mb-2">Images ({req.images.length})</p>
                          <div className="flex gap-2 flex-wrap">
                            {req.images.map((img, i) => (
                              <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="w-20 h-20 rounded-xl overflow-hidden border border-white/5 hover:border-gold/30 transition-colors">
                                <img src={img} alt="" className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Videos */}
                      {req.videos.length > 0 && (
                        <div>
                          <p className="text-xs text-white/30 mb-2">Videos ({req.videos.length})</p>
                          <div className="flex gap-2 flex-wrap">
                            {req.videos.map((vid, i) => (
                              <a key={i} href={vid} target="_blank" rel="noopener noreferrer" className="w-32 h-20 rounded-xl overflow-hidden border border-white/5 bg-black">
                                <video src={vid} className="w-full h-full object-cover" muted />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        {!req.read && (
                          <button
                            onClick={() => markAsRead(req.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 text-gold rounded-lg text-xs hover:bg-gold/20 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark as Read
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteConfirm(req.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-400/10 text-red-400 rounded-lg text-xs hover:bg-red-400/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
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
              <AlertTriangle className="w-5 h-5 text-red-400 mb-3" />
              <h3 className="text-white font-semibold mb-2">Delete Request</h3>
              <p className="text-sm text-white/60 mb-6">Are you sure you want to permanently delete this request?</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-white/60 hover:bg-white/5 rounded-lg">
                  Cancel
                </button>
                <button onClick={() => deleteRequest(deleteConfirm)} className="px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg">
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

function Detail({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-primary/30 rounded-xl p-3">
      <p className="text-[10px] text-white/30 mb-0.5">{label}</p>
      <p className="text-sm text-white/80 flex items-center gap-1.5">
        {icon && <span className="text-white/30">{icon}</span>}
        {value}
      </p>
    </div>
  );
}
