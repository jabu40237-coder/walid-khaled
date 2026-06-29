'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  Image as ImageIcon,
  Loader2,
  Filter,
  FolderKanban,
} from 'lucide-react';
import { projectCategories } from '@/lib/utils';

interface Project {
  id: string;
  title: { ar: string; en: string; kurd: string };
  category: string;
  governorate: string;
  city: string;
  coverImage: string;
  featured: boolean;
  completionYear: number;
  createdAt: string;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 20;

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categoryFilter) params.set('category', categoryFilter);
      params.set('limit', limit.toString());
      params.set('offset', (page * limit).toString());

      const res = await fetch(`/api/projects?${params}`);
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      setProjects(data.projects);
      setTotal(data.total);
    } catch (err) {
      setError('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, page]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete project');
      toast.success('Project deleted successfully');
      setDeleteConfirm(null);
      fetchProjects();
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Projects</h2>
          <p className="text-sm text-white/40 mt-1">
            {total} project{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 bg-gold text-primary font-semibold rounded-xl px-4 py-2.5 hover:bg-gold-400 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Project
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search projects..."
            className="w-full bg-primary-200 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(0);
            }}
            className="appearance-none bg-primary-200 border border-white/10 rounded-xl pl-10 pr-8 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50 min-w-[180px]"
          >
            <option value="" className="bg-primary-200">All Categories</option>
            {Object.entries(projectCategories).map(([key, val]) => (
              <option key={key} value={key} className="bg-primary-200">
                {val.en}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center py-12">
          <AlertTriangle className="w-10 h-10 text-gold/40 mb-3" />
          <p className="text-white/40 mb-3">{error}</p>
          <button
            onClick={fetchProjects}
            className="px-4 py-2 bg-gold/10 text-gold rounded-lg hover:bg-gold/20 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-primary-200 border border-white/5 rounded-2xl p-4 flex items-center gap-4"
            >
              <div className="w-14 h-14 skeleton rounded-xl shrink-0" />
              <div className="flex-1">
                <div className="w-48 h-4 skeleton mb-2" />
                <div className="w-24 h-3 skeleton" />
              </div>
              <div className="w-20 h-3 skeleton" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && projects.length === 0 && (
        <div className="text-center py-16">
          <FolderKanban className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/40 mb-2">No projects found</p>
          <p className="text-sm text-white/20 mb-4">
            {search || categoryFilter ? 'Try different search terms or filters' : 'Add your first project to get started'}
          </p>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 bg-gold/10 text-gold rounded-lg px-4 py-2 hover:bg-gold/20 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Project
          </Link>
        </div>
      )}

      {/* Projects Table */}
      {!loading && !error && projects.length > 0 && (
        <>
          <div className="bg-primary-200 border border-white/5 rounded-2xl overflow-hidden">
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 text-xs text-white/30 border-b border-white/5">
              <div className="col-span-5">Project</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-1">Governorate</div>
              <div className="col-span-1">Year</div>
              <div className="col-span-1">Featured</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 last:border-b-0 items-center hover:bg-white/[0.02] transition-colors"
              >
                {/* Project Info */}
                <div className="lg:col-span-5 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/50 overflow-hidden shrink-0 border border-white/5">
                    {project.coverImage ? (
                      <img
                        src={project.coverImage}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-white/10" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {project.title.en || project.title.ar}
                    </p>
                    <p className="text-xs text-white/40 truncate">
                      {project.city || project.governorate}
                    </p>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <span className="text-xs text-gold bg-gold/10 px-2.5 py-1 rounded-full">
                    {projectCategories[project.category]?.en || project.category}
                  </span>
                </div>
                <div className="lg:col-span-1 text-xs text-white/50">{project.governorate}</div>
                <div className="lg:col-span-1 text-xs text-white/50">{project.completionYear}</div>
                <div className="lg:col-span-1">
                  {project.featured ? (
                    <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                      Featured
                    </span>
                  ) : (
                    <span className="text-xs text-white/20">—</span>
                  )}
                </div>
                <div className="lg:col-span-2 flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/projects/${project.id}/edit`}
                    className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(project.id)}
                    className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/30">
                Showing {page * limit + 1}–{Math.min((page + 1) * limit, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="p-2 text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-8 h-8 rounded-lg text-xs transition-colors ${
                      page === i
                        ? 'bg-gold/20 text-gold'
                        : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-2 text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => !deleting && setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-primary-200 border border-white/10 rounded-2xl p-6 max-w-sm w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Delete Project</h3>
                  <p className="text-xs text-white/40">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-white/60 mb-6">
                Are you sure you want to delete this project? All associated images and data will be permanently removed.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleting}
                  className="px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete Project
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


