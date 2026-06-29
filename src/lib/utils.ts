import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string, locale: string): string {
  return new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-IQ' : locale === 'kurd' ? 'ku' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getDirection(locale: string): 'rtl' | 'ltr' {
  return locale === 'ar' || locale === 'kurd' ? 'rtl' : 'ltr';
}

export const governorates: Record<string, { ar: string; kurd: string; en: string }> = {
  duhok: { ar: 'دهوك', kurd: 'Duhok', en: 'Duhok' },
  erbil: { ar: 'أربيل', kurd: 'Hewlêr', en: 'Erbil' },
  sulaymaniyah: { ar: 'السليمانية', kurd: 'Silêmanî', en: 'Sulaymaniyah' },
  nineveh: { ar: 'نينوى', kurd: 'Neynewa', en: 'Nineveh' },
  baghdad: { ar: 'بغداد', kurd: 'Bexda', en: 'Baghdad' },
  basra: { ar: 'البصرة', kurd: 'Besre', en: 'Basra' },
  kirkuk: { ar: 'كركوك', kurd: 'Kerkûk', en: 'Kirkuk' },
  anbar: { ar: 'الأنبار', kurd: 'Enbar', en: 'Anbar' },
  diyala: { ar: 'ديالى', kurd: 'Diyale', en: 'Diyala' },
  karbala: { ar: 'كربلاء', kurd: 'Kerbelâ', en: 'Karbala' },
  najaf: { ar: 'النجف', kurd: 'Necef', en: 'Najaf' },
  wasit: { ar: 'واسط', kurd: 'Wasit', en: 'Wasit' },
  qadisiyah: { ar: 'القادسية', kurd: 'Qadisiye', en: 'Al-Qadisiyah' },
  maysan: { ar: 'ميسان', kurd: 'Mêysan', en: 'Maysan' },
  dhiqar: { ar: 'ذي قار', kurd: 'Zîqar', en: 'Dhi Qar' },
  mutanna: { ar: 'المثنى', kurd: 'Musenna', en: 'Al-Muthanna' },
  salahuddin: { ar: 'صلاح الدين', kurd: 'Selahedîn', en: 'Salah al-Din' },
  babylon: { ar: 'بابل', kurd: 'Babîl', en: 'Babylon' },
};

export const projectCategories: Record<string, { ar: string; kurd: string; en: string; icon: string }> = {
  residential: { ar: 'منازل سكنية', kurd: 'Xaniyên Niştecîh', en: 'Residential Houses', icon: 'Home' },
  villas: { ar: 'فلل فاخرة', kurd: 'Vîlayên Luks', en: 'Luxury Villas', icon: 'Building2' },
  commercial: { ar: 'مباني تجارية', kurd: 'Avahiyên Bazirganî', en: 'Commercial Buildings', icon: 'Building' },
  renovation: { ar: 'ترميم خارجي', kurd: 'Nûjenkirina Derve', en: 'Exterior Renovation', icon: 'Wrench' },
  'eps-insulation': { ar: 'عزل EPS', kurd: 'Îzolasyona EPS', en: 'EPS Insulation', icon: 'Shield' },
  classical: { ar: 'واجهات كلاسيكية', kurd: 'Façadeyên Klasîk', en: 'Classical Facades', icon: 'Landmark' },
  modern: { ar: 'واجهات حديثة', kurd: 'Façadeyên Modern', en: 'Modern Facades', icon: 'Sparkles' },
  decorative: { ar: 'عناصر زخرفية', kurd: 'Hêmanên Dekoratîf', en: 'Decorative Elements', icon: 'Palette' },
};

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function truncate(str: string, length: number) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getWhatsAppLink(phone: string, message?: string) {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  let url = `https://wa.me/${cleanPhone}`;
  if (message) {
    url += `?text=${encodeURIComponent(message)}`;
  }
  return url;
}

export function generateSEOMetadata(
  title: string,
  description: string,
  locale: string,
  image?: string,
  path: string = '/'
) {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      locale: locale === 'ar' ? 'ar_IQ' : 'en_US',
      type: 'website' as const,
      images: image ? [{ url: image, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: image ? [image] : [],
    },
    alternates: {
      canonical: path,
      languages: {
        ar: `/ar${path}`,
        kurd: `/kurd${path}`,
        en: `/en${path}`,
      },
    },
  };
}
