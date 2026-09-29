"""
generate_site_docs.py
---------------------
Convert all 20 lesson Markdown files from courses/modernized_lessons/ and courses/lessons/
into clean Markdoc-compatible pages for the Syntax Next.js documentation portal in site/src/app/docs/.
"""

import json
import os
import re
import glob
import json
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODERN_DIR = BASE_DIR / "courses" / "modernized_lessons"
LESSONS_DIR = BASE_DIR / "courses" / "lessons"
DOCS_DIR = BASE_DIR / "site" / "src" / "app" / "docs"
PUBLIC_ARTIFACTS = BASE_DIR / "site" / "public" / "artifacts"

DOMAIN_NAMES = {
    1: "المجال 1: التعامل مع بيئة الحاسوب",
    2: "المجال 1: التعامل مع بيئة الحاسوب",
    3: "المجال 1: التعامل مع بيئة الحاسوب",
    4: "المجال 1: التعامل مع بيئة الحاسوب",
    5: "المجال 1: التعامل مع بيئة الحاسوب",
    6: "المجال 1: التعامل مع بيئة الحاسوب",
    7: "المجال 2: المكتبية (Word & Excel)",
    8: "المجال 2: المكتبية (Word & Excel)",
    9: "المجال 2: المكتبية (Word & Excel)",
    10: "المجال 2: المكتبية (Word & Excel)",
    11: "المجال 2: المكتبية (Word & Excel)",
    12: "المجال 2: المكتبية (Word & Excel)",
    13: "المجال 3: العروض التقديمية",
    14: "المجال 3: العروض التقديمية",
    15: "المجال 4: الخوارزميات والبرمجة",
    16: "المجال 4: الخوارزميات والبرمجة",
    17: "المجال 5: تقنيات الويب والإنترنت",
    18: "المجال 5: تقنيات الويب والإنترنت",
    19: "المجال 5: تقنيات الويب والإنترنت",
    20: "المجال 5: تقنيات الويب والإنترنت",
}

UNIT_TITLES = {
    1: "تقنية المعلومات والتطور التكنولوجي",
    2: "تجميع الحاسوب والمكونات المادية",
    3: "نظام التشغيل (Windows 11) وإدارة الملفات",
    4: "إعدادات النظام ولوحة التحكم في Windows 11",
    5: "حماية الحاسوب والأمان الرقمي",
    6: "الشبكات المحلية والربط الشبكي الحديث",
    7: "الأنماط في معالج النصوص Word",
    8: "القوالب في معالج النصوص Word",
    9: "المقاطع في معالج النصوص Word",
    10: "دمج المراسلات في معالج النصوص Word",
    11: "الصيغ والدوال في جداول Excel",
    12: "فرز وتصفية البيانات في Excel",
    13: "الارتباطات التشعبية في PowerPoint",
    14: "الحركة والمؤثرات في العروض التقديمية",
    15: "المخطط الانسيابي (Flowcharts)",
    16: "الخوارزميات والبرمجة بلغة بايثون",
    17: "متصفح الويب والبحث الآمن",
    18: "البريد الإلكتروني والمراسلات الرقمية",
    19: "شبكات التواصل الاجتماعي والاستعمال المسؤول",
    20: "إنشاء صفحة ويب بلغة HTML5",
}


def find_source_file(unit_num: int) -> Path:
    num_str = f"{unit_num:02d}"
    # Prefer modernized lessons
    modern_files = list(MODERN_DIR.glob(f"**/unit-{num_str}*.md"))
    if modern_files:
        return modern_files[0]
    # Fallback to standard lessons
    standard_files = list(LESSONS_DIR.glob(f"**/unit-{num_str}*.md"))
    if standard_files:
        return standard_files[0]
    raise FileNotFoundError(f"Unit {num_str} not found in lessons.")


