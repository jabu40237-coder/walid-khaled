import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://walidkhaled.com';
  const locales = ['ar', 'kurd', 'en'];

  const publicRoutes = [
    '',
    '/projects',
    '/services',
    '/contact',
    '/faq',
    '/consultation',
    '/reviews',
    '/privacy',
    '/terms',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of publicRoutes) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1 : 0.8,
      });
    }
  }

  return sitemapEntries;
}
