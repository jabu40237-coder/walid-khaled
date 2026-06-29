import type { Locale } from '@/types';

export default function TermsPage({ params: { locale } }: { params: { locale: Locale } }) {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 lg:px-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
          {locale === 'ar' ? 'شروط الخدمة' : locale === 'kurd' ? 'مەرجەکانی خزمەتگوزاری' : 'Terms of Service'}
        </h1>
        <div className="w-20 h-1 bg-gold rounded-full mb-8" />
        
        <div className="glass p-8 space-y-6 text-white/70 leading-relaxed text-sm">
          <section>
            <h2 className="text-lg text-white font-semibold mb-3">
              {locale === 'ar' ? '١. قبول الشروط' : locale === 'kurd' ? '١. پەسەندکردنی مەرجەکان' : '1. Acceptance of Terms'}
            </h2>
            <p>
              {locale === 'ar'
                ? 'باستخدامك لهذا الموقع، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام الموقع.'
                : locale === 'kurd'
                ? 'بە بەکارهێنانی ئەم ماڵپەڕە، تۆ ڕازی دەبیت بە پابەندبوون بەم مەرجانەی خزمەتگوزارییە. ئەگەر لەگەڵ هیچ کام لەم مەرجانە ڕازی نیت، تکایە ماڵپەڕەکە بەکارمەهێنە.'
                : 'By using this website, you agree to be bound by these terms of service. If you do not agree with any of these terms, please do not use the website.'}
            </p>
          </section>

          <section>
            <h2 className="text-lg text-white font-semibold mb-3">
              {locale === 'ar' ? '٢. الخدمات' : locale === 'kurd' ? '٢. خزمەتگوزارییەکان' : '2. Services'}
            </h2>
            <p>
              {locale === 'ar'
                ? 'تقدم شركة وليد خالد خدمات تصميم وتنفيذ الواجهات الخارجية. جميع الخدمات تخضع للاتفاق المبرم بين الطرفين ويتم تحديد النطاق والتكلفة والجدول الزمني في العقد.'
                : locale === 'kurd'
                ? 'کۆمپانیای وەلید خالد خزمەتگوزاری دیزاین و جێبەجێکردنی فەیسی دەرەوە پێشکەش دەکات. هەموو خزمەتگوزارییەکان بەپێی ڕێککەوتنی نێوان هەردوو لا دەبن و سنوور و تێچوون و خشتەی کاتی لە گرێبەستەکەدا دیاری دەکرێن.'
                : 'Walid Khaled provides exterior facade design and execution services. All services are subject to the agreement between both parties, with scope, cost, and timeline defined in the contract.'}
            </p>
          </section>

          <section>
            <h2 className="text-lg text-white font-semibold mb-3">
              {locale === 'ar' ? '٣. الملكية الفكرية' : locale === 'kurd' ? '٣. مافی لەبەرگرتنەوە' : '3. Intellectual Property'}
            </h2>
            <p>
              {locale === 'ar'
                ? 'جميع المحتويات الموجودة على هذا الموقع بما في ذلك النصوص والصور والشعارات والتصاميم محمية بموجب حقوق الملكية الفكرية.'
                : locale === 'kurd'
                ? 'هەموو ناوەڕۆکێکی ئەم ماڵپەڕە لەوانە دەق، وێنە، لۆگۆ، و دیزاین بەپێی یاساکانی مافی لەبەرگرتنەوە پارێزراون.'
                : 'All content on this website including text, images, logos, and designs is protected by intellectual property rights.'}
            </p>
          </section>

          <section>
            <h2 className="text-lg text-white font-semibold mb-3">
              {locale === 'ar' ? '٤. تحديد المسؤولية' : locale === 'kurd' ? '٤. سنووردارکردنی بەرپرسیارێتی' : '4. Limitation of Liability'}
            </h2>
            <p>
              {locale === 'ar'
                ? 'لا تتحمل شركة وليد خالد أي مسؤولية عن أي أضرار تنشأ عن استخدام هذا الموقع أو الاعتماد على المعلومات الواردة فيه.'
                : locale === 'kurd'
                ? 'کۆمپانیای وەلید خالد هیچ بەرپرسیارێتییەک لە هەر زیانێک کە لە بەکارهێنانی ئەم ماڵپەڕە یان پشتبەستن بە زانیارییەکانی ناویدا دروست دەبێت، ناگرێتە ئەستۆ.'
                : 'Walid Khaled shall not be liable for any damages arising from the use of this website or reliance on information contained herein.'}
            </p>
          </section>

          <section>
            <h2 className="text-lg text-white font-semibold mb-3">
              {locale === 'ar' ? '٥. تعديل الشروط' : locale === 'kurd' ? '٥. گۆڕینی مەرجەکان' : '5. Modifications'}
            </h2>
            <p>
              {locale === 'ar'
                ? 'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم نشر التعديلات على هذه الصفحة.'
                : locale === 'kurd'
                ? 'ئێمە مافی گۆڕینی ئەم مەرجانەمان لە هەر کاتێکدا پاراستووە. گۆڕانکارییەکان لەسەر ئەم پەڕەیە بڵاو دەکرێنەوە.'
                : 'We reserve the right to modify these terms at any time. Changes will be posted on this page.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
