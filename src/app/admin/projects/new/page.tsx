'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  Video,
  Star,
  Trash2,
  MoveUp,
  MoveDown,
} from 'lucide-react';
import { governorates, projectCategories } from '@/lib/utils';

interface MultilingualField {
  ar: string;
  kurd: string;
  en: string;
}

interface ProjectFormData {
  title: MultilingualField;
  description: MultilingualField;
  shortDescription: MultilingualField;
  governorate: string;
  city: string;
  category: string;
  completionYear: number;
  coverImage: string;
  images: string[];
  videos: string[];
  beforeImages: string[];
  afterImages: string[];
  materials: string[];
  highlights: MultilingualField[];
  challenges: MultilingualField;
  designProcess: MultilingualField;
  executionProcess: MultilingualField;
  featured: boolean;
  order: number;
}

const emptyMultilingual: MultilingualField = { ar: '', kurd: '', en: '' };

const defaultFormData: ProjectFormData = {
  title: { ...emptyMultilingual },
  description: { ...emptyMultilingual },
  shortDescription: { ...emptyMultilingual },
  governorate: '',
  city: '',
  category: '',
  completionYear: new Date().getFullYear(),
  coverImage: '',
  images: [],
  videos: [],
  beforeImages: [],
  afterImages: [],
  materials: [],
  highlights: [],
  challenges: { ...emptyMultilingual },
  designProcess: { ...emptyMultilingual },
  executionProcess: { ...emptyMultilingual },
  featured: false,
  order: 0,
};

const languages = [
  { key: 'ar' as const, label: 'العربية', dir: 'rtl' as const },
  { key: 'kurd' as const, label: 'کوردی', dir: 'rtl' as const },
  { key: 'en' as const, label: 'English', dir: 'ltr' as const },
];

const langLabels: Record<string, string> = { ar: 'Arabic', kurd: 'Kurdish', en: 'English' };

