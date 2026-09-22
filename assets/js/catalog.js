/* Bronam catalogue + store config.
   Edit prices, copy and Shopify variant IDs here — every page reads from this file. */

window.BRONAM_CONFIG = {
  // Your Shopify domain, e.g. "bronam.myshopify.com". Leave empty until the store is live:
  // checkout then shows a notice instead of redirecting.
  shopifyDomain: "",
  currency: "INR",
  freeShippingThreshold: 999,
  shippingFlat: 79,
  supportEmail: "care@bronam.in",
  whatsapp: "919999999999" // country code + number, no "+"
};

// Shades for BASE. `hex` is used for swatches only.
window.BRONAM_SHADES = [
  { id: "n10", name: "Wheat",     code: "N10", depth: "light",  undertone: "neutral", hex: "#E3BF9C" },
  { id: "w15", name: "Sandstone", code: "W15", depth: "light",  undertone: "warm",    hex: "#D9AE84" },
  { id: "o20", name: "Chai",      code: "O20", depth: "medium", undertone: "olive",   hex: "#C49A6C" },
  { id: "w25", name: "Teak",      code: "W25", depth: "medium", undertone: "warm",    hex: "#B6865A" },
  { id: "n30", name: "Cinnamon",  code: "N30", depth: "tan",    undertone: "neutral", hex: "#9E6E47" },
  { id: "o35", name: "Clove",     code: "O35", depth: "tan",    undertone: "olive",   hex: "#8C6440" },
  { id: "w40", name: "Mahogany",  code: "W40", depth: "deep",   undertone: "warm",    hex: "#6F4A2F" },
  { id: "n45", name: "Ebony",     code: "N45", depth: "deep",   undertone: "neutral", hex: "#553824" }
];

// `variantId` = Shopify variant ID (number). For shaded products, set one per shade in `variants`.
window.BRONAM_PRODUCTS = [
  {
    id: "prime",
    type: "single",
    name: "Prime",
    kind: "Face Primer",
    step: 1,
    price: 899,
    size: "30 ml",
    render: "tube",
    tagline: "Blurs pores and controls shine so everything after it sits flat.",
    description:
      "A lightweight, oil-controlling gel that smooths texture, grips your base and keeps the T-zone matte through a humid day. Clear on every skin tone.",
    benefits: ["Blurs visible pores", "Matte for up to 10 hours*", "Non-comedogenic"],
    howTo: "Squeeze a pea-sized amount. Press over nose, forehead and chin first, then the rest of the face. Wait 30 seconds.",
    keyIngredients: ["Niacinamide 2%", "Kaolin clay", "Hyaluronic acid"],
    inci:
      "Aqua, Dimethicone, Cyclopentasiloxane, Niacinamide, Kaolin, Glycerin, Sodium Hyaluronate, Silica, Phenoxyethanol, Ethylhexylglycerin.",
    variantId: null,
    rating: 4.7,
    reviews: 312
  },
  {
    id: "base",
    type: "single",
    name: "Base",
    kind: "Skin-Tint Foundation",
    step: 2,
    price: 1199,
    size: "30 ml",
    render: "pump",
    shaded: true,
    tagline: "Evens tone and hides dark circles without looking like makeup.",
    description:
      "Sheer-to-medium coverage that corrects redness, uneven patches and under-eye shadow. Built for Indian skin tones in eight shades across three undertones. Blends with fingers in under a minute.",
    benefits: ["Undetectable finish", "Buildable coverage", "Sweat and transfer resistant"],
    howTo: "One pump. Dot on cheeks, forehead and chin. Blend outward with fingertips, tapping at the jawline so there's no edge.",
    keyIngredients: ["Niacinamide", "Squalane", "Vitamin E"],
    inci:
      "Aqua, Cyclopentasiloxane, Titanium Dioxide, Glycerin, Squalane, Niacinamide, Iron Oxides (CI 77491, CI 77492, CI 77499), Tocopherol, Phenoxyethanol.",
    variants: {}, // e.g. { n10: 44012345678, w15: 44012345679 }
    rating: 4.6,
    reviews: 488
  },
  {
    id: "lock",
    type: "single",
    name: "Lock",
    kind: "Setting Spray",
    step: 3,
    price: 749,
    size: "100 ml",
    render: "spray",
    tagline: "Seals the look against heat, sweat and a long commute.",
    description:
      "A weightless mist that sets primer and base in place, removes any powdery look and keeps skin looking like skin until evening.",
    benefits: ["All-day hold", "Invisible, non-sticky", "Cooling on application"],
    howTo: "Close your eyes. Hold 20 cm away and mist in an X, then a T. Let it dry for 30 seconds. Don't touch.",
    keyIngredients: ["Aloe vera", "Green tea extract", "Glycerin"],
    inci:
      "Aqua, Alcohol Denat., Glycerin, Aloe Barbadensis Leaf Juice, Camellia Sinensis Leaf Extract, PVP, Panthenol, Phenoxyethanol.",
    variantId: null,
    rating: 4.8,
    reviews: 241
  },
  {
    id: "kit",
    type: "bundle",
    name: "The 3-Minute Kit",
    kind: "Prime + Base + Lock",
    price: 2399,
    compareAt: 2847,
    render: "kit",
    includes: ["prime", "base", "lock"],
    shaded: true,
    tagline: "The full routine. Three steps, three minutes.",
    description:
      "Everything you need to look rested, even-toned and shine-free, in the order you use it. Pick your Base shade at checkout.",
    variantId: null,
    variants: {},
    rating: 4.8,
    reviews: 206
  },
  {
    id: "duo-base",
    type: "bundle",
    name: "Base Duo",
    kind: "Prime + Base",
    price: 1899,
    compareAt: 2098,
    render: "duo-base",
    includes: ["prime", "base"],
    shaded: true,
    tagline: "Smooth, then even out. For office days and photos.",
    description: "The two steps that do the most visible work. Add Lock any time.",
    variantId: null,
    variants: {},
    rating: 4.6,
    reviews: 97
  },
  {
    id: "duo-fix",
    type: "bundle",
    name: "Shine Control Duo",
    kind: "Prime + Lock",
    price: 1449,
    compareAt: 1648,
    render: "duo-fix",
    includes: ["prime", "lock"],
    tagline: "No coverage, just no shine. Ideal for oily skin and hot days.",
    description: "For men who don't need coverage but want to stay matte and fresh from morning to night.",
    variantId: null,
    rating: 4.7,
    reviews: 74
  }
];

window.BRONAM = {
  product(id) {
    return window.BRONAM_PRODUCTS.find((p) => p.id === id);
  },
  shade(id) {
    return window.BRONAM_SHADES.find((s) => s.id === id);
  },
  money(n) {
    return "₹" + Number(n).toLocaleString("en-IN");
  }
};
