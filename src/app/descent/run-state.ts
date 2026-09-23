/**
 * Tiny shared state between the canvas and the HUD. Kept out of the
 * component modules so React Fast Refresh keeps working on both.
 *
 * `speed` is 1 while the skier is running, eases to 0 through the finish
 * hockey stop and stays 0 once parked. PixelRun writes it while drawing;
 * the HUD multiplies its speed readout by it. No React state involved.
 */
export const runState = { speed: 1 };
