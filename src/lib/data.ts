// Mocked data layer — replace with Supabase/PostgreSQL in production
// All operations are async to allow seamless swap to a real database later

import { Project, Service, Review, ConsultationRequest, FAQ, SiteSettings, Analytics, MediaFile } from '@/types';

// --- In-memory stores (replace with database queries) ---
let projects: Project[] = [];
let services: Service[] = [];
let reviews: Review[] = [];
let requests: ConsultationRequest[] = [];
let faqs: FAQ[] = [];
let mediaFiles: MediaFile[] = [];
let settings: SiteSettings = getDefaultSettings();
let visitors = 0;

function getDefaultSettings(): SiteSettings {
  return {
    id: 'default',
    companyName: { ar: 'وليد خالد', kurd: 'Welîd Xalid', en: 'Walid Khaled' },
    brandName: { ar: 'وليد خالد – تصميم خارجي وواجهات', kurd: 'Welîd Xalid – Sêwirana Derve û Façade', en: 'Walid Khaled – Exterior Design & Facades' },
    logo: '/images/logo.png',
    heroVideo: '/videos/hero.mp4',
    heroImages: [],
    heroHeadline: {
      ar: 'تصميم خارجي فاخر وحلول واجهات مميزة',
      kurd: 'Sêwirana Derve ya Luks û Çareseriyên Façadeyên Premium',
      en: 'Luxury Exterior Design & Premium Facade Solutions',
    },
    heroSubtitle: {
      ar: 'منذ عام 2009، تخصصنا في تصميم وتنفيذ الواجهات الخارجية الفاخرة وأنظمة العزل EPS والزخارف المعمارية في جميع محافظات العراق.',
      kurd: 'Ji 2009an ve, em di sêwirandin û cîbicîkirina façadeyên derve yên luks, pergalên îzolasyona EPS û dekorasyona mîmarî de li hemû parêzgehên Iraqê pispor in.',
      en: 'Since 2009, we have specialized in designing and executing luxury exterior facades, EPS insulation systems, and architectural decorations across all governorates of Iraq.',
    },
    aboutDescription: {
      ar: 'وليد خالد هي شركة رائدة في مجال تصميم وتنفيذ الواجهات الخارجية في العراق. مع أكثر من 1500 مشروع مكتمل، نقدم خدمات متكاملة تشمل العزل الحراري EPS والزخرفة الخارجية والعناصر المعمارية.',
      kurd: 'Welîd Xalid pargîdaniyek pêşeng e di sêwirandin û cîbicîkirina façadeyên derve de li Iraqê. Bi zêdetirî 1500 projeyên temamkirî, em xizmetguzariyên yekbûyî pêşkêş dikin.',
      en: 'Walid Khaled is a leading company in exterior facade design and execution in Iraq. With over 1500 completed projects, we offer integrated services including EPS thermal insulation, exterior decoration, and architectural elements.',
    },
    phone1: '07507669742',
    phone2: '07824440503',
    whatsapp: '07507669742',
    email: 'info@walidkhaled.com',
    address: { ar: 'دهوك – العراق', kurd: 'Duhok – Iraq', en: 'Duhok – Iraq' },
    facebook: 'https://www.facebook.com/share/1APX5nYKUM/',
    instagram: 'https://www.instagram.com/walid_khalid444',
    tiktok: 'https://www.tiktok.com/@walidkhald0',
    workingHours: { ar: 'السبت – الخميس: ٨:٠٠ صباحاً – ٦:٠٠ مساءً', kurd: 'Şemî – Pêncşem: 8:00 sibê – 6:00 êvarê', en: 'Sat – Thu: 8:00 AM – 6:00 PM' },
    stats: { completedProjects: 1500, yearsExperience: 16, governorates: 'جميع المحافظات', satisfaction: '99%' },
    seo: {
      title: { ar: 'وليد خالد – تصميم خارجي وواجهات', kurd: 'Welîd Xalid – Sêwirana Derve û Façade', en: 'Walid Khaled – Exterior Design & Facades' },
      description: { ar: 'شركة وليد خالد متخصصة في تصميم وتنفيذ الواجهات الخارجية الفاخرة في العراق', kurd: 'Pargîdaniya Welîd Xalid pispor di sêwirandin û cîbicîkirina façadeyên derve yên luks de li Iraqê', en: 'Walid Khaled specializes in luxury exterior facade design and execution across Iraq' },
      keywords: 'facade, exterior design, EPS insulation, Iraq, Duhok, واجهات, تصميم خارجي',
    },
  };
}

