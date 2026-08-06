import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CarouselProps = {
  /** Accessible name, e.g. "What you get". */
  label: string;
  children: ReactNode;
  /** Advance on a timer. Pauses on hover, focus and for reduced-motion users. */
  autoPlayMs?: number;
  className?: string;
};

/**
 * Scroll-snap carousel.
 *
 * The track is a real horizontally scrolling element rather than a
 * transform-driven slider, so touch swipe, momentum, trackpad gestures and
 * keyboard scrolling all come from the browser. The buttons and dots drive the
 * same scroll position, which keeps every input path in sync.
 */
function Carousel({ label, children, autoPlayMs, className }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slides = Children.toArray(children);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageCount, setPageCount] = useState(slides.length);
  const [isPaused, setIsPaused] = useState(false);

  // The rendered index also lives in a ref. Scroll events are async and may be
  // coalesced, so reading position back from the DOM alone means two quick
  // clicks on "next" both compute from a stale index and land on the same
  // slide. The ref is updated synchronously on every intentional move.
  const indexRef = useRef(0);

  const setIndex = useCallback((index: number) => {
    indexRef.current = index;
    setActiveIndex(index);
  }, []);

  // How many slides fit at once, and therefore how many snap positions exist.
  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const first = track.firstElementChild as HTMLElement | null;
    if (!first) {
      return;
    }
    const slideWidth = first.getBoundingClientRect().width;
    if (slideWidth <= 0) {
      return;
    }
    const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
    const visible = Math.max(1, Math.round((track.clientWidth + gap) / (slideWidth + gap)));
    const pages = Math.max(1, slides.length - visible + 1);
    setPageCount(pages);
    // Widening the viewport shows more slides at once and so removes snap
    // positions from the end; without this the index can point past them.
    if (indexRef.current > pages - 1) {
      setIndex(pages - 1);
    }
  }, [slides.length, setIndex]);

  useEffect(() => {
    measure();
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measure]);

  // Derive the active slide from the real scroll position so that swiping,
  // clicking and autoplay all report the same state.
  function handleScroll() {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const children = Array.from(track.children) as HTMLElement[];
    let closest = 0;
    let smallest = Infinity;
    children.forEach((child, index) => {
      const distance = Math.abs(child.offsetLeft - track.offsetLeft - track.scrollLeft);
      if (distance < smallest) {
        smallest = distance;
        closest = index;
      }
    });
    setIndex(Math.min(closest, pageCount - 1));
  }

  const scrollToIndex = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) {
        return;
      }
      const target = track.children[index] as HTMLElement | undefined;
      if (!target) {
        return;
      }
      // Move the index first so the dots and arrow disabled-states respond to
      // the click immediately rather than waiting for the scroll to settle.
      setIndex(index);
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      track.scrollTo({
        left: target.offsetLeft - track.offsetLeft,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    },
    [setIndex],
  );

  function step(direction: -1 | 1) {
    const next = indexRef.current + direction;
    scrollToIndex(Math.min(Math.max(next, 0), pageCount - 1));
  }

  useEffect(() => {
    if (!autoPlayMs || isPaused || pageCount <= 1) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = window.setInterval(() => {
      const next = indexRef.current + 1 >= pageCount ? 0 : indexRef.current + 1;
      scrollToIndex(next);
    }, autoPlayMs);
    return () => window.clearInterval(timer);
  }, [autoPlayMs, isPaused, pageCount, scrollToIndex]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  }

  const atStart = activeIndex <= 0;
  const atEnd = activeIndex >= pageCount - 1;

  return (
    <div
      className={className ? `ek-carousel ${className}` : "ek-carousel"}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div
        className="ek-carousel-track"
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        ref={trackRef}
        tabIndex={0}
      >
        {slides.map((slide, index) => (
          <div
            aria-label={`${index + 1} of ${slides.length}`}
            aria-roledescription="slide"
            className="ek-carousel-slide"
            key={index}
            role="group"
          >
            {slide}
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="ek-carousel-controls">
          <button
            aria-label={`Previous ${label} slide`}
            className="ek-carousel-arrow"
            disabled={atStart}
            onClick={() => step(-1)}
            type="button"
          >
            <ChevronLeft size={19} />
          </button>

          <div className="ek-carousel-dots" role="tablist" aria-label={`${label} slides`}>
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                aria-label={`Go to slide ${index + 1}`}
                aria-selected={index === activeIndex}
                className={index === activeIndex ? "is-active" : undefined}
                key={index}
                onClick={() => scrollToIndex(index)}
                role="tab"
                type="button"
              />
            ))}
          </div>

          <button
            aria-label={`Next ${label} slide`}
            className="ek-carousel-arrow"
            disabled={atEnd}
            onClick={() => step(1)}
            type="button"
          >
            <ChevronRight size={19} />
          </button>
        </div>
      )}
    </div>
  );
}

export default Carousel;
