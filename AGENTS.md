# AGENTS.md — Informatic-courses Project Guide

## Project Overview
This repository contains educational computer science (Informatique) resources for **1st Year Secondary School (1AS / 15-year-old students) in Algeria**, aligned with the official national curriculum (Ministry of National Education).

The core objective is to **modernize and upgrade the textbook and lesson content** (originally published in 2015) to reflect contemporary technology while respecting pedagogical standards.

---

## Directory Structure
- `archive/legacy-reference/sources/`: Original reference documents (PDFs of textbook, annual progression, unit PDFs).
- `archive/legacy-reference/book/`: Raw OCR conversion of the full 2015 textbook (`informatique1as-livre_scolaire.md`) and extracted page images.
- `planning/`: Active yearly plan (`التخطيط_السنوي.md`) and its short README. Superseded plans are preserved in `archive/planning-legacy/`.
- `courses/lessons/`: Structured course units in Markdown & HTML divided into 5 main conceptual domains (*المجالات المفاهيمية*):
  1. `1-التعامل_مع_بيئة_الحاسوب` (Units 01-06: TIC, Hardware Assembly, OS, Control Panel, Security, LAN)
  2. `2-المكتبية` (Units 07-12: Word Styles/Templates/Sections/Mail-Merge, Excel Formulas/Functions & Data Sorting)
  3. `3-العروض_التقديمية` (Units 13-14: PowerPoint Hyperlinks, Animations & Presentations)
  4. `4-المقدمة_في_البرمجة` (Units 15-16: Flowcharts, Algorithms & Programming Concepts)
  5. `5-تقنيات_الويب` (Units 17-20: Web Browsers, Email, Social Networks, HTML Web Page Creation)
- `courses/convert_lessons.py`: Python script to convert all Markdown lesson files into styled RTL HTML.

---

## Content & Pedagogical Guidelines
1. **Language & Direction**:
   - Primary language: Clear, modern educational **Arabic** (*اللغة العربية*).
   - Text direction: Right-To-Left (RTL).
   - Technical terms: Mention standard Arabic term first, followed by English/French equivalent in parentheses where relevant (e.g., *معالج النصوص (Word Processor / Traitement de texte)*).
2. **Target Audience (15yo Secondary Students)**:
   - Clear explanations with step-by-step illustrations.
   - Practical exercises, hands-on activities, and real-world examples suitable for a computer lab environment.
   - Age-appropriate terminology, avoiding overly obscure academic jargon without sacrificing technical accuracy.
3. **2015 -> 2026 Tech Stack Upgrades**:
   - **OS**: Windows 7/8/XP references -> Windows 11 / modern Linux (Ubuntu/Debian) concepts.
   - **Office Suite**: MS Office 2007/2010 references -> Office 365 / Office 2021 / LibreOffice.
   - **Web & Security**: Internet Explorer/Old web tools -> Modern browsers (Edge/Chrome/Firefox), Cloud storage, Online Security (MFA, phishing, privacy), and modern web basics (HTML5/CSS3).
   - **Algorithms & Programming**: Flowcharts + pseudo-code transition to modern algorithmic logic (and introducing Python fundamentals where applicable).
4. **HTML Synchronization**:
   - Whenever any `.md` file in `courses/lessons/` is modified, run `python courses/convert_lessons.py` to regenerate the HTML files.

## Reusable teaching workflows
- Project skills are under `.agents/skills/`: use `lesson-production` for one-unit modernization and `assessment-builder` for classroom assessment packs.
- The read-only `curriculum_auditor` custom agent lives in `.codex/agents/`; use it for bounded alignment or staleness audits before broad changes.
