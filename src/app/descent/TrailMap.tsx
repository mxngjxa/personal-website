"use client";

import { useRef } from "react";
import { RUN_SECTIONS } from "./run-data";
import { clamp } from "./scroll-engine";
import { TrailSign } from "./TrailSign";
import { useScrollFrame } from "./use-scroll-progress";

/**
 * Fixed trail-map rail (desktop). Stops are evenly spaced; the red dot is
 * interpolated piecewise between them from the real section offsets, so it
 * sits on a sign exactly when that section reaches the top of the view.
 */
export function TrailMap() {
  const dotRef = useRef<HTMLSpanElement>(null);
  const tops = useRef<number[]>([]);
  const lastIdx = useRef(-1);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const navRef = useRef<HTMLElement>(null);
  const railH = useRef(0);
  const lastPx = useRef(-1);

  useScrollFrame(
    (f) => {
      const t = tops.current;
      if (!t.length || !dotRef.current) return false;
      // Reading position: a third of the way down the viewport.
      const y = f.y + f.vh * 0.33;
      const end = Math.max(t[t.length - 1] + 1, f.docH - f.vh * 0.67);
      let pos = 0;
      for (let i = 0; i < t.length; i++) {
        const a = t[i];
        const b = i + 1 < t.length ? t[i + 1] : end;
        if (y >= a) pos = i + clamp((y - a) / Math.max(1, b - a), 0, 1);
      }
      const frac = clamp(pos / (t.length - 1), 0, 1);
      const px = Math.round(frac * railH.current * 2) / 2;
      if (px !== lastPx.current) {
        lastPx.current = px;
        dotRef.current.style.transform = `translate3d(0, ${px}px, 0)`;
      }
      const idx = Math.min(t.length - 1, Math.floor(pos + 0.02));
      if (idx !== lastIdx.current) {
        const prev = linkRefs.current[lastIdx.current];
        prev?.removeAttribute("aria-current");
        linkRefs.current[idx]?.setAttribute("aria-current", "location");
        lastIdx.current = idx;
      }
      return false;
    },
    () => {
      railH.current = navRef.current?.clientHeight ?? 0;
      lastPx.current = -1;
      tops.current = RUN_SECTIONS.map((s) => {
        const el = document.getElementById(s.id);
        return el ? el.getBoundingClientRect().top + window.scrollY : 0;
      });
    }
  );

  return (
    <nav ref={navRef} className="trail-map" aria-label="Trail map">
      <ol className="trail-map__list">
        {RUN_SECTIONS.map((s, i) => (
          <li
            key={s.id}
            className="trail-map__stop"
            style={{ top: `${(i / (RUN_SECTIONS.length - 1)) * 100}%` }}
          >
            <a
              href={`#${s.id}`}
              ref={(el) => {
                linkRefs.current[i] = el;
              }}
              className="trail-map__link"
            >
              <span className="trail-map__plate">
                <TrailSign kind={s.sign} size={14} />
              </span>
              <span className="trail-map__label">{s.label}</span>
            </a>
          </li>
        ))}
      </ol>
      <span ref={dotRef} className="trail-map__dot" aria-hidden="true" />
    </nav>
  );
}
