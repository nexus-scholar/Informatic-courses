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
├── sources/                      # الملفات الأصلية (PDF)
│   ├── informatique1as-livre_scolaire.pdf
│   ├── plan_annuel2020-informatique1as.pdf
│   └── courses/                  # ملفات PDF مصدرية للدروس
│       ├── course-1-tic.pdf
│       ├── course-2-office.pdf
│       ├── course-3-excel.pdf
│       ├── course-4-ppt.pdf
│       ├── course-5-algo.pdf
│       └── course-6-web.pdf
├── courses/                      # فصول دراسية بصيغة Markdown
│   ├── course-1-tic/             # تقنية المعلومات (TIC)
│   ├── course-2-office/          # المكتبية: Word / Excel / PowerPoint
│   ├── course-3-excel/           # صيغ ودوال Excel
│   ├── course-4-ppt/             # العروض التقديمية والروابط التشعبية
│   ├── course-5-algo/            # المخططات النسقية والخوارزميات
│   └── course-6-web/             # المتصفح، البريد، شبكات التواصل
├── book/                         # الكتاب المدرسي كاملًا (Markdown)
│   ├── informatique1as-livre_scolaire.md
│   └── informatique1as-livre_scolaire_artifacts/
└── planning/                     # وثائق التخطيط والمذكرات
    ├── التدرج_السنوي_الرسمي_الكامل.md
    ├── خريطة_الوحدات_الصفحات_أدق.md
    ├── خطة_التوزيع_السنوية_المصححة.md
    ├── خطة_التوزيع_السنوية_النهائية_جدول_رسمي.md
    ├── مذكرة_درس_المخططات_النسقية.md
    └── مذكرة_درس_تجميع_الحاسوب.md
```

> **ملاحظة:** كل مجلد درس يحوي مجلد `*_artifacts/` يضم صور صفحات الكتاب المرتبطة به، ويتم الرجوع إليها بمسارات نسبية داخل ملفات Markdown.
