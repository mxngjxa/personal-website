"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { clamp } from "./scroll-engine";
import { useScrollFrame } from "./use-scroll-progress";

const fmtAlt = (n: number) => n.toLocaleString("en-US");

/**
 * Fixed race HUD. Numbers are written straight to text nodes from the shared
 * scroll loop — React never re-renders on scroll.
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
    const spd = Math.round(clamp(Math.abs(f.vy) * 42, 0, 112));
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
        <Link href="/classic" className="hud__link hud__wide">
          CLASSIC CV <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </header>
  );
}

function NightSkiToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const night = mounted && resolvedTheme === "dark";

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target;
      if (
        e.key.toLowerCase() !== "d" ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        (t instanceof HTMLElement && t.isContentEditable)
      ) {
        return;
      }
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resolvedTheme, setTheme]);

  return (
    <button
      type="button"
      className="hud__toggle"
      aria-pressed={night}
      title="Toggle night skiing (D)"
      onClick={() => setTheme(night ? "light" : "dark")}
    >
      NIGHT SKI{" "}
      <span className="hud__toggle-state">
        <span className="when-night">ON</span>
        <span className="when-day">OFF</span>
      </span>
    </button>
  );
}
