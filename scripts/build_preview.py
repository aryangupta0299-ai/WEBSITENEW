#!/usr/bin/env python3
"""Bundle the multi-page site into one self-contained HTML file for previewing.

Inlines CSS, JS, fonts and images, and swaps pages client-side, so the whole
site can be viewed from a single file (e.g. a hosted preview that only serves
one page). The real site is unchanged: keep editing the normal files.

Usage: python3 scripts/build_preview.py [output.html]
"""
import base64
import json
import mimetypes
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "preview.html"

PAGES = {
    "index.html": "home",
    "shop.html": "shop",
    "product.html": "product",
    "shade-finder.html": "finder",
    "about.html": "about",
    "support.html": "support",
    "cart.html": "cart",
}


def data_uri(path: Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    if path.suffix == ".woff2":
        mime = "font/woff2"
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


IMAGES = {f"assets/img/{p.name}": data_uri(p) for p in (ROOT / "assets/img").glob("*.jpg")}


def inline_images(text: str) -> str:
    for src, uri in IMAGES.items():
        text = text.replace(src, uri)
    return text


def between(text: str, start: str, end: str) -> str:
    i = text.index(start) + len(start)
    return text[i : text.index(end, i)]


pages = {}
for fname, key in PAGES.items():
    html = (ROOT / fname).read_text()
    pages[fname] = {
        "key": key,
        "title": re.search(r"<title>(.*?)</title>", html).group(1),
        "main": inline_images(between(html, '<main id="main">\n', "  </main>")),
    }

index = (ROOT / "index.html").read_text()
header = between(index, '<a class="skip-link" href="#main">Skip to content</a>\n', '  <main id="main">')
footer = between(index, "  </main>\n", "  <script ")

css = (ROOT / "assets/css/styles.css").read_text()
for font in (ROOT / "assets/fonts").glob("*.woff2"):
    css = css.replace(f"url(../fonts/{font.name})", f"url({data_uri(font)})")
css += """
/* preview-only */
.site-header { top: env(safe-area-inset-top, 0px); }
.preview-bar { background: #2a2a2a; color: #fff; font-size: 12px; text-align: center; padding: 7px 16px; }
.preview-bar strong { font-weight: 600; }
"""

js = "\n".join(
    inline_images((ROOT / f"assets/js/{name}.js").read_text()) for name in ("catalog", "renders", "main", "pages")
)

router = """
(function () {
  const PAGES = %s;
  const main = document.getElementById("main");
  const navs = () => document.querySelectorAll(".site-header .nav, #mobile-menu nav");

  function show(file, search, hash, first) {
    const pg = PAGES[file] || PAGES["index.html"];
    main.innerHTML = pg.main;
    document.body.dataset.page = pg.key;
    document.title = pg.title;
    navs().forEach((nav) => nav.querySelectorAll("a").forEach((a) => {
      const f = a.getAttribute("href").split(/[?#]/)[0];
      f === file && pg.key !== "home" ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
    }));
    if (first) return;  // initial render: page scripts run their own init on DOMContentLoaded
    const menu = document.getElementById("mobile-menu");
    if (menu && menu.classList.contains("is-open")) { menu.classList.remove("is-open"); document.body.style.overflow = ""; }
    window.BRONAM_HYDRATE_RENDERS();
    window.BRONAM_INIT_PAGE(pg.key, search || "");
    const target = hash && document.getElementById(hash.slice(1));
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
    main.setAttribute("tabindex", "-1");
    main.focus({ preventScroll: true });
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.hasAttribute("data-open-cart") || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (/^(https?:|mailto:|tel:)/.test(href)) return;
    const url = new URL(href, "https://preview.local/");
    const file = url.pathname.slice(1);
    if (!PAGES[file]) return;
    e.preventDefault();
    show(file, url.search, url.hash, false);
  });

  const start = (location.hash || "").slice(1);
  const byKey = Object.keys(PAGES).find((f) => PAGES[f].key === start);
  show(byKey || "index.html", "", "", true);
})();
""" % json.dumps(pages)

out = f"""<title>Bronam Storefront</title>
<meta name="theme-color" content="#000000">
<style>
{css}
</style>
<a class="skip-link" href="#main">Skip to content</a>
<div class="preview-bar"><strong>Design preview.</strong> Photos, reviews, figures and checkout are placeholders.</div>
{header}  <main id="main"></main>
{footer}<script>
{router}
</script>
<script>
{js}
</script>
"""
OUT.write_text(out)
print(f"Wrote {OUT} ({OUT.stat().st_size / 1024:.0f} KB)")
