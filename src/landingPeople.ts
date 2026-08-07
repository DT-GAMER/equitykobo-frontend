/**
 * People content for the landing page — images, names and quotes in one place.
 *
 * ---------------------------------------------------------------------------
 * IMAGES
 * ---------------------------------------------------------------------------
 * Personas use real photographs hosted on Cloudinary, referenced by `path` and
 * served through `cdn()` / `cdnSrcSet()` below. To swap one, upload the new
 * file and replace the path — the transforms and srcset follow automatically.
 * Source images are 16:9; the persona card box matches that ratio, so nothing
 * is cropped.
 *
 * Testimonial entries still point at placeholder SVGs in `public/images/`.
 * Drop a real photograph into that folder and change the extension here —
 * nothing else needs to move.
 *
 * What works for this audience:
 *   - Real Nigerian investors in real settings — home, office, market, transit.
 *   - Natural light, candid framing, ordinary clothes.
 *   - 1200px+ on the long edge, then compressed. Export as .webp where you can.
 *
 * What actively hurts:
 *   - Generic corporate stock: headsets, boardrooms, suits, handshakes.
 *   - Anything visibly non-local. The audience will read it as decoration and
 *     trust the page less than they would with no photo at all.
 *
 * ---------------------------------------------------------------------------
 * TESTIMONIALS ARE DELIBERATELY UNFILLED
 * ---------------------------------------------------------------------------
 * `testimonials` below is empty, and the section does not render while it is
 * empty. That is intentional: invented social proof is exactly the thing this
 * audience has been burned by, and it is the one element that becomes a real
 * problem if anyone checks it. Add entries only for real users who have agreed
 * to be named. The shape is documented on the `Testimonial` type.
 */

const CLOUDINARY = "https://res.cloudinary.com/dofiyn7bw/image/upload";

/**
 * Build a Cloudinary URL with delivery transforms.
 *
 * `f_auto` negotiates WebP/AVIF per browser and `q_auto` picks a quality that
 * holds up visually — together they take these photos from ~66KB to ~20KB.
 * `w_` resizes on their CDN so we never ship 1280px to a phone.
 */
export function cdn(path: string, width: number) {
  return `${CLOUDINARY}/f_auto,q_auto,w_${width}/${path}`;
}

/** Candidate widths for the browser to choose from, paired with `sizes`. */
export function cdnSrcSet(path: string, widths = [480, 800, 1200]) {
  return widths.map((width) => `${cdn(path, width)} ${width}w`).join(", ");
}

export type Persona = {
  id: string;
  /** Cloudinary public path, including the version segment. */
  path: string;
  alt: string;
  label: string;
  situation: string;
  need: string;
};

export type Testimonial = {
  id: string;
  image: string;
  quote: string;
  name: string;
  location: string;
  context: string;
};

export const founder = {
  /** Cloudinary public path. Source is 896x1195, a 3:4 portrait. */
  path: "v1786104354/WhatsApp_Image_2026-08-07_at_13.05.10_plgqjv.jpg",
  width: 896,
  height: 1195,
  alt: "Abakpa Dominic, founder of EquityKobo, at his desk",
  name: "Abakpa Dominic",
  role: "Founder, EquityKobo",
  // The founder's own words, in the first person. This is the one place on the
  // page that should sound like a person rather than a product.
  body: [
    "I wanted to invest in Nigerian companies, but I kept running into the same problem: there was plenty of information, but very little clarity. I could find prices, reports, news and opinions, yet still struggle to answer a simple question: is this company actually worth my money, and why?",
    "EquityKobo is what I wanted for myself: the evidence in plain English, the risks beside the reasons, and a clear picture of what makes a company worth owning.",
    "It won't tell you what to buy. It will help you understand why you would buy it.",
  ],
};

export const personas: Persona[] = [
  {
    id: "first-timer",
    path: "v1786098757/WhatsApp_Image_2026-08-07_at_10.48.36_txrc0j.jpg",
    alt: "A first-time investor reading an EquityKobo decision card for Zenith Bank, writing 'why it's worth holding — fundamentals, not tips' in a notebook",
    label: "The first-timer",
    situation: "Bought on a tip, lost money, stopped trusting the market.",
    need: "Wants to understand what makes a company worth holding before risking anything again.",
  },
  {
    id: "saver",
    path: "v1786098757/usertype1_dg7tef.jpg",
    alt: "An investor comparing a BUY signal for MTN Nigeria against a WAIT signal for Transcorp, beside a savings jar labelled investment fund",
    label: "The monthly saver",
    situation: "Puts something aside every payday and buys when there is enough.",
    need: "Wants to know which names deserve the next contribution, and which to wait on.",
  },
  {
    id: "holder",
    path: "v1786098811/usertype3_blk2mo.jpg",
    alt: "A long-term holder reviewing his written thesis for Flourmill while EquityKobo flags that the reasons for holding have changed",
    label: "The long-term holder",
    situation: "Owns a handful of stocks and cannot remember why some of them are there.",
    need: "Wants a thesis on record, and a signal when the reason for holding stops being true.",
  },
];

/**
 * Real, consented users only. See the note at the top of this file.
 *
 * Example shape:
 *   {
 *     id: "unique-key",
 *     image: "/images/testimonial-1.jpg",
 *     quote: "What they actually said, in their words.",
 *     name: "Their real name",
 *     location: "Lagos",
 *     context: "Investing since 2023",
 *   }
 */
export const testimonials: Testimonial[] = [];
