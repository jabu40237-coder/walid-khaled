// Core types for Walid Khaled website

export interface Project {
  id: string;
  title: { ar: string; kurd: string; en: string };
  description: { ar: string; kurd: string; en: string };
  shortDescription: { ar: string; kurd: string; en: string };
  governorate: string;
  city: string;
  category: ProjectCategory;
  completionYear: number;
  coverImage: string;
  images: string[];
  videos: string[];
  beforeImages: string[];
  afterImages: string[];
  materials: string[];
  highlights: { ar: string; kurd: string; en: string }[];
  challenges: { ar: string; kurd: string; en: string };
  designProcess: { ar: string; kurd: string; en: string };
  executionProcess: { ar: string; kurd: string; en: string };
  clientTestimonial?: {
    name: string;
    role: string;
    text: { ar: string; kurd: string; en: string };
    rating: number;
  };
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectCategory =
  | 'residential'
  | 'villas'
  | 'commercial'
  | 'renovation'
  | 'eps-insulation'
  | 'classical'
  | 'modern'
  | 'decorative';

export interface Service {
  id: string;
  title: { ar: string; kurd: string; en: string };
  description: { ar: string; kurd: string; en: string };
  longDescription: { ar: string; kurd: string; en: string };
  icon: string;
  image: string;
  order: number;
  features: { ar: string; kurd: string; en: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
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

export interface ConsultationRequest {
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
  preferredContactMethod: 'whatsapp' | 'phone' | 'email';
  preferredContactTime: string;
  read: boolean;
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: { ar: string; kurd: string; en: string };
  answer: { ar: string; kurd: string; en: string };
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  id: string;
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
  stats: {
    completedProjects: number;
    yearsExperience: number;
    governorates: string;
    satisfaction: string;
  };
  seo: {
    title: { ar: string; kurd: string; en: string };
    description: { ar: string; kurd: string; en: string };
    keywords: string;
  };
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  folder: string;
  projectId?: string;
  createdAt: string;
}

export interface Analytics {
  totalProjects: number;
  totalPhotos: number;
  totalVideos: number;
  totalRequests: number;
  totalVisitors: number;
  mostViewedProjects: { id: string; title: string; views: number }[];
  latestRequests: ConsultationRequest[];
  monthlyStats: { month: string; visitors: number; requests: number }[];
  deviceTypes: { desktop: number; mobile: number; tablet: number };
  trafficSources: { direct: number; social: number; search: number; referral: number };
}

export type Locale = 'ar' | 'kurd' | 'en';

export interface PageProps {
  params: { locale: Locale; id?: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

// ──────────────────────────────────────────────
// Backup & Restore
// ──────────────────────────────────────────────

export interface BackupManifest {
  version: string;
  createdAt: string;
  checksum: string;
  counts: {
    projects: number;
    services: number;
    reviews: number;
    requests: number;
    faqs: number;
    mediaFiles: number;
  };
  label?: string;
}

export interface BackupData {
  manifest: BackupManifest;
  projects: Project[];
  services: Service[];
  reviews: Review[];
  requests: ConsultationRequest[];
  faqs: FAQ[];
  mediaFiles: MediaFile[];
  settings: Omit<SiteSettings, 'id'> & { id?: string };
}

export interface BackupListItem {
  id: string;
  filename: string;
  manifest: BackupManifest;
  sizeBytes: number;
}
