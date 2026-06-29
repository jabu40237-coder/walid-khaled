import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className="bg-primary text-white min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-8xl md:text-9xl font-display font-bold text-gold/20 mb-6">404</div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
            الصفحة غير موجودة
          </h1>
          <p className="text-white/50 mb-8 max-w-md mx-auto">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          </p>
          <Link
            href="/ar"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-primary font-medium hover:bg-gold-400 transition-colors"
          >
            العودة للرئيسية
          </Link>
        </div>
      </body>
    </html>
  );
}
