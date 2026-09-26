"""Convert all teachers guide markdown files to HTML."""
import pathlib, re, html as htmllib, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

BASE = pathlib.Path(r"C:\Users\mouadh\Documents\Informatic-courses")
GUIDE = BASE / "teachers_guide"

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Naskh+Arabic:wght@400;700&display=swap');
body{font-family:'Amiri','Noto Naskh Arabic',serif;direction:rtl;text-align:right;background:#fff;color:#1a1a1a;line-height:2;max-width:900px;margin:0 auto;padding:20px 30px}
h1{color:#1565c0;border-bottom:3px solid #1565c0;padding-bottom:10px}
h2{color:#1976d2;border-bottom:2px solid #e3f2fd;padding-bottom:6px;margin-top:30px}
h3{color:#1e88e5;margin-top:20px}
h4{color:#42a5f5}
table{width:100%;border-collapse:collapse;margin:15px 0}
th,td{border:1px solid #bbb;padding:8px 12px;text-align:right}
th{background:#e3f2fd;font-weight:bold}
tr:nth-child(even){background:#f5f5f5}
pre,code{background:#f5f5f5;padding:2px 6px;border-radius:3px;font-family:monospace}
pre{padding:12px;overflow-x:auto;border:1px solid #ddd}
blockquote{border-right:4px solid #1976d2;padding-right:15px;margin:15px 0;color:#555}
hr{border:none;border-top:2px solid #e3f2fd;margin:20px 0}
ul,ol{padding-right:20px}
a{color:#1565c0}
a:hover{color:#0d47a1}
img{max-width:100%;height:auto}
"""


def inline_format(text: str) -> str:
    """Convert inline markdown (bold, italic, code, links) to HTML with escaping."""
    text = htmllib.escape(text)
    # Code first (backticks) so markers inside are not mangled
    text = re.sub(r"`([^`]+)`", lambda m: f"<code>{m.group(1)}</code>", text)
    # Links [text](url)
    text = re.sub(
        r"\[([^\]]+)\]\(([^)]+)\)",
        lambda m: f'<a href="{m.group(2)}">{m.group(1)}</a>',
        text,
    )
    # Bold **text**
    text = re.sub(r"\*\*([^*]+)\*\*", lambda m: f"<strong>{m.group(1)}</strong>", text)
    # Italic *text*
    text = re.sub(r"\*([^*]+)\*", lambda m: f"<em>{m.group(1)}</em>", text)
    return text


def md_to_html(md: str) -> str:
    lines = md.splitlines()
    out = []
    in_table = False
    in_code = False
    in_ul = False
    in_ol = False

    for line in lines:
        stripped = line.strip()

        # Code blocks
        if stripped.startswith("```"):
            if in_code:
                out.append("</code></pre>")
                in_code = False
            else:
                lang = stripped[3:].strip()
                out.append(f"<pre><code class=\"{lang}\">" if lang else "<pre><code>")
                in_code = True
            continue
        if in_code:
            out.append(htmllib.escape(line))
            continue

        # Tables
        if "|" in stripped and stripped.startswith("|"):
            cells = [c.strip() for c in stripped.split("|")[1:-1]]
            if all(set(c) <= set("- :") for c in cells):
                continue
            if not in_table:
                out.append("<table>")
                in_table = True
                tag = "th"
            else:
                tag = "td"
            out.append("<tr>" + "".join(f"<{tag}>{inline_format(c)}</{tag}>" for c in cells) + "</tr>")
            continue
        elif in_table:
            out.append("</table>")
            in_table = False

        # Headings
        m = re.match(r"^(#{1,4})\s+(.*)", stripped)
        if m:
            level = len(m.group(1))
            out.append(f"<h{level}>{inline_format(m.group(2))}</h{level}>")
            continue

        # Horizontal rules
        if stripped in ("---", "***", "___"):
            out.append("<hr>")
            continue

        # Unordered lists
        if re.match(r"^[-*]\s+", stripped):
            if not in_ul:
                out.append("<ul>")
                in_ul = True
            out.append(f"<li>{inline_format(re.sub(r'^[-*]\s+', '', stripped))}</li>")
            continue
        elif in_ul:
            out.append("</ul>")
            in_ul = False

        # Ordered lists
        if re.match(r"^\d+\.\s+", stripped):
            if not in_ol:
                out.append("<ol>")
                in_ol = True
            out.append(f"<li>{inline_format(re.sub(r'^\d+\.\s+', '', stripped))}</li>")
            continue
        elif in_ol:
            out.append("</ol>")
            in_ol = False

        # Blockquotes
        if stripped.startswith(">"):
            out.append(f"<blockquote><p>{inline_format(stripped[1:].strip())}</p></blockquote>")
            continue

        # Images
        img_m = re.match(r"!\[([^\]]*)\]\(([^)]+)\)", stripped)
        if img_m:
            alt = htmllib.escape(img_m.group(1))
            src = img_m.group(2).replace("\\", "/")
            out.append(f'<p><img src="{src}" alt="{alt}"></p>')
            continue

        # Empty lines
        if not stripped:
            out.append("")
            continue

        # Paragraphs
        out.append(f"<p>{inline_format(stripped)}</p>")

    if in_table:
        out.append("</table>")
    if in_ul:
        out.append("</ul>")
    if in_ol:
        out.append("</ol>")
    if in_code:
        out.append("</code></pre>")

    return "\n".join(out)


TEMPLATE = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<style>{css}</style>
</head>
<body>
{body}
</body>
</html>"""


count = 0
for md_file in sorted(GUIDE.rglob("*.md")):
    md = md_file.read_text(encoding="utf-8")
    body = md_to_html(md)
    # Extract title from first heading
    title_m = re.search(r"^#\s+(.+)", md, re.MULTILINE)
    title = title_m.group(1) if title_m else md_file.stem

    html = TEMPLATE.format(title=title, css=CSS, body=body)
    html_file = md_file.with_suffix(".html")
    html_file.write_text(html, encoding="utf-8")
    size_kb = html_file.stat().st_size / 1024
    count += 1
    print(f"  {md_file.parent.name}/{md_file.name} -> {html_file.name} ({size_kb:.0f} KB)")

print(f"\nDone — {count} HTML files generated for Teachers Guide")
