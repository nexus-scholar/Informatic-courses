"""Copy each lesson's images into its own artifacts/ folder and fix paths in md + html."""
import pathlib, re, shutil, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

BASE = pathlib.Path(r"C:\Users\mouadh\Documents\Informatic-courses")
SRC_ARTIFACTS = BASE / "book" / "informatique1as-livre_scolaire_artifacts"
LESSONS = BASE / "courses" / "lessons"

total_copied = 0

for md_file in sorted(LESSONS.rglob("*.md")):
    content = md_file.read_text(encoding="utf-8")
    imgs = re.findall(r"!\[.*?\]\(([^)]+)\)", content)
    if not imgs:
        continue

    # Create artifacts dir next to the md file
    art_dir = md_file.parent / "artifacts"
    art_dir.mkdir(exist_ok=True)

    copied = 0
    for img_ref in imgs:
        # Extract just the filename from the reference
        img_name = pathlib.PureWindowsPath(img_ref).name
        src = SRC_ARTIFACTS / img_name
        dst = art_dir / img_name
        if src.exists() and not dst.exists():
            shutil.copy2(src, dst)
            copied += 1
        elif dst.exists():
            copied += 1  # already there

    total_copied += copied

    # Fix paths in markdown: replace old reference with artifacts/filename
    new_content = content
    for img_ref in imgs:
        img_name = pathlib.PureWindowsPath(img_ref).name
        new_content = new_content.replace(img_ref, f"artifacts/{img_name}")
    if new_content != content:
        md_file.write_text(new_content, encoding="utf-8")

    # Fix paths in corresponding HTML
    html_file = md_file.with_suffix(".html")
    if html_file.exists():
        html = html_file.read_text(encoding="utf-8")
        new_html = html
        for img_ref in imgs:
            img_name = pathlib.PureWindowsPath(img_ref).name
            # HTML uses forward slashes and may have different prefix
            old_patterns = [
                f"../book/informatique1as-livre_scolaire_artifacts/{img_name}",
                f"informatique1as-livre_scolaire_artifacts/{img_name}",
                f"book/informatique1as-livre_scolaire_artifacts/{img_name}",
                f"../book/informatique1as-livre_scolaire_artifacts\\{img_name}",
            ]
            for old in old_patterns:
                new_html = new_html.replace(old, f"artifacts/{img_name}")
        if new_html != html:
            html_file.write_text(new_html, encoding="utf-8")

    rel = md_file.relative_to(LESSONS)
    print(f"  {rel.parent.name}/{md_file.name}: {copied} images")

print(f"\nDone — {total_copied} image references processed")
