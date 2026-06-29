import { useTranslations } from 'next-intl';
import type { Locale } from '@/types';

export default function PrivacyPage({ params: { locale } }: { params: { locale: Locale } }) {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 lg:px-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
          {locale === 'ar' ? 'سياسة الخصوصية' : locale === 'kurd' ? 'سیاسەتی تایبەتمەندی' : 'Privacy Policy'}
        </h1>
        <div className="w-20 h-1 bg-gold rounded-full mb-8" />
        
        <div className="glass p-8 space-y-6 text-white/70 leading-relaxed text-sm">
          <section>
            <h2 className="text-lg text-white font-semibold mb-3">
              {locale === 'ar' ? '١. المعلومات التي نجمعها' : locale === 'kurd' ? '١. زانیارییەکانی کۆدەکەینەوە' : '1. Information We Collect'}
            </h2>
            <p>
              {locale === 'ar' 
                ? 'عند استخدامك لموقعنا أو تقديم طلب استشارة، قد نجمع المعلومات التالية: الاسم الكامل، رقم الهاتف، البريد الإلكتروني، والمعلومات المتعلقة بمشروعك.'
                : locale === 'kurd'
                ? 'کاتێک ماڵپەڕەکەمان بەکاردەهێنیت یان داواکاری ڕاوێژکاری پێشکەش دەکەیت، ڕەنگە ئەم زانیارییانە کۆبکەینەوە: ناوی تەواو، ژمارەی تەلەفۆن، ئیمەیڵ، و زانیاری پەیوەندیدار بە پرۆژەکەت.'
                : 'When you use our website or submit a consultation request, we may collect: full name, phone number, email address, and information related to your project.'}
            </p>
          </section>

          <section>
            <h2 className="text-lg text-white font-semibold mb-3">
              {locale === 'ar' ? '٢. كيفية استخدام المعلومات' : locale === 'kurd' ? '٢. چۆنیەتی بەکارهێنانی زانیارییەکان' : '2. How We Use Information'}
            </h2>
            <p>
              {locale === 'ar'
                ? 'نستخدم المعلومات التي نجمعها للتواصل معك بخصوص مشروعك، وتقديم الخدمات التي طلبتها، وتحسين تجربتك مع موقعنا.'
                : locale === 'kurd'
                ? 'ئێمە زانیارییە کۆکراوەکان بۆ پەیوەندیکردن لەگەڵت سەبارەت بە پرۆژەکەت، پێشکەشکردنی ئەو خزمەتگوزارییانەی داواکراوە، و باشترکردنی ئەزموونت لەگەڵ ماڵپەڕەکەمان بەکاردەهێنین.'
                : 'We use collected information to contact you about your project, provide requested services, and improve your experience with our website.'}
            </p>
          </section>

          <section>
            <h2 className="text-lg text-white font-semibold mb-3">
              {locale === 'ar' ? '٣. حماية المعلومات' : locale === 'kurd' ? '٣. پاراستنی زانیارییەکان' : '3. Information Protection'}
            </h2>
            <p>
              {locale === 'ar'
                ? 'نتخذ إجراءات أمنية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التعديل أو الإفشاء.'
                : locale === 'kurd'
                ? 'ئێمە ڕێوشوێنی ئەمنی گونجاو دەگرین بۆ پاراستنی زانیارییە کەسییەکانت لە دەستڕاگەیشتن، گۆڕانکاری، یان ئاشکراکردنی بێ مۆڵەت.'
                : 'We take appropriate security measures to protect your personal information from unauthorized access, modification, or disclosure.'}
            </p>
          </section>

          <section>
            <h2 className="text-lg text-white font-semibold mb-3">
              {locale === 'ar' ? '٤. ملفات تعريف الارتباط' : locale === 'kurd' ? '٤. کووکییەکان' : '4. Cookies'}
            </h2>
            <p>
              {locale === 'ar'
                ? 'قد يستخدم موقعنا ملفات تعريف الارتباط لتحسين تجربة التصفح. يمكنك تعطيل ملفات تعريف الارتباط من خلال إعدادات المتصفح الخاص بك.'
                : locale === 'kurd'
                ? 'ڕەنگە ماڵپەڕەکەمان کووکی بەکاربهێنێت بۆ باشترکردنی ئەزموونی گەڕان. دەتوانیت کووکییەکان لە ڕێگەی ڕێکخستنەکانی وێبگەڕەکەتەوە ناچالاک بکەیت.'
                : 'Our website may use cookies to improve browsing experience. You can disable cookies through your browser settings.'}
            </p>
          </section>

          <section>
            <h2 className="text-lg text-white font-semibold mb-3">
              {locale === 'ar' ? '٥. التواصل' : locale === 'kurd' ? '٥. پەیوەندی' : '5. Contact'}
            </h2>
            <p>
              {locale === 'ar'
                ? 'إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا عبر الهاتف أو البريد الإلكتروني.'
                : locale === 'kurd'
                ? 'ئەگەر هەر پرسیارێکت هەیە دەربارەی سیاسەتی تایبەتمەندی، تکایە لە ڕێگەی تەلەفۆن یان ئیمەیڵەوە پەیوەندیمان پێوە بکە.'
                : 'If you have any questions about our privacy policy, please contact us via phone or email.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
