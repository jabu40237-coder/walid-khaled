'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Star, Trash2, CheckCircle2, XCircle, Eye, Loader2,
  AlertTriangle, MessageSquareHeart,
} from 'lucide-react';

interface Review {
  id: string;
  customerName: string;
  customerRole?: string;
  customerPhoto?: string;
  projectPhoto?: string;
  rating: number;
  text: { ar: string; kurd: string; en: string };
  verified: boolean;
  approved: boolean;
  projectId?: string;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/reviews?all=true');
      if (!res.ok) throw new Error('Failed to fetch');
      setReviews(await res.json());
    } catch {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const approve = async (id: string) => {
    try {
      const res = await fetch(`/api/reviews?id=${id}&action=approve`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Review approved');
      fetchReviews();
    } catch {
      toast.error('Failed to approve');
    }
  };

  const reject = async (id: string) => {
    try {
      const res = await fetch(`/api/reviews?id=${id}&action=reject`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Review rejected');
      fetchReviews();
    } catch {
      toast.error('Failed to reject');
    }
  };

  const deleteReview = async (id: string) => {
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Review deleted');
      setDeleteConfirm(null);
      fetchReviews();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const pending = reviews.filter(r => !r.approved);
  const approved = reviews.filter(r => r.approved);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Reviews</h2>
          <p className="text-sm text-white/40 mt-1">
            {reviews.length} reviews · {pending.length} pending
          </p>
        </div>
      </div>

      {error && (
        <div className="flex flex-col items-center py-12">
          <AlertTriangle className="w-10 h-10 text-gold/40 mb-3" />
          <p className="text-white/40 mb-3">{error}</p>
          <button onClick={fetchReviews} className="px-4 py-2 bg-gold/10 text-gold rounded-lg hover:bg-gold/20 text-sm">
            Try Again
          </button>
        </div>
      )}

      {loading && !error && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-primary-200 border border-white/5 rounded-2xl p-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 skeleton rounded-full shrink-0" />
                <div className="flex-1">
                  <div className="w-32 h-4 skeleton mb-2" />
                  <div className="w-48 h-3 skeleton" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && reviews.length === 0 && (
        <div className="text-center py-16">
          <Star className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/40">No reviews yet</p>
        </div>
      )}

      {/* Pending Reviews */}
      {pending.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gold mb-3">Pending Approval ({pending.length})</h3>
          <div className="space-y-3">
            {pending.map(review => (
              <ReviewCard
                key={review.id}
                review={review}
                expanded={viewingId === review.id}
                onToggle={() => setViewingId(viewingId === review.id ? null : review.id)}
                onApprove={() => approve(review.id)}
                onReject={() => reject(review.id)}
                onDelete={() => setDeleteConfirm(review.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Approved Reviews */}
      {approved.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/60 mb-3">Approved ({approved.length})</h3>
          <div className="space-y-3">
            {approved.map(review => (
              <ReviewCard
                key={review.id}
                review={review}
                expanded={viewingId === review.id}
                onToggle={() => setViewingId(viewingId === review.id ? null : review.id)}
                onDelete={() => setDeleteConfirm(review.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <Modal onClose={() => setDeleteConfirm(null)}>
            <AlertTriangle className="w-5 h-5 text-red-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Delete Review</h3>
            <p className="text-sm text-white/60 mb-6">Permanently delete this review?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-white/60 hover:bg-white/5 rounded-lg">
                Cancel
              </button>
              <button onClick={() => deleteReview(deleteConfirm)} className="px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg">
                Delete
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReviewCard({
  review, expanded, onToggle, onApprove, onReject, onDelete,
}: {
  review: Review;
  expanded: boolean;
  onToggle: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-primary-200 border border-white/5 rounded-2xl overflow-hidden">
      <div className="p-4 flex items-start gap-3 cursor-pointer hover:bg-white/[0.02]" onClick={onToggle}>
        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0 text-sm text-gold font-semibold">
          {review.customerName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm text-white font-medium">{review.customerName}</p>
            {review.verified && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < review.rating ? 'text-gold fill-gold' : 'text-white/10'}`}
              />
            ))}
          </div>
          <p className="text-xs text-white/40 mt-1">
            {review.text.en || review.text.ar || 'No text'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {!review.approved && onApprove && (
            <button onClick={(e) => { e.stopPropagation(); onApprove(); }} className="p-1.5 text-green-400/60 hover:text-green-400 hover:bg-green-400/10 rounded-lg" title="Approve">
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
          {!review.approved && onReject && (
            <button onClick={(e) => { e.stopPropagation(); onReject(); }} className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg" title="Reject">
              <XCircle className="w-4 h-4" />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 text-red-400/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {(['ar', 'kurd', 'en'] as const).map(lang => (
                  review.text[lang] && (
                    <div key={lang} className="bg-primary/30 rounded-xl p-3">
                      <p className="text-[10px] text-white/30 mb-1 uppercase">{lang}</p>
                      <p className="text-sm text-white/70">{review.text[lang]}</p>
                    </div>
                  )
                ))}
              </div>
              <div className="flex gap-4 text-xs text-white/30">
                <span>Created: {new Date(review.createdAt).toLocaleDateString()}</span>
                {review.customerRole && <span>Role: {review.customerRole}</span>}
                <span>{review.approved ? '✅ Approved' : '⏳ Pending'}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-primary-200 border border-white/10 rounded-2xl p-6 max-w-sm w-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
