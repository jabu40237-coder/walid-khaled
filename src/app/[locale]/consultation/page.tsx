'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Send,
  Upload,
  FileImage,
  FileVideo,
  X,
  CheckCircle,
  Loader2,
  Phone,
  Mail,
  MessageCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, governorates, projectCategories } from '@/lib/utils';
import { createRequest } from '@/lib/data';
import { SmartAssistant } from '@/components/sections/SmartAssistant';
import type { ConsultationRequest } from '@/types';

const projectTypes = Object.entries(projectCategories).map(([key, val]) => ({
  value: key,
  label: val,
}));

const contactTimes = [
  { value: 'morning', label: { ar: 'صباحاً (8:00 – 12:00)', kurd: 'Sibê (8:00 – 12:00)', en: 'Morning (8:00 – 12:00)' } },
  { value: 'afternoon', label: { ar: 'بعد الظهر (12:00 – 4:00)', kurd: 'Piştî Nîvro (12:00 – 4:00)', en: 'Afternoon (12:00 – 4:00)' } },
  { value: 'evening', label: { ar: 'مساءً (4:00 – 6:00)', kurd: 'Êvarê (4:00 – 6:00)', en: 'Evening (4:00 – 6:00)' } },
];

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  governorate: string;
  city: string;
  projectType: string;
  estimatedArea: string;
  description: string;
  preferredContactMethod: 'whatsapp' | 'phone' | 'email';
  preferredContactTime: string;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  governorate?: string;
  city?: string;
  projectType?: string;
  description?: string;
}

const initialFormData: FormData = {
  fullName: '',
  phone: '',
  email: '',
  governorate: '',
  city: '',
  projectType: '',
  estimatedArea: '',
  description: '',
  preferredContactMethod: 'whatsapp',
  preferredContactTime: 'morning',
};

