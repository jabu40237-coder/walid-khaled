'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Save, Loader2, Upload, AlertTriangle, Settings2,
  Phone, Mail, MapPin, Globe, Clock, BarChart3,
} from 'lucide-react';

interface SettingsData {
  companyName: { ar: string; kurd: string; en: string };
  brandName: { ar: string; kurd: string; en: string };
  logo: string;
  heroVideo: string;
  heroImages: string[];
  heroHeadline: { ar: string; kurd: string; en: string };
  heroSubtitle: { ar: string; kurd: string; en: string };
  aboutDescription: { ar: string; kurd: string; en: string };
  phone1: string;
  phone2: string;
  whatsapp: string;
  email: string;
  address: { ar: string; kurd: string; en: string };
  facebook: string;
  instagram: string;
  tiktok: string;
  workingHours: { ar: string; kurd: string; en: string };
  stats: { completedProjects: number; yearsExperience: number; governorates: string; satisfaction: string };
  seo: { title: { ar: string; kurd: string; en: string }; description: { ar: string; kurd: string; en: string }; keywords: string };
}

const languages = [
  { key: 'ar' as const, label: 'العربية', dir: 'rtl' as const },
  { key: 'kurd' as const, label: 'کوردی', dir: 'rtl' as const },
  { key: 'en' as const, label: 'English', dir: 'ltr' as const },
];

