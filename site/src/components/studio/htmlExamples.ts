// HTML studio examples for unit 21. Valid HTML5, Arabic content, short lines.

export type Files = Record<string, string>

export interface HtmlSlide {
  title: string
  text: string
  /** Full document shown on this slide (lines new since the previous slide are highlighted). */
  code: string
}

export interface HtmlChallenge {
  text: string
  /** Receives every file parsed as a Document. */
  test: (docs: Record<string, Document>) => boolean
}

export interface HtmlExample {
  id: string
  title: string
  problem: string
  slides: HtmlSlide[]
  /** Starting files for the challenge mode. */
  start: Files
  challenges: HtmlChallenge[]
}

/** Shared skeleton so every example is a complete, valid HTML5 page. */
export function page(body: string, title = 'صفحتي', head = ''): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport"
        content="width=device-width">
  <title>${title}</title>${head ? `\n${head}` : ''}
</head>
<body>
${body}
</body>
</html>`
}

const q = (d: Document, s: string) => d.querySelector(s)
const qa = (d: Document, s: string) => [...d.querySelectorAll(s)]
const idx = (docs: Record<string, Document>) => docs['index.html']

export const MEDIA = {
  landscape: '/studio/media/landscape.svg',
  monument: '/studio/media/monument.svg',
}

export const HTML_EXAMPLES: HtmlExample[] = [
  {
    id: 'skeleton',
    title: 'بنية صفحة HTML5',
    problem: 'كل صفحة ويب تبدأ بالهيكل نفسه: نوع المستند، ثم html، ثم head و body.',
    slides: [
      { title: 'نوع المستند', text: 'السطر الأول يخبر المتصفح أن الملف مكتوب بلغة HTML5.', code: '<!DOCTYPE html>' },
      {
        title: 'العنصر html',
        text: 'يحيط بكل الصفحة. lang="ar" للغة العربية و dir="rtl" لاتجاه الكتابة من اليمين إلى اليسار.',
        code: '<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n\n</html>',
      },
      {
        title: 'الرأس head',
        text: 'معلومات عن الصفحة لا تظهر في محتواها: الترميز utf-8 حتى تظهر الحروف العربية سليمة، والعنوان الذي يظهر في التبويب.',
        code: '<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head>\n  <meta charset="utf-8">\n  <title>صفحتي الأولى</title>\n</head>\n\n</html>',
      },
      {
        title: 'الجسم body',
        text: 'كل ما يظهر للزائر يُكتب داخل body. لاحظ المعاينة: يظهر العنوان والفقرة.',
        code: page('  <h1>مرحبًا بكم</h1>\n  <p>هذه أول صفحة أكتبها.</p>', 'صفحتي الأولى'),
      },
    ],
    start: { 'index.html': '<!DOCTYPE html>\n<html>\n<head>\n</head>\n<body>\n\n</body>\n</html>' },
    challenges: [
      { text: 'أضف lang="ar" إلى الوسم html', test: (d) => idx(d).documentElement.getAttribute('lang') === 'ar' },
      { text: 'أضف dir="rtl" إلى الوسم html', test: (d) => idx(d).documentElement.getAttribute('dir') === 'rtl' },
      { text: 'أضف <meta charset="utf-8"> داخل head', test: (d) => !!q(idx(d), 'meta[charset]') },
      { text: 'أعطِ الصفحة عنوانًا بالوسم title', test: (d) => idx(d).title.trim().length > 0 },
      { text: 'اكتب عنوانًا رئيسيًا h1 داخل body', test: (d) => !!q(idx(d), 'body h1')?.textContent?.trim() },
    ],
  },
  {
    id: 'text',
    title: 'العناوين والفقرات والتنسيق',
    problem: 'نكتب مقالًا قصيرًا: عناوين بستة مستويات، فقرات، سطر جديد، خط فاصل، وكلمات مهمة.',
    slides: [
      { title: 'العناوين', text: 'من h1 (الأهم والأكبر) إلى h6. نستعمل h1 مرة واحدة غالبًا.', code: page('  <h1>مدينتي وهران</h1>\n  <h2>الموقع</h2>') },
      { title: 'الفقرات', text: 'p تُنشئ فقرة؛ والمتصفح يتجاهل الأسطر الفارغة والمسافات الزائدة داخل الكود.', code: page('  <h1>مدينتي وهران</h1>\n  <h2>الموقع</h2>\n  <p>تقع وهران في غرب الجزائر\n     على البحر المتوسط.</p>') },
      { title: 'التأكيد', text: 'strong لكلمة مهمة (غامق)، و em للتشديد (مائل). b و i للمظهر فقط دون معنى.', code: page('  <h1>مدينتي وهران</h1>\n  <h2>الموقع</h2>\n  <p>تقع وهران في <strong>غرب</strong> الجزائر\n     على <em>البحر المتوسط</em>.</p>') },
      { title: 'br و hr', text: 'br ينهي السطر داخل الفقرة، و hr يرسم خطًا فاصلًا. كلاهما وسم بلا إغلاق.', code: page('  <h1>مدينتي وهران</h1>\n  <h2>الموقع</h2>\n  <p>تقع وهران في <strong>غرب</strong> الجزائر\n     على <em>البحر المتوسط</em>.</p>\n  <hr>\n  <p>الهاتف: 041 00 00 00<br>\n     البريد: info@example.com</p>') },
    ],
    start: { 'index.html': page('  <!-- اكتب هنا -->', 'مقالي') },
    challenges: [
      { text: 'عنوان رئيسي h1', test: (d) => !!q(idx(d), 'h1')?.textContent?.trim() },
      { text: 'عنوان فرعي h2', test: (d) => !!q(idx(d), 'h2')?.textContent?.trim() },
      { text: 'فقرتان p على الأقل', test: (d) => qa(idx(d), 'p').filter((p) => p.textContent?.trim()).length >= 2 },
      { text: 'كلمة مهمة بالوسم strong داخل فقرة', test: (d) => !!q(idx(d), 'p strong') },
      { text: 'خط فاصل hr', test: (d) => !!q(idx(d), 'hr') },
    ],
  },
  {
    id: 'lists',
    title: 'القوائم: النقطية والمرقّمة',
    problem: 'العدّاد النقطي ul والعدّاد الرقمي ol، وكل عنصر في li.',
    slides: [
      { title: 'قائمة نقطية', text: 'ul (Unordered List): الترتيب لا يهم. كل عنصر داخل li.', code: page('  <h2>أدوات المخبر</h2>\n  <ul>\n    <li>حاسوب</li>\n    <li>طابعة</li>\n    <li>جهاز عرض</li>\n  </ul>') },
      { title: 'قائمة مرقّمة', text: 'ol (Ordered List): الترتيب مهم، فيرقّم المتصفح العناصر وحده.', code: page('  <h2>أدوات المخبر</h2>\n  <ul>\n    <li>حاسوب</li>\n    <li>طابعة</li>\n    <li>جهاز عرض</li>\n  </ul>\n  <h2>تشغيل الحاسوب</h2>\n  <ol>\n    <li>اضغط زر التشغيل</li>\n    <li>انتظر شاشة الدخول</li>\n    <li>اكتب كلمة المرور</li>\n  </ol>') },
      { title: 'type و start', text: 'type="A" للترقيم بالحروف، و start="3" لبدء العد من 3.', code: page('  <ol type="A" start="3">\n    <li>عنصر</li>\n    <li>عنصر</li>\n  </ol>') },
      { title: 'قائمة داخل قائمة', text: 'نضع ul جديدة داخل li لصنع قائمة فرعية.', code: page('  <ul>\n    <li>الإعلام الآلي\n      <ul>\n        <li>HTML</li>\n        <li>الخوارزميات</li>\n      </ul>\n    </li>\n    <li>الرياضيات</li>\n  </ul>') },
    ],
    start: { 'index.html': page('  <h2>مشترياتي</h2>\n\n  <h2>خطوات تحضير الشاي</h2>\n', 'قوائمي') },
    challenges: [
      { text: 'قائمة نقطية ul فيها 3 عناصر على الأقل', test: (d) => qa(idx(d), 'ul').some((u) => u.querySelectorAll(':scope > li').length >= 3) },
      { text: 'قائمة مرقّمة ol فيها 3 عناصر على الأقل', test: (d) => qa(idx(d), 'ol').some((u) => u.querySelectorAll(':scope > li').length >= 3) },
      { text: 'كل عنصر li داخل ul أو ol', test: (d) => qa(idx(d), 'li').length > 0 && qa(idx(d), 'li').every((li) => /^(UL|OL)$/.test(li.parentElement?.tagName ?? '')) },
      { text: 'إثراء: قائمة فرعية داخل li', test: (d) => !!q(idx(d), 'li ul, li ol') },
    ],
  },
  {
    id: 'links',
    title: 'الارتباطات التشعبية',
    problem: 'الوسم a يربط الصفحة بموقع آخر، أو بصفحة من الموقع نفسه، أو ببريد إلكتروني.',
    slides: [
      { title: 'رابط إلى موقع', text: 'href يحمل العنوان الكامل. النص بين <a> و </a> هو ما ينقر عليه الزائر.', code: page('  <p>زر موقع\n    <a href="https://www.example.com">مثال</a>.</p>') },
      { title: 'فتح في تبويب جديد', text: 'target="_blank" يفتح الرابط في تبويب جديد ويبقي صفحتك مفتوحة.', code: page('  <p>زر موقع\n    <a href="https://www.example.com"\n       target="_blank">مثال</a>.</p>') },
      { title: 'رابط داخلي', text: 'لصفحة من موقعك نكتب اسم الملف فقط: مسار نسبي.', code: page('  <p><a href="page2.html">الصفحة الثانية</a></p>') },
      { title: 'رابط بريد', text: 'mailto: يفتح برنامج البريد مع العنوان جاهزًا.', code: page('  <p>راسلنا:\n    <a href="mailto:club@example.com">\n      club@example.com</a></p>') },
    ],
    start: { 'index.html': page('  <h1>روابطي المفيدة</h1>\n', 'روابط') },
    challenges: [
      { text: 'رابط إلى موقع يبدأ بـ https://', test: (d) => qa(idx(d), 'a[href]').some((a) => /^https?:\/\//.test(a.getAttribute('href') ?? '')) },
      { text: 'رابط يفتح في تبويب جديد', test: (d) => !!q(idx(d), 'a[target="_blank"]') },
      { text: 'رابط بريد mailto:', test: (d) => qa(idx(d), 'a[href]').some((a) => (a.getAttribute('href') ?? '').startsWith('mailto:')) },
      { text: 'رابط إلى page2.html', test: (d) => !!q(idx(d), 'a[href="page2.html"]') },
      { text: 'كل رابط له نص يُنقر عليه', test: (d) => qa(idx(d), 'a').length > 0 && qa(idx(d), 'a').every((a) => a.textContent?.trim()) },
    ],
  },
  {
    id: 'images',
    title: 'الصور',
    problem: 'الوسم img يُدرج صورة. src مكانها، و alt نص يصفها لمن لا يراها.',
    slides: [
      { title: 'إدراج صورة', text: 'img وسم بلا إغلاق. في المختبر استعمل الصور الجاهزة في /studio/media/.', code: page(`  <img src="${MEDIA.landscape}"\n       alt="منظر لصحراء وواحة">`) },
      { title: 'لماذا alt؟', text: 'يظهر alt إذا لم تُحمَّل الصورة، ويقرؤه برنامج قراءة الشاشة للمكفوفين. جرّب تغيير src إلى اسم خاطئ.', code: page(`  <img src="${MEDIA.landscape}"\n       alt="منظر لصحراء وواحة">\n  <img src="missing.jpg"\n       alt="صورة غير موجودة">`) },
      { title: 'الحجم', text: 'width يحدد العرض بالبكسل، ويضبط المتصفح الارتفاع حفاظًا على الأبعاد.', code: page(`  <img src="${MEDIA.monument}"\n       alt="معلم تاريخي"\n       width="160">`) },
      { title: 'صورة مع عنوان', text: 'figure و figcaption يربطان الصورة بتعليقها.', code: page(`  <figure>\n    <img src="${MEDIA.monument}"\n         alt="معلم تاريخي" width="160">\n    <figcaption>معلم من بلادي</figcaption>\n  </figure>`) },
    ],
    start: { 'index.html': page('  <h1>صور من الجزائر</h1>\n', 'صوري') },
    challenges: [
      { text: `أدرج صورة (مثلًا ${MEDIA.landscape})`, test: (d) => qa(idx(d), 'img').some((i) => i.getAttribute('src')?.trim()) },
      { text: 'لكل صورة نص بديل alt غير فارغ', test: (d) => qa(idx(d), 'img').length > 0 && qa(idx(d), 'img').every((i) => i.getAttribute('alt')?.trim()) },
      { text: 'حدّد عرض صورة بـ width', test: (d) => !!q(idx(d), 'img[width]') },
      { text: 'إثراء: صورتان على الأقل', test: (d) => qa(idx(d), 'img').length >= 2 },
    ],
  },
  {
    id: 'tables',
    title: 'الجداول',
    problem: 'الجدول لعرض البيانات فقط: صفوف tr، خلايا عنوان th، وخلايا td.',
    slides: [
      { title: 'صف العناوين', text: 'table يحيط بالجدول، tr صف، و th خلية عنوان (غامقة ومتوسّطة). يظهر الجدول بلا حدود: نرسمها بـ CSS في القسم الموالي، لا بالخاصية القديمة border.', code: page('  <table>\n    <tr>\n      <th>المادة</th>\n      <th>المعامل</th>\n    </tr>\n  </table>') },
      { title: 'صفوف البيانات', text: 'td خلية عادية. كل صف يحمل العدد نفسه من الخلايا.', code: page('  <table>\n    <tr>\n      <th>المادة</th>\n      <th>المعامل</th>\n    </tr>\n    <tr>\n      <td>الرياضيات</td>\n      <td>4</td>\n    </tr>\n    <tr>\n      <td>الإعلام الآلي</td>\n      <td>2</td>\n    </tr>\n  </table>') },
      { title: 'عنوان الجدول', text: 'caption يكتب عنوانًا فوق الجدول.', code: page('  <table>\n    <caption>المعاملات</caption>\n    <tr>\n      <th>المادة</th>\n      <th>المعامل</th>\n    </tr>\n    <tr>\n      <td>الرياضيات</td>\n      <td>4</td>\n    </tr>\n    <tr>\n      <td>الإعلام الآلي</td>\n      <td>2</td>\n    </tr>\n  </table>') },
    ],
    start: { 'index.html': page('  <h1>جدول حصصي</h1>\n', 'جدول') },
    challenges: [
      { text: 'جدول table له عنوان caption', test: (d) => !!q(idx(d), 'table caption')?.textContent?.trim() },
      { text: 'صف أول فيه خلايا عنوان th', test: (d) => !!q(idx(d), 'table tr th') },
      { text: '3 صفوف tr على الأقل', test: (d) => qa(idx(d), 'table tr').length >= 3 },
      { text: 'كل الصفوف بالعدد نفسه من الخلايا', test: (d) => { let rows = qa(idx(d), 'table tr').map((r) => r.querySelectorAll('th,td').length); return rows.length > 1 && rows.every((n) => n === rows[0]) } },
    ],
  },
  {
    id: 'style',
    title: 'لمسة CSS بدل الوسوم القديمة',
    problem: 'المظهر (الألوان، الخطوط، المحاذاة) يُكتب في CSS داخل الوسم style، لا بوسوم قديمة مثل font و center.',
    slides: [
      { title: 'الوسم style', text: 'داخل head نكتب قواعد: المحدِّد ثم الخصائص بين { }.', code: page('  <h1>نادي الإعلام الآلي</h1>\n  <p>مرحبًا بالأعضاء الجدد.</p>', 'النادي', '  <style>\n    h1 { color: teal; }\n  </style>') },
      { title: 'الخلفية والخط', text: 'background-color للخلفية، و font-family للخط، و text-align للمحاذاة.', code: page('  <h1>نادي الإعلام الآلي</h1>\n  <p>مرحبًا بالأعضاء الجدد.</p>', 'النادي', '  <style>\n    body {\n      background-color: #f5f9ff;\n      font-family: Tahoma, sans-serif;\n    }\n    h1 { color: teal; text-align: center; }\n  </style>') },
      { title: 'حدود الجدول', text: 'border لرسم الحدود، و padding للمسافة داخل الخلايا.', code: page('  <table>\n    <tr><th>اليوم</th><th>الحصة</th></tr>\n    <tr><td>الأحد</td><td>HTML</td></tr>\n  </table>', 'النادي', '  <style>\n    table { border-collapse: collapse; }\n    th, td {\n      border: 1px solid #555;\n      padding: 6px 12px;\n    }\n    th { background-color: #dfefff; }\n  </style>') },
    ],
    start: { 'index.html': page('  <h1>صفحتي</h1>\n  <p>فقرة أولى.</p>\n  <table>\n    <tr><th>أ</th><th>ب</th></tr>\n    <tr><td>1</td><td>2</td></tr>\n  </table>', 'تنسيق', '  <style>\n\n  </style>') },
    challenges: [
      { text: 'لوّن العنوان h1 بخاصية color', test: (d) => /h1[^{]*\{[^}]*\bcolor\s*:/i.test(q(idx(d), 'style')?.textContent ?? '') },
      { text: 'غيّر خلفية body بـ background-color', test: (d) => /body[^{]*\{[^}]*background(-color)?\s*:/i.test(q(idx(d), 'style')?.textContent ?? '') },
      { text: 'أضف حدودًا للخلايا بـ border', test: (d) => /(td|th|table)[^{]*\{[^}]*\bborder\s*:/i.test(q(idx(d), 'style')?.textContent ?? '') },
      { text: 'لا وسوم قديمة (font، center، bgcolor، align)', test: (d) => !q(idx(d), 'font, center, [bgcolor], [align]') },
    ],
  },
  {
    id: 'project',
    title: 'المشروع: صفحة التعريف بولايتي',
    problem: 'موقع من صفحتين: index.html للتعريف بالولاية، و page2.html لجدول معلومات، مع روابط بينهما.',
    slides: [
      { title: 'الصفحة الرئيسية', text: 'عنوان، فقرتان، صورة بنص بديل، قائمة، ورابط إلى الصفحة الثانية.', code: page(`  <h1>ولاية تلمسان</h1>\n  <p>تقع في <strong>الغرب</strong> الجزائري.</p>\n  <img src="${MEDIA.monument}"\n       alt="معلم تاريخي" width="160">\n  <h2>من معالمها</h2>\n  <ul>\n    <li>المنصورة</li>\n    <li>شلالات الوريط</li>\n  </ul>\n  <p><a href="page2.html">معلومات أكثر</a></p>`, 'ولايتي') },
      { title: 'الصفحة الثانية', text: 'جدول بيانات ورابط للعودة. في وضع «جرّب» يمكنك التنقل بين الملفين بالروابط نفسها.', code: page('  <h1>معلومات عن ولايتي</h1>\n  <table>\n    <tr><th>المعلومة</th><th>القيمة</th></tr>\n    <tr><td>رقم الولاية</td><td>13</td></tr>\n  </table>\n  <p><a href="index.html">العودة</a></p>', 'معلومات', '  <style>\n    th, td { border: 1px solid #555; }\n  </style>') },
    ],
    start: {
      'index.html': page('  <h1>ولايتي</h1>\n', 'ولايتي'),
      'page2.html': page('  <h1>معلومات</h1>\n', 'معلومات'),
    },
    challenges: [
      { text: 'index: عنوان h1 وفقرتان على الأقل', test: (d) => !!q(idx(d), 'h1') && qa(idx(d), 'p').length >= 2 },
      { text: 'index: صورة بنص بديل alt', test: (d) => qa(idx(d), 'img').some((i) => i.getAttribute('alt')?.trim()) },
      { text: 'index: قائمة ul أو ol', test: (d) => !!q(idx(d), 'ul li, ol li') },
      { text: 'index: رابط إلى page2.html', test: (d) => !!q(idx(d), 'a[href="page2.html"]') },
      { text: 'page2: جدول فيه 3 صفوف على الأقل', test: (d) => !!d['page2.html'] && qa(d['page2.html'], 'tr').length >= 3 },
      { text: 'page2: رابط للعودة إلى index.html', test: (d) => !!d['page2.html'] && !!q(d['page2.html'], 'a[href="index.html"]') },
    ],
  },
]
