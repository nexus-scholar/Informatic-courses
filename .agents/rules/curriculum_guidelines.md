# Curriculum & Lesson Content Rules

When editing or updating any lesson unit in `courses/lessons/`:

1. **Structure Consistency**:
   - Each unit must keep a clean Markdown header hierarchy (`# Unit Title`, `## Sections`, `### Sub-sections`).
   - Include clear learning objectives (*الأهداف التعلمية*) at the beginning of each unit.
   - Include a practical application/exercise section (*أنشطة تطبيقية / تمارين*) at the end.

2. **RTL Arabic Text Integrity**:
   - Do not invert parentheses around Latin words (e.g. write `(Word)` not `)Word(`).
   - Ensure clean Unicode Arabic text without Wingdings or OCR artifacts.

3. **Modernization Standards**:
   - Update hardware specs (e.g., RAM in GBs, SSD vs HDD, USB 3/Type-C, modern CPUs).
   - Update software screenshots/references to Windows 11 & modern Office/cloud tools.
   - Update internet/web units to cover modern topics: Cloud computing, Cyber hygiene, Phishing, Privacy, AI concepts, and HTML5.

4. **Automation**:
   - Run `python courses/convert_lessons.py` after editing lesson `.md` files to update `.html` files.
