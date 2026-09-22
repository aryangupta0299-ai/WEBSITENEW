/* Bronam — shared behaviour: cart, drawer, menu, toast, product cards, checkout handoff. */

(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const B = window.BRONAM;
  const CFG = window.BRONAM_CONFIG;
  const KEY = "bronam.cart.v1";

  /* ---------- icons ---------- */
  const ICON = {
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19"/></svg>',
    star: '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="m10 1.5 2.6 5.5 6 .7-4.5 4.1 1.2 5.9L10 14.8l-5.3 2.9 1.2-5.9L1.4 7.7l6-.7L10 1.5Z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>'
  };
  window.BRONAM_ICON = ICON;

  function stars(r) {
    const full = Math.round(r);
    let s = "";
    for (let i = 0; i < 5; i++) s += `<span style="opacity:${i < full ? 1 : 0.25}">${ICON.star}</span>`;
    return `<span class="stars" aria-hidden="true">${s}</span>`;
  }
  window.BRONAM_STARS = stars;

  /* ---------- cart store ---------- */
  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return memory; }
  }
  let memory = [];
  function write(items) {
    memory = items;
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* private mode: keep in memory */ }
    document.dispatchEvent(new CustomEvent("cart:change"));
  }
  const lineKey = (id, shade) => id + (shade ? ":" + shade : "");

  const Cart = {
    items: () => read(),
    count: () => read().reduce((n, l) => n + l.qty, 0),
    subtotal: () => read().reduce((n, l) => n + (B.product(l.id)?.price || 0) * l.qty, 0),
    add(id, qty = 1, shade = null) {
      const items = read();
      const k = lineKey(id, shade);
      const hit = items.find((l) => lineKey(l.id, l.shade) === k);
      if (hit) hit.qty = Math.min(hit.qty + qty, 10);
      else items.push({ id, shade, qty });
      write(items);
    },
    set(k, qty) {
      let items = read();
      if (qty <= 0) items = items.filter((l) => lineKey(l.id, l.shade) !== k);
      else items.forEach((l) => { if (lineKey(l.id, l.shade) === k) l.qty = Math.min(qty, 10); });
      write(items);
    },
    clear: () => write([])
  };
  window.BRONAM_CART = Cart;

  function shipping(sub) {
    if (sub === 0) return 0;
    return sub >= CFG.freeShippingThreshold ? 0 : CFG.shippingFlat;
  }

  /* ---------- chrome injected once per page ---------- */
  function injectChrome() {
    const nav = $(".site-header .nav");
    const navLinks = nav ? nav.innerHTML : "";
    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <div class="mobile-menu" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
        <div class="mobile-menu__top">
          <a class="logo" href="index.html" aria-label="Bronam home"><span class="logo__box">BRO</span><span class="logo__rest">NAM</span></a>
          <button class="icon-btn" data-close-menu aria-label="Close menu">${ICON.close}</button>
        </div>
        <nav aria-label="Mobile">${navLinks}</nav>
        <div class="mobile-menu__foot">
          <a class="btn btn--invert btn--block" href="shade-finder.html">Find your shade</a>
          <a class="btn btn--ghost btn--block" style="--fg:#fff;--bd:rgba(255,255,255,.5)" href="support.html">Help &amp; support</a>
        </div>
      </div>
      <div class="scrim" data-close-drawer></div>
      <aside class="drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div class="drawer__head">
          <h2 id="drawer-title">Your bag</h2>
          <button class="icon-btn" data-close-drawer aria-label="Close bag">${ICON.close}</button>
        </div>
        <div class="drawer__body" id="drawer-body"></div>
        <div class="drawer__foot" id="drawer-foot"></div>
      </aside>
      <div class="toast" id="toast" role="status" aria-live="polite"></div>
      <dialog class="modal" id="checkout-modal" aria-labelledby="co-title">
        <div class="modal__inner">
          <h2 id="co-title">Checkout isn't connected yet</h2>
          <p>This site hands your bag to Shopify's secure checkout. To switch it on, add your store domain and variant IDs in <code>assets/js/catalog.js</code>.</p>
          <p class="small muted" id="co-detail"></p>
          <form method="dialog"><button class="btn btn--block">Got it</button></form>
        </div>
      </dialog>`
    );
  }

  /* ---------- menu ---------- */
  let lastFocus = null;
  function openLayer(el, focusSel) {
    lastFocus = document.activeElement;
    el.classList.add("is-open");
    document.body.style.overflow = "hidden";
    setTimeout(() => (el.querySelector(focusSel) || el).focus(), 50);
  }
  function closeLayer(el) {
    el.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  function trapFocus(el, e) {
    if (e.key !== "Tab" || !el.classList.contains("is-open")) return;
    const f = $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', el).filter((n) => n.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }

  /* ---------- drawer rendering ---------- */
  function lineHTML(l) {
    const p = B.product(l.id);
    if (!p) return "";
    const sh = l.shade ? B.shade(l.shade) : null;
    const k = lineKey(l.id, l.shade);
    return `
      <div class="line">
        <a class="line__media" href="product.html?id=${p.id}" tabindex="-1" aria-hidden="true">${window.BRONAM_RENDER(p.render)}</a>
        <div class="line__info">
          <div class="line__top"><a href="product.html?id=${p.id}" style="text-decoration:none">${p.name}</a><span class="num">${B.money(p.price * l.qty)}</span></div>
          <div class="line__meta">${p.kind}</div>
          ${sh ? `<div class="line__meta"><i style="--c:${sh.hex}"></i>Shade ${sh.code} ${sh.name}</div>` : ""}
          <div class="line__actions">
            <div class="qty" role="group" aria-label="Quantity for ${p.name}">
              <button type="button" data-qty="${k}" data-delta="-1" aria-label="Decrease">−</button>
              <input type="number" min="0" max="10" value="${l.qty}" data-qty-input="${k}" aria-label="Quantity">
              <button type="button" data-qty="${k}" data-delta="1" aria-label="Increase">+</button>
            </div>
            <button type="button" class="remove" data-remove="${k}">Remove</button>
          </div>
        </div>
      </div>`;
  }
  window.BRONAM_LINE_HTML = lineHTML;

  function shipMeter(sub) {
    const left = CFG.freeShippingThreshold - sub;
    const pct = Math.min(sub / CFG.freeShippingThreshold, 1);
    return `
      <div class="ship-meter">
        <span>${left > 0 ? `Add <strong>${B.money(left)}</strong> more for free delivery` : "Free delivery unlocked"}</span>
        <div class="ship-meter__bar"><span style="transform:scaleX(${pct})"></span></div>
      </div>`;
  }
  window.BRONAM_SHIP_METER = shipMeter;

  function renderDrawer() {
    const body = $("#drawer-body"), foot = $("#drawer-foot");
    if (!body) return;
    const items = Cart.items();
    if (!items.length) {
      body.innerHTML = `
        <div class="empty">
          <p>Your bag is empty.</p>
          <a class="btn" href="shop.html">Shop the range</a>
        </div>`;
      foot.innerHTML = "";
      return;
    }
    const sub = Cart.subtotal();
    body.innerHTML = shipMeter(sub) + items.map(lineHTML).join("");
    foot.innerHTML = `
      <div class="totals"><div class="grand"><span>Subtotal</span><span class="num">${B.money(sub)}</span></div></div>
      <p class="xs muted">Inclusive of all taxes. Delivery and COD calculated at checkout.</p>
      <button class="btn btn--block" data-checkout>Checkout securely</button>
      <a class="link small center" href="cart.html">View bag</a>`;
  }

  function renderCount() {
    const n = Cart.count();
    $$(".cart-count").forEach((el) => { el.textContent = n || ""; el.dataset.count = n; });
    $$("[data-open-cart]").forEach((el) => el.setAttribute("aria-label", `Bag, ${n} item${n === 1 ? "" : "s"}`));
  }

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(html) {
    const t = $("#toast");
    t.innerHTML = html;
    t.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-shown"), 4000);
  }
  window.BRONAM_TOAST = toast;

  /* ---------- checkout handoff (Shopify cart permalink) ---------- */
  function checkout() {
    const items = Cart.items();
    if (!items.length) return;
    const missing = [];
    const parts = items.map((l) => {
      const p = B.product(l.id);
      const v = l.shade && p.variants ? p.variants[l.shade] : p.variantId;
      if (!v) missing.push(p.name + (l.shade ? " (" + B.shade(l.shade).code + ")" : ""));
      return `${v}:${l.qty}`;
    });
    if (!CFG.shopifyDomain || missing.length) {
      $("#co-detail").textContent = !CFG.shopifyDomain
        ? "Missing: shopifyDomain."
        : "Missing variant IDs for: " + missing.join(", ") + ".";
      $("#checkout-modal").showModal();
      return;
    }
    window.location.href = `https://${CFG.shopifyDomain}/cart/${parts.join(",")}`;
  }

  /* ---------- product card (used on home, shop, cart upsell) ---------- */
  window.BRONAM_CARD = function (p, opts = {}) {
    const needsShade = p.shaded;
    return `
      <article class="card" data-type="${p.type}">
        <a class="card__media" href="product.html?id=${p.id}" tabindex="-1" aria-hidden="true">
          ${p.step ? `<span class="card__step">Step ${p.step}</span>` : ""}
          ${window.BRONAM_RENDER(p.render, { title: p.name + " " + p.kind })}
        </a>
        <div class="card__body">
          <div class="card__title">
            <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
            <span class="card__price num">${p.compareAt ? `<s>${B.money(p.compareAt)}</s>` : ""}${B.money(p.price)}</span>
          </div>
          <span class="card__kind">${p.kind}</span>
          ${opts.tagline !== false ? `<p class="card__tagline">${p.tagline}</p>` : ""}
          <div class="card__foot">
            ${needsShade
              ? `<a class="btn" href="product.html?id=${p.id}">Choose shade</a>`
              : `<button class="btn" data-add="${p.id}">Add to bag</button>`}
            <span class="rating">${stars(p.rating)}<span>${p.rating} (${p.reviews})</span></span>
          </div>
        </div>
      </article>`;
  };

  /* ---------- global events ---------- */
  function bind() {
    const menu = $("#mobile-menu"), drawer = $("#cart-drawer"), scrim = $(".scrim");

    document.addEventListener("click", (e) => {
      const t = e.target.closest("[data-open-menu],[data-close-menu],[data-open-cart],[data-close-drawer],[data-add],[data-qty],[data-remove],[data-checkout]");
      if (!t) return;
      if (t.matches("[data-open-menu]")) { openLayer(menu, "[data-close-menu]"); t.setAttribute("aria-expanded", "true"); }
      else if (t.matches("[data-close-menu]")) { closeLayer(menu); $("[data-open-menu]")?.setAttribute("aria-expanded", "false"); }
      else if (t.matches("[data-open-cart]")) { e.preventDefault(); if (menu.classList.contains("is-open")) closeLayer(menu); openDrawer(); }
      else if (t.matches("[data-close-drawer]")) closeDrawer();
      else if (t.matches("[data-add]")) {
        const shade = t.dataset.shade || null;
        const qty = parseInt(t.dataset.qtyValue || "1", 10);
        Cart.add(t.dataset.add, qty, shade);
        const p = B.product(t.dataset.add);
        toast(`<span>${p.name} added to your bag</span><button class="link" data-open-cart>View bag</button>`);
      }
      else if (t.matches("[data-qty]")) {
        const k = t.dataset.qty;
        const l = Cart.items().find((x) => lineKey(x.id, x.shade) === k);
        if (l) Cart.set(k, l.qty + parseInt(t.dataset.delta, 10));
      }
      else if (t.matches("[data-remove]")) Cart.set(t.dataset.remove, 0);
      else if (t.matches("[data-checkout]")) checkout();
    });

    document.addEventListener("change", (e) => {
      const i = e.target.closest("[data-qty-input]");
      if (i) Cart.set(i.dataset.qtyInput, Math.max(0, parseInt(i.value || "0", 10)));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (drawer.classList.contains("is-open")) closeDrawer();
        if (menu.classList.contains("is-open")) closeLayer(menu);
      }
      trapFocus(drawer, e);
      trapFocus(menu, e);
    });

    function openDrawer() { renderDrawer(); scrim.classList.add("is-open"); openLayer(drawer, "[data-close-drawer]"); }
    function closeDrawer() { scrim.classList.remove("is-open"); closeLayer(drawer); }
    window.BRONAM_OPEN_CART = openDrawer;

    document.addEventListener("cart:change", () => { renderCount(); renderDrawer(); });

    // Newsletter / simple forms with client-side confirmation
    $$("form[data-newsletter]").forEach((f) => {
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = f.querySelector("input[type=email]");
        if (!input.checkValidity()) { input.reportValidity(); return; }
        f.outerHTML = `<p role="status">You're on the list. First drop, first to know.</p>`;
      });
    });
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    injectChrome();
    bind();
    renderCount();
    window.BRONAM_HYDRATE_RENDERS();
    const y = $("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
  });
})();
