# Bronam website

A static website for Bronam: men's primer, skin tint and setting spray. It uses plain HTML, CSS and JS, with no build step.

## Pages

| File | What it is |
|------|------------|
| `index.html` | Home: hero, product range, How it works (scroll timer), shade finder teaser, skin science, before/after, reviews, story teaser |
| `shop.html` | All products and bundles, with filters (`?filter=bundle`) |
| `product.html?id=…` | Product detail page (`prime`, `base`, `lock`, `kit`, `duo-base`, `duo-fix`) |
| `shade-finder.html` | 3-question shade quiz that adds the matched shade to the bag |
| `about.html` | Our story |
| `support.html` | Contact form, WhatsApp and email, FAQ, shipping and returns, policies |
| `cart.html` | Full bag page. A slide-out bag drawer is also on every page |

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Edit products, prices and settings

Everything lives in **`assets/js/catalog.js`**: products, bundles, prices, shades, the free delivery threshold, the support email and the WhatsApp number.

## Connect Shopify checkout

The bag hands off to Shopify's hosted checkout through a cart permalink (`https://STORE/cart/VARIANT:QTY,…`). To switch it on:

1. Set `shopifyDomain` in `catalog.js` (e.g. `"bronam.myshopify.com"`).
2. For each product, set `variantId`. For shaded products (Base and the bundles that include it), fill `variants` with one Shopify variant ID per shade, e.g. `{ n10: 4401…, w15: 4401… }`.

Until both are set, "Checkout" opens a notice that says what's missing.

## Replace before launch

- **Photography:** `assets/img/*.jpg` are crops of the mood board and are low resolution. Swap in high-res shots at the same file names.
- **Product images:** product cards use vector packaging renders (`assets/js/renders.js`). Replace them with product photos when you have them.
- **Before/after, review scores and study figures** on the home and product pages are placeholders, marked with `PLACEHOLDER` comments. Use genuine, unretouched photos and verified reviews and data only.
- **Ingredient and "free from" claims:** confirm each one with your formulator.
- **Contact form:** it currently simulates sending. Point it at Shopify's contact form, Formspree or your helpdesk (see `support()` in `assets/js/pages.js`).
- **About page story:** placeholder copy. Replace it with the founders' real story.

## Design system

- **Colour:** black `#000`, white `#fff`, charcoal `#1d1d1d`. Bone `#F1EBE0`, gold `#B58C3C` and clay `#8B6F5C` appear only inside imagery (product backdrops, packaging text).
- **Type:** Archivo, self-hosted variable font. The width axis goes to 125% for headlines. Montserrat 600 is used for the BRO|NAM logo only.
- **Signature element:** the inverted "BRO" box from the logo. It's reused for buttons, the step timer and the footer wordmark.