function DropZone({
  label,
  accept,
  icon: Icon,
  files,
  setFiles,
  maxFiles = 5,
  locale,
}: {
  label: string;
  accept: string;
  icon: React.ElementType;
  files: File[];
  setFiles: (files: File[]) => void;
  maxFiles?: number;
  locale: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
        accept.includes(f.type.split('/')[0])
      );
      if (files.length + droppedFiles.length > maxFiles) {
        toast.error(
          locale === 'ar'
            ? `الحد الأقصى ${maxFiles} ملفات`
            : locale === 'kurd'
            ? `Herî zêde ${maxFiles} pel`
            : `Maximum ${maxFiles} files`
        );
        return;
      }
      setFiles([...files, ...droppedFiles]);
    },
    [files, setFiles, accept, maxFiles, locale]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (files.length + selectedFiles.length > maxFiles) {
        toast.error(
          locale === 'ar'
            ? `الحد الأقصى ${maxFiles} ملفات`
            : locale === 'kurd'
            ? `Herî zêde ${maxFiles} pel`
            : `Maximum ${maxFiles} files`
        );
        return;
      }
      setFiles([...files, ...selectedFiles]);
    },
    [files, setFiles, maxFiles, locale]
  );

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300',
          isDragging
            ? 'border-gold bg-gold/5'
            : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Icon className="w-8 h-8 text-white/30 mx-auto mb-2" />
        <p className="text-white/50 text-sm">{label}</p>
        <p className="text-white/20 text-xs mt-1">
          {locale === 'ar'
            ? 'اسحب وأفلت الملفات هنا أو اضغط للاختيار'
            : locale === 'kurd'
            ? 'Pelan bikişîne û berde vir an bitikîne ji bo hilbijartinê'
            : 'Drag and drop files here or click to browse'}
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
            >
              {file.type.startsWith('image') ? (
                <FileImage className="w-4 h-4 text-gold shrink-0" />
              ) : (
                <FileVideo className="w-4 h-4 text-gold shrink-0" />
              )}
              <span className="text-white/60 text-xs truncate flex-1">{file.name}</span>
              <span className="text-white/30 text-xs">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="text-white/40 hover:text-red-400 transition-colors"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ConsultationPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = useTranslations('contact');
  const cnsl = useTranslations('consultation');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const getGovLabel = useCallback(
    (gov: { ar: string; kurd: string; en: string }) =>
      locale === 'ar' ? gov.ar : locale === 'kurd' ? gov.kurd : gov.en,
    [locale]
  );

  const getProjectTypeLabel = useCallback(
    (pt: { ar: string; kurd: string; en: string }) =>
      locale === 'ar' ? pt.ar : locale === 'kurd' ? pt.kurd : pt.en,
    [locale]
  );

  const getContactTimeLabel = useCallback(
    (ct: { ar: string; kurd: string; en: string }) =>
      locale === 'ar' ? ct.ar : locale === 'kurd' ? ct.kurd : ct.en,
    [locale]
  );

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const names = formData.fullName.trim().split(/\s+/);

    if (!formData.fullName.trim()) {
      newErrors.fullName =
        locale === 'ar'
          ? 'الاسم الكامل مطلوب'
          : locale === 'kurd'
          ? 'Navê tevahî pêwîst e'
          : 'Full name is required';
    } else if (names.length < 2) {
      newErrors.fullName =
        locale === 'ar'
          ? 'يرجى إدخال الاسم الأول والأخير'
          : locale === 'kurd'
          ? 'Ji kerema xwe nav û paşnavê binivîse'
          : 'Please enter first and last name';
    } else if (names.some((n) => n.length < 2)) {
      newErrors.fullName =
        locale === 'ar'
          ? 'الاسم قصير جداً'
          : locale === 'kurd'
          ? 'Nav pir kurt e'
          : 'Name is too short';
    }

    if (!formData.phone.trim()) {
      newErrors.phone =
        locale === 'ar'
          ? 'رقم الهاتف مطلوب'
          : locale === 'kurd'
          ? 'Hejmara telefonê pêwîst e'
          : 'Phone number is required';
    } else if (!/^(\+?\d{1,3})?[\d\s\-()]{7,15}$/.test(formData.phone.trim())) {
      newErrors.phone =
        locale === 'ar'
          ? 'رقم هاتف غير صالح'
          : locale === 'kurd'
          ? 'Hejmara telefonê nederbasdar e'
          : 'Invalid phone number';
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.city =
        locale === 'ar'
          ? 'بريد إلكتروني غير صالح'
          : locale === 'kurd'
          ? 'E-nameya nederbasdar'
          : 'Invalid email address';
    }

    if (!formData.governorate) {
      newErrors.governorate =
        locale === 'ar'
          ? 'يرجى اختيار المحافظة'
          : locale === 'kurd'
          ? 'Ji kerema xwe parêzgehê hilbijêre'
          : 'Please select a governorate';
    }

    if (!formData.city.trim()) {
      newErrors.city =
        locale === 'ar'
          ? 'المدينة مطلوبة'
          : locale === 'kurd'
          ? 'Bajar pêwîst e'
          : 'City is required';
    } else if (formData.city.trim().length < 2) {
      newErrors.city =
        locale === 'ar'
          ? 'اسم المدينة قصير جداً'
          : locale === 'kurd'
          ? 'Navê bajarî pir kurt e'
          : 'City name is too short';
    }

    if (!formData.projectType) {
      newErrors.projectType =
        locale === 'ar'
          ? 'يرجى اختيار نوع المشروع'
          : locale === 'kurd'
          ? 'Ji kerema xwe cureyê projeyê hilbijêre'
          : 'Please select a project type';
    }

    if (!formData.description.trim()) {
      newErrors.description =
        locale === 'ar'
          ? 'وصف المشروع مطلوب'
          : locale === 'kurd'
          ? 'Danasîna projeyê pêwîst e'
          : 'Project description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description =
        locale === 'ar'
          ? 'يرجى كتابة وصف أطول (10 أحرف على الأقل)'
          : locale === 'kurd'
          ? 'Danasîneke dirêjtir binivîse (herî kêm 10 tîp)'
          : 'Please write a longer description (at least 10 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check
    if (honeypotRef.current?.value) {
      toast.success(
        locale === 'ar'
          ? 'تم استلام طلبك بنجاح'
          : locale === 'kurd'
          ? 'Daxwaza we bi serkeftî hat wergirtin'
          : 'Your request was received successfully'
      );
      return;
    }

    if (!validate()) {
      toast.error(
        locale === 'ar'
          ? 'يرجى تصحيح الأخطاء في النموذج'
          : locale === 'kurd'
          ? 'Ji kerema xwe şaşiyên di formê de rast bike'
          : 'Please correct the errors in the form'
      );
      return;
    }

    setSubmitting(true);

    try {
      await createRequest({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        governorate: formData.governorate,
        city: formData.city.trim(),
        projectType: formData.projectType,
        estimatedArea: formData.estimatedArea.trim() || undefined,
        description: formData.description.trim(),
        images: images.map(() => ''),
        videos: videos.map(() => ''),
        preferredContactMethod: formData.preferredContactMethod,
        preferredContactTime: formData.preferredContactTime,
      });

      toast.success(
        locale === 'ar'
          ? 'تم استلام طلبك بنجاح'
          : locale === 'kurd'
          ? 'Daxwaza we bi serkeftî hat wergirtin'
          : 'Request received successfully'
      );
      setSuccess(true);
      setFormData(initialFormData);
      setImages([]);
      setVideos([]);
    } catch {
      toast.error(
        locale === 'ar'
          ? 'حدث خطأ. يرجى المحاولة مرة أخرى'
          : locale === 'kurd'
          ? 'Şaşiyek çêbû. Ji kerema xwe dîsa biceribîne'
          : 'An error occurred. Please try again'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="section-heading text-gradient-gold mb-4">
              {cnsl('title')}
            </h1>
            <p className="section-subheading mb-6">{cnsl('subtitle')}</p>
            <div className="accent-line mx-auto" />
          </motion.div>
        </div>
      </section>

      {/* Smart Assistant */}
      <section className="pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto">
          <SmartAssistant locale={locale} />
        </div>
      </section>

      {/* Form */}
      <section className="pb-24 px-4 md:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="glass p-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </motion.div>
                <h2 className="text-2xl text-white font-bold mb-3">
                  {t('success_title')}
                </h2>
                <p className="text-white/60 mb-8 max-w-md mx-auto">
                  {t('success_message')}
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="btn-outline"
                >
                  {locale === 'ar'
                    ? 'إرسال طلب آخر'
                    : locale === 'kurd'
                    ? 'Daxwazek Din Bişîne'
                    : 'Submit Another Request'}
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                onSubmit={handleSubmit}
                className="glass p-6 md:p-8 space-y-6"
                noValidate
              >
                {/* Honeypot - hidden from users */}
                <input
                  ref={honeypotRef}
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  className="absolute opacity-0 top-0 left-0 h-0 w-0 -z-10"
                  aria-hidden="true"
                />

                {/* CSRF note */}
                <input
                  type="hidden"
                  name="_csrf"
                  value={typeof document !== 'undefined' ? document.cookie.match(/XSRF-TOKEN=([^;]*)/)?.[1] || '' : ''}
                />

                {/* Full Name */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    {t('name')} <span className="text-gold">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-white placeholder-white/20 text-sm focus:outline-none focus:ring-1 focus:ring-gold/50 transition-all',
                      errors.fullName ? 'border-red-500/50' : 'border-white/10'
                    )}
                    placeholder={
                      locale === 'ar'
                        ? 'الاسم الأول والأخير'
                        : locale === 'kurd'
                        ? 'Nav û Paşnav'
                        : 'First and Last Name'
                    }
                  />
                  {errors.fullName && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-1.5"
                    >
                      {errors.fullName}
                    </motion.p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    {t('your_phone')} <span className="text-gold">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-white placeholder-white/20 text-sm focus:outline-none focus:ring-1 focus:ring-gold/50 transition-all',
                      errors.phone ? 'border-red-500/50' : 'border-white/10'
                    )}
                    placeholder="0750 000 0000"
                    dir="ltr"
                  />
                  {errors.phone && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-1.5"
                    >
                      {errors.phone}
                    </motion.p>
                  )}
                </div>

                {/* Email (Optional) */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    {t('your_email')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:ring-1 focus:ring-gold/50 transition-all"
                    placeholder="email@example.com"
                    dir="ltr"
                  />
                </div>

                {/* Governorate */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    {t('governorate')} <span className="text-gold">*</span>
                  </label>
                  <select
                    value={formData.governorate}
                    onChange={(e) => updateField('governorate', e.target.value)}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-white text-sm focus:outline-none focus:ring-1 focus:ring-gold/50 transition-all appearance-none',
                      errors.governorate ? 'border-red-500/50' : 'border-white/10'
                    )}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C8A84E' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      paddingRight: '2.5rem',
                    }}
                  >
                    <option value="" className="bg-primary">
                      {locale === 'ar'
                        ? 'اختر المحافظة'
                        : locale === 'kurd'
                        ? 'Parêzgehê hilbijêre'
                        : 'Select Governorate'}
                    </option>
                    {Object.entries(governorates).map(([key, val]) => (
                      <option key={key} value={key} className="bg-primary">
                        {getGovLabel(val)}
                      </option>
                    ))}
                  </select>
                  {errors.governorate && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-1.5"
                    >
                      {errors.governorate}
                    </motion.p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    {t('city')} <span className="text-gold">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-white placeholder-white/20 text-sm focus:outline-none focus:ring-1 focus:ring-gold/50 transition-all',
                      errors.city ? 'border-red-500/50' : 'border-white/10'
                    )}
                    placeholder={
                      locale === 'ar'
                        ? 'اسم المدينة'
                        : locale === 'kurd'
                        ? 'Navê bajarî'
                        : 'City name'
                    }
                  />
                  {errors.city && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-1.5"
                    >
                      {errors.city}
                    </motion.p>
                  )}
                </div>

                {/* Project Type */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    {t('project_type')} <span className="text-gold">*</span>
                  </label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => updateField('projectType', e.target.value)}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-white text-sm focus:outline-none focus:ring-1 focus:ring-gold/50 transition-all appearance-none',
                      errors.projectType ? 'border-red-500/50' : 'border-white/10'
                    )}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C8A84E' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      paddingRight: '2.5rem',
                    }}
                  >
                    <option value="" className="bg-primary">
                      {locale === 'ar'
                        ? 'اختر نوع المشروع'
                        : locale === 'kurd'
                        ? 'Cureyê projeyê hilbijêre'
                        : 'Select Project Type'}
                    </option>
                    {projectTypes.map((pt) => (
                      <option key={pt.value} value={pt.value} className="bg-primary">
                        {getProjectTypeLabel(pt.label)}
                      </option>
                    ))}
                  </select>
                  {errors.projectType && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-1.5"
                    >
                      {errors.projectType}
                    </motion.p>
                  )}
                </div>

                {/* Estimated Area (Optional) */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    {t('area')}
                  </label>
                  <input
                    type="text"
                    value={formData.estimatedArea}
                    onChange={(e) => updateField('estimatedArea', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:ring-1 focus:ring-gold/50 transition-all"
                    placeholder={
                      locale === 'ar'
                        ? 'مثال: 300 م²'
                        : locale === 'kurd'
                        ? 'Mînak: 300 m²'
                        : 'e.g. 300 m²'
                    }
                  />
                </div>

                {/* Project Description */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    {t('description')} <span className="text-gold">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={4}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-white placeholder-white/20 text-sm focus:outline-none focus:ring-1 focus:ring-gold/50 transition-all resize-y',
                      errors.description ? 'border-red-500/50' : 'border-white/10'
                    )}
                    placeholder={
                      locale === 'ar'
                        ? 'صف مشروعك بالتفصيل...'
                        : locale === 'kurd'
                        ? 'Projeya xwe bi hûrgilî binivîse...'
                        : 'Describe your project in detail...'
                    }
                  />
                  {errors.description && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-1.5"
                    >
                      {errors.description}
                    </motion.p>
                  )}
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      {t('upload_images')}
                    </label>
                    <DropZone
                      label={t('upload_images')}
                      accept="image/*"
                      icon={FileImage}
                      files={images}
                      setFiles={setImages}
                      maxFiles={5}
                      locale={locale}
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      {t('upload_videos')}
                    </label>
                    <DropZone
                      label={t('upload_videos')}
                      accept="video/*"
                      icon={FileVideo}
                      files={videos}
                      setFiles={setVideos}
                      maxFiles={3}
                      locale={locale}
                    />
                  </div>
                </div>

                {/* Preferred Contact Method */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-3">
                    {t('preferred_contact')}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'whatsapp', icon: MessageCircle, label: 'WhatsApp', color: 'green' },
                      { value: 'phone', icon: Phone, label: t('phone'), color: 'blue' },
                      { value: 'email', icon: Mail, label: t('email'), color: 'gold' },
                    ].map((method) => (
                      <label
                        key={method.value}
                        className={cn(
                          'relative flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-pointer transition-all duration-300',
                          formData.preferredContactMethod === method.value
                            ? 'border-gold bg-gold/10 text-white'
                            : 'border-white/10 bg-white/[0.02] text-white/50 hover:border-white/20'
                        )}
                      >
                        <input
                          type="radio"
                          name="preferredContactMethod"
                          value={method.value}
                          checked={formData.preferredContactMethod === method.value}
                          onChange={(e) =>
                            updateField(
                              'preferredContactMethod',
                              e.target.value as 'whatsapp' | 'phone' | 'email'
                            )
                          }
                          className="sr-only"
                        />
                        <method.icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Preferred Contact Time */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    {t('preferred_time')}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {contactTimes.map((ct) => (
                      <label
                        key={ct.value}
                        className={cn(
                          'relative flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all duration-300 text-sm',
                          formData.preferredContactTime === ct.value
                            ? 'border-gold bg-gold/10 text-white'
                            : 'border-white/10 bg-white/[0.02] text-white/50 hover:border-white/20'
                        )}
                      >
                        <input
                          type="radio"
                          name="preferredContactTime"
                          value={ct.value}
                          checked={formData.preferredContactTime === ct.value}
                          onChange={(e) => updateField('preferredContactTime', e.target.value)}
                          className="sr-only"
                        />
                        {getContactTimeLabel(ct.label)}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: submitting ? 1 : 1.02 }}
                  whileTap={{ scale: submitting ? 1 : 0.98 }}
                  className="w-full btn-primary text-base py-4 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {locale === 'ar'
                        ? 'جارٍ الإرسال...'
                        : locale === 'kurd'
                        ? 'Tê şandin...'
                        : 'Sending...'}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" />
                      {t('submit')}
                    </span>
                  )}
                </motion.button>

                {/* No price note */}
                <p className="text-white/20 text-xs text-center">
                  {locale === 'ar'
                    ? 'نحن لا نعرض الأسعار في هذا النموذج. تواصل معنا للحصول على استشارة مجانية.'
                    : locale === 'kurd'
                    ? 'Em bihayan di vê formê de nîşan nadin. Ji bo şêwirmendiya belaş bi me re têkilî daynin.'
                    : 'We do not display prices. Contact us for a free consultation.'}
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
