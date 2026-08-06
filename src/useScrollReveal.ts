import { useEffect } from "react";

/**
 * Fades sections up as they enter the viewport.
 *
 * Elements opt in with the `data-reveal` attribute and are revealed by adding
 * `is-revealed`. The initial hidden state lives behind `.js-reveal-ready` on
 * <html>, which this hook sets — so with JavaScript disabled, or before hydration,
 * content stays visible rather than being stuck at opacity 0.
 */
function useScrollReveal() {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!targets.length) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      targets.forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    document.documentElement.classList.add("js-reveal-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );

    targets.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("js-reveal-ready");
    };
  }, []);
}

export default useScrollReveal;
