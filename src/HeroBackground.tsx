import { useEffect, useRef } from "react";

type Ribbon = {
  /** Vertical centre as a fraction of hero height. */
  base: number;
  amplitude: number;
  /** Horizontal drift in px per second. Negative values run right-to-left. */
  speed: number;
  /** Horizontal zoom on the noise field — smaller is smoother. */
  scale: number;
  thickness: number;
  /** 0 = far/faint, 1 = near/bright. Drives opacity, speed and thickness. */
  depth: number;
  seed: number;
  offset: number;
  /** Eased lift applied while this ribbon is the one under the cursor. */
  lift: number;
  targetLift: number;
};

// Brand palette, mirrored from landing-v2.css. Canvas cannot read CSS custom
// properties without a getComputedStyle round-trip per frame, so these are
// duplicated deliberately — keep them in sync with --lv2-orange / --lv2-blue.
const ORANGE = "238, 115, 37";
const BLUE = "41, 116, 173";

const RIBBON_COUNT = 6;
const SAMPLE_STEP = 7;

/**
 * Interactive market-ribbon backdrop for the hero.
 *
 * Layered polylines generated from fractal value noise, drifting at different
 * speeds and depths — the shape of price history rather than a generic particle
 * field. Moving the pointer lights up the nearest ribbon and drops a crosshair
 * and marker onto it, the way hovering a real price chart would.
 *
 * The canvas is inert to input (`pointer-events: none` in CSS) so it can never
 * intercept a click on the call-to-action buttons sitting above it; pointer
 * position is read from the hero element instead.
 */
