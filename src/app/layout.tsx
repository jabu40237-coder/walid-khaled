import type { Metadata } from 'next';
import { Inter, Playfair_Display, Noto_Naskh_Arabic } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Walid Khaled – Exterior Design & Facades',
  description: 'Luxury exterior facade design and execution across all governorates of Iraq since 2009. Specializing in EPS insulation, architectural decorations, and premium facade solutions.',
  keywords: 'facade, exterior design, EPS insulation, Iraq, Duhok, واجهات, تصميم خارجي',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Walid Khaled – Exterior Design & Facades',
    description: 'Luxury exterior facade design and execution across all governorates of Iraq since 2009.',
    type: 'website',
    locale: 'ar_IQ',
    siteName: 'Walid Khaled',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Walid Khaled – Exterior Design & Facades',
    description: 'Luxury exterior facade design and execution across all governorates of Iraq since 2009.',
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
