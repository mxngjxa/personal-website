"use client";

import { useEffect, useRef } from "react";
import { type ScrollFrame, subscribe } from "./scroll-engine";

/**
 * Subscribe a component to the shared scroll loop. Callbacks are kept in refs,
 * so re-renders never re-subscribe and nothing here triggers React renders.
 */
export function useScrollFrame(
  tick: (frame: ScrollFrame) => boolean | undefined,
  measure?: (frame: ScrollFrame) => void
) {
  const tickRef = useRef(tick);
  const measureRef = useRef(measure);
  tickRef.current = tick;
  measureRef.current = measure;

  useEffect(
    () =>
      subscribe({
        tick: (f) => tickRef.current(f),
        measure: (f) => measureRef.current?.(f),
      }),
    []
  );
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
