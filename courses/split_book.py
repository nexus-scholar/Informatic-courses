"""Split the full book markdown into individual lesson files following the official التدرج."""
import pathlib, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

BASE = pathlib.Path(r"C:\Users\mouadh\Documents\Informatic-courses")
BOOK = BASE / "book" / "informatique1as-livre_scolaire.md"
LESSONS = BASE / "courses" / "lessons"
LESSONS.mkdir(exist_ok=True)

lines = BOOK.read_text(encoding="utf-8").splitlines(keepends=True)

# Define lessons: (unit_num, name, domain, start_line, end_line, duration)
# Line numbers are 1-indexed matching the heading scan
lessons = [
    # Domain 1: التعامل مع بيئة الحاسوب
    (1, "تقنية المعلومات", "1-التعامل_مع_بيئة_الحاسوب", 52, 182, "02 ساعة"),
    (2, "تجميع الحاسوب", "1-التعامل_مع_بيئة_الحاسوب", 184, 561, "04 ساعات"),
    (3, "نظام التشغيل", "1-التعامل_مع_بيئة_الحاسوب", 563, 674, "04 ساعات"),
    (4, "لوحة التحكم", "1-التعامل_مع_بيئة_الحاسوب", 676, 818, "01 ساعة"),
    (5, "حماية الحاسوب", "1-التعامل_مع_بيئة_الحاسوب", 820, 912, "01 ساعة"),
    (6, "الشبكة المحلية", "1-التعامل_مع_بيئة_الحاسوب", 914, 1132, "04 ساعات"),
    # Domain 3 in book (مكتبية): treated as Domain 2 in file numbering
    (7, "الأنماط_في_Word", "2-المكتبية", 1160, 1318, None),
    (8, "القوالب_في_Word", "2-المكتبية", 1320, 1587, None),
    (9, "المقاطع_في_Word", "2-المكتبية", 1589, 1781, None),
    (10, "دمج_المراسلات", "2-المكتبية", 1783, 2058, "02 ساعة"),
    (11, "الصيغ_والدوال_في_Excel", "2-المكتبية", 2060, 2468, None),
    (12, "فرز_البيانات_في_Excel", "2-المكتبية", 2470, 2653, None),
    # Domain 4 in book (عروض تقديمية): part of web in التدرج
    (13, "الارتباطات_التشعبية_في_PowerPoint", "3-العروض_التقديمية", 2655, 2918, None),
    (14, "الحركة_في_العروض_التقديمية", "3-العروض_التقديمية", 2920, 3254, None),
    # Domain 2 in book (خوارزميات): algorithms
    (15, "المخطط_الإنسيابي", "4-المقدمة_في_البرمجة", 3276, 3371, "02 ساعة"),
    (16, "الخوارزميات", "4-المقدمة_في_البرمجة", 3373, 3668, "12 ساعة"),
    # Domain 4 in book (ويب): web
    (17, "المتصفح", "5-تقنيات_الويب", 3678, 3840, "02 ساعة"),
    (18, "البريد_الإلكتروني", "5-تقنيات_الويب", 3842, 3950, "01 ساعة"),
    (19, "شبكات_التواصل_الاجتماعي", "5-تقنيات_الويب", 3952, 4029, "01 ساعة"),
    (20, "إنشاء_صفحة_ويب_HTML", "5-تقنيات_الويب", 4031, 4441, "06 ساعات"),
]

# Domain metadata
domain_meta = {
    "1-التعامل_مع_بيئة_الحاسوب": "المجال الأول: التعامل مع بيئة الحاسوب",
    "2-المكتبية": "المجال الثاني: المكتبية",
    "3-العروض_التقديمية": "المجال الثالث: العروض التقديمية",
    "4-المقدمة_في_البرمجة": "المجال الرابع: المقدمة في البرمجة",
    "5-تقنيات_الويب": "المجال الخامس: تقنيات الويب",
}

for unit_num, name, domain, start, end, duration in lessons:
    domain_dir = LESSONS / domain
    domain_dir.mkdir(exist_ok=True)

    # Build filename
    safe_name = name.replace(" ", "_").replace("/", "_")
    filename = f"unit-{unit_num:02d}-{safe_name}.md"
    filepath = domain_dir / filename

    # Extract content (lines are 0-indexed in list, but start/end are 1-indexed)
    content_lines = lines[start - 1 : end]
    content = "".join(content_lines)

    # Build header
    domain_title = domain_meta.get(domain, domain)
    header = f"# الوحدة {unit_num}: {name.replace('_', ' ')}\n"
    header += f"## {domain_title}\n"
    if duration:
        header += f"### المدة الزمنية: {duration}\n"
    header += "\n---\n\n"

    filepath.write_text(header + content, encoding="utf-8")
    print(f"  [{unit_num:02d}] {filename} ({len(content_lines)} lines)")

print(f"\nDone — {len(lessons)} lessons in {LESSONS}")