function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) {
      return;
    }
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    // Hoisted function declarations below do not inherit the null-narrowing
    // from the guards above, so capture non-null locals once and use those.
    const cv: HTMLCanvasElement = canvas;
    const hostEl: HTMLElement = host;
    const ctx: CanvasRenderingContext2D = context;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let ribbons: Ribbon[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let isVisible = true;
    let lastTime = 0;

    const pointer = { x: 0, y: 0, targetStrength: 0, strength: 0, activeRibbon: -1 };

    // --- 1D fractal value noise -------------------------------------------
    // Cheap, deterministic and seamlessly scrollable: shifting x is all that is
    // needed to animate. Stacked octaves give the jaggedness that makes a curve
    // read as price history rather than a sine wave.
    function hash(n: number, seed: number) {
      const x = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
      return x - Math.floor(x);
    }

    function valueNoise(x: number, seed: number) {
      const i = Math.floor(x);
      const f = x - i;
      // Smoothstep keeps the first derivative continuous, so no visible kinks.
      const u = f * f * (3 - 2 * f);
      return hash(i, seed) * (1 - u) + hash(i + 1, seed) * u;
    }

    function fbm(x: number, seed: number) {
      let sum = 0;
      let amp = 0.5;
      let freq = 1;
      for (let octave = 0; octave < 5; octave++) {
        sum += valueNoise(x * freq, seed + octave * 17) * amp;
        // Non-integer lacunarity stops the octaves lining up into a repeat.
        freq *= 2.07;
        amp *= 0.5;
      }
      return sum * 2 - 1;
    }

    function ribbonY(ribbon: Ribbon, x: number) {
      const n = fbm((x + ribbon.offset) * ribbon.scale, ribbon.seed);
      return ribbon.base * height + n * ribbon.amplitude - ribbon.lift;
    }

    function seed() {
      ribbons = Array.from({ length: RIBBON_COUNT }, (_, i) => {
        const depth = 0.28 + (i / (RIBBON_COUNT - 1)) * 0.72;
        return {
          base: 0.16 + (i / (RIBBON_COUNT - 1)) * 0.7,
          // fbm rarely reaches its full [-1,1] range — typical deviation is
          // nearer +/-0.3 — so the nominal amplitude has to be roughly triple
          // the swing actually wanted on screen.
          amplitude: (height * 0.15 + 46) * (0.55 + depth * 0.75),
          // Nearer ribbons travel faster; that speed difference is what sells
          // the depth more than opacity does.
          speed: -(10 + depth * 26),
          scale: 0.0034 + (1 - depth) * 0.0026,
          thickness: 1 + depth * 1.5,
          depth,
          seed: i * 9.73 + 1.3,
          offset: i * 640,
          lift: 0,
          targetLift: 0,
        };
      });
    }

    function resize() {
      const rect = hostEl.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      // Cap DPR: past 2x the extra pixels cost real frame time and buy nothing
      // visible for 1px lines.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(width * dpr);
      cv.height = Math.round(height * dpr);
      cv.style.width = `${width}px`;
      cv.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    /** Which ribbon is vertically nearest the cursor, if any is close enough. */
    function findActiveRibbon() {
      if (pointer.strength < 0.05) {
        return -1;
      }
      let best = -1;
      let bestDistance = 90;
      ribbons.forEach((ribbon, index) => {
        const distance = Math.abs(ribbonY(ribbon, pointer.x) - pointer.y);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      return best;
    }

    function drawRibbon(ribbon: Ribbon, index: number) {
      const isActive = index === pointer.activeRibbon;
      const points: Array<[number, number]> = [];
      for (let x = -SAMPLE_STEP; x <= width + SAMPLE_STEP; x += SAMPLE_STEP) {
        points.push([x, ribbonY(ribbon, x)]);
      }

      // Soft area fill beneath the line, as on a chart. Alpha stays low so six
      // stacked ribbons never muddy the copy sitting above them.
      const fill = ctx.createLinearGradient(0, ribbon.base * height - ribbon.amplitude, 0, height);
      const fillAlpha = (isActive ? 0.15 : 0.06) * ribbon.depth;
      fill.addColorStop(0, `rgba(${isActive ? ORANGE : BLUE}, ${fillAlpha})`);
      fill.addColorStop(1, `rgba(${isActive ? ORANGE : BLUE}, 0)`);
      ctx.beginPath();
      points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.lineTo(width + SAMPLE_STEP, height);
      ctx.lineTo(-SAMPLE_STEP, height);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();

      ctx.beginPath();
      points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      if (isActive) {
        ctx.strokeStyle = `rgba(${ORANGE}, ${0.55 + pointer.strength * 0.4})`;
        ctx.lineWidth = ribbon.thickness + 0.9;
        ctx.shadowColor = `rgba(${ORANGE}, 0.55)`;
        ctx.shadowBlur = 14;
      } else {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.07 + ribbon.depth * 0.2})`;
        ctx.lineWidth = ribbon.thickness;
      }
      ctx.lineJoin = "round";
      ctx.stroke();
      // shadowBlur is sticky on the context; clear it or every later fill glows.
      ctx.shadowBlur = 0;
    }

    /** Crosshair and marker on the hovered ribbon, like a chart tooltip. */
    function drawCursorReadout() {
      const index = pointer.activeRibbon;
      if (index < 0 || pointer.strength < 0.05) {
        return;
      }
      const ribbon = ribbons[index];
      const y = ribbonY(ribbon, pointer.x);

      ctx.save();
      ctx.globalAlpha = pointer.strength;

      ctx.beginPath();
      ctx.setLineDash([4, 6]);
      ctx.moveTo(pointer.x, y);
      ctx.lineTo(pointer.x, height);
      ctx.strokeStyle = `rgba(${ORANGE}, 0.4)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(pointer.x, y, 9, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ORANGE}, 0.18)`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pointer.x, y, 3.6, 0, Math.PI * 2);
      ctx.fillStyle = "#f4823d";
      ctx.fill();

      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      if (pointer.strength > 0.01) {
        const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 260);
        glow.addColorStop(0, `rgba(${ORANGE}, ${0.11 * pointer.strength})`);
        glow.addColorStop(1, `rgba(${ORANGE}, 0)`);
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }

      // Far ribbons first so the nearer, brighter ones sit on top.
      ribbons.forEach(drawRibbon);
      drawCursorReadout();
    }

    function update(delta: number) {
      pointer.strength += (pointer.targetStrength - pointer.strength) * Math.min(1, delta * 4);
      pointer.activeRibbon = findActiveRibbon();

      ribbons.forEach((ribbon, index) => {
        ribbon.offset += ribbon.speed * delta;
        ribbon.targetLift = index === pointer.activeRibbon ? 9 : 0;
        ribbon.lift += (ribbon.targetLift - ribbon.lift) * Math.min(1, delta * 6);
      });
    }

    function loop(time: number) {
      // Motion is time-based, not per-frame, so speed is identical on 60Hz and
      // 120Hz displays. The clamp stops a long frame teleporting the ribbons.
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016;
      lastTime = time;
      update(delta);
      draw();
      frame = window.requestAnimationFrame(loop);
    }

    function start() {
      if (frame || reduceMotion.matches || !isVisible) {
        return;
      }
      lastTime = 0;
      frame = window.requestAnimationFrame(loop);
    }

    function stop() {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = hostEl.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.targetStrength = 1;
    }

    function handlePointerLeave() {
      pointer.targetStrength = 0;
    }

    function handleVisibility() {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    }

    function handleMotionPreference() {
      stop();
      if (reduceMotion.matches) {
        // Still render one frame so the hero is not a flat rectangle.
        draw();
      } else {
        start();
      }
    }

    resize();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduceMotion.matches) {
        draw();
      }
    });
    resizeObserver.observe(hostEl);

    // Stop burning frames once the hero is scrolled past.
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          start();
        } else {
          stop();
        }
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(hostEl);

    hostEl.addEventListener("pointermove", handlePointerMove);
    hostEl.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("visibilitychange", handleVisibility);
    reduceMotion.addEventListener("change", handleMotionPreference);

    if (reduceMotion.matches) {
      draw();
    } else {
      start();
    }

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      hostEl.removeEventListener("pointermove", handlePointerMove);
      hostEl.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
      reduceMotion.removeEventListener("change", handleMotionPreference);
    };
  }, []);

  return <canvas aria-hidden="true" className="hero-canvas" ref={canvasRef} />;
}

export default HeroBackground;
