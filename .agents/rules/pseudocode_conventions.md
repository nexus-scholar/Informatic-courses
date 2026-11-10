# Pseudo-code conventions (Units 15–17)

One dialect for every algorithm in the student lessons, teacher guides and assessments. It follows the 2015 textbook (French keywords, as in Algobox and in classroom exams) and adds a fixed Arabic reading for each keyword. The future interactive playground will parse exactly this dialect, so do not invent variants.

## Keywords

| Pseudo-code | القراءة بالعربية | Python (extension only) |
|---|---|---|
| `Algorithme Nom` | خوارزمية الاسم | — |
| `Const` | ثوابت | `NOM = valeur` |
| `Var` | متغيرات | — |
| `Début` / `Fin` | بداية / نهاية | — |
| `x ← expression` | يُسند إلى x | `x = expression` |
| `Lire(x)` / `Lire(a, b)` | اقرأ | `x = int(input())` / `float(input())` |
| `Ecrire("texte", x)` | اكتب | `print("texte", x)` |
| `Si cond Alors … FinSi` | إذا … فإن … نهاية إذا | `if cond:` |
| `Si cond Alors … Sinon … FinSi` | إذا … فإن … وإلا … نهاية إذا | `if … else:` |
| `Pour i de 1 à n Faire … FinPour` | من أجل i من 1 إلى n افعل … نهاية من أجل | `for i in range(1, n + 1):` |
| `TantQue cond Faire … FinTantQue` | طالما … افعل … نهاية طالما | `while cond:` |
| `Répéter … Jusqu'à cond` (إثراء) | كرّر … إلى أن | — |

## Declarations and types

```text
Algorithme Surface_Rectangle
Const
    PI = 3.14
Var
    longueur, largeur, surface : Réel
    n : Entier
    nom : Chaîne
    admis : Booléen
Début
    Ecrire("Donner la longueur et la largeur :")
    Lire(longueur, largeur)
    surface ← longueur * largeur
    Ecrire("La surface est : ", surface)
Fin
```

- Types: `Entier`, `Réel`, `Caractère`, `Chaîne`, `Booléen` (values `Vrai` / `Faux`).
- Identifiers: Latin letters, digits and `_`; start with a letter; no spaces, no accents, no reserved words. Constants in CAPITALS.
- Indent block contents by 4 spaces. One instruction per line.

## Operators

- Arithmetic: `+  -  *  /  div  mod` (`div` = integer quotient, `mod` = remainder).
- Comparison: `=  ≠  <  >  ≤  ≥` (write `≠ ≤ ≥`, not `<> <= >=`).
- Logical: `ET  OU  NON`.
- Assignment is always `←` (never `=` or `:=`).

## Formatting in Markdown

- Pseudo-code in fenced blocks tagged ```` ```text ````; Python in ```` ```python ````.
- Every closing keyword is written (`FinSi`, `FinPour`, `FinTantQue`); never `Fin faire` / `Fin tant que`.
- Trace tables (جدول التتبع) are Markdown tables: one column per variable plus `Ecrire` output, one row per executed step or loop turn.
- Each exercise states its input and the expected output for a sample input, so it can later be checked automatically.
