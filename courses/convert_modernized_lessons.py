"""Convert all modernized lesson markdown files to HTML."""
import pathlib, re, html as htmllib, sys

sys.stdout.reconfigure(encoding="utf-8")

BASE = pathlib.Path(r"C:\Users\mouadh\Documents\Informatic-courses")
MODERNIZED_DIR = BASE / "courses" / "modernized_lessons"

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Naskh+Arabic:wght@400;600;700&family=Fira+Code:wght@400;600&display=swap');
body{font-family:'Noto Naskh Arabic','Amiri',sans-serif;direction:rtl;text-align:right;background:#f8fafc;color:#1e293b;line-height:1.9;max-width:920px;margin:0 auto;padding:30px 40px}
.header-card{background:linear-gradient(135deg, #1e40af, #3b82f6);color:#fff;padding:25px 30px;border-radius:12px;margin-bottom:30px;box-shadow:0 4px 12px rgba(30,64,175,0.15)}
.header-card h1{color:#fff;border:none;margin:0 0 10px 0;padding:0;font-size:1.8em}
.header-card p{margin:0;opacity:0.9;font-size:1.05em}
h1{color:#1e40af;border-bottom:3px solid #3b82f6;padding-bottom:10px;margin-top:40px;font-size:1.7em}
h2{color:#1e3a8a;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin-top:32px;font-size:1.35em}
h3{color:#2563eb;margin-top:24px;font-size:1.15em}
h4{color:#0284c7;font-size:1.05em}
p{margin:12px 0;text-align:justify}
strong{color:#0f172a;font-weight:700}
table{width:100%;border-collapse:collapse;margin:20px 0;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)}
th,td{border:1px solid #cbd5e1;padding:10px 14px;text-align:right}
th{background:#eff6ff;color:#1e40af;font-weight:700}
tr:nth-child(even){background:#f8fafc}
pre,code{font-family:'Fira Code',monospace;direction:ltr;text-align:left}
code{background:#f1f5f9;color:#0f172a;padding:2px 6px;border-radius:4px;font-size:0.9em;display:inline-block}
pre{background:#0f172a;color:#f8fafc;padding:16px;border-radius:8px;overflow-x:auto;margin:18px 0}
pre code{background:transparent;color:inherit;padding:0;display:block}
blockquote{border-right:4px solid #3b82f6;background:#eff6ff;padding:12px 18px;margin:20px 0;border-radius:0 8px 8px 0;color:#1e3a8a}
hr{border:none;border-top:2px solid #e2e8f0;margin:30px 0}
ul,ol{padding-right:24px;margin:12px 0}
li{margin:6px 0}
a{color:#2563eb;text-decoration:none}
a:hover{text-decoration:underline}
img{max-width:100%;height:auto;border-radius:8px;margin:15px 0;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
.note-box{background:#f0fdf4;border-right:4px solid #22c55e;padding:15px;border-radius:0 8px 8px 0;margin:20px 0}
.warning-box{background:#fef2f2;border-right:4px solid #ef4444;padding:15px;border-radius:0 8px 8px 0;margin:20px 0}
"""


def inline_format(text: str) -> str:
    """Convert inline markdown (bold, italic, code, links) to HTML with escaping."""
    text = htmllib.escape(text)
    text = re.sub(r"`([^`]+)`", lambda m: f"<code>{m.group(1)}</code>", text)
    text = re.sub(
        r"\[([^\]]+)\]\(([^)]+)\)",
        lambda m: f'<a href="{m.group(2)}">{m.group(1)}</a>',
        text,
    )
    text = re.sub(r"\*\*([^*]+)\*\*", lambda m: f"<strong>{m.group(1)}</strong>", text)
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

        if stripped.startswith("```"):
            if in_code:
                out.append("</code></pre>")
                in_code = False
            else:
                lang = stripped[3:].strip()
                out.append(f'<pre><code class="{lang}">' if lang else "<pre><code>")
                in_code = True
            continue
        if in_code:
            out.append(htmllib.escape(line))
            continue

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

        m = re.match(r"^(#{1,4})\s+(.*)", stripped)
        if m:
            level = len(m.group(1))
            out.append(f"<h{level}>{inline_format(m.group(2))}</h{level}>")
            continue

        if stripped in ("---", "***", "___"):
            out.append("<hr>")
            continue

        if re.match(r"^[-*]\s+", stripped):
            if not in_ul:
                out.append("<ul>")
                in_ul = True
            out.append(f"<li>{inline_format(re.sub(r'^[-*]\s+', '', stripped))}</li>")
            continue
        elif in_ul:
            out.append("</ul>")
            in_ul = False

        if re.match(r"^\d+\.\s+", stripped):
            if not in_ol:
                out.append("<ol>")
                in_ol = True
            out.append(f"<li>{inline_format(re.sub(r'^\d+\.\s+', '', stripped))}</li>")
            continue
        elif in_ol:
            out.append("</ol>")
            in_ol = False

        if stripped.startswith(">"):
            out.append(f"<blockquote><p>{inline_format(stripped[1:].strip())}</p></blockquote>")
            continue

        img_m = re.match(r"!\[([^\]]*)\]\(([^)]+)\)", stripped)
        if img_m:
            alt = htmllib.escape(img_m.group(1))
            src = img_m.group(2).replace("\\", "/")
            out.append(f'<p><img src="{src}" alt="{alt}"></p>')
            continue

        if not stripped:
            out.append("")
            continue

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


def convert_all():
    if not MODERNIZED_DIR.exists():
        print(f"Directory {MODERNIZED_DIR} does not exist yet.")
        return

    count = 0
    for md_file in sorted(MODERNIZED_DIR.rglob("*.md")):
        md = md_file.read_text(encoding="utf-8")
        body = md_to_html(md)
        title_m = re.search(r"^#\s+(.+)", md, re.MULTILINE)
        title = title_m.group(1) if title_m else md_file.stem

        html = TEMPLATE.format(title=title, css=CSS, body=body)
        html_file = md_file.with_suffix(".html")
        html_file.write_text(html, encoding="utf-8")
        size_kb = html_file.stat().st_size / 1024
        count += 1
        print(f"  {md_file.parent.name}/{md_file.name} -> {html_file.name} ({size_kb:.0f} KB)")

    print(f"\nDone — {count} modernized HTML files generated.")


if __name__ == "__main__":
    convert_all()