// --- Settings ---
export async function getSettings(): Promise<SiteSettings> {
  return settings;
}

export async function updateSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
  settings = { ...settings, ...updates };
  return settings;
}

// --- Projects ---
export async function getProjects(options?: {
  category?: string;
  governorate?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ projects: Project[]; total: number }> {
  let filtered = [...projects];

  if (options?.category) filtered = filtered.filter(p => p.category === options.category);
  if (options?.governorate) filtered = filtered.filter(p => p.governorate === options.governorate);
  if (options?.search) {
    const s = options.search.toLowerCase();
    filtered = filtered.filter(p =>
      Object.values(p.title).some(v => v.toLowerCase().includes(s)) ||
      Object.values(p.description).some(v => v.toLowerCase().includes(s)) ||
      p.city.toLowerCase().includes(s)
    );
  }
  if (options?.featured) filtered = filtered.filter(p => p.featured);
  filtered.sort((a, b) => b.order - a.order);

  const total = filtered.length;
  if (options?.offset) filtered = filtered.slice(options.offset);
  if (options?.limit) filtered = filtered.slice(0, options.limit);

  return { projects: filtered, total };
}

export async function getProject(id: string): Promise<Project | null> {
  return projects.find(p => p.id === id) ?? null;
}

export async function createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const project: Project = {
    ...data,
    id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  projects.push(project);
  return project;
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project | null> {
  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) return null;
  projects[idx] = { ...projects[idx], ...data, updatedAt: new Date().toISOString() };
  return projects[idx];
}

export async function deleteProject(id: string): Promise<boolean> {
  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) return false;
  projects.splice(idx, 1);
  return true;
}

// --- Services ---
export async function getServices(): Promise<Service[]> {
  return [...services].sort((a, b) => a.order - b.order);
}

export async function getService(id: string): Promise<Service | null> {
  return services.find(s => s.id === id) ?? null;
}

