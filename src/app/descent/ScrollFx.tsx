"use client";

import { useEffect, useRef } from "react";
import { clamp } from "./scroll-engine";
import { useScrollFrame } from "./use-scroll-progress";

interface Scrub {
  el: HTMLElement;
  top: number;
  height: number;
  last: number;
}

/**
 * Page-wide scroll effects that don't need their own component:
 *  - [data-scrub]  → writes `--r` (0..1) as the element crosses the viewport
 *                    (drives the word-by-word reveal in THE LINE).
 *  - [data-reveal] → gets `.is-in` once it enters the viewport
 *                    (slalom flags sliding in, cards dropping in).
 * Hidden-until-revealed styles only apply once `data-fx="on"` is set here, so
 * without JavaScript everything is simply visible.
 */
export function ScrollFx() {
  const scrubs = useRef<Scrub[]>([]);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".descent");
    if (!root) return;
    const targets = root.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
    );
    for (const t of targets) {
      // Anything already above the fold on load is shown immediately.
      if (t.getBoundingClientRect().top < window.innerHeight * 0.88) {
        t.classList.add("is-in");
      } else {
        io.observe(t);
      }
    }
    root.dataset.fx = "on";
    return () => io.disconnect();
  }, []);

  useScrollFrame(
    (f) => {
      for (const s of scrubs.current) {
        // 0 when the element's top is at 85% of the viewport,
        // 1 when its bottom reaches 45%.
        const start = s.top - f.vh * 0.85;
        const end = s.top + s.height - f.vh * 0.45;
        const r = clamp((f.y - start) / Math.max(1, end - start), 0, 1);
        if (Math.abs(r - s.last) > 0.001) {
          s.last = r;
          s.el.style.setProperty("--r", r.toFixed(4));
        }
      }
      return false;
    },
    () => {
      scrubs.current = Array.from(
        document.querySelectorAll<HTMLElement>("[data-scrub]")
      ).map((el) => {
        const r = el.getBoundingClientRect();
        return {
          el,
          top: r.top + window.scrollY,
          height: r.height,
          last: -1,
        };
      });
    }
  );

  return null;
}
