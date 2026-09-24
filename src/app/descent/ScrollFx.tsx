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
 *  - [data-reveal] → gets `data-revealed` once it enters the viewport
 *                    (slalom flags sliding in, cards dropping in).
 * Hidden-until-revealed styles only apply once `data-fx="on"` is set here, so
 * without JavaScript everything is simply visible.
 *
 * The revealed flag is a data attribute, not a class: React owns `className`
 * and rewrites it on re-render (dev HMR), which would hide a card again, but
 * it never touches an attribute it didn't render. A MutationObserver picks up
 * [data-reveal] nodes that React mounts later (remounts, HMR), so a fresh
 * node is observed instead of staying invisible.
 */
export function ScrollFx() {
  const scrubs = useRef<Scrub[]>([]);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".descent");
    if (!root) return;
    const reveal = (el: Element) => {
      if (el instanceof HTMLElement) el.dataset.revealed = "";
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            reveal(e.target);
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
    );
    const track = (t: HTMLElement) => {
      if (t.dataset.revealed !== undefined) return;
      // Anything already above the fold is shown immediately.
      if (t.getBoundingClientRect().top < window.innerHeight * 0.88) {
        reveal(t);
      } else {
        io.observe(t);
      }
    };
    for (const t of root.querySelectorAll<HTMLElement>("[data-reveal]")) {
      track(t);
    }
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        for (const n of r.addedNodes) {
          if (!(n instanceof HTMLElement)) continue;
          if (n.matches("[data-reveal]")) track(n);
          for (const t of n.querySelectorAll<HTMLElement>("[data-reveal]")) {
            track(t);
          }
        }
      }
    });
    // Only <main>: the HUD rewrites its text nodes every scroll frame.
    mo.observe(root.querySelector("main") ?? root, {
      childList: true,
      subtree: true,
    });
    root.dataset.fx = "on";
    return () => {
      io.disconnect();
      mo.disconnect();
    };
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
