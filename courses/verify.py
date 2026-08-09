import sys, io, re, pathlib
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

html = pathlib.Path(r"C:\Users\mouadh\Documents\Informatic-courses\courses\lessons\1-التعامل_مع_بيئة_الحاسوب\unit-02-تجميع_الحاسوب.html").read_text(encoding="utf-8")
srcs = re.findall(r'src="([^"]+)"', html)
print(f"Images in unit-02 HTML: {len(srcs)}")
for s in srcs[:5]:
    print(f"  {s}")

art = pathlib.Path(r"C:\Users\mouadh\Documents\Informatic-courses\courses\lessons\1-التعامل_مع_بيئة_الحاسوب\artifacts")
files = list(art.iterdir())
print(f"\nartifacts/ contains {len(files)} files")
