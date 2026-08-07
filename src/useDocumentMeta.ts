import { useEffect } from "react";

type Meta = {
  title: string;
  description?: string;
  /** Path only, e.g. "/login". Resolved against the production origin. */
  canonicalPath?: string;
  /** Keep private, signed-in pages out of the index. */
  noindex?: boolean;
};

const SITE_ORIGIN = "https://equitykobo.com";

/**
 * Sets the document title and the handful of meta tags that vary per route.
 *
 * Scope, so this is not mistaken for full SEO coverage: this runs in the
 * browser after React mounts. Google executes JavaScript and will generally
 * pick these up on its rendering pass, but the crawlers that matter for link
 * previews — WhatsApp, X, LinkedIn, Facebook — do not run JS at all and only
 * ever see what is in index.html. The Open Graph tags for the shared homepage
 * therefore live there, statically, and are deliberately not managed here.
 *
 * The real fix for per-route social previews is pre-rendering or SSR.
 */
function useDocumentMeta({ title, description, canonicalPath, noindex }: Meta) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const created: HTMLElement[] = [];

    function upsert(selector: string, make: () => HTMLElement, apply: (el: HTMLElement) => void) {
      let el = document.head.querySelector<HTMLElement>(selector);
      if (!el) {
        el = make();
        document.head.appendChild(el);
        created.push(el);
      }
      apply(el);
      return el;
    }

    const previousDescription = document.head
      .querySelector('meta[name="description"]')
      ?.getAttribute("content");

    if (description) {
      upsert(
        'meta[name="description"]',
        () => {
          const m = document.createElement("meta");
          m.setAttribute("name", "description");
          return m;
        },
        (el) => el.setAttribute("content", description),
      );
    }

    if (canonicalPath) {
      upsert(
        'link[rel="canonical"]',
        () => {
          const l = document.createElement("link");
          l.setAttribute("rel", "canonical");
          return l;
        },
        (el) => el.setAttribute("href", `${SITE_ORIGIN}${canonicalPath}`),
      );
    }

    if (noindex) {
      upsert(
        'meta[name="robots"]',
        () => {
          const m = document.createElement("meta");
          m.setAttribute("name", "robots");
          return m;
        },
        (el) => el.setAttribute("content", "noindex, nofollow"),
      );
    }

    return () => {
      document.title = previousTitle;
      // Restore rather than delete: index.html ships a description for the
      // homepage, and removing it on unmount would strip it permanently.
      if (description && previousDescription) {
        document.head
          .querySelector('meta[name="description"]')
          ?.setAttribute("content", previousDescription);
      }
      created.forEach((el) => el.remove());
    };
  }, [title, description, canonicalPath, noindex]);
}

export default useDocumentMeta;