def process_markdown_content(raw_text: str, unit_num: int, title: str) -> str:
    lines = raw_text.splitlines()
    cleaned_lines = []
    
    # 1. Skip initial H1 / metadata header block
    in_header = True
    lead_found = False
    in_code_block = False
    
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Check if we are past the initial unit header
        if in_header:
            if stripped.startswith("# الوحدة") or stripped.startswith("# الوحدة "):
                i += 1
                continue
            if stripped.startswith("## المجال") or stripped.startswith("### المدة") or stripped.startswith("**المستوى:**") or stripped.startswith("**الحجم الزمني"):
                i += 1
                continue
            if stripped in ("---", "***", "___") and not lead_found:
                in_header = False
                i += 1
                continue
            if stripped == "":
                i += 1
                continue
            # If line is regular text, this is our introductory lead
            in_header = False
        
        # Normalize image paths
        line = re.sub(r'!\[(.*?)\]\(\.?/?artifacts/(image_[a-zA-Z0-9_]+\.png)\)', r'![\1](/artifacts/\2)', line)
        line = re.sub(r'src=[\'"]\.?/?artifacts/(image_[a-zA-Z0-9_]+\.png)[\'"]', r'src="/artifacts/\1"', line)

        # Normalize bare code blocks without language to ```text
        if stripped.startswith("```"):
            if not in_code_block:
                in_code_block = True
                lang = stripped[3:].strip()
                if not lang:
                    line = "```text"
            else:
                in_code_block = False
            cleaned_lines.append(line)
            i += 1
            continue

        # Heading adjustments:
        # In legacy files, headings are often:
        # `### 1 الإشكالية` or `### 2 ما هو النمط؟` or `## 1. البنية الأساسية`
        m_h3_num = re.match(r'^###\s+(\d+)[\.\s]+(.*)', stripped)
        if m_h3_num:
            num = m_h3_num.group(1)
            head_title = m_h3_num.group(2).strip()
            line = f"## {num}. {head_title}"
            cleaned_lines.append(line)
            i += 1
            continue

        m_h3_alpha = re.match(r'^###\s+([أ-ي])\.\s+(.*)', stripped)
        if m_h3_alpha:
            alpha = m_h3_alpha.group(1)
            head_title = m_h3_alpha.group(2).strip()
            line = f"### {alpha}. {head_title}"
            cleaned_lines.append(line)
            i += 1
            continue

        # Convert simple note/warning paragraphs into Markdoc Callouts
        if stripped.startswith("ملاحظة:") or stripped.startswith("ملاحظة :") or stripped.startswith("**ملاحظة:**"):
            note_content = re.sub(r'^\*{0,2}ملاحظة\s*:\*{0,2}\s*', '', stripped)
            line = f'{{% callout title="ملاحظة" %}}\n{note_content}\n{{% /callout %}}'
            cleaned_lines.append(line)
            i += 1
            continue

        if stripped.startswith("تنبيه:") or stripped.startswith("تنبيه :") or stripped.startswith("**تنبيه:**"):
            warn_content = re.sub(r'^\*{0,2}تنبيه\s*:\*{0,2}\s*', '', stripped)
            line = f'{{% callout type="warning" title="تنبيه هـام" %}}\n{warn_content}\n{{% /callout %}}'
            cleaned_lines.append(line)
            i += 1
            continue

        cleaned_lines.append(line)
        i += 1

    content_str = "\n".join(cleaned_lines).strip()

    # If first paragraph doesn't have lead, add {% .lead %} to the first paragraph
    paragraphs = content_str.split("\n\n")
    if paragraphs and not paragraphs[0].startswith("#") and not paragraphs[0].startswith("{%"):
        first_para = paragraphs[0].strip()
        if not first_para.endswith("{% .lead %}"):
            paragraphs[0] = f"{first_para} {{% .lead %}}"
        content_str = "\n\n".join(paragraphs)

    # Build description for metadata
    clean_desc = re.sub(r'\[.*?\]\(.*?\)', '', content_str[:250])
    clean_desc = re.sub(r'[#*`_{}%"]', '', clean_desc).replace('\n', ' ').strip()
    if len(clean_desc) > 160:
        clean_desc = clean_desc[:157] + '...'
    if not clean_desc:
        clean_desc = f"درس {title} لمقرر مادة الإعلام الآلي للسنة الأولى ثانوي في الجزائر."

    frontmatter = f"""---
title: {json.dumps(title, ensure_ascii=False)}
nextjs:
  metadata:
    title: {json.dumps(f"الوحدة {unit_num:02d} - {title} | منهاج 1AS", ensure_ascii=False)}
    description: {json.dumps(clean_desc, ensure_ascii=False)}
---

"""
    return frontmatter + content_str + "\n"


def sync_images():
    PUBLIC_ARTIFACTS.mkdir(parents=True, exist_ok=True)
    count = 0
    for img_path in LESSONS_DIR.glob("**/artifacts/*.png"):
        dest_file = PUBLIC_ARTIFACTS / img_path.name
        if not dest_file.exists() or dest_file.stat().st_size != img_path.stat().st_size:
            shutil.copy2(img_path, dest_file)
            count += 1
    print(f"[Images] Synced {count} images to site/public/artifacts/")


def main():
    sync_images()
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    
    print("\n[Converting Lessons] Processing Units 01 to 20...")
    for unit_num in range(1, 21):
        num_str = f"{unit_num:02d}"
        target_dir = DOCS_DIR / f"unit-{num_str}"
        target_dir.mkdir(parents=True, exist_ok=True)
        target_page = target_dir / "page.md"
        
        # If unit-01 already has our hand-crafted rich version, we can keep or re-verify
        # Unit 01 was handcrafted with extra quick-links, let's preserve it if already fine,
        # or we only generate units 02 to 20!
        if unit_num == 1 and target_page.exists():
            print(f" - Unit 01: Preserved hand-crafted version at {target_page.relative_to(BASE_DIR)}")
            continue

        src_file = find_source_file(unit_num)
        title = UNIT_TITLES.get(unit_num, f"الوحدة {num_str}")
        
        with open(src_file, "r", encoding="utf-8") as f:
            raw_text = f.read()

        converted_md = process_markdown_content(raw_text, unit_num, title)
        
        with open(target_page, "w", encoding="utf-8") as f:
            f.write(converted_md)
            
        print(f" + Unit {num_str}: Generated from {src_file.name} -> {target_page.relative_to(BASE_DIR)}")

    # Clean up obsolete template demo pages from site/src/app/docs/
    obsolete_pages = [
        "architecture-guide",
        "basics-of-time-travel",
        "cacheadvance-flush",
        "cacheadvance-predict",
        "cacheadvance-regret",
        "cacheadvance-revert",
        "compile-time-caching",
        "design-principles",
        "how-to-contribute",
        "installation",
        "introduction-to-string-theory",
        "neuralink-integration",
        "predicting-user-behavior",
        "predictive-data-generation",
        "temporal-paradoxes",
        "testing",
        "the-butterfly-effect",
        "understanding-caching",
        "writing-plugins",
    ]
    for obs in obsolete_pages:
        obs_dir = DOCS_DIR / obs
        if obs_dir.exists() and obs_dir.is_dir():
            shutil.rmtree(obs_dir)
            print(f" - Cleaned up demo page: {obs}")

    print("\n[Done] All 20 units are now successfully converted into site/src/app/docs/!")


if __name__ == "__main__":
    main()
