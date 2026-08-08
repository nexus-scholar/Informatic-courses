#!/usr/bin/env python3
"""Convert course-2-office.md to RTL HTML with embedded CSS."""

import re
from pathlib import Path

def md_to_html(md_path: Path) -> str:
    text = md_path.read_text(encoding='utf-8')
    lines = text.splitlines()
    html_lines = []
    in_list = False
    in_table = False
    table_rows = []

    def close_list():
        nonlocal in_list
        if in_list:
            html_lines.append('</ul>')
            in_list = False

    def close_table():
        nonlocal in_table, table_rows
        if in_table and table_rows:
            html_lines.append('<table>')
            for i, row in enumerate(table_rows):
                cells = [c.strip() for c in row.split('|')[1:-1]]
                tag = 'th' if i == 0 else 'td'
                row_html = ''.join(f'<{tag}>{c}</{tag}>' for c in cells)
                html_lines.append(f'<tr>{row_html}</tr>')
            html_lines.append('</table>')
            in_table = False
            table_rows = []

    def process_inline(text):
        # Bold **text**
        text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
        # Italic *text*
        text = re.sub(r'\*(.+?)\*', r'<em>\1</em>', text)
        # Inline code `text`
        text = re.sub(r'`(.+?)`', r'<code>\1</code>', text)
        return text

    for line in lines:
        stripped = line.strip()

        # Skip empty lines
        if not stripped:
            close_list()
            close_table()
            continue

        # Skip HTML comments
        if stripped.startswith('<!--'):
            continue

        # Table rows (start with |)
        if stripped.startswith('|') and stripped.endswith('|'):
            close_list()
            # Skip separator rows
            if re.match(r'^\|[\s\-:|]+\|$', stripped):
                continue
            if not in_table:
                in_table = True
                table_rows = []
            table_rows.append(stripped)
            continue
        else:
            close_table()

        # Images: ![alt](src)
        img_match = re.match(r'^!\[([^\]]*)\]\(([^)]+)\)$', stripped)
        if img_match:
            close_list()
            alt = img_match.group(1)
            src = img_match.group(2)
            html_lines.append(f'<figure class="figure"><img src="{src}" alt="{alt}"></figure>')
            continue

        # Headings
        h_match = re.match(r'^(#{1,6})\s+(.+)$', stripped)
        if h_match:
            close_list()
            level = len(h_match.group(1))
            content = process_inline(h_match.group(2))
            html_lines.append(f'<h{level}>{content}</h{level}>')
            continue

        # Unordered list items
        li_match = re.match(r'^[-*]\s+(.+)$', stripped)
        if li_match:
            if not in_list:
                html_lines.append('<ul>')
                in_list = True
            content = process_inline(li_match.group(1))
            html_lines.append(f'<li>{content}</li>')
            continue

        # Ordered list items
        oli_match = re.match(r'^(\d+)\.\s+(.+)$', stripped)
        if oli_match:
            close_list()
            content = process_inline(oli_match.group(2))
            html_lines.append(f'<p>{oli_match.group(1)}. {content}</p>')
            continue

        # Regular paragraph
        close_list()
        content = process_inline(stripped)
        html_lines.append(f'<p>{content}</p>')

    close_list()
    close_table()

    body = '\n'.join(html_lines)

    return f'''<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>المجال المفاهيمي الثاني - Word Excel PowerPoint</title>
  <style>
  @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap');

  * {{ margin: 0; padding: 0; box-sizing: border-box; }}

  body {{
    font-family: 'Segoe UI', 'Noto Naskh Arabic', 'Amiri', Tahoma, sans-serif;
    background: #f0f2f5;
    color: #1a1a1a;
    line-height: 1.9;
    font-size: 17px;
  }}

  .page {{
    max-width: 880px;
    margin: 0 auto;
    background: #fff;
    min-height: 100vh;
    box-shadow: 0 0 20px rgba(0,0,0,0.08);
    padding: 40px 45px;
  }}

  h1, h2, h3, h4, h5, h6 {{
    font-family: 'Amiri', 'Noto Naskh Arabic', serif;
    color: #1565c0;
    margin: 1.4em 0 0.6em 0;
    line-height: 1.5;
  }}

  h2 {{
    font-size: 1.45em;
    border-right: 4px solid #1565c0;
    padding-right: 14px;
    margin-top: 2em;
  }}

  h3 {{
    font-size: 1.25em;
    border-right: 3px solid #42a5f5;
    padding-right: 12px;
  }}

  h4 {{
    font-size: 1.1em;
    color: #1976d2;
  }}

  p {{
    margin: 0.55em 0;
    text-align: justify;
  }}

  strong {{
    color: #0d47a1;
  }}

  ul, ol {{
    margin: 0.6em 0;
    padding-right: 1.6em;
    list-style-type: disc;
  }}

  li {{
    margin: 0.3em 0;
  }}

  ul ul {{
    list-style-type: circle;
  }}

  .figure {{
    text-align: center;
    margin: 1.2em 0;
    padding: 10px;
    background: #fafafa;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
  }}

  .figure img {{
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }}

  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    font-size: 0.95em;
    direction: rtl;
  }}

  th, td {{
    border: 1px solid #ccc;
    padding: 8px 10px;
    text-align: right;
    vertical-align: top;
  }}

  th {{
    background: #e3f2fd;
    font-weight: bold;
    color: #0d47a1;
  }}

  tr:nth-child(even) {{
    background: #f9f9f9;
  }}

  code {{
    background: #f5f5f5;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.9em;
    direction: ltr;
    display: inline-block;
  }}

  @media print {{
    body {{ background: white; }}
    .page {{
      box-shadow: none;
      padding: 20px;
      max-width: 100%;
    }}
  }}

  @media (max-width: 600px) {{
    .page {{
      padding: 20px 16px;
      font-size: 15px;
    }}
    h2 {{ font-size: 1.25em; }}
  }}
  </style>
</head>
<body>
  <div class="page">
{body}
  </div>
</body>
</html>'''


if __name__ == '__main__':
    md_path = Path(__file__).parent / 'course-2-office.md'
    out_path = Path(__file__).parent / 'course-2-office.html'
    html = md_to_html(md_path)
    out_path.write_text(html, encoding='utf-8')
    print(f'Generated: {out_path}')
    print(f'Size: {out_path.stat().st_size:,} bytes')
