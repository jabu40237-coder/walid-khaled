import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { FloatingButtons } from '@/components/layout/FloatingButtons';
import { Toaster } from 'react-hot-toast';

const locales = ['ar', 'kurd', 'en'];

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale)) notFound();

  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' || locale === 'kurd' ? 'rtl' : 'ltr'} className="dark" suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <div className="flex flex-col min-h-screen">
              <Navigation locale={locale} />
              <main className="flex-1">{children}</main>
              <Footer locale={locale} />
              <FloatingButtons locale={locale} />
            </div>
            <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  background: '#1A1A1A',
                  color: '#fff',
                  border: '1px solid rgba(200, 168, 78, 0.3)',
                },
              }}
            />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
