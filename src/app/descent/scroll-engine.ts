/**
 * One shared requestAnimationFrame loop for every scroll-linked effect on the
 * DESCENT page (canvas, HUD, trail map, hero scrub, word reveal).
 *
 * - Scroll/resize listeners are passive and only *schedule* a frame.
 * - Layout reads happen in `measure` callbacks, which run once per
 *   resize / content-size change, never per frame.
 * - The loop stops itself when nothing is moving and no subscriber asks for
 *   another frame, and it never runs while the tab is hidden.
 */

export interface ScrollFrame {
  /** window.scrollY */
  y: number;
  /** smoothed scroll velocity in px/ms (positive = scrolling down) */
  vy: number;
  vw: number;
  vh: number;
  /** document scroll height */
  docH: number;
  /** rAF timestamp (ms) */
  t: number;
  /** ms since previous frame (clamped) */
  dt: number;
  /** true while the page is actually moving */
  scrolling: boolean;
}

export interface ScrollSubscriber {
  /** Called on every frame. Return true to request another frame. */
  tick: (frame: ScrollFrame) => boolean | undefined;
  /** Called after layout changes; do all DOM reads here. */
  measure?: (frame: ScrollFrame) => void;
}

const subscribers = new Set<ScrollSubscriber>();

let raf = 0;
let listening = false;
let needsMeasure = true;
let lastY = 0;
let lastT = 0;
let stillFrames = 0;
let resizeObserver: ResizeObserver | null = null;

const frame: ScrollFrame = {
  y: 0,
  vy: 0,
  vw: 0,
  vh: 0,
  docH: 0,
  t: 0,
  dt: 16,
  scrolling: false,
};

function schedule() {
  if (raf || typeof document === "undefined" || document.hidden) return;
  raf = requestAnimationFrame(loop);
}

function loop(t: number) {
  raf = 0;
  const y = window.scrollY;

  if (needsMeasure) {
    needsMeasure = false;
    frame.vw = window.innerWidth;
    frame.vh = window.innerHeight;
    frame.docH = document.documentElement.scrollHeight;
    frame.y = y;
    for (const sub of subscribers) sub.measure?.(frame);
  }

  const dt = lastT ? Math.min(64, Math.max(1, t - lastT)) : 16;
  const dy = y - lastY;
  const instant = dy / dt;
  // critically-damped-ish smoothing so the speedometer doesn't flicker
  frame.vy += (instant - frame.vy) * Math.min(1, dt / 90);
  if (Math.abs(frame.vy) < 0.002) frame.vy = 0;

  stillFrames = Math.abs(dy) < 0.5 ? stillFrames + 1 : 0;

  frame.y = y;
  frame.t = t;
  frame.dt = dt;
  frame.scrolling = stillFrames < 2;

  lastY = y;
  lastT = t;

  let again = false;
  for (const sub of subscribers) {
    if (sub.tick(frame)) again = true;
  }

  if (again || frame.vy !== 0 || stillFrames < 8) {
    schedule();
  } else {
    lastT = 0;
  }
}

function onScroll() {
  schedule();
}

function onResize() {
  needsMeasure = true;
  schedule();
}

function onVisibility() {
  if (document.hidden) {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    lastT = 0;
  } else {
    schedule();
  }
}

function start() {
  if (listening) return;
  listening = true;
  lastY = window.scrollY;
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  // Content height changes (fonts swapping in, images) shift every cached
  // position, so re-measure when the document box changes size.
  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(document.body);
  }
  document.fonts?.ready.then(onResize).catch(() => undefined);
}

function stop() {
  if (!listening) return;
  listening = false;
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", onResize);
  document.removeEventListener("visibilitychange", onVisibility);
  resizeObserver?.disconnect();
  resizeObserver = null;
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

export function subscribe(sub: ScrollSubscriber): () => void {
  subscribers.add(sub);
  start();
  needsMeasure = true;
  schedule();
  return () => {
    subscribers.delete(sub);
    if (subscribers.size === 0) stop();
  };
}

/** Ask for a re-measure + frame (e.g. after a theme or media change). */
export function invalidate() {
  needsMeasure = true;
  schedule();
}

export const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;
