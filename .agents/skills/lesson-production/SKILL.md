---
name: lesson-production
description: Create or modernize a 1AS Informatique lesson with aligned teacher materials and regenerated RTL HTML. Use for a specific teaching unit, not for a whole-curriculum audit.
---

# Lesson production

Work on one unit at a time. Treat `courses/lessons/` as the canonical student material and `teachers_guide/` as the canonical teacher material.

1. Read the matching lesson, teacher-guide files if present, `planning/التخطيط_السنوي.md`, and `.agents/rules/curriculum_guidelines.md`.
2. Preserve the official learning intent while replacing obsolete technology examples with accessible current concepts. Do not make time-sensitive market-share or product-feature claims unless the request requires and verifies them.
3. Give the student lesson: objectives, clear Arabic explanation, a realistic lab/class activity, and end-of-unit assessment. Give Arabic terminology first, then English/French in parentheses only where useful.
4. Align the teacher note, teaching method, and activities with the revised objectives; state any missing equipment or institutional constraint rather than inventing it.
5. After changing a student Markdown lesson, run `python courses/convert_lessons.py` and confirm that its HTML counterpart exists. Review the diff and do not overwrite unrelated units.

Report the files changed, validation performed, and any pedagogical decision needing teacher approval.
