import sys, io, re, pathlib
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

LESSONS = pathlib.Path(r"C:\Users\mouadh\Documents\Informatic-courses\courses\lessons")

def is_pua(ch):
    return 0xF000 <= ord(ch) <= 0xF8FF or 0xE000 <= ord(ch) <= 0xF8FF

issues = []
for f in sorted(LESSONS.rglob("*.md")) + sorted(LESSONS.rglob("*.html")):
    txt = f.read_text(encoding="utf-8")
    rel = f.relative_to(LESSONS)

    pua = set(c for c in txt if is_pua(c))
    if pua:
        issues.append(f"{rel}: PUA chars {[hex(ord(c)) for c in pua]}")

    if f.suffix == ".md":
        fences = txt.count("```")
        if fences % 2:
            issues.append(f"{rel}: unbalanced code fences ({fences})")
        if "formula-not-decoded" in txt:
            issues.append(f"{rel}: leftover formula-not-decoded")
        # check image refs still point to artifacts/
        bad = re.findall(r"!\[[^\]]*\]\((?!artifacts/)[^)]+\)", txt)
        if bad:
            issues.append(f"{rel}: non-artifacts image refs {bad[:3]}")

    if f.suffix == ".html":
        if "&lt;!--" in txt:
            issues.append(f"{rel}: leftover escaped comment")
        if "http://localhost" in txt:
            issues.append(f"{rel}: localhost ref")
        # images that don't exist
        for m in re.finditer(r'src="([^"]+)"', txt):
            src = m.group(1)
            if src.startswith("artifacts/"):
                p = f.parent / src.replace("/", "\\")
                if not p.exists():
                    issues.append(f"{rel}: missing image {src}")

if issues:
    print("ISSUES FOUND:")
    for i in issues:
        print(f"  {i}")
else:
    print("No issues found.")

# Also verify count of md and html per lesson
for md in sorted(LESSONS.rglob("*.md")):
    html = md.with_suffix(".html")
    status = "OK" if html.exists() else "MISSING HTML"
    print(f"  {status}  {md.relative_to(LESSONS)}")