export async function createService(data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
  const service: Service = {
    ...data,
    id: `svc_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  services.push(service);
  return service;
}

export async function updateService(id: string, data: Partial<Service>): Promise<Service | null> {
  const idx = services.findIndex(s => s.id === id);
  if (idx === -1) return null;
  services[idx] = { ...services[idx], ...data, updatedAt: new Date().toISOString() };
  return services[idx];
}

export async function deleteService(id: string): Promise<boolean> {
  const idx = services.findIndex(s => s.id === id);
  if (idx === -1) return false;
  services.splice(idx, 1);
  return true;
}

// --- Reviews ---
export async function getReviews(approvedOnly = true): Promise<Review[]> {
  let items = [...reviews];
  if (approvedOnly) items = items.filter(r => r.approved);
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createReview(data: Omit<Review, 'id' | 'approved' | 'createdAt'>): Promise<Review> {
  const review: Review = {
    ...data,
    id: `rev_${Date.now()}`,
    approved: false,
    createdAt: new Date().toISOString(),
  };
  reviews.push(review);
  return review;
}

export async function approveReview(id: string): Promise<Review | null> {
  const idx = reviews.findIndex(r => r.id === id);
  if (idx === -1) return null;
  reviews[idx].approved = true;
  return reviews[idx];
}

export async function deleteReview(id: string): Promise<boolean> {
  const idx = reviews.findIndex(r => r.id === id);
  if (idx === -1) return false;
  reviews.splice(idx, 1);
  return true;
}

// --- Consultation Requests ---
export async function createRequest(data: Omit<ConsultationRequest, 'id' | 'read' | 'createdAt'>): Promise<ConsultationRequest> {
  const req: ConsultationRequest = {
    ...data,
    id: `req_${Date.now()}`,
    read: false,
    createdAt: new Date().toISOString(),
  };
  requests.push(req);
  return req;
}

export async function getRequests(): Promise<ConsultationRequest[]> {
  return [...requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markRequestRead(id: string): Promise<void> {
  const idx = requests.findIndex(r => r.id === id);
  if (idx !== -1) requests[idx].read = true;
}

export async function deleteRequest(id: string): Promise<boolean> {
  const idx = requests.findIndex(r => r.id === id);
  if (idx === -1) return false;
  requests.splice(idx, 1);
  return true;
}

// --- FAQs ---
export async function getFAQs(): Promise<FAQ[]> {
  return [...faqs].sort((a, b) => a.order - b.order);
}

export async function createFAQ(data: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>): Promise<FAQ> {
  const faq: FAQ = { ...data, id: `faq_${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  faqs.push(faq);
  return faq;
}

export async function updateFAQ(id: string, data: Partial<FAQ>): Promise<FAQ | null> {
  const idx = faqs.findIndex(f => f.id === id);
  if (idx === -1) return null;
  faqs[idx] = { ...faqs[idx], ...data, updatedAt: new Date().toISOString() };
  return faqs[idx];
}

export async function deleteFAQ(id: string): Promise<boolean> {
  const idx = faqs.findIndex(f => f.id === id);
  if (idx === -1) return false;
  faqs.splice(idx, 1);
  return true;
}

// --- Media ---
export async function getMediaFiles(options?: { projectId?: string; folder?: string; search?: string }): Promise<MediaFile[]> {
  let items = [...mediaFiles];
  if (options?.projectId) items = items.filter(m => m.projectId === options.projectId);
  if (options?.folder) items = items.filter(m => m.folder === options.folder);
  if (options?.search) { const s = options.search.toLowerCase(); items = items.filter(m => m.originalName.toLowerCase().includes(s)); }
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addMediaFile(data: Omit<MediaFile, 'id' | 'createdAt'>): Promise<MediaFile> {
  const file: MediaFile = { ...data, id: `med_${Date.now()}`, createdAt: new Date().toISOString() };
  mediaFiles.push(file);
  return file;
}

export async function deleteMediaFile(id: string): Promise<boolean> {
  const idx = mediaFiles.findIndex(m => m.id === id);
  if (idx === -1) return false;
  mediaFiles.splice(idx, 1);
  return true;
}

// --- Analytics ---
export async function getAnalytics(): Promise<Analytics> {
  visitors++;
  return {
    totalProjects: projects.length,
    totalPhotos: mediaFiles.filter(m => m.mimeType.startsWith('image')).length,
    totalVideos: mediaFiles.filter(m => m.mimeType.startsWith('video')).length,
    totalRequests: requests.length,
    totalVisitors: visitors,
    mostViewedProjects: [],
    latestRequests: requests.slice(0, 5),
    monthlyStats: [],
    deviceTypes: { desktop: 60, mobile: 30, tablet: 10 },
    trafficSources: { direct: 40, social: 35, search: 20, referral: 5 },
  };
}

// --- Auth ---
// Credential storage and admin functions are now in @/lib/admin-store
// They are re-exported at the top of this file for backward compatibility

// ──────────────────────────────────────────────
// Backup & Restore — pure data operations
// (no Node.js deps; checksums + file I/O are in backup-store.ts)
// ──────────────────────────────────────────────

import { BackupData } from '@/types';

/**
 * Export all website data. Does NOT include admin credentials.
 * Checksum is empty — filled in by backup-store.
 */
export async function exportAllData(): Promise<BackupData> {
  const allProjects = (await getProjects()).projects;
  const allServices = await getServices();
  const allReviews = await getReviews(false);
  const allRequests = await getRequests();
  const allFAQs = await getFAQs();
  const allMedia = await getMediaFiles();
  const currentSettings = await getSettings();

  return {
    manifest: {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      checksum: '',
      counts: {
        projects: allProjects.length,
        services: allServices.length,
        reviews: allReviews.length,
        requests: allRequests.length,
        faqs: allFAQs.length,
        mediaFiles: allMedia.length,
      },
    },
    projects: allProjects,
    services: allServices,
    reviews: allReviews,
    requests: allRequests,
    faqs: allFAQs,
    mediaFiles: allMedia,
    settings: currentSettings,
  };
}

/**
 * Replace all data stores with imported backup data.
 * Called by restore API (validates before calling).
 */
export function _importAll(data: BackupData): void {
  // Use the module-level vars directly (same module)
  // These are set by createProject, createService, etc.
  // We assign directly since this function is in the same module.

  // Clear existing
  projects.length = 0;
  services.length = 0;
  reviews.length = 0;
  requests.length = 0;
  faqs.length = 0;
  mediaFiles.length = 0;

  // Import
  projects.push(...data.projects);
  services.push(...data.services);
  reviews.push(...data.reviews);
  requests.push(...data.requests);
  faqs.push(...data.faqs);
  mediaFiles.push(...data.mediaFiles);

  if (data.settings) {
    settings = data.settings as SiteSettings;
  }
}

// --- Seed data ---
export async function seedDefaultData() {
  if (services.length === 0) {
    const defaultServices: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>[] = [
      { title: { ar: 'عزل الواجهات EPS', kurd: 'Îzolasyona Façade EPS', en: 'EPS Facade Insulation' }, description: { ar: 'أنظمة عزل حراري متكاملة للواجهات الخارجية', kurd: 'Pergalên îzolasyona germî ji bo façadeyên derve', en: 'Complete thermal insulation systems for exterior facades' }, longDescription: { ar: 'نستخدم أحدث تقنيات العزل الحراري EPS لتوفير حماية مثلى للمباني ضد الحرارة والرطوبة. نظام العزل EPS يقلل استهلاك الطاقة ويحسن المظهر الجمالي للواجهات.', kurd: 'Em teknîkên herî nû yên îzolasyona germî EPS bikar tînin da ku parastina çêtirîn ji bo avahiyan li dijî germê û şêdariyê peyda bikin. Pergala îzolasyona EPS xerckirina enerjiyê kêm dike û dîmenê estetîk ê façadeyan baştir dike.', en: 'We use the latest EPS thermal insulation technologies to provide optimal protection for buildings against heat and moisture. The EPS insulation system reduces energy consumption and improves the aesthetic appearance of facades.' }, icon: 'Shield', image: '', order: 1, features: [
        { ar: 'عزل حراري عالي الكفاءة', kurd: 'Îzolasyona germî ya bi karîgeriya bilind', en: 'High-efficiency thermal insulation' },
        { ar: 'مقاومة للرطوبة والعفن', kurd: 'Berxwedêr li dijî şêdariyê û kêzikê', en: 'Moisture and mold resistant' },
        { ar: 'توفير في استهلاك الطاقة', kurd: 'Teserûfkirina xerckirina enerjiyê', en: 'Energy consumption savings' },
        { ar: 'عمر افتراضي طويل', kurd: 'Jiyana dirêj', en: 'Long lifespan' },
      ] },
      { title: { ar: 'تصميم الواجهات الخارجية', kurd: 'Sêwirana Façadeyên Derve', en: 'Exterior Facade Design' }, description: { ar: 'تصاميم عصرية وأنيقة للواجهات الخارجية', kurd: 'Sêwiranên modern û elegant bo façadeyên derve', en: 'Modern and elegant exterior facade designs' }, longDescription: { ar: 'نقدم تصاميم معمارية فريدة تناسب ذوقك واحتياجاتك. فريق التصميم لدينا يستخدم أحدث برامج التصميم ثلاثي الأبعاد لتصور المشروع قبل البدء بالتنفيذ.', kurd: 'Em sêwiranên mîmarî yên bêhempa pêşkêş dikin ku li gorî tam û pêdiviyên te ne. Tîma sêwirana me nermalava herî nû ya sêwirana 3D bikar tîne da ku projeyê berî destpêkirina cîbicîkirinê xeyal bike.', en: 'We offer unique architectural designs that suit your taste and needs. Our design team uses the latest 3D design software to visualize the project before execution begins.' }, icon: 'Building2', image: '', order: 2, features: [
        { ar: 'تصاميم مخصصة حسب الطلب', kurd: 'Sêwiranên taybet li gorî daxwazê', en: 'Custom designs on request' },
        { ar: 'عرض ثلاثي الأبعاد قبل التنفيذ', kurd: 'Pêşkêşkirina 3D berî cîbicîkirinê', en: '3D preview before execution' },
        { ar: 'أنماط معمارية متنوعة', kurd: 'Şêweyên mîmarî yên cihêreng', en: 'Diverse architectural styles' },
      ] },
      { title: { ar: 'الديكور الخارجي الفاخر', kurd: 'Dekorasyona Derve ya Luks', en: 'Luxury Exterior Decoration' }, description: { ar: 'زخارف خارجية فاخرة تضيف طابعاً مميزاً', kurd: 'Dekorasyona derve ya luks taybetmendiyek taybet zêde dike', en: 'Luxury exterior decorations that add distinctive character' }, longDescription: { ar: 'نضيف لمسات فنية فاخرة لواجهات المباني باستخدام أجود المواد وأحدث التقنيات.', kurd: 'Em têkiliyên hunerî yên luks li façadeyên avahiyan zêde dikin bi karanîna materyalên herî baş û teknîkên herî nû.', en: 'We add luxurious artistic touches to building facades using the finest materials and latest techniques.' }, icon: 'Palette', image: '', order: 3, features: [] },
      { title: { ar: 'الأعمدة والعناصر المعمارية', kurd: 'Stûn û Hêmanên Mîmarî', en: 'Columns & Architectural Elements' }, description: { ar: 'تصميم وتنفيذ أعمدة وعناصر معمارية فاخرة', kurd: 'Sêwirandin û cîbicîkirina stûn û hêmanên mîmarî yên luks', en: 'Design and execution of luxury columns and architectural elements' }, longDescription: { ar: '', kurd: '', en: '' }, icon: 'Landmark', image: '', order: 4, features: [] },
      { title: { ar: 'التشطيب الخارجي', kurd: 'Temamkirina Derve', en: 'Exterior Finishing' }, description: { ar: 'تشطيبات خارجية عالية الجودة', kurd: 'Temamkirina derve ya bi kalîteya bilind', en: 'High-quality exterior finishing' }, longDescription: { ar: '', kurd: '', en: '' }, icon: 'Paintbrush', image: '', order: 5, features: [] },
      { title: { ar: 'ترميم الواجهات', kurd: 'Nûjenkirina Façadeyê', en: 'Facade Renovation' }, description: { ar: 'ترميم وتجديد الواجهات القديمة', kurd: 'Nûjenkirin û vejandina façadeyên kevn', en: 'Restoration and renovation of old facades' }, longDescription: { ar: '', kurd: '', en: '' }, icon: 'Wrench', image: '', order: 6, features: [] },
      { title: { ar: 'تصميم ثلاثي الأبعاد قبل التنفيذ', kurd: 'Sêwirana 3D Berî Cîbicîkirinê', en: '3D Design Before Execution' }, description: { ar: 'نقدم تصاميم ثلاثية الأبعاد للمشروع قبل البدء بالتنفيذ', kurd: 'Em sêwiranên 3D ji bo projeyê berî destpêkirina cîbicîkirinê pêşkêş dikin', en: 'We provide 3D designs for the project before execution begins' }, longDescription: { ar: '', kurd: '', en: '' }, icon: 'Cuboid', image: '', order: 7, features: [] },
      { title: { ar: 'إشراف كامل على المشروع', kurd: 'Çavdêriya Tevahî ya Projeyê', en: 'Full Project Supervision' }, description: { ar: 'إشراف كامل على جميع مراحل التنفيذ', kurd: 'Çavdêriya tevahî li ser hemû qonaxên cîbicîkirinê', en: 'Complete supervision of all execution phases' }, longDescription: { ar: '', kurd: '', en: '' }, icon: 'Eye', image: '', order: 8, features: [] },
    ];
    for (const s of defaultServices) {
      await createService(s);
    }
  }

  if (faqs.length === 0) {
    const defaultFAQs: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>[] = [
      { question: { ar: 'ما هو عزل EPS؟', kurd: 'Îzolasyona EPS çi ye?', en: 'What is EPS insulation?' }, answer: { ar: 'عزل EPS (البوليسترين الممدد) هو نظام عزل حراري متطور للواجهات الخارجية. يوفر حماية ممتازة ضد الحرارة والرطوبة، ويحسن كفاءة الطاقة في المبنى، ويمنح مظهراً جمالياً ممتازاً للواجهات.', kurd: 'Îzolasyona EPS (Polîstîrêna Berfirehkirî) pergalek îzolasyona germî ya pêşketî ye ji bo façadeyên derve. Parastina hêja li dijî germê û şilbûnê peyda dike, karbidestiya enerjiyê ya avahiyê baştir dike, û xuyangek estetîk a hêja dide façadeyan.', en: 'EPS (Expanded Polystyrene) insulation is an advanced thermal insulation system for exterior facades. It provides excellent protection against heat and moisture, improves building energy efficiency, and gives facades an excellent aesthetic appearance.' }, order: 1 },
      { question: { ar: 'كم تستغرق مدة التنفيذ؟', kurd: 'Maweya cîbicîkirinê çend e?', en: 'How long does execution take?' }, answer: { ar: 'تختلف مدة التنفيذ حسب حجم المشروع. المشاريع السكنية الصغيرة قد تستغرق من أسبوعين إلى شهر، بينما المشاريع التجارية الكبيرة قد تستغرق عدة أشهر. نقدم جدولاً زمنياً دقيقاً قبل بدء العمل.', kurd: 'Maweya cîbicîkirinê li gorî mezinahiya projeyê diguhere. Projeyên niştecîbûnê yên biçûk dibe ku 2 hefte heya 1 mehê bidomînin, dema ku projeyên bazirganî yên mezin dibe ku çend mehan bidomînin. Em berî destpêkirina kar bernameyek demkî ya rast peyda dikin.', en: 'Execution time varies based on project size. Small residential projects may take 2 weeks to 1 month, while large commercial projects may take several months. We provide a detailed timeline before work begins.' }, order: 2 },
      { question: { ar: 'هل تخدمون جميع محافظات العراق؟', kurd: 'Ma hûn li hemû parêzgehên Iraqê xizmet dikin?', en: 'Do you serve all governorates of Iraq?' }, answer: { ar: 'نعم، نخدم جميع محافظات العراق. لدينا مشاريع منجزة في دهوك وأربيل والسليمانية ونينوى وبغداد والبصرة وغيرها من المحافظات.', kurd: 'Belê, em li hemû parêzgehên Iraqê xizmet dikin. Projeyên me yên qediyayî li Duhok, Hewlêr, Silêmanî, Neynewa, Bexda, Besre û parêzgehên din hene.', en: 'Yes, we serve all governorates of Iraq. We have completed projects in Duhok, Erbil, Sulaymaniyah, Nineveh, Baghdad, Basra, and other governorates.' }, order: 3 },
      { question: { ar: 'هل تقدمون تصاميم مخصصة؟', kurd: 'Ma hûn sêwiranên taybet pêşkêş dikin?', en: 'Do you offer custom designs?' }, answer: { ar: 'نعم، جميع تصاميمنا مخصصة حسب احتياجات العميل وطبيعة المشروع. نقدم تصاميم ثلاثية الأبعاد قبل التنفيذ لضمان رضاك الكامل.', kurd: 'Belê, hemû sêwiranên me li gorî hewcedariyên xerîdar û cewhera projeyê têne xweşkirin. Em sêwiranên 3D berî cîbicîkirinê pêşkêş dikin da ku razîbûna weya tam misoger bikin.', en: 'Yes, all our designs are customized according to client needs and project nature. We provide 3D designs before execution to ensure your complete satisfaction.' }, order: 4 },
      { question: { ar: 'هل الاستشارة مجانية؟', kurd: 'Ma şêwirmendî belaş e?', en: 'Is consultation free?' }, answer: { ar: 'نعم، نقدم استشارة مجانية لجميع العملاء. يمكنك التواصل معنا عبر الهاتف أو واتساب أو ملء نموذج طلب الاستشارة، وسيتواصل معك فريقنا في أقرب وقت.', kurd: 'Belê, em ji bo hemû xerîdaran şêwirmendiya belaş pêşkêş dikin. Hûn dikarin bi me re bi telefon, WhatsApp, an dagirtina forma daxwaza şêwirmendiyê têkilî daynin, û tîma me dê di demek nêzîk de bi we re têkilî dayne.', en: 'Yes, we offer free consultation for all clients. You can contact us via phone, WhatsApp, or fill out the consultation request form, and our team will contact you as soon as possible.' }, order: 5 },
    ];
    for (const f of defaultFAQs) {
      await createFAQ(f);
    }
  }
}
