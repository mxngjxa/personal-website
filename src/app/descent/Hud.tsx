"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { runState, WALK_KMH } from "./run-state";
import { clamp } from "./scroll-engine";
import { useScrollFrame } from "./use-scroll-progress";

const fmtAlt = (n: number) => n.toLocaleString("en-US");

/**
 * Fixed race HUD. Numbers are written straight to text nodes from the shared
 * scroll loop — React never re-renders on scroll. The readouts are
 * aria-hidden and deliberately not a live region: they change every frame.
 */
export function Hud({
  altTop,
  altBase,
  yearTop,
  yearBase,
}: {
  altTop: number;
  altBase: number;
  yearTop: number;
  yearBase: number;
}) {
  const altRef = useRef<HTMLSpanElement>(null);
  const yrRef = useRef<HTMLSpanElement>(null);
  const spdRef = useRef<HTMLSpanElement>(null);
  const altMRef = useRef<HTMLSpanElement>(null);
  const yrMRef = useRef<HTMLSpanElement>(null);
  const last = useRef({ alt: -1, yr: -1, spd: -1 });

  useScrollFrame((f) => {
    const max = Math.max(1, f.docH - f.vh);
    const p = clamp(f.y / max, 0, 1);
    const alt = Math.round(altTop + (altBase - altTop) * p);
    // Year ticks over evenly across the run; the base lodge shows BASE_YEAR.
    const span = yearTop - yearBase + 1;
    const yr = Math.max(yearBase, yearTop - Math.floor(p * span * 0.999));
    // runState.speed eases to 0 through the finish hockey stop; on foot
    // after it the readout is a steady walking pace while the page moves.
    const moving = Math.abs(f.vy) > 0.02;
    const spd = runState.walking
      ? moving
        ? WALK_KMH
        : 0
      : Math.round(clamp(Math.abs(f.vy) * 42, 0, 112) * runState.speed);
    const l = last.current;
    if (alt !== l.alt) {
      l.alt = alt;
      const s = fmtAlt(alt);
      if (altRef.current) altRef.current.textContent = s;
      if (altMRef.current) altMRef.current.textContent = s;
    }
    if (yr !== l.yr) {
      l.yr = yr;
      const s = String(yr);
      if (yrRef.current) yrRef.current.textContent = s;
      if (yrMRef.current) yrMRef.current.textContent = s;
    }
    if (spd !== l.spd) {
      l.spd = spd;
      if (spdRef.current)
        spdRef.current.textContent = String(spd).padStart(3, "0");
    }
    return false;
  });

  return (
    <header className="hud">
      <div className="hud__row">
        <Link href="/" className="hud__brand hud__wide">
          MGUAN.ORG
        </Link>
        <span className="hud__item hud__wide" aria-hidden="true">
          RUN: THE GUAN
        </span>
        <span className="hud__item hud__wide" aria-hidden="true">
          ALT <span ref={altRef}>{fmtAlt(altTop)}</span>M
        </span>
        <span className="hud__item hud__wide" aria-hidden="true">
          YR <span ref={yrRef}>{yearTop}</span>
        </span>
        <span className="hud__item hud__wide" aria-hidden="true">
          SPD <span ref={spdRef}>000</span> KM/H
        </span>
        {/* compact readout for phones */}
        <span className="hud__item hud__narrow" aria-hidden="true">
          <span ref={altMRef}>{fmtAlt(altTop)}</span>M ·{" "}
          <span ref={yrMRef}>{yearTop}</span>
        </span>
        <span className="hud__spacer" />
        <NightSkiToggle />
        <a
          href="/resume.pdf"
          className="hud__link hud__wide"
          target="_blank"
          rel="noopener noreferrer"
        >
          RESUME PDF <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  );
}

function NightSkiToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const night = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      className="hud__toggle"
      aria-pressed={night}
      title="Toggle night skiing"
      onClick={() => setTheme(night ? "light" : "dark")}
    >
      NIGHT SKI{" "}
      {/* visual only: aria-pressed carries the state, so the name stays
          "NIGHT SKI" instead of "NIGHT SKI OFF, not pressed" */}
      <span className="hud__toggle-state" aria-hidden="true">
        <span className="when-night">ON</span>
        <span className="when-day">OFF</span>
      </span>
    </button>
  );
}
