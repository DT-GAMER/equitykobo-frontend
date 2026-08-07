/**
 * Brand assets and palette.
 *
 * ---------------------------------------------------------------------------
 * LOGOS
 * ---------------------------------------------------------------------------
 * Both source files are JPEGs on a white background with a wide margin, so they
 * are delivered through three Cloudinary transforms:
 *
 *   e_trim                   strips the white margin, so the mark fills its box
 *                            and CSS sizing is predictable
 *   e_make_transparent:20    knocks the white out, so one asset works on the
 *                            light header and the dark footer alike
 *   f_auto,q_auto            serves WebP with an alpha channel (~5KB at 260px)
 *
 * The tolerance of 20 is deliberate and was measured: at 12 the icon keeps a
 * white fringe between the bars, and at 40 the transform eats into the orange
 * bar itself. If the logo is ever re-uploaded, re-check that value.
 *
 * The cleanest long-term fix is a transparent PNG or SVG master, which would
 * make e_trim and e_make_transparent unnecessary.
 */

const CLOUDINARY = "https://res.cloudinary.com/dofiyn7bw/image/upload";
const LOGO_TRANSFORM = "e_trim/e_make_transparent:20/f_auto,q_auto";

export function logoUrl(path: string, width: number) {
  return `${CLOUDINARY}/${LOGO_TRANSFORM},w_${width}/${path}`;
}

export function logoSrcSet(path: string, widths: number[]) {
  return widths.map((width) => `${logoUrl(path, width)} ${width}w`).join(", ");
}

/** Horizontal lockup: mark plus wordmark plus tagline. Trimmed ratio 5.2:1. */
export const logoLockup = {
  path: "v1786098757/equitykobo-secondary-logo_apeziw.jpg",
  width: 520,
  height: 100,
  alt: "EquityKobo — smart Nigerian investing",
};

/** The mark on its own. Trimmed ratio 1.19:1. For tight spaces and favicons. */
export const logoIcon = {
  path: "v1786098756/equitykobo-logo_zwkup6.jpg",
  width: 520,
  height: 439,
  alt: "EquityKobo",
};
