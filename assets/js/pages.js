/* Page-specific behaviour, keyed by <body data-page="…">. */

(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const B = window.BRONAM;
  const P = window.BRONAM_PRODUCTS;
  const S = window.BRONAM_SHADES;
  let params = new URLSearchParams(location.search);
  const SHADE_KEY = "bronam.shade";

  function savedShade() {
    try { return localStorage.getItem(SHADE_KEY); } catch (e) { return null; }
  }
  function saveShade(id) {
    try { localStorage.setItem(SHADE_KEY, id); } catch (e) { /* ignore */ }
  }

  function starsInto(root = document) {
    $$("[data-stars]", root).forEach((el) => (el.innerHTML = window.BRONAM_STARS(+el.dataset.stars)));
  }

  /* ---------------- HOME ---------------- */
  function home() {
    $("#home-products").innerHTML = P.filter((p) => p.type === "single").map((p) => window.BRONAM_CARD(p)).join("");
    $("#swatch-strip").innerHTML = S.map((s) => `<div style="--c:${s.hex}" title="${s.code} ${s.name}"><span>${s.code}</span></div>`).join("");
    $("#summary-stars").innerHTML = window.BRONAM_STARS(4.7);
    starsInto();
    routine();
    compare();
  }

  function routine() {
    const steps = $$(".step");
    if (!steps.length) return;
    const min = $("[data-timer-min]");
    const bars = $$(".timer-bar span");
    const render = $("[data-routine-render]");
    let current = 0;
    function activate(n) {
      if (n === current) return;
      current = n;
      min.textContent = n;
      bars.forEach((b, i) => b.classList.toggle("is-done", i < n));
      steps.forEach((s) => s.classList.toggle("is-active", +s.dataset.step === n));
      const kind = steps[n - 1].dataset.renderKind;
      if (render) render.innerHTML = window.BRONAM_RENDER(kind, { title: steps[n - 1].querySelector("h3").textContent });
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && activate(+e.target.dataset.step)),
      { rootMargin: "-45% 0px -45% 0px" }
    );
    steps.forEach((s) => io.observe(s));
    if (render) render.innerHTML = window.BRONAM_RENDER("tube", { title: "Prime" });
  }

  function compare() {
    $$("[data-compare]").forEach((c) => {
      const r = c.querySelector("input[type=range]");
      const set = () => c.style.setProperty("--pos", r.value + "%");
      r.addEventListener("input", set);
      set();
    });
  }

  /* ---------------- SHOP ---------------- */
  function shop() {
    const grid = $("#shop-grid");
    const btns = $$("[data-filter]");
    function apply(f) {
      const list = P.filter((p) => f === "all" || p.type === f);
      grid.innerHTML = list.map((p) => window.BRONAM_CARD(p)).join("");
      btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === f)));
      $("#shop-count").textContent = `${list.length} product${list.length === 1 ? "" : "s"}`;
    }
    btns.forEach((b) =>
      b.addEventListener("click", () => {
        apply(b.dataset.filter);
        const u = new URL(location.href);
        b.dataset.filter === "all" ? u.searchParams.delete("filter") : u.searchParams.set("filter", b.dataset.filter);
        try { history.replaceState(null, "", u); } catch (e) { /* sandboxed viewers */ }
      })
    );
    const f = params.get("filter");
    apply(f === "bundle" || f === "single" ? f : "all");
  }

  /* ---------------- PRODUCT ---------------- */
  function product() {
    const p = B.product(params.get("id")) || B.product("kit");
    document.title = `${p.name}, ${p.kind} | Bronam`;
    const root = $("#pdp");
    const incl = p.includes ? p.includes.map((id) => B.product(id)) : null;
    let shade = p.shaded ? params.get("shade") || savedShade() : null;
    if (shade && !B.shade(shade)) shade = null;
    let qty = 1;

    const photos = [
      ["assets/img/model-apply.jpg", "Man applying Bronam to his cheek"],
      ["assets/img/texture-cream.jpg", "Close-up of the product texture"]
    ];

    root.innerHTML = `
      <div class="pdp__gallery">
        <div class="pdp__main">${window.BRONAM_RENDER(p.render, { title: p.name + " " + p.kind })}</div>
        ${photos.map(([src, alt]) => `<div class="pdp__thumb"><img src="${src}" alt="${alt}" loading="lazy"></div>`).join("")}
      </div>
      <div class="pdp__info">
        <div class="stack-2">
          <h1 class="display h2">${p.name}</h1>
          <p class="muted">${p.kind}${p.size ? `, ${p.size}` : ""}</p>
          <a class="rating" href="#pdp-reviews" style="text-decoration:none">${window.BRONAM_STARS(p.rating)}<span>${p.rating} from ${p.reviews} reviews</span></a>
        </div>
        <div>
          <p class="pdp__price num">${B.money(p.price)}${p.compareAt ? `<s>${B.money(p.compareAt)}</s>` : ""}</p>
          <p class="xs muted">MRP inclusive of all taxes</p>
        </div>
        <p>${p.description}</p>
        ${p.benefits ? `<ul class="pdp__benefits">${p.benefits.map((b) => `<li>${window.BRONAM_ICON.check}${b}</li>`).join("")}</ul>` : ""}
        ${incl ? `<ul class="pdp__benefits">${incl.map((i) => `<li>${window.BRONAM_ICON.check}<span><strong>${i.name}</strong> ${i.kind}, ${i.size}</span></li>`).join("")}</ul>` : ""}
        ${p.shaded ? `
          <div class="shade-picker">
            <div class="field-label"><span id="shade-label">Shade: <span data-shade-name>${shade ? B.shade(shade).code + " " + B.shade(shade).name : "choose one"}</span></span><a class="link xs" href="shade-finder.html">Not sure? Find your shade</a></div>
            <div class="swatches" role="radiogroup" aria-labelledby="shade-label">
              ${S.map((s) => `<button type="button" class="swatch" role="radio" aria-checked="${s.id === shade}" style="--c:${s.hex}" data-shade="${s.id}" aria-label="${s.code} ${s.name}, ${s.undertone} undertone" tabindex="${(shade ? s.id === shade : s === S[0]) ? 0 : -1}"></button>`).join("")}
            </div>
            <p class="xs muted" data-shade-hint>${shade ? hintFor(B.shade(shade)) : "Pick the shade that matches your jawline, not your hand."}</p>
          </div>` : ""}
        <div class="buy-row">
          <div class="qty" role="group" aria-label="Quantity">
            <button type="button" data-pdp-qty="-1" aria-label="Decrease quantity">−</button>
            <input type="number" min="1" max="10" value="1" aria-label="Quantity" data-pdp-qty-input>
            <button type="button" data-pdp-qty="1" aria-label="Increase quantity">+</button>
          </div>
          <button class="btn" data-pdp-add>Add to bag, ${B.money(p.price)}</button>
        </div>
        <p class="field__error" role="alert" data-shade-error style="margin-top:-12px">Choose a shade first.</p>
        <div class="pdp__assure">
          <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>Free delivery over ₹999. Ships in 24 hours. COD available.</div>
          <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4"/></svg>Wrong shade? Free exchange within 30 days, even if opened.</div>
        </div>
        <div class="accordion">
          ${p.howTo ? `<details open><summary>How to use</summary><div class="acc-body"><p>${p.howTo}</p></div></details>` : ""}
          ${incl ? `<details open><summary>How to use the routine</summary><div class="acc-body">${incl.map((i) => `<p><strong style="color:#000">${i.step}. ${i.name}.</strong> ${i.howTo}</p>`).join("")}</div></details>` : ""}
          ${p.keyIngredients ? `<details><summary>Key ingredients</summary><div class="acc-body"><p>${p.keyIngredients.join(", ")}.</p></div></details>` : ""}
          ${p.inci ? `<details><summary>Full ingredient list</summary><div class="acc-body"><p class="small">${p.inci}</p></div></details>` : ""}
          <details><summary>Delivery and returns</summary><div class="acc-body"><p>Dispatched within 24 hours from our warehouse. Metro cities in 2 to 3 days, elsewhere 4 to 6. Unopened products can be returned within 30 days. Shade exchanges are free, even if opened.</p></div></details>
        </div>
      </div>`;

    // shade picker (roving tabindex radiogroup)
    const sw = $$(".swatch[data-shade]", root);
    function pick(id, focus) {
      shade = id;
      sw.forEach((b) => { const on = b.dataset.shade === id; b.setAttribute("aria-checked", on); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
      const s = B.shade(id);
      $("[data-shade-name]", root).textContent = `${s.code} ${s.name}`;
      $("[data-shade-hint]", root).textContent = hintFor(s);
      $("[data-shade-error]", root).style.display = "none";
    }
    sw.forEach((b, i) => {
      b.addEventListener("click", () => pick(b.dataset.shade));
      b.addEventListener("keydown", (e) => {
        const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!d) return;
        e.preventDefault();
        pick(sw[(i + d + sw.length) % sw.length].dataset.shade, true);
      });
    });

    const qIn = $("[data-pdp-qty-input]", root);
    const addBtn = $("[data-pdp-add]", root);
    function setQty(n) {
      qty = Math.max(1, Math.min(10, n || 1));
      qIn.value = qty;
      addBtn.textContent = `Add to bag, ${B.money(p.price * qty)}`;
    }
    $$("[data-pdp-qty]", root).forEach((b) => b.addEventListener("click", () => setQty(qty + +b.dataset.pdpQty)));
    qIn.addEventListener("change", () => setQty(parseInt(qIn.value, 10)));
    addBtn.addEventListener("click", () => {
      if (p.shaded && !shade) {
        const err = $("[data-shade-error]", root);
        err.style.display = "block";
        sw[0].focus();
        return;
      }
      window.BRONAM_CART.add(p.id, qty, shade);
      if (shade) saveShade(shade);
      window.BRONAM_TOAST(`<span>${p.name} added to your bag</span><button class="link" data-open-cart>View bag</button>`);
    });

    // reviews block + related
    $("#pdp-reviews-score").textContent = p.rating;
    $("#pdp-reviews-stars").innerHTML = window.BRONAM_STARS(p.rating);
    $("#pdp-reviews-count").textContent = `Based on ${p.reviews} reviews`;
    starsInto();
    const related = P.filter((x) => x.id !== p.id && (p.type === "bundle" ? x.type === "bundle" || x.id === "kit" : x.type === "single" || x.id === "kit")).slice(0, 3);
    $("#related").innerHTML = related.map((x) => window.BRONAM_CARD(x, { tagline: false })).join("");
  }

  function hintFor(s) {
    const u = { warm: "golden or peachy", neutral: "balanced", olive: "greenish-golden" }[s.undertone];
    return `${s.code} ${s.name}: ${s.depth} depth with a ${u} undertone.`;
  }

  /* ---------------- SHADE FINDER ---------------- */
  function finder() {
    const form = $("#finder");
    const steps = $$("fieldset", form);
    const prog = $$(".finder__progress span");
    const back = $("[data-finder-back]"), next = $("[data-finder-next]");
    const result = $("#finder-result");
    let i = 0;

    // depth choices with chips
    const depthChips = { light: "#DDB791", medium: "#BE9166", tan: "#976A44", deep: "#5E3F28" };
    $$("[data-depth-chip]").forEach((el) => el.style.setProperty("--c", depthChips[el.dataset.depthChip]));

    function show(n) {
      i = n;
      steps.forEach((f, k) => (f.hidden = k !== n));
      prog.forEach((p, k) => p.classList.toggle("is-done", k <= n));
      back.hidden = n === 0;
      next.textContent = n === steps.length - 1 ? "See my shade" : "Next";
      $("#finder-step").textContent = `Question ${n + 1} of ${steps.length}`;
      const first = steps[n].querySelector("input:checked") || steps[n].querySelector("input");
      if (first && n > 0) first.focus();
    }
    back.addEventListener("click", () => show(i - 1));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const chosen = steps[i].querySelector("input:checked");
      const err = steps[i].querySelector(".field__error");
      if (!chosen) { err.style.display = "block"; steps[i].querySelector("input").focus(); return; }
      err.style.display = "none";
      if (i < steps.length - 1) return show(i + 1);
      finish();
    });

    function finish() {
      const fd = new FormData(form);
      const depth = fd.get("depth"), tone = fd.get("undertone"), goal = fd.get("goal");
      const order = ["light", "medium", "tan", "deep"];
      const scored = S.map((s) => ({
        s,
        score: Math.abs(order.indexOf(s.depth) - order.indexOf(depth)) * 2 + (s.undertone === tone ? 0 : s.undertone === "neutral" || tone === "neutral" ? 0.6 : 1)
      })).sort((a, b) => a.score - b.score);
      const best = scored[0].s, alt = scored[1].s;
      saveShade(best.id);
      const goalCopy = {
        circles: "For dark circles, tap a second thin layer under the eyes only. Don't add more everywhere.",
        redness: "For redness or razor irritation, dab it on the red areas first, then blend the rest.",
        even: "For a light even-out, half a pump is enough. Blend it right up to the hairline."
      }[goal];
      form.hidden = true;
      $(".finder__progress").hidden = true;
      $("#finder-step").hidden = true;
      result.hidden = false;
      result.innerHTML = `
        <div class="finder-result">
          <div class="finder-result__swatch" style="--c:${best.hex}"><span class="logo" aria-hidden="true" style="font-size:12px"><span class="logo__box">BRO</span><span class="logo__rest" style="color:${["light", "medium"].includes(best.depth) ? "#000" : "#fff"}">NAM</span></span></div>
          <div class="stack-5">
            <p class="muted">Your match</p>
            <h2 class="display h2" tabindex="-1" id="result-title">${best.code} ${best.name}</h2>
            <p class="lede">${hintFor(best)} ${goalCopy}</p>
            <p class="small muted">Between shades? <button class="link" data-alt="${alt.id}">Try ${alt.code} ${alt.name}</button> instead. If it's not right, we'll exchange it free.</p>
            <div class="btn-row">
              <button class="btn" data-add="kit" data-shade="${best.id}">Add the Kit in ${best.code}, ₹2,399</button>
              <button class="btn btn--ghost" data-add="base" data-shade="${best.id}">Just Base, ₹1,199</button>
            </div>
            <button class="link small" data-restart style="justify-self:start">Start again</button>
          </div>
        </div>`;
      $("#result-title").focus();
      $("[data-alt]", result).addEventListener("click", (e) => {
        const a = B.shade(e.target.dataset.alt);
        saveShade(a.id);
        result.querySelector(".finder-result__swatch").style.setProperty("--c", a.hex);
        $("#result-title").textContent = `${a.code} ${a.name}`;
        $$("[data-add]", result).forEach((b) => (b.dataset.shade = a.id));
        result.querySelector("[data-add=kit]").textContent = `Add the Kit in ${a.code}, ₹2,399`;
      });
      $("[data-restart]", result).addEventListener("click", () => {
        form.reset(); form.hidden = false; result.hidden = true;
        $(".finder__progress").hidden = false; $("#finder-step").hidden = false; show(0);
      });
    }
    const strip = $("#finder-strip");
    if (strip) strip.innerHTML = S.map((s) => `<div style="--c:${s.hex}" title="${s.code} ${s.name}"><span>${s.code}</span></div>`).join("");
    show(0);
  }

  /* ---------------- CART PAGE ---------------- */
  function cartPage() {
    const lines = $("#cart-lines"), sum = $("#cart-summary"), up = $("#cart-upsell");
    const CFG = window.BRONAM_CONFIG;
    function render() {
      const items = window.BRONAM_CART.items();
      if (!items.length) {
        lines.innerHTML = `<div class="empty"><p>Your bag is empty.</p><a class="btn" href="shop.html">Shop the range</a></div>`;
        sum.hidden = true;
        up.innerHTML = "";
        return;
      }
      sum.hidden = false;
      lines.innerHTML = items.map(window.BRONAM_LINE_HTML).join("");
      const sub = window.BRONAM_CART.subtotal();
      const ship = sub >= CFG.freeShippingThreshold ? 0 : CFG.shippingFlat;
      $("#sum-meter").innerHTML = window.BRONAM_SHIP_METER(sub);
      $("#sum-sub").textContent = B.money(sub);
      $("#sum-ship").textContent = ship ? B.money(ship) : "Free";
      $("#sum-total").textContent = B.money(sub + ship);
      const inCart = new Set(items.map((l) => l.id));
      const ideas = P.filter((p) => p.type === "single" && !inCart.has(p.id) && !p.shaded).slice(0, 2);
      up.innerHTML = ideas.length && !inCart.has("kit")
        ? `<h2 class="h3" style="font-stretch:125%;font-weight:700">Complete the routine</h2>` +
          ideas.map((p) => `
            <div class="upsell__item">
              <div class="line__media">${window.BRONAM_RENDER(p.render)}</div>
              <div><strong>${p.name}</strong><div class="small muted">${p.kind}, ${B.money(p.price)}</div></div>
              <button class="btn btn--ghost" style="min-height:44px;padding:0 16px" data-add="${p.id}">Add</button>
            </div>`).join("")
        : "";
    }
    const onChange = () => {
      if (!document.contains(lines)) return document.removeEventListener("cart:change", onChange);
      render();
    };
    document.addEventListener("cart:change", onChange);
    render();
  }

  /* ---------------- SUPPORT ---------------- */
  function support() {
    const CFG = window.BRONAM_CONFIG;
    $$("[data-wa]").forEach((a) => (a.href = `https://wa.me/${CFG.whatsapp}`));
    $$("[data-email]").forEach((a) => (a.href = `mailto:${CFG.supportEmail}`));
    $$("[data-email-text]").forEach((el) => (el.textContent = CFG.supportEmail));
    const form = $("#contact-form");
    if (!form) return;
    const rules = {
      name: (v) => (v.trim().length >= 2 ? "" : "Enter your name."),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Enter an email like name@example.com."),
      topic: (v) => (v ? "" : "Choose what this is about."),
      message: (v) => (v.trim().length >= 10 ? "" : "Tell us a little more, at least 10 characters.")
    };
    function check(el) {
      const msg = rules[el.name] ? rules[el.name](el.value) : "";
      const f = el.closest(".field");
      f.classList.toggle("has-error", !!msg);
      f.querySelector(".field__error").textContent = msg;
      el.setAttribute("aria-invalid", msg ? "true" : "false");
      return !msg;
    }
    Object.keys(rules).forEach((n) => form.elements[n].addEventListener("blur", (e) => check(e.target)));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const bad = Object.keys(rules).map((n) => form.elements[n]).filter((el) => !check(el));
      if (bad.length) { bad[0].focus(); return; }
      const btn = form.querySelector("button[type=submit]");
      btn.classList.add("is-loading");
      btn.textContent = "Sending…";
      // Wire this to Shopify's contact form, Formspree or your helpdesk. Simulated here.
      setTimeout(() => {
        form.outerHTML = `<div class="form-success" role="status" tabindex="-1" id="sent"><strong>Message sent.</strong><p class="muted">We reply within one working day, usually much sooner. Check your inbox for a copy.</p></div>`;
        $("#sent").focus();
      }, 700);
    });
  }

  const inits = { home, shop, product, finder, cart: cartPage, support };

  // Also used by the single-file preview to re-run a page after swapping content.
  window.BRONAM_INIT_PAGE = function (page, search) {
    if (search !== undefined) params = new URLSearchParams(search);
    (inits[page] || (() => {}))();
  };

  document.addEventListener("DOMContentLoaded", () => window.BRONAM_INIT_PAGE(document.body.dataset.page));
})();