const langLabels: Record<string, string> = { ar: 'Arabic', kurd: 'Kurdish', en: 'English' };

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeLang, setActiveLang] = useState<'ar'|'kurd'|'en'>('ar');

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed');
      setSettings(await res.json());
    } catch {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const updateField = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  const updateMultilingual = (field: keyof SettingsData, lang: 'ar'|'kurd'|'en', value: string) => {
    if (!settings) return;
    const current = settings[field] as { ar: string; kurd: string; en: string };
    updateField(field, { ...current, [lang]: value });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="w-32 h-7 skeleton mb-4" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-primary-200 border border-white/5 rounded-2xl p-6">
            <div className="w-24 h-4 skeleton mb-3" />
            <div className="w-full h-10 skeleton rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="flex flex-col items-center py-20">
        <AlertTriangle className="w-12 h-12 text-gold/40 mb-4" />
        <p className="text-white/40 mb-4">{error || 'Failed to load settings'}</p>
        <button onClick={fetchSettings} className="px-4 py-2 bg-gold/10 text-gold rounded-lg hover:bg-gold/20 text-sm">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Site Settings</h2>
          <p className="text-sm text-white/40 mt-1">Manage your website configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-gold text-primary font-semibold rounded-xl px-5 py-2.5 hover:bg-gold-400 transition-colors text-sm disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
      </div>

      {/* Language Tabs */}
      <div className="bg-primary-200 border border-white/5 rounded-2xl p-1 flex gap-1">
        {languages.map(lang => (
          <button
            key={lang.key}
            onClick={() => setActiveLang(lang.key)}
            className={`flex-1 py-2 text-sm rounded-xl transition-colors ${
              activeLang === lang.key ? 'bg-gold/10 text-gold' : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Company Info */}
      <SectionCard title="Company Information" icon={<Settings2 className="w-4 h-4" />}>
        {languages.map(lang => (
          <div key={lang.key} className={activeLang === lang.key ? 'space-y-3' : 'hidden'}>
            <FormField label={`Company Name (${langLabels[lang.key]})`}>
              <input
                type="text"
                value={settings.companyName[lang.key]}
                onChange={e => updateMultilingual('companyName', lang.key, e.target.value)}
                dir={lang.dir}
                className="admin-input"
              />
            </FormField>
            <FormField label={`Brand Name (${langLabels[lang.key]})`}>
              <input
                type="text"
                value={settings.brandName[lang.key]}
                onChange={e => updateMultilingual('brandName', lang.key, e.target.value)}
                dir={lang.dir}
                className="admin-input"
              />
            </FormField>
            <FormField label={`Address (${langLabels[lang.key]})`}>
              <input
                type="text"
                value={settings.address[lang.key]}
                onChange={e => updateMultilingual('address', lang.key, e.target.value)}
                dir={lang.dir}
                className="admin-input"
              />
            </FormField>
            <FormField label={`Working Hours (${langLabels[lang.key]})`}>
              <input
                type="text"
                value={settings.workingHours[lang.key]}
                onChange={e => updateMultilingual('workingHours', lang.key, e.target.value)}
                dir={lang.dir}
                className="admin-input"
              />
            </FormField>
          </div>
        ))}
      </SectionCard>

      {/* Hero Section */}
      <SectionCard title="Hero Section" icon={<Globe className="w-4 h-4" />}>
        <FormField label="Logo URL">
          <input
            type="text"
            value={settings.logo}
            onChange={e => updateField('logo', e.target.value)}
            className="admin-input"
            placeholder="/images/logo.png"
          />
        </FormField>
        <FormField label="Hero Video URL">
          <input
            type="text"
            value={settings.heroVideo}
            onChange={e => updateField('heroVideo', e.target.value)}
            className="admin-input"
            placeholder="/videos/hero.mp4"
          />
        </FormField>
        {languages.map(lang => (
          <div key={lang.key} className={activeLang === lang.key ? 'space-y-3' : 'hidden'}>
            <FormField label={`Hero Headline (${langLabels[lang.key]})`}>
              <input
                type="text"
                value={settings.heroHeadline[lang.key]}
                onChange={e => updateMultilingual('heroHeadline', lang.key, e.target.value)}
                dir={lang.dir}
                className="admin-input"
              />
            </FormField>
            <FormField label={`Hero Subtitle (${langLabels[lang.key]})`}>
              <textarea
                value={settings.heroSubtitle[lang.key]}
                onChange={e => updateMultilingual('heroSubtitle', lang.key, e.target.value)}
                dir={lang.dir}
                rows={3}
                className="admin-input resize-none"
              />
            </FormField>
            <FormField label={`About Description (${langLabels[lang.key]})`}>
              <textarea
                value={settings.aboutDescription[lang.key]}
                onChange={e => updateMultilingual('aboutDescription', lang.key, e.target.value)}
                dir={lang.dir}
                rows={4}
                className="admin-input resize-none"
              />
            </FormField>
          </div>
        ))}
      </SectionCard>

      {/* Contact Info */}
      <SectionCard title="Contact Information" icon={<Phone className="w-4 h-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Phone 1">
            <input type="text" value={settings.phone1} onChange={e => updateField('phone1', e.target.value)} className="admin-input" />
          </FormField>
          <FormField label="Phone 2">
            <input type="text" value={settings.phone2} onChange={e => updateField('phone2', e.target.value)} className="admin-input" />
          </FormField>
          <FormField label="WhatsApp">
            <input type="text" value={settings.whatsapp} onChange={e => updateField('whatsapp', e.target.value)} className="admin-input" />
          </FormField>
          <FormField label="Email">
            <input type="email" value={settings.email} onChange={e => updateField('email', e.target.value)} className="admin-input ltr-only" />
          </FormField>
        </div>
      </SectionCard>

      {/* Social Media */}
      <SectionCard title="Social Media Links" icon={<Globe className="w-4 h-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Facebook URL">
            <input type="url" value={settings.facebook} onChange={e => updateField('facebook', e.target.value)} className="admin-input ltr-only" />
          </FormField>
          <FormField label="Instagram URL">
            <input type="url" value={settings.instagram} onChange={e => updateField('instagram', e.target.value)} className="admin-input ltr-only" />
          </FormField>
          <FormField label="TikTok URL">
            <input type="url" value={settings.tiktok} onChange={e => updateField('tiktok', e.target.value)} className="admin-input ltr-only" />
          </FormField>
        </div>
      </SectionCard>

      {/* Statistics */}
      <SectionCard title="Statistics" icon={<BarChart3 className="w-4 h-4" />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FormField label="Completed Projects">
            <input type="number" value={settings.stats.completedProjects} onChange={e => updateField('stats', { ...settings.stats, completedProjects: parseInt(e.target.value) || 0 })} className="admin-input" />
          </FormField>
          <FormField label="Years Experience">
            <input type="number" value={settings.stats.yearsExperience} onChange={e => updateField('stats', { ...settings.stats, yearsExperience: parseInt(e.target.value) || 0 })} className="admin-input" />
          </FormField>
          <FormField label="Governorates Text">
            <input type="text" value={settings.stats.governorates} onChange={e => updateField('stats', { ...settings.stats, governorates: e.target.value })} className="admin-input" />
          </FormField>
          <FormField label="Satisfaction Rate">
            <input type="text" value={settings.stats.satisfaction} onChange={e => updateField('stats', { ...settings.stats, satisfaction: e.target.value })} className="admin-input" />
          </FormField>
        </div>
      </SectionCard>

      {/* SEO */}
      <SectionCard title="SEO Settings" icon={<Globe className="w-4 h-4" />}>
        {languages.map(lang => (
          <div key={lang.key} className={activeLang === lang.key ? 'space-y-3' : 'hidden'}>
            <FormField label={`Meta Title (${langLabels[lang.key]})`}>
              <input
                type="text"
                value={settings.seo.title[lang.key]}
                onChange={e => updateMultilingual('seo', lang.key, e.target.value)}
                dir={lang.dir}
                className="admin-input"
              />
            </FormField>
            <FormField label={`Meta Description (${langLabels[lang.key]})`}>
              <textarea
                value={settings.seo.description[lang.key]}
                onChange={e => updateMultilingual('seo', lang.key, e.target.value)}
                dir={lang.dir}
                rows={3}
                className="admin-input resize-none"
              />
            </FormField>
          </div>
        ))}
        <FormField label="Keywords (comma-separated)">
          <input
            type="text"
            value={settings.seo.keywords}
            onChange={e => updateField('seo', { ...settings.seo, keywords: e.target.value })}
            className="admin-input ltr-only"
          />
        </FormField>
      </SectionCard>

      {/* Save */}
      <div className="flex justify-end pt-4 border-t border-white/5">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-gold text-primary font-semibold rounded-xl px-6 py-2.5 hover:bg-gold-400 transition-colors text-sm disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
      </div>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-primary-200 border border-white/5 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        {icon && <span className="text-gold/60">{icon}</span>}
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-white/40 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
