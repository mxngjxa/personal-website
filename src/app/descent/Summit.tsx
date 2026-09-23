"use client";

import { useRef } from "react";
import { clamp } from "./scroll-engine";
import { useScrollFrame } from "./use-scroll-progress";

const STEPS = ["3", "2", "1", "GO"] as const;
/** Scroll progress at which each start light comes on. */
const STEP_AT = [0.58, 0.68, 0.78, 0.88];

/**
 * SUMMIT — a 220vh section whose inner scene is pinned (sticky). Scroll
 * progress is written to `--p` and the start-gate countdown to `data-step`;
 * CSS does the rest.
 */
export function Summit({
  first,
  last,
  nick,
  fullName,
  about,
}: {
  first: string;
  last: string;
  nick: string | null;
  fullName: string;
  about: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const top = useRef(0);
  const span = useRef(1);
  const lastP = useRef(-1);
  const lastStep = useRef(-2);

  useScrollFrame(
    (f) => {
      const el = sectionRef.current;
      if (!el) return false;
      const p = clamp((f.y - top.current) / span.current, 0, 1);
      if (Math.abs(p - lastP.current) > 0.0005) {
        lastP.current = p;
        el.style.setProperty("--p", p.toFixed(4));
      }
      let step = -1;
      for (let i = 0; i < STEP_AT.length; i++) if (p >= STEP_AT[i]) step = i;
      if (step !== lastStep.current) {
        lastStep.current = step;
        el.dataset.step = String(step);
      }
      return false;
    },
    (f) => {
      const el = sectionRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      top.current = r.top + window.scrollY;
      span.current = Math.max(1, r.height - f.vh);
    }
  );

  return (
    <section
      ref={sectionRef}
      id="summit"
      className="summit"
      data-run="summit"
      data-lane="0.84"
      data-lane-m="0.3"
      data-carve="0.8"
      data-step="-1"
      aria-labelledby="summit-name"
    >
      <div className="summit__pin">
        <div className="d-container summit__inner">
          <div className="bib">
            <span className="bib__label">BIB</span>
            <span className="bib__num">01</span>
            <span className="bib__meta">
              RUN: THE GUAN
              <br />
              START · SUMMIT
            </span>
          </div>

          <h1 id="summit-name" className="summit__name">
            <span className="sr-only">{fullName}</span>
            <span className="summit__line" aria-hidden="true">
              {first}
            </span>
            {nick ? (
              <span className="sticker" aria-hidden="true">
                "{nick}"
              </span>
            ) : null}
            {last ? (
              <span className="summit__line" aria-hidden="true">
                {last}
              </span>
            ) : null}
          </h1>

          <p className="summit__about">{about}</p>

          <p className="summit__drop" aria-hidden="true">
            DROP IN <span className="blink">↓</span>
          </p>

          <div className="countdown" aria-hidden="true">
            {STEPS.map((s, i) => (
              <span
                key={s}
                className={`countdown__light${s === "GO" ? " countdown__light--go" : ""}`}
                data-i={i}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
