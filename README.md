# موارد تعليمية — الإعلام الآلي (السنة الأولى ثانوي)

---

## 1) الوصف الرسمي

هذا المشروع عبارة عن **مجموعة موارد تعليمية لمادة الإعلام الآلي / Computer Science** موجّهة إلى **تلاميذ السنة الأولى ثانوي (1AS) في الجزائر**، وفق المرجع الرسمي للتدرجات السنوية الصادر عن وزارة التربية الوطنية (جويلية 2019). ويشتمل على المكوّنات الآتية:

- **المصادر الأصلية (PDF):** الكتاب المدرسي الرسمي، والخطة السنوية للتدرّج، وملفات PDF مصدرية لفصول الدروس.
- **فصول دراسية بصيغة Markdown** مقتبسة من الكتاب المدرسي، تغطي المحاور التالية:
  - تقنية المعلومات (TIC).
  - المكتبية: معالج النصوص Word، المجدول Excel، والعروض التقديمية PowerPoint.
  - صيغ ودوال Excel، والفرز.
  - الارتباطات التشعبية والحركة في PowerPoint.
  - المخططات النسقية والخوارزميات.
  - المتصفح، البريد الإلكتروني، وشبكات التواصل الاجتماعي.
- **الكتاب المدرسي كاملًا بصيغة Markdown** مع ملفات الصور المرافقة لصفحاته.
- **وثائق التخطيط السنوي:** التدرج السنوي الرسمي الكامل، خريطة ربط الوحدات بصفحات الكتاب، وخطة التوزيع السنوية (المصححة والنهائية).
- **مذكرات دروس جاهزة** لبعض الوحدات (المخططات النسقية، تجميع الحاسوب).

---

## 2) Project Overview (English)

This project is a **teaching resource collection for Computer Science (Informatique)** targeting **first-year secondary students (1AS) in Algeria**, aligned with the official annual progression issued by the Algerian Ministry of National Education (July 2019). It bundles the official textbook and yearly plan as original PDFs, six Markdown course chapters covering TIC, Word/Excel/PowerPoint, Excel formulas and functions, PowerPoint hyperlinks, flowcharts and algorithms, and web topics (browser, e-mail, social networks), a full Markdown conversion of the textbook with its page images, yearly planning documents (official progression, unit-to-page map, corrected and final distribution plans), and ready-to-use lesson notes for select units.

---

## 3) هيكل المشروع

```
Informatic-courses/
├── README.md
├── archive/                      # المواد المرجعية والنسخ السابقة (غير نشطة)
│   ├── legacy-reference/         # PDF وOCR الكتاب القديم
│   └── planning-legacy/          # نسخ التخطيط السابقة
├── courses/                      # فصول دراسية بصيغة Markdown
│   ├── course-1-tic/             # تقنية المعلومات (TIC)
│   ├── course-2-office/          # المكتبية: Word / Excel / PowerPoint
│   ├── course-3-excel/           # صيغ ودوال Excel
│   ├── course-4-ppt/             # العروض التقديمية والروابط التشعبية
│   ├── course-5-algo/            # المخططات النسقية والخوارزميات
│   └── course-6-web/             # المتصفح، البريد، شبكات التواصل
└── planning/                     # وثائق التخطيط والمذكرات
    ├── التخطيط_السنوي.md          # الوثيقة العملية الوحيدة
    └── README.md                   # الاستعمال والأرشيف
```

> **تنظيم العمل الحالي:** استُبدلت المسارات `book/` و`sources/` في البنية النشطة بالأرشيف `archive/legacy-reference/`. وثيقة التخطيط اليومية هي `planning/التخطيط_السنوي.md`؛ والنسخ السابقة محفوظة في `archive/planning-legacy/`.

## البوابة التعليمية والنشر

توجد البوابة التعليمية المبنية بـ Next.js في `site/`. تُنشر تلقائيًا على GitHub Pages عبر `.github/workflows/deploy-pages.yml` عند الدفع إلى فرع `master`، ويكون نطاقها العام `https://informatique.mouadh.info`.

- لتحديث صفحات البوابة من الدروس: شغّل `python courses/generate_site_docs.py`.
- لا تُنشر مواد `archive/` أو `teachers_guide/` ضمن مخرجات الموقع.
- يتطلب النشر أن تكون قيمة **Source** في GitHub: `GitHub Actions` ضمن `Settings → Pages`.

> **ملاحظة:** كل مجلد درس يحوي مجلد `*_artifacts/` يضم صور صفحات الكتاب المرتبطة به، ويتم الرجوع إليها بمسارات نسبية داخل ملفات Markdown.

## تعديل المحتوى دون كسر الموقع

- المصدر الوحيد لدروس التلاميذ هو `courses/lessons/`؛ أمّا `site/src/app/docs/` فهو ناتج تلقائي ولا يُعدّل مباشرة.
- قبل النشر شغّل: `python courses/convert_lessons.py`، ثم `python courses/generate_site_docs.py`، ثم `python courses/verify_site_content.py`، وأخيراً `npm --prefix site run build`.
- الموارد الخارجية المنتقاة موجودة في `site/src/app/resources/page.md`، ودليل التشغيل المختصر للموقع موجود في `site/README.md`.
