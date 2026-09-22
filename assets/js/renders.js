/* Vector product renders — matte black packaging with the BRO|NAM mark.
   Stand-ins until product photography exists; swap for <img> tags any time. */

(function () {
  let uid = 0;

  function defs(id) {
    return `
      <defs>
        <linearGradient id="body${id}" x1="0" x2="1">
          <stop offset="0" stop-color="#050505"/>
          <stop offset=".22" stop-color="#2a2a2a"/>
          <stop offset=".34" stop-color="#151515"/>
          <stop offset=".78" stop-color="#0b0b0b"/>
          <stop offset="1" stop-color="#000"/>
        </linearGradient>
        <linearGradient id="cap${id}" x1="0" x2="1">
          <stop offset="0" stop-color="#111"/>
          <stop offset=".3" stop-color="#3a3a3a"/>
          <stop offset=".45" stop-color="#1c1c1c"/>
          <stop offset="1" stop-color="#050505"/>
        </linearGradient>
        <radialGradient id="shadow${id}" cx=".5" cy=".5" r=".5">
          <stop offset="0" stop-color="#000" stop-opacity=".35"/>
          <stop offset="1" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>`;
  }

  // The logo lockup scaled for packaging. x/y = centre of lockup.
  function mark(x, y, s) {
    const w = 34 * s, h = 13 * s;
    return `
      <g font-family="Montserrat, Archivo, sans-serif" font-weight="600" letter-spacing="${2.2 * s}">
        <rect x="${x - w - 1.5 * s}" y="${y - h / 2}" width="${w}" height="${h}" fill="#F4F1EC"/>
        <text x="${x - w / 2 - 1.5 * s + 1.1 * s}" y="${y + 3.2 * s}" font-size="${9 * s}" text-anchor="middle" fill="#000">BRO</text>
        <text x="${x + w / 2 + 2 * s}" y="${y + 3.2 * s}" font-size="${9 * s}" text-anchor="middle" fill="#F4F1EC">NAM</text>
      </g>`;
  }

  function label(x, y, name, kind, s) {
    return `
      <g font-family="Archivo, sans-serif" text-anchor="middle">
        <text x="${x}" y="${y}" font-size="${10 * s}" font-weight="700" letter-spacing="${3.4 * s}" fill="#B58C3C">${name.toUpperCase()}</text>
        <text x="${x}" y="${y + 11 * s}" font-size="${5.4 * s}" letter-spacing="${1.6 * s}" fill="#9a9a9a">${kind.toUpperCase()}</text>
      </g>`;
  }

  function tube(id, cx, base, s) {
    // Squeeze tube standing on its cap, crimp at top.
    const w = 92 * s, top = base - 300 * s, capH = 42 * s;
    const x = cx - w / 2;
    return `
      <ellipse cx="${cx}" cy="${base + 4 * s}" rx="${70 * s}" ry="${9 * s}" fill="url(#shadow${id})"/>
      <path d="M${x + 6 * s} ${base - capH} L${x - 4 * s} ${top + 16 * s} L${x - 4 * s} ${top} L${x + w + 4 * s} ${top} L${x + w + 4 * s} ${top + 16 * s} L${x + w - 6 * s} ${base - capH} Z" fill="url(#body${id})"/>
      <rect x="${x - 4 * s}" y="${top}" width="${w + 8 * s}" height="${9 * s}" fill="#0a0a0a"/>
      <rect x="${x + 4 * s}" y="${base - capH}" width="${w - 8 * s}" height="${capH}" rx="${4 * s}" fill="url(#cap${id})"/>
      ${mark(cx, top + 110 * s, s)}`;
  }

  function pump(id, cx, base, s) {
    const w = 96 * s, h = 190 * s, x = cx - w / 2, top = base - h;
    return `
      <ellipse cx="${cx}" cy="${base + 4 * s}" rx="${72 * s}" ry="${9 * s}" fill="url(#shadow${id})"/>
      <rect x="${x}" y="${top}" width="${w}" height="${h}" rx="${12 * s}" fill="url(#body${id})"/>
      <rect x="${cx - 20 * s}" y="${top - 34 * s}" width="${40 * s}" height="${36 * s}" rx="${3 * s}" fill="url(#cap${id})"/>
      <rect x="${cx - 5 * s}" y="${top - 58 * s}" width="${10 * s}" height="${26 * s}" fill="#1a1a1a"/>
      <path d="M${cx - 16 * s} ${top - 70 * s} h${48 * s} a${4 * s} ${4 * s} 0 0 1 0 ${10 * s} h-${48 * s} a${4 * s} ${4 * s} 0 0 1 0 -${10 * s} Z" fill="url(#cap${id})"/>
      ${mark(cx, top + 62 * s, s)}`;
  }

  function spray(id, cx, base, s) {
    const w = 70 * s, h = 250 * s, x = cx - w / 2, top = base - h;
    return `
      <ellipse cx="${cx}" cy="${base + 4 * s}" rx="${58 * s}" ry="${8 * s}" fill="url(#shadow${id})"/>
      <rect x="${x}" y="${top}" width="${w}" height="${h}" rx="${9 * s}" fill="url(#body${id})"/>
      <rect x="${cx - 16 * s}" y="${top - 16 * s}" width="${32 * s}" height="${18 * s}" fill="#2a2a2a"/>
      <rect x="${cx - 22 * s}" y="${top - 58 * s}" width="${44 * s}" height="${44 * s}" rx="${6 * s}" fill="url(#cap${id})"/>
      <circle cx="${cx + 14 * s}" cy="${top - 44 * s}" r="${2.4 * s}" fill="#000"/>
      ${mark(cx, top + 70 * s, s * 0.82)}`;
  }

  const singles = { tube, pump, spray };
  const meta = {
    tube: ["Prime", "Face primer"],
    pump: ["Base", "Skin tint"],
    spray: ["Lock", "Setting spray"]
  };

  function one(kind, id, cx, base, s) {
    const [n, k] = meta[kind];
    const heights = { tube: 300, pump: 190, spray: 250 };
    const labelY = base - heights[kind] * s + (kind === "tube" ? 150 : kind === "pump" ? 102 : 110) * s;
    return singles[kind](id, cx, base, s) + label(cx, labelY, n, k, s * (kind === "spray" ? 0.82 : 1));
  }

  window.BRONAM_RENDER = function (render, opts) {
    opts = opts || {};
    const id = ++uid;
    const title = opts.title || "Bronam product";
    let body;
    if (render === "kit") {
      body = one("spray", id, 110, 440, 0.78) + one("tube", id, 310, 452, 0.78) + one("pump", id, 210, 470, 0.9);
    } else if (render === "duo-base") {
      body = one("tube", id, 140, 450, 0.85) + one("pump", id, 265, 460, 0.95);
    } else if (render === "duo-fix") {
      body = one("spray", id, 140, 450, 0.88) + one("tube", id, 265, 460, 0.88);
    } else {
      body = one(render, id, 200, 450, 1.05);
    }
    return `<svg viewBox="0 0 400 500" role="img" aria-label="${title}" xmlns="http://www.w3.org/2000/svg">${defs(id)}${body}</svg>`;
  };

  // Hydrate <div data-render="tube" data-title="..."></div>
  window.BRONAM_HYDRATE_RENDERS = function (root) {
    (root || document).querySelectorAll("[data-render]").forEach((el) => {
      if (el.dataset.hydrated) return;
      el.innerHTML = window.BRONAM_RENDER(el.dataset.render, { title: el.dataset.title });
      el.dataset.hydrated = "1";
    });
  };
})();
