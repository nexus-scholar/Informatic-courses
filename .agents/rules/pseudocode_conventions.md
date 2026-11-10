# Pseudo-code conventions (Units 15–17)

One dialect for every algorithm and flowchart in the student lessons, teacher guides, assessments and the flowchart studio (`site/src/components/studio/`). **Keywords, types and identifiers are in English; every message shown to the user is in Arabic. No French anywhere** (the only exception: naming Algobox's own on-screen buttons, since that program is French).

The studio's evaluator parses exactly this dialect, so do not invent variants.

## Keywords

| Pseudo-code | القراءة بالعربية |
|---|---|
| `Algorithm Name` | خوارزمية الاسم |
| `Const` | ثوابت |
| `Var` | متغيرات |
| `Begin` / `End` | بداية / نهاية |
| `x ← expression` | يُسند إلى x |
| `Read(x)` / `Read(a, b)` | اقرأ |
| `Write("نص", x)` | اكتب |
| `If cond Then … EndIf` | إذا … فإن … نهاية إذا |
| `If cond Then … Else … EndIf` | إذا … فإن … وإلا … نهاية إذا |
| `For i ← 1 To n Do … EndFor` | من أجل i من 1 إلى n افعل … نهاية من أجل |
| `While cond Do … EndWhile` | طالما … افعل … نهاية طالما |
| `Repeat … Until cond` (إثراء) | كرّر … إلى أن |

Python appears only in optional «جسر نحو Python» boxes: `x = int(input())`, `print("نص", x)`, `if/else`, `for i in range(1, n + 1)`, `while`.

## Declarations and types

```text
Algorithm RectangleArea
Const
    PI = 3.14
Var
    length, width, area : Real
    n : Integer
    name : String
    passed : Boolean
Begin
    Write("أدخل الطول والعرض:")
    Read(length, width)
    area ← length * width
    Write("المساحة = ", area)
End
```

- Types: `Integer`, `Real`, `Char`, `String`, `Boolean` (values `True` / `False`).
- Identifiers: English words or short abbreviations (`avg`, `total`, `count`, `goalsA`); Latin letters, digits and `_`; start with a letter; no spaces, no accents, no reserved words. Constants in CAPITALS.
- Indent block contents by 4 spaces. One instruction per line.

## Operators

- Arithmetic: `+  -  *  /  div  mod` (`div` = integer quotient, `mod` = remainder).
- Comparison: `=  ≠  <  >  ≤  ≥` (write `≠ ≤ ≥`, not `<> <= >=`).
- Logical: `AND  OR  NOT`.
- Assignment is always `←` (never `=` or `:=`).

## Output

- `Write` prints its parts one after another **with no added space**: `Write("x = ", x)` → `x = 3`.
- Messages are Arabic strings: `Write("ناجح")`, `Write("لا يوجد حل")`.

## Formatting in Markdown

- Pseudo-code in fenced blocks tagged ```` ```text ````; Python in ```` ```python ````.
- Every closing keyword is written (`EndIf`, `EndFor`, `EndWhile`).
- Trace tables (جدول التتبع) are Markdown tables: one column per variable plus the `Write` output, one row per executed step or loop turn.
- Each exercise states its input and the expected output for a sample input, so it can be checked automatically.
- Terminology in prose: Arabic first, then the English term in parentheses where useful — e.g. المخطط النسقي (Flowchart). No French glosses.
