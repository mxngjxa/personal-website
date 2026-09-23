/**
 * Tiny shared state between the canvas and the HUD. Kept out of the
 * component modules so React Fast Refresh keeps working on both.
 *
 * `speed` is 1 while the skier is running, eases to 0 through the finish
 * hockey stop and stays 0 once parked. `walking` is true while he walks from
 * his skis down to SAY HI; the HUD then shows a steady WALK_KMH while the
 * page moves. PixelRun writes both while drawing. No React state involved.
 */
export const runState = { speed: 1, walking: false };

export const WALK_KMH = 5;
