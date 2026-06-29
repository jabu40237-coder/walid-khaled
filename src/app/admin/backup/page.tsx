'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Download,
  Upload,
  Trash2,
  Plus,
  RefreshCw,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileArchive,
  Clock,
  HardDrive,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { BackupListItem, BackupManifest } from '@/types';

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getBackupTag(filename: string): string {
  if (filename.includes('auto-')) {
    const match = filename.match(/auto-([a-zA-Z0-9_-]+)/);
    return match ? `Auto: ${match[1].replace(/_/g, ' ')}` : 'Automatic';
  }
  if (filename.includes('pre-restore')) return 'Pre-Restore Safety';
  return 'Manual';
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
export default function AdminBackupPage() {
  const [backups, setBackups] = useState<BackupListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [uploadingRestore, setUploadingRestore] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch backups ───────────────────────────
  const fetchBackups = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/backup');
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups || []);
      }
    } catch {
      toast.error('Failed to load backups.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  // ── Create backup ───────────────────────────
  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: 'manual' }),
      });

      if (res.ok) {
        toast.success('Backup created successfully!');
        await fetchBackups();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to create backup.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setCreating(false);
    }
  };

  // ── Download backup ─────────────────────────
  const handleDownload = async (backup: BackupListItem) => {
    try {
      const res = await fetch(`/api/admin/backup/${backup.id}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const ts = backup.manifest.createdAt.replace(/[:.]/g, '-');
        a.href = url;
        a.download = `walid-khaled-backup-${ts}.json.gz`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Backup downloaded.');
      } else {
        toast.error('Failed to download backup.');
      }
    } catch {
      toast.error('Network error.');
    }
  };

  // ── Delete backup ───────────────────────────
  const handleDelete = async (backup: BackupListItem) => {
    setDeleting(backup.id);
    try {
      const res = await fetch(`/api/admin/backup/${backup.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Backup deleted.');
        await fetchBackups();
      } else {
        toast.error('Failed to delete backup.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setDeleting(null);
    }
  };

  // ── Restore from file upload ────────────────
  const handleRestoreUpload = async () => {
    if (!restoreFile) {
      toast.error('Please select a backup file.');
      return;
    }

    setUploadingRestore(true);
    try {
      const formData = new FormData();
      formData.append('file', restoreFile);

      const res = await fetch('/api/admin/restore', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Backup restored successfully!');
        setRestoreFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        await fetchBackups();
      } else {
        toast.error(data.error || 'Restore failed.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setUploadingRestore(false);
    }
  };

  // ── Render ──────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white mb-1">
          Backup & Restore
        </h1>
        <p className="text-sm text-white/40">
          Create, download, and restore full website backups.
        </p>
      </div>

      {/* Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Create Backup */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleCreateBackup}
          disabled={creating}
          className="flex items-center justify-center gap-3 p-6 rounded-2xl bg-gold/10 border border-gold/20 hover:bg-gold/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center group-hover:bg-gold/30 transition-colors">
            {creating ? (
              <Loader2 className="w-6 h-6 text-gold animate-spin" />
            ) : (
              <Plus className="w-6 h-6 text-gold" />
            )}
          </div>
          <div className="text-left">
            <p className="text-white font-semibold">Create Backup</p>
            <p className="text-sm text-white/40">
              Export all website data now
            </p>
          </div>
        </motion.button>

        {/* Restore from File */}
        <div className="p-6 rounded-2xl bg-primary-200/50 border border-white/5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Restore from File</p>
              <p className="text-sm text-white/40">
                Upload a .json.gz backup to restore
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json.gz,.json"
              onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
              className="flex-1 text-sm text-white/60 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gold/20 file:text-gold hover:file:bg-gold/30 file:cursor-pointer file:transition-colors"
            />
            <button
              onClick={handleRestoreUpload}
              disabled={!restoreFile || uploadingRestore}
              className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploadingRestore ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Restore
            </button>
          </div>
          {restoreFile && (
            <p className="text-xs text-gold/50 mt-3 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Restoring will replace ALL current data. A safety backup will be
              created automatically.
            </p>
          )}
        </div>
      </div>

      {/* Backups List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Backup History
            <span className="text-sm text-white/30 ml-2 font-normal">
              ({backups.length})
            </span>
          </h2>
          <button
            onClick={fetchBackups}
            disabled={loading}
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            title="Refresh"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-gold animate-spin" />
          </div>
        ) : backups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 rounded-2xl bg-primary-200/30 border border-white/5"
          >
            <Database className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30">No backups yet.</p>
            <p className="text-sm text-white/15 mt-1">
              Create your first backup to get started.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {backups.map((backup, i) => {
              const m = backup.manifest;
              const isAuto = backup.filename.includes('auto-');
              const isSafety = backup.filename.includes('pre-restore');

              return (
                <motion.div
                  key={backup.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-primary-200/50 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          isSafety
                            ? 'bg-orange-500/20'
                            : isAuto
                            ? 'bg-blue-500/20'
                            : 'bg-gold/20'
                        }`}
                      >
                        {isSafety ? (
                          <Shield className="w-5 h-5 text-orange-400" />
                        ) : (
                          <FileArchive className="w-5 h-5 text-gold" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-white font-medium text-sm truncate">
                            {formatDate(m.createdAt)}
                          </p>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              isSafety
                                ? 'bg-orange-500/10 text-orange-300 border border-orange-500/20'
                                : isAuto
                                ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                                : 'bg-gold/10 text-gold border border-gold/20'
                            }`}
                          >
                            {getBackupTag(backup.filename)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/30">
                          <span className="flex items-center gap-1">
                            <HardDrive className="w-3 h-3" />
                            {formatBytes(backup.sizeBytes)}
                          </span>
                          <span>v{m.version}</span>
                          <span>•</span>
                          <span>
                            {m.counts.projects}P {m.counts.services}S{' '}
                            {m.counts.reviews}R {m.counts.faqs}F
                          </span>
                        </div>
                        <p className="text-[10px] text-white/15 mt-1 font-mono truncate">
                          {backup.filename}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDownload(backup)}
                        className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(backup)}
                        disabled={deleting === backup.id}
                        className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                        title="Delete"
                      >
                        {deleting === backup.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
