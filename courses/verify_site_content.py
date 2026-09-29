"""Fast, dependency-free integrity checks for the public teaching portal.

Run this after generating site pages and before publishing. It intentionally
checks only links and files owned by this repository; external learning links
are curated in ``site/src/app/resources/page.md`` and reviewed by a teacher.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "site" / "src" / "app"
DOCS = APP / "docs"
PUBLIC = ROOT / "site" / "public"
NAVIGATION = ROOT / "site" / "src" / "lib" / "navigation.ts"

IMAGE_RE = re.compile(r"!\[[^]]*\]\(([^)]+)\)")
LINK_RE = re.compile(r'href="(/[^"#?]+)')
MARKDOWN_LINK_RE = re.compile(r"(?<!!)\[[^]]+\]\((/[^)#?]+)\)")


def page_exists(path: str) -> bool:
    if path == "/":
        return (ROOT / "site" / "src" / "app" / "page.md").is_file()
    return (ROOT / "site" / "src" / "app" / path.lstrip("/") / "page.md").is_file()


def main() -> int:
    errors: list[str] = []
    lesson_pages = [DOCS / f"unit-{number:02d}" / "page.md" for number in range(1, 21)]
    missing_pages = [page for page in lesson_pages if not page.is_file()]
    if missing_pages:
        errors.extend(f"Missing generated page: {page.relative_to(ROOT)}" for page in missing_pages)

    nav = NAVIGATION.read_text(encoding="utf-8")
    for number in range(1, 21):
        href = f"/docs/unit-{number:02d}"
        if href not in nav:
            errors.append(f"Navigation is missing {href}")

    pages = list(APP.glob("**/page.md"))
    for page in pages:
        if not page.is_file():
            continue
        text = page.read_text(encoding="utf-8")
        body = text.split("\n---\n", 1)[1] if text.startswith("---\n") else text
        for image in IMAGE_RE.findall(body):
            if not image.startswith("/artifacts/"):
                errors.append(f"Image must use /artifacts/... in {page.relative_to(ROOT)}: {image}")
            elif not (PUBLIC / image.lstrip("/")).is_file():
                errors.append(f"Missing image {image} referenced by {page.relative_to(ROOT)}")
        for link in [*LINK_RE.findall(body), *MARKDOWN_LINK_RE.findall(body)]:
            if not page_exists(link):
                errors.append(f"Broken internal link {link} in {page.relative_to(ROOT)}")

    resources = ROOT / "site" / "src" / "app" / "resources" / "page.md"
    if not resources.is_file():
        errors.append("Missing curated resources page: site/src/app/resources/page.md")

    if errors:
        print("Portal integrity check failed:")
        print("\n".join(f"- {error}" for error in errors))
        return 1

    print("Portal integrity check passed: 20 lesson pages, navigation, internal links, and images.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
