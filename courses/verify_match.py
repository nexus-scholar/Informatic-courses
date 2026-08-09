import sys, io, re, pathlib
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

md = pathlib.Path(r"C:\Users\mouadh\Documents\Informatic-courses\courses\lessons\1-التعامل_مع_بيئة_الحاسوب\unit-01-تقنية_المعلومات.md").read_text(encoding="utf-8")
html = pathlib.Path(r"C:\Users\mouadh\Documents\Informatic-courses\courses\lessons\1-التعامل_مع_بيئة_الحاسوب\unit-01-تقنية_المعلومات.html").read_text(encoding="utf-8")

# Count headings in md
md_h1 = len(re.findall(r"^#\s+", md, re.MULTILINE))
md_h2 = len(re.findall(r"^##\s+", md, re.MULTILINE))
md_h3 = len(re.findall(r"^###\s+", md, re.MULTILINE))
md_h4 = len(re.findall(r"^####\s+", md, re.MULTILINE))

# Count headings in html
html_h1 = len(re.findall(r"<h1>", html))
html_h2 = len(re.findall(r"<h2>", html))
html_h3 = len(re.findall(r"<h3>", html))
html_h4 = len(re.findall(r"<h4>", html))

print("Markdown headings:", md_h1, md_h2, md_h3, md_h4)
print("HTML headings:", html_h1, html_h2, html_h3, html_h4)

# Check key content presence in both
checks = ["1951", "1981", "1994", "2001", "2009", "2007", "2010", "MS-DOS", "SOMME", "1985", "1995", "2001"]
for c in checks:
    in_md = c in md
    in_html = c in html
    status = "OK" if in_md and in_html else "MISSING"
    print(f"  {c}: md={in_md} html={in_html} {status}")

# Check no PUA
pua = set(c for c in html if 0xE000 <= ord(c) <= 0xF8FF)
print(f"PUA in HTML: {len(pua)}")
if pua:
    print(f"  {[hex(ord(c)) for c in pua]}")

# Image refs
md_imgs = len(re.findall(r"!\[.*?\]\(artifacts/", md))
html_imgs = len(re.findall(r'src="artifacts/', html))
print(f"Images: md={md_imgs} html={html_imgs}")

# Also check table row counts
md_table_rows = len(re.findall(r"^\|.*\|$", md, re.MULTILINE))
html_table_rows = len(re.findall(r"<tr>", html))
print(f"Table rows: md={md_table_rows} html={html_table_rows}")