export default function NewProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProjectFormData>(defaultFormData);
  const [activeLang, setActiveLang] = useState<'ar'|'kurd'|'en'>('ar');
  const [saving, setSaving] = useState(false);
  const [newMaterial, setNewMaterial] = useState('');
  const [newHighlight, setNewHighlight] = useState<MultilingualField>({ ...emptyMultilingual });
  const [uploading, setUploading] = useState(false);

  const updateMultilingual = (
    obj: MultilingualField,
    field: keyof MultilingualField,
    value: string
  ): MultilingualField => ({ ...obj, [field]: value });

  const updateFormField = <K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const addImage = (field: 'images' | 'videos' | 'beforeImages' | 'afterImages', url: string) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], url] }));
  };

  const removeImage = (field: 'images' | 'videos' | 'beforeImages' | 'afterImages', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const addMaterial = () => {
    if (!newMaterial.trim()) return;
    setFormData(prev => ({ ...prev, materials: [...prev.materials, newMaterial.trim()] }));
    setNewMaterial('');
  };

  const removeMaterial = (index: number) => {
    setFormData(prev => ({ ...prev, materials: prev.materials.filter((_, i) => i !== index) }));
  };

  const addHighlight = () => {
    if (!newHighlight.ar && !newHighlight.en) return;
    setFormData(prev => ({ ...prev, highlights: [...prev.highlights, { ...newHighlight }] }));
    setNewHighlight({ ...emptyMultilingual });
  };

  const removeHighlight = (index: number) => {
    setFormData(prev => ({ ...prev, highlights: prev.highlights.filter((_, i) => i !== index) }));
  };

  const moveHighlight = (index: number, direction: 'up' | 'down') => {
    setFormData(prev => {
      const items = [...prev.highlights];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= items.length) return prev;
      [items[index], items[target]] = [items[target], items[index]];
      return { ...prev, highlights: items };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formDataUpload = new FormData();
    Array.from(files).forEach(f => formDataUpload.append('files', f));
    formDataUpload.append('folder', 'projects');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const urls = Array.isArray(data) ? data.map((d: any) => d.url) : [data.url];
      urls.forEach((url: string) => {
        if (field === 'coverImage') {
          updateFormField('coverImage', url);
        } else {
          addImage(field as any, url);
        }
      });
      toast.success('File uploaded successfully');
    } catch {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.ar || !formData.title.en) {
      toast.error('Title in Arabic and English is required');
      return;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create project');
      }

      toast.success('Project created successfully');
      router.push('/admin/projects');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">New Project</h2>
            <p className="text-sm text-white/40 mt-1">Create a new project listing</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 bg-gold text-primary font-semibold rounded-xl px-5 py-2.5 hover:bg-gold-400 transition-colors text-sm disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Project
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Language Tabs */}
        <div className="bg-primary-200 border border-white/5 rounded-2xl p-1 flex gap-1">
          {languages.map(lang => (
            <button
              key={lang.key}
              type="button"
              onClick={() => setActiveLang(lang.key)}
              className={`flex-1 py-2 text-sm rounded-xl transition-colors ${
                activeLang === lang.key
                  ? 'bg-gold/10 text-gold'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Title */}
        <SectionCard title="Title">
          {languages.map(lang => (
            <div key={lang.key} className={activeLang === lang.key ? '' : 'hidden'}>
              <label className="block text-xs text-white/40 mb-1.5">{langLabels[lang.key]} Title</label>
              <input
                type="text"
                value={formData.title[lang.key]}
                onChange={e => updateFormField('title', updateMultilingual(formData.title, lang.key, e.target.value))}
                placeholder={`Project title in ${langLabels[lang.key]}`}
                dir={lang.dir}
                className="w-full bg-primary/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50"
              />
            </div>
          ))}
        </SectionCard>

        {/* Short Description */}
        <SectionCard title="Short Description">
          {languages.map(lang => (
            <div key={lang.key} className={activeLang === lang.key ? '' : 'hidden'}>
              <label className="block text-xs text-white/40 mb-1.5">{langLabels[lang.key]} Short Description</label>
              <textarea
                value={formData.shortDescription[lang.key]}
                onChange={e => updateFormField('shortDescription', updateMultilingual(formData.shortDescription, lang.key, e.target.value))}
                placeholder={`Brief description in ${langLabels[lang.key]}`}
                dir={lang.dir}
                rows={2}
                className="w-full bg-primary/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 resize-none"
              />
            </div>
          ))}
        </SectionCard>

        {/* Full Description */}
        <SectionCard title="Full Description">
          {languages.map(lang => (
            <div key={lang.key} className={activeLang === lang.key ? '' : 'hidden'}>
              <label className="block text-xs text-white/40 mb-1.5">{langLabels[lang.key]} Description</label>
              <textarea
                value={formData.description[lang.key]}
                onChange={e => updateFormField('description', updateMultilingual(formData.description, lang.key, e.target.value))}
                placeholder={`Full description in ${langLabels[lang.key]}`}
                dir={lang.dir}
                rows={5}
                className="w-full bg-primary/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 resize-none"
              />
            </div>
          ))}
        </SectionCard>

        {/* Basic Info */}
        <SectionCard title="Project Details">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Governorate</label>
              <select
                value={formData.governorate}
                onChange={e => updateFormField('governorate', e.target.value)}
                className="w-full bg-primary/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50"
              >
                <option value="">Select Governorate</option>
                {Object.entries(governorates).map(([key, val]) => (
                  <option key={key} value={key}>{val.en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => updateFormField('city', e.target.value)}
                placeholder="City name"
                className="w-full bg-primary/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Completion Year</label>
              <input
                type="number"
                value={formData.completionYear}
                onChange={e => updateFormField('completionYear', parseInt(e.target.value) || new Date().getFullYear())}
                className="w-full bg-primary/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Category</label>
              <select
                value={formData.category}
                onChange={e => updateFormField('category', e.target.value)}
                className="w-full bg-primary/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50"
              >
                <option value="">Select Category</option>
                {Object.entries(projectCategories).map(([key, val]) => (
                  <option key={key} value={key}>{val.en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Display Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={e => updateFormField('order', parseInt(e.target.value) || 0)}
                className="w-full bg-primary/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={e => updateFormField('featured', e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-primary/50 text-gold focus:ring-gold/30"
              />
              <span className="text-sm text-white/60">Featured Project</span>
            </label>
          </div>
        </SectionCard>

        {/* Cover Image */}
        <SectionCard title="Cover Image">
          <div className="flex items-start gap-4">
            {formData.coverImage ? (
              <div className="relative w-40 h-28 rounded-xl overflow-hidden border border-white/10">
                <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => updateFormField('coverImage', '')}
                  className="absolute top-1 right-1 p-1 bg-black/70 rounded-lg hover:bg-black/90 transition-colors"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ) : (
              <div className="w-40 h-28 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white/20" />
              </div>
            )}
            <div className="flex-1">
              <label className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl px-4 py-2.5 cursor-pointer transition-colors text-sm">
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload Cover Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileUpload(e, 'coverImage')}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              <p className="text-xs text-white/20 mt-2">Or enter URL below</p>
              <input
                type="text"
                value={formData.coverImage}
                onChange={e => updateFormField('coverImage', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-primary/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 mt-2"
              />
            </div>
          </div>
        </SectionCard>

        {/* Images */}
        <ImageUploadSection
          title="Project Images"
          images={formData.images}
          onAdd={url => addImage('images', url)}
          onRemove={i => removeImage('images', i)}
          uploading={uploading}
          onUpload={e => handleFileUpload(e, 'images')}
          handleFieldUpdate={(url) => {
            if (url) addImage('images', url);
          }}
        />

        {/* Videos */}
        <ImageUploadSection
          title="Project Videos"
          images={formData.videos}
          onAdd={url => addImage('videos', url)}
          onRemove={i => removeImage('videos', i)}
          uploading={uploading}
          onUpload={e => handleFileUpload(e, 'videos')}
          handleFieldUpdate={(url) => {
            if (url) addImage('videos', url);
          }}
          accept="video/*"
          icon={<Video className="w-6 h-6" />}
        />

        {/* Before/After */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUploadSection
            title="Before Images"
            images={formData.beforeImages}
            onAdd={url => addImage('beforeImages', url)}
            onRemove={i => removeImage('beforeImages', i)}
            uploading={uploading}
            onUpload={e => handleFileUpload(e, 'beforeImages')}
            handleFieldUpdate={(url) => { if (url) addImage('beforeImages', url); }}
          />
          <ImageUploadSection
            title="After Images"
            images={formData.afterImages}
            onAdd={url => addImage('afterImages', url)}
            onRemove={i => removeImage('afterImages', i)}
            uploading={uploading}
            onUpload={e => handleFileUpload(e, 'afterImages')}
            handleFieldUpdate={(url) => { if (url) addImage('afterImages', url); }}
          />
        </div>

        {/* Materials */}
        <SectionCard title="Materials">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newMaterial}
              onChange={e => setNewMaterial(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
              placeholder="Add material..."
              className="flex-1 bg-primary/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50"
            />
            <button
              type="button"
              onClick={addMaterial}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.materials.map((m, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 text-gold rounded-lg text-xs"
              >
                {m}
                <button type="button" onClick={() => removeMaterial(i)}>
                  <X className="w-3 h-3 hover:text-white transition-colors" />
                </button>
              </span>
            ))}
            {formData.materials.length === 0 && (
              <p className="text-xs text-white/20">No materials added yet</p>
            )}
          </div>
        </SectionCard>

        {/* Highlights */}
        <SectionCard title="Highlights">
          <div className="space-y-3 mb-3">
            {languages.map(lang => (
              <div key={lang.key} className={activeLang === lang.key ? '' : 'hidden'}>
                <label className="block text-xs text-white/40 mb-1">{langLabels[lang.key]} Highlight</label>
                <input
                  type="text"
                  value={newHighlight[lang.key]}
                  onChange={e => setNewHighlight(prev => ({ ...prev, [lang.key]: e.target.value }))}
                  placeholder={`Highlight in ${langLabels[lang.key]}`}
                  dir={lang.dir}
                  className="w-full bg-primary/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addHighlight}
            className="flex items-center gap-2 text-sm text-gold hover:text-gold-400 transition-colors mb-3"
          >
            <Plus className="w-4 h-4" />
            Add Highlight
          </button>
          <div className="space-y-2">
            {formData.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2 bg-primary/30 rounded-xl p-3 border border-white/5">
                <div className="flex flex-col gap-1">
                  <button type="button" onClick={() => moveHighlight(i, 'up')} disabled={i === 0} className="text-white/20 hover:text-white disabled:opacity-20">
                    <MoveUp className="w-3 h-3" />
                  </button>
                  <button type="button" onClick={() => moveHighlight(i, 'down')} disabled={i === formData.highlights.length - 1} className="text-white/20 hover:text-white disabled:opacity-20">
                    <MoveDown className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  {languages.map(lang => (
                    <div key={lang.key} className={activeLang === lang.key ? '' : (h[lang.key] ? 'block' : 'hidden')}>
                      {h[lang.key] && (
                        <p className="text-sm text-white/70" dir={lang.dir}>{h[lang.key]}</p>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => removeHighlight(i)} className="p-1 text-white/20 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {formData.highlights.length === 0 && (
              <p className="text-xs text-white/20">No highlights added yet</p>
            )}
          </div>
        </SectionCard>

        {/* Challenges, Design Process, Execution Process */}
        {[
          { key: 'challenges' as const, title: 'Challenges' },
          { key: 'designProcess' as const, title: 'Design Process' },
          { key: 'executionProcess' as const, title: 'Execution Process' },
        ].map(section => (
          <SectionCard key={section.key} title={section.title}>
            {languages.map(lang => (
              <div key={lang.key} className={activeLang === lang.key ? '' : 'hidden'}>
                <label className="block text-xs text-white/40 mb-1.5">{langLabels[lang.key]}</label>
                <textarea
                  value={formData[section.key][lang.key]}
                  onChange={e => updateFormField(section.key, updateMultilingual(formData[section.key], lang.key, e.target.value))}
                  placeholder={`${section.title} in ${langLabels[lang.key]}`}
                  dir={lang.dir}
                  rows={4}
                  className="w-full bg-primary/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 resize-none"
                />
              </div>
            ))}
          </SectionCard>
        ))}

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-gold text-primary font-semibold rounded-xl px-6 py-2.5 hover:bg-gold-400 transition-colors text-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Create Project
          </button>
        </div>
      </form>
    </div>
  );
}

// --- Sub-components ---

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-primary-200 border border-white/5 rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

function ImageUploadSection({
  title,
  images,
  onAdd,
  onRemove,
  uploading,
  onUpload,
  handleFieldUpdate,
  accept = 'image/*',
  icon,
}: {
  title: string;
  images: string[];
  onAdd: (url: string) => void;
  onRemove: (index: number) => void;
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFieldUpdate: (url: string) => void;
  accept?: string;
  icon?: React.ReactNode;
}) {
  const [urlInput, setUrlInput] = useState('');

  return (
    <SectionCard title={title}>
      <div className="flex flex-wrap gap-3 mb-3">
        {images.map((url, i) => (
          <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10 group">
            {accept === 'video/*' ? (
              <video src={url} className="w-full h-full object-cover" />
            ) : (
              <img src={url} alt="" className="w-full h-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 p-1 bg-black/70 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}
        {images.length === 0 && (
          <div className="w-24 h-24 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center">
            {icon || <ImageIcon className="w-5 h-5 text-white/20" />}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <label className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl px-4 py-2 cursor-pointer transition-colors text-sm">
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload'}
          <input type="file" accept={accept} onChange={onUpload} className="hidden" multiple disabled={uploading} />
        </label>
        <input
          type="text"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (urlInput.trim()) {
                onAdd(urlInput.trim());
                setUrlInput('');
              }
            }
          }}
          placeholder="Paste URL + Enter"
          className="flex-1 bg-primary/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50"
        />
      </div>
    </SectionCard>
  );
}
