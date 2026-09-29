# البوابة التعليمية — الإعلام الآلي 1AS

هذه البوابة هي النسخة العامة لمواد الإعلام الآلي للسنة الأولى ثانوي في الجزائر. تبنى بـ Next.js وتُنشر آلياً عبر GitHub Pages إلى `https://informatique.mouadh.info`.

## أين أحرر ماذا؟

| ما تريد تغييره | حرر هذا الملف أو المجلد | لا تحرر |
|---|---|---|
| محتوى درس للتلاميذ | `courses/lessons/` | `site/src/app/docs/` لأنه ناتج تلقائي |
| صور الدروس | مجلد `artifacts/` قرب الدرس | `site/public/artifacts/` لأنه نسخة منشورة |
| موارد خارجية موثوقة | `site/src/app/resources/page.md` | روابط أرشيفية داخل الكتاب القديم |
| ترتيب عناصر القائمة | `site/src/lib/navigation.ts` | مخرجات `site/out/` |
| التخطيط السنوي | `planning/التخطيط_السنوي.md` | الملفات المحفوظة في `archive/planning-legacy/` |

توجد مسودات سابقة في `courses/modernized_lessons/` للاحتفاظ بسجل التطوير فقط؛ لا يقرأها مولّد الموقع.

## سير عمل آمن قبل النشر

من جذر المشروع:

```powershell
python courses/convert_lessons.py
python courses/generate_site_docs.py
python courses/verify_site_content.py
npm --prefix site run build
```

يكرر GitHub Actions التوليد والتحقق والبناء عند الدفع إلى `master`. لا تُرفع `site/out/` ولا `node_modules/` إلى Git؛ مخرجات النشر تُنشأ في CI.

## تشغيل محلي

```powershell
npm --prefix site ci
npm --prefix site run dev
```

ثم افتح `http://localhost:3000`. يمكن البحث داخل الدروس من مربع البحث أو اختصار لوحة المفاتيح الظاهر في الواجهة.

## سياسة الموارد

أضف موردًا فقط إذا كان رسمياً أو تابعاً لمؤسسة تعليمية موثوقة، وحدد الوحدة والهدف التربوي. اختبر الرابط قبل استعماله مع التلاميذ، ولا تطلب من التلاميذ إنشاء حسابات أو مشاركة بيانات شخصية من أجل نشاط مدرسي.

## الرخصة

قالب الواجهة مرخص وفق [Tailwind Plus license](./LICENSE.md). محتوى الدروس ومصادره يتبعان تنظيم هذا المستودع والمواد المرجعية المحفوظة فيه.
