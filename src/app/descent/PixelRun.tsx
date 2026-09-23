"use client";

import { useEffect, useRef } from "react";
import { runState } from "./run-state";
import { clamp, invalidate, type ScrollFrame } from "./scroll-engine";
import {
  BAYER4,
  type CompiledSprite,
  compileSprite,
  PINES,
  SKI_PROP,
  SKIER_CARVE_LEFT,
  SKIER_CARVE_RIGHT,
  SKIER_PARK_LEFT,
  SKIER_PARK_RIGHT,
  SKIER_SKID_LEFT,
  SKIER_SKID_RIGHT,
  SKIER_STEPOUT_LEFT,
  SKIER_STEPOUT_RIGHT,
  SKIER_STOP_LEFT,
  SKIER_STOP_RIGHT,
  SKIER_TUCK,
  WALKER_STAND,
  WALKER_STEP_L,
  WALKER_STEP_R,
  WALKER_WAVE_A,
  WALKER_WAVE_B,
} from "./sprites";
import { prefersReducedMotion, useScrollFrame } from "./use-scroll-progress";

/* ------------------------------------------------------------------------- */
/* Tunables                                                                   */
/* ------------------------------------------------------------------------- */

/** CSS px per canvas pixel before device-pixel snapping. */
const PIXEL = 4;
/** Max trail rows kept (1 row = 1 canvas pixel of page height). */
const TRAIL_CAP = 4000;
const FLAKE_COUNT = 120;
/** Spray particle pool (carve spray + the finish burst share it). */
const SPRAY_CAP = 112;
/** floats per particle: x, y, vx, vy, life, world(0|1), size, floor */
const SPRAY_STRIDE = 8;
const MOBILE_BP = 768;

/* Finish-line hockey stop, all in canvas rows (1 row = 1 canvas px). */
/** Rows of carve set-up above the line. */
const FINISH_APPROACH = 64;
/** Skid length: skis go sideways this far past the brake point. */
const STOP_D = 24;
/** Fraction of the braking scroll spent swinging the skis round. */
const SKID_END = 0.3;
/** Extra scroll after the full stop before the skier stands up. */
const PARK_AFTER = 28;
const BURST = 72;
const BURST_MS = 1000;

/* After the stop: step out of the skis, walk down to SAY HI and wave. Also
   in rows of feet travel past the brake point (du), like the stop above. */
/** One boot comes out of its binding (parking starts at 2*STOP_D+PARK_AFTER). */
const STEPOUT_DU = 2 * STOP_D + PARK_AFTER + 4;
/** Skis planted upright in the snow, skier standing beside them. */
const PLANT_DU = STEPOUT_DU + 6;
/** First step of the walk. */
const WALK_DU = PLANT_DU + 6;
/** Minimum scroll (rows) the walk is spread over. */
const MIN_WALK = 40;
/** Path length (canvas px) per walk-cycle frame. */
const STRIDE = 5;
/** Columns between the planted skis and where the skier stands. */
const PLANT_OFF = 9;
/** Boot prints kept (two per stride). */
const PRINT_CAP = 480;
/** Wave frame length: ~4.5 sprite changes a second. */
const WAVE_MS = 220;
/** CSS px between SAY HI's border box and the skier (its shadow is 10px). */
const WAVE_GAP = 14;

/* ------------------------------------------------------------------------- */
/* Colour packing (ImageData is RGBA bytes; we write 32-bit words)            */
/* ------------------------------------------------------------------------- */

const LITTLE_ENDIAN =
  new Uint8Array(new Uint32Array([0x0a0b0c0d]).buffer)[0] === 0x0d;

function pack(hex: string, a = 255): number {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return LITTLE_ENDIAN
    ? ((a << 24) | (b << 16) | (g << 8) | r) >>> 0
    : ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;
}

function withAlpha(c: number, a: number): number {
  return LITTLE_ENDIAN
    ? ((c & 0x00ffffff) | (a << 24)) >>> 0
    : ((c & 0xffffff00) | a) >>> 0;
}

/* ------------------------------------------------------------------------- */
/* Palettes                                                                   */
/* ------------------------------------------------------------------------- */

interface Palette {
  sky: [number, number, number];
  star: number;
  starDim: number;
  moon: number;
  moonShade: number;
  cloud: number;
  cloudShade: number;
  far: number;
  farSnow: number;
  rock: number;
  rockShade: number;
  snow: number;
  snowShade: number;
  slope: number;
  trail: number;
  flakeSky: number;
  flakeSlope: number;
  spray: number;
  /** denser clumps in the finish burst, so it reads on white snow */
  sprayClump: number;
  outline: number;
  finishA: number;
  finishB: number;
  sprite: Record<string, number>;
  night: boolean;
}

function buildPalette(night: boolean): Palette {
  const sprite = (red: string, redShade: string, blue: string) => ({
    K: pack("#0b0d10"),
    R: pack(red),
    D: pack(redShade),
    B: pack(blue),
    N: pack(night ? "#2440b8" : "#0b2aae"),
    I: pack("#a9dbff"),
    W: pack("#ffffff"),
    F: pack("#f2c29b"),
    G: pack(night ? "#aab6c3" : "#7d8894"),
    S: pack("#0b0d10"),
    T: pack(night ? "#23454b" : "#1f3b35"),
    t: pack(night ? "#142b30" : "#122622"),
    k: pack(night ? "#5a4032" : "#4a3426"),
    s: pack(night ? "#7f93a8" : "#bfd4e6"),
  });

  if (night) {
    return {
      sky: [pack("#03050a"), pack("#0b1322"), pack("#1b2b3f")],
      star: pack("#e9eef3"),
      starDim: pack("#6f86a3"),
      moon: pack("#e9eef3"),
      moonShade: pack("#a9b6c4"),
      cloud: 0,
      cloudShade: 0,
      far: pack("#15233a"),
      farSnow: pack("#3b5070"),
      rock: pack("#1f2b3b"),
      rockShade: pack("#141d29"),
      snow: pack("#c6d4e3"),
      snowShade: pack("#7f93a8"),
      slope: pack("#0a0e14"),
      trail: pack("#1d2939"),
      flakeSky: pack("#e9eef3"),
      flakeSlope: pack("#9fb2c6"),
      spray: pack("#c6d4e3"),
      sprayClump: pack("#f4f8fb"),
      outline: pack("#e9eef3"),
      finishA: pack("#e9eef3"),
      finishB: pack("#27374d"),
      sprite: sprite("#ff4a3d", "#b8231a", "#4f74ff"),
      night,
    };
  }
  return {
    sky: [pack("#6fb0ef"), pack("#a9dbff"), pack("#e1f1ff")],
    star: 0,
    starDim: 0,
    moon: 0,
    moonShade: 0,
    cloud: pack("#ffffff"),
    cloudShade: pack("#d3e9fb"),
    far: pack("#8fb0d0"),
    farSnow: pack("#eef6fc"),
    rock: pack("#3a4756"),
    rockShade: pack("#27313d"),
    snow: pack("#ffffff"),
    snowShade: pack("#c9dceb"),
    slope: pack("#eef2f5"),
    trail: pack("#c3cfda"),
    flakeSky: pack("#ffffff"),
    flakeSlope: pack("#aebfd0"),
    spray: pack("#b7c8d7"),
    sprayClump: pack("#8fa6bb"),
    outline: 0,
    finishA: pack("#0b0d10"),
    finishB: pack("#ffffff"),
    sprite: sprite("#ff2e1f", "#b81a10", "#1640ff"),
    night,
  };
}

interface BakedSprite {
  w: number;
  h: number;
  px: Uint32Array;
  outline: Uint8Array;
}

function bake(s: CompiledSprite, pal: Palette): BakedSprite {
  const px = new Uint32Array(s.w * s.h);
  for (let i = 0; i < px.length; i++) {
    const k = s.keys[i];
    px[i] = k ? (pal.sprite[k] ?? 0) : 0;
  }
  return { w: s.w, h: s.h, px, outline: s.outline };
}

const SKIER_BITMAPS = {
  tuck: SKIER_TUCK,
  left: SKIER_CARVE_LEFT,
  right: SKIER_CARVE_RIGHT,
  skidL: SKIER_SKID_LEFT,
  skidR: SKIER_SKID_RIGHT,
  stopL: SKIER_STOP_LEFT,
  stopR: SKIER_STOP_RIGHT,
  parkL: SKIER_PARK_LEFT,
  parkR: SKIER_PARK_RIGHT,
  stepoutL: SKIER_STEPOUT_LEFT,
  stepoutR: SKIER_STEPOUT_RIGHT,
  stand: WALKER_STAND,
  walkL: WALKER_STEP_L,
  walkR: WALKER_STEP_R,
  waveA: WALKER_WAVE_A,
  waveB: WALKER_WAVE_B,
  prop: SKI_PROP,
};
/** Walk cycle, indexed by distance travelled / STRIDE. */
const WALK_CYCLE: readonly SkierPose[] = ["walkL", "stand", "walkR", "stand"];
type SkierPose = keyof typeof SKIER_BITMAPS;

const COMPILED = {
  skier: Object.fromEntries(
    Object.entries(SKIER_BITMAPS).map(([k, b]) => [k, compileSprite(b)])
  ) as Record<SkierPose, CompiledSprite>,
  pines: PINES.map(compileSprite),
};

/* ------------------------------------------------------------------------- */
/* Deterministic noise                                                        */
/* ------------------------------------------------------------------------- */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Jagged 1-D ridge via midpoint displacement, values in [0,1]. */
function ridge(width: number, seed: number, rough: number): Float32Array {
  const rand = mulberry32(seed);
  let size = 1;
  while (size < width) size <<= 1;
  const h = new Float32Array(size + 1);
  h[0] = rand();
  h[size] = rand();
  let amp = 0.5;
  for (let step = size; step > 1; step >>= 1) {
    const half = step >> 1;
    for (let i = half; i < size; i += step) {
      h[i] = (h[i - half] + h[i + half]) / 2 + (rand() - 0.5) * amp;
    }
    amp *= rough;
  }
  let lo = Number.POSITIVE_INFINITY;
  let hi = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < width; i++) {
    lo = Math.min(lo, h[i]);
    hi = Math.max(hi, h[i]);
  }
  const out = new Float32Array(width);
  for (let i = 0; i < width; i++) out[i] = (h[i] - lo) / (hi - lo || 1);
  return out;
}

/* ------------------------------------------------------------------------- */
/* Scene state                                                                */
/* ------------------------------------------------------------------------- */

interface Tree {
  row: number; // page row of the trunk base
  col: number; // centre column
  kind: number; // index into PINES
  depth: number; // parallax factor
  alpha: number;
}

interface Scene {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  img: ImageData | null;
  buf: Uint32Array;
  W: number;
  H: number;
  PX: number;
  vw: number;
  vh: number;
  mobile: boolean;
  reduced: boolean;
  pal: Palette;
  skier: Record<SkierPose, BakedSprite>;
  pines: BakedSprite[];
  /** skier sprite top, in screen rows */
  anchorRow: number;
  /** canvas-px x of the skier centre along the run, per page row */
  pathX: Float32Array;
  visited: Uint8Array;
  lastFeetRow: number;
  trees: Tree[];
  far: Float32Array;
  near: Float32Array;
  horizon0: number;
  heroTop: number;
  heroScroll: number;
  stars: Array<[number, number, number]>;
  flakes: Float32Array; // x, y, speed, depth, phase
  spray: Float32Array; // see SPRAY_STRIDE
  sprayHead: number;
  pose: SkierPose;
  /** page row of the finish line (-1 = no finish on this page) */
  finishRow: number;
  /** feet row where the skis start to come round */
  brakeRow: number;
  /** feet row where the skier comes to rest */
  stopRow: number;
  /** -1: skis end pointing to the viewer's left, 1: right */
  stopDir: number;
  /** canvas x of the line between the finish posts */
  finishX: number;
  /** previous frame's feet row past brakeRow (NaN = unknown) */
  lastDu: number;
  /** keep drawing every frame until this rAF time (finish burst) */
  burstUntil: number;
  /** false when there's no SAY HI spot below the finish to walk to */
  walk: boolean;
  /** walker centre x per page row, from walkRow0 to waveRow */
  walkX: Float32Array;
  /** cumulative path length (canvas px) along walkX */
  walkDist: Float32Array;
  /** feet row where the walk starts (just in front of the planted skis) */
  walkRow0: number;
  /** run row (scroll-pinned feet row) where walking starts / arrives */
  walkStart: number;
  arrive: number;
  /** feet row and centre x at the SAY HI block */
  waveRow: number;
  waveX: number;
  /** boot prints: [row, col] pairs in page space, in walking order */
  prints: Int32Array;
  printN: number;
  /** how many prints have been walked so far (persist like the trail) */
  printsShown: number;
  /** the idle loop has parked: hold the still pose */
  idle: boolean;
  lastY: number;
  lastDraw: number;
  layoutKey: string;
}

function readPalette(): Palette {
  return buildPalette(document.documentElement.classList.contains("dark"));
}

function bakeAll(scene: Scene) {
  scene.skier = Object.fromEntries(
    Object.entries(COMPILED.skier).map(([k, c]) => [k, bake(c, scene.pal)])
  ) as Record<SkierPose, BakedSprite>;
  scene.pines = COMPILED.pines.map((p) => bake(p, scene.pal));
}

/* ------------------------------------------------------------------------- */
/* Measure: everything that needs layout reads                                */
/* ------------------------------------------------------------------------- */

interface Ctrl {
  y: number;
  x: number;
  gate: boolean;
}

function measure(scene: Scene, f: ScrollFrame) {
  const { vw, vh, docH } = f;
  const dpr = window.devicePixelRatio || 1;
  // Snap so one canvas pixel is an integer number of device pixels.
  const PX = Math.max(1, Math.round(PIXEL * dpr)) / dpr;
  const W = Math.ceil(vw / PX);
  const H = Math.ceil(vh / PX);
  const mobile = vw < MOBILE_BP;

  scene.vw = vw;
  scene.vh = vh;
  scene.PX = PX;
  scene.mobile = mobile;
  scene.reduced = prefersReducedMotion();

  if (scene.W !== W || scene.H !== H || !scene.img) {
    scene.W = W;
    scene.H = H;
    scene.canvas.width = W;
    scene.canvas.height = H;
    scene.canvas.style.width = `${W * PX}px`;
    scene.canvas.style.height = `${H * PX}px`;
    scene.img = scene.ctx.createImageData(W, H);
    scene.buf = new Uint32Array(scene.img.data.buffer);
  }

  const spriteH = scene.skier.tuck.h;
  scene.anchorRow = Math.round((vh * (mobile ? 0.62 : 0.38)) / PX);
  const feetScreenRow = scene.anchorRow + spriteH - 1;

  // --- hero camera
  const hero = document.getElementById("summit");
  const scrollY = window.scrollY;
  if (hero) {
    const r = hero.getBoundingClientRect();
    const pin = hero.firstElementChild as HTMLElement | null;
    scene.heroTop = r.top + scrollY;
    scene.heroScroll = Math.max(1, r.height - (pin?.offsetHeight || vh));
  } else {
    scene.heroTop = 0;
    scene.heroScroll = 1;
  }
  scene.horizon0 = Math.max(
    feetScreenRow + 8,
    Math.round(H * (mobile ? 0.82 : 0.62))
  );

  // --- the line: control points from lanes + slalom poles
  const pts: Ctrl[] = [];
  const sections = document.querySelectorAll<HTMLElement>("[data-run]");
  const laneStep = mobile ? 240 : 320;
  for (const s of sections) {
    const r = s.getBoundingClientRect();
    const top = r.top + scrollY;
    const bottom = top + r.height;
    if (s.dataset.run === "gates") {
      const poles = s.querySelectorAll<HTMLElement>("[data-gate]");
      const off = mobile ? 42 : 56;
      let prev: Ctrl | null = null;
      for (const p of poles) {
        const pr = p.getBoundingClientRect();
        if (pr.width === 0 && pr.height === 0) continue;
        const px = pr.left + pr.width / 2;
        // Pass the pole where it is planted in the snow, below its flag.
        const py = pr.bottom + scrollY - (mobile ? 22 : 30);
        const side = p.dataset.gate;
        const x = mobile || side === "left" ? px + off : px - off;
        const c = { y: py, x, gate: true };
        if (mobile && prev) {
          // Swing out between gates so the trail keeps its S on a phone.
          pts.push({ y: (prev.y + py) / 2, x: vw * 0.62, gate: true });
        }
        pts.push(c);
        prev = c;
      }
    } else {
      const lane =
        Number.parseFloat(
          (mobile ? s.dataset.laneM : s.dataset.lane) ?? "0.8"
        ) * vw;
      const carve =
        Number.parseFloat(s.dataset.carve ?? "1") * (mobile ? 14 : 28);
      if (carve === 0) {
        pts.push({ y: top, x: lane, gate: false });
        pts.push({ y: bottom, x: lane, gate: false });
      } else {
        let k = 0;
        for (let y = top; y <= bottom; y += laneStep, k++) {
          pts.push({ y, x: lane + (k % 2 ? carve : -carve), gate: false });
        }
      }
    }
  }
  // Give the skier room to set up for the first gate and exit the last one.
  const gateYs = pts.filter((p) => p.gate).map((p) => p.y);
  const clear = mobile ? 160 : 300;
  const ctrl = pts
    .filter((p) => p.gate || !gateYs.some((g) => Math.abs(g - p.y) < clear))
    .sort((a, b) => a.y - b.y);

  const rows = Math.ceil(docH / PX) + H + 2;
  const pathX = new Float32Array(rows);
  const halfW = (scene.skier.tuck.w / 2 + 2) * PX;
  if (ctrl.length === 0) {
    pathX.fill((vw * 0.8) / PX);
  } else {
    let j = 0;
    for (let r = 0; r < rows; r++) {
      const y = r * PX;
      while (j < ctrl.length - 2 && ctrl[j + 1].y < y) j++;
      let x: number;
      if (y <= ctrl[0].y) x = ctrl[0].x;
      else if (y >= ctrl[ctrl.length - 1].y) x = ctrl[ctrl.length - 1].x;
      else {
        const a = ctrl[j];
        const b = ctrl[j + 1];
        const t = clamp((y - a.y) / (b.y - a.y || 1), 0, 1);
        const s = t * t * (3 - 2 * t);
        x = a.x + (b.x - a.x) * s;
      }
      pathX[r] = clamp(x, halfW, vw - halfW) / PX;
    }
  }
  // --- finish line: carve in, hockey stop just past the line, then park.
  scene.finishRow = -1;
  scene.lastDu = Number.NaN;
  const fin = document.querySelector<HTMLElement>("[data-finish-line]");
  const finR = fin?.getBoundingClientRect();
  if (finR && (finR.width > 0 || finR.height > 0)) {
    const lineRow = Math.round((finR.top + scrollY) / PX);
    const brake = lineRow + 2;
    const stop = brake + STOP_D;
    if (brake > FINISH_APPROACH && stop < rows) {
      const lo = halfW / PX;
      const hi = (vw - halfW) / PX;
      const xb = pathX[brake];
      // Skis come round with the tips toward the middle of the page.
      const dir = xb > W / 2 ? -1 : 1;
      // Set-up: swing out, then carve back toward the tips' side so the
      // last turn flows into the stop.
      const amp = mobile ? 6 : 10;
      const a0 = brake - FINISH_APPROACH;
      for (let r = a0; r <= brake; r++) {
        const t = (r - a0) / FINISH_APPROACH;
        pathX[r] = clamp(pathX[r] - dir * amp * Math.sin(Math.PI * t), lo, hi);
      }
      // Skidding: a little sideways drift toward the tips, then rest.
      const drift = 3;
      for (let r = brake + 1; r < rows; r++) {
        const t = Math.min(1, (r - brake) / STOP_D);
        pathX[r] = clamp(xb + dir * drift * t * (2 - t), lo, hi);
      }
      scene.finishRow = lineRow;
      scene.brakeRow = brake;
      scene.stopRow = stop;
      scene.stopDir = dir;
      scene.finishX = Math.round(pathX[lineRow]);
    }
  }
  scene.pathX = pathX;
  measureWalk(scene, f, feetScreenRow);

  // Layout changed → old tracks no longer line up; start a fresh trail.
  const layoutKey = `${W}x${Math.round(docH / 50)}`;
  if (layoutKey !== scene.layoutKey) {
    scene.layoutKey = layoutKey;
    scene.visited = new Uint8Array(Math.min(TRAIL_CAP, rows));
    scene.lastFeetRow = -1;
    scene.printsShown = 0;
  }

  // --- ridge lines (summit sits under the skier at scroll 0)
  const summitCol = Math.round(pathX[feetScreenRow] ?? W * 0.8);
  const peakH = scene.horizon0 - (feetScreenRow + 1);
  const farN = ridge(W, 7, 0.62);
  const nearN = ridge(W, 31, 0.58);
  const far = new Float32Array(W);
  const near = new Float32Array(W);
  for (let x = 0; x < W; x++) {
    far[x] = Math.round(peakH * (0.35 + farN[x] * 0.85));
    const base = peakH * (0.12 + nearN[x] * 0.62);
    const d = Math.abs(x - summitCol);
    // A little plateau for the skier to stand on, then jagged flanks.
    const peak = d <= 4 ? peakH : peakH - (d - 4) * 0.9 - (d % 3 === 0 ? 1 : 0);
    near[x] = Math.round(Math.max(base, peak));
  }
  scene.far = far;
  scene.near = near;

  // stars (night) — positions relative to the horizon so they pitch away too
  const rand = mulberry32(99);
  scene.stars = [];
  for (let i = 0; i < Math.round((W * scene.horizon0) / 140); i++) {
    scene.stars.push([
      Math.floor(rand() * W),
      Math.floor(rand() * scene.horizon0 * 0.8),
      rand(),
    ]);
  }

  // --- trees along the piste edges, outside the content column
  // With the trail-map rail on screen, the right-hand tree line moves in to
  // the gap between the text column and the skier's lane.
  const railOn = vw >= 1024;
  const measureEl = document.querySelector<HTMLElement>("#the-line .d-measure");
  const measureRight = measureEl
    ? measureEl.getBoundingClientRect().right / PX
    : W * 0.7;
  const laneLeft = (vw * 0.84 - 72) / PX;
  const col = document.querySelector<HTMLElement>("#gates .d-container");
  let colLeft = (vw * 0.06) / PX;
  let colRight = (vw * 0.94) / PX;
  if (col) {
    const cr = col.getBoundingClientRect();
    const cs = getComputedStyle(col);
    colLeft = (cr.left + Number.parseFloat(cs.paddingLeft)) / PX;
    colRight = (cr.right - Number.parseFloat(cs.paddingRight)) / PX;
  }
  const trand = mulberry32(1337);
  const trees: Tree[] = [];
  const docRows = Math.ceil(docH / PX);
  for (let row = 10; row < docRows; row += 14 + Math.floor(trand() * 26)) {
    for (const side of [0, 1]) {
      const roll = trand();
      const kind = roll < 0.45 ? 0 : roll < 0.8 ? 1 : 2;
      const w = COMPILED.pines[kind].w;
      let lo: number;
      let hi: number;
      if (mobile) {
        if (trand() > 0.3) continue;
        lo = side === 0 ? -w / 2 : W - w / 2;
        hi = side === 0 ? 1 : W + 1;
      } else if (side === 0) {
        lo = w / 2 + 1;
        hi = colLeft - w / 2 - 2;
      } else if (railOn) {
        lo = measureRight + w / 2 + 6;
        hi = laneLeft - w / 2;
      } else {
        lo = colRight + w / 2 + 2;
        hi = W - w / 2 - 1;
      }
      if (hi - lo < 1) {
        trand();
        continue;
      }
      trees.push({
        row: row + Math.floor(trand() * 10),
        col: Math.round(lo + trand() * (hi - lo)),
        kind,
        depth: kind === 0 ? 0.9 : kind === 1 ? 0.95 : 1,
        alpha: mobile ? 90 : 255,
      });
    }
  }
  scene.trees = trees;
}

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * The walk from the planted skis to the spot beside SAY HI: a lane down the
 * open side of the slope, then a turn in to stand right of the block with
 * the soles on its bottom edge. All page-space, derived from layout only.
 */
function measureWalk(scene: Scene, f: ScrollFrame, feetScreenRow: number) {
  scene.walk = false;
  if (scene.finishRow < 0) return;
  const spot = document.querySelector<HTMLElement>("[data-wave-spot]");
  const sr = spot?.getBoundingClientRect();
  if (!sr || (sr.width === 0 && sr.height === 0)) return;
  const { PX, W, mobile } = scene;
  const scrollY = window.scrollY;
  const standW = COMPILED.skier.stand.w;
  // Body is centred on column 7 of every on-foot frame.
  const half = 7;
  const leftPx = Math.min(sr.right + WAVE_GAP, f.vw - standW * PX - 2);
  const waveX = Math.round(leftPx / PX) + half;
  const waveRow = Math.round((sr.bottom + scrollY) / PX) - 1;

  const propX = scene.pathX[scene.stopRow];
  const dir = scene.stopDir;
  const x0 = clamp(Math.round(propX + dir * PLANT_OFF), half, W - half);
  const r0 = scene.stopRow + 2;
  const n = waveRow - r0;
  if (n < 30) return;

  // Desktop: straight down the skier's lane (right of the text column), a
  // touch further from the skis. Phone: the right edge, the only open strip.
  const lane = mobile
    ? W - half - 1
    : clamp(Math.round(propX + dir * 16), half, W - half);
  const lead = Math.min(n * 0.3, 50);
  const ap = clamp(Math.abs(lane - waveX) * 0.8, 30, n * 0.5);
  const apStart = n - ap;
  const walkX = new Float32Array(n + 1);
  const walkDist = new Float32Array(n + 1);
  for (let i = 0; i <= n; i++) {
    let x = lane;
    if (i < lead) x = x0 + (lane - x0) * smooth(i / lead);
    if (i > apStart) x = lane + (waveX - lane) * smooth((i - apStart) / ap);
    walkX[i] = x;
    if (i > 0) walkDist[i] = walkDist[i - 1] + Math.hypot(1, x - walkX[i - 1]);
  }

  // Boot prints, alternating feet, one per stride.
  const prints = new Int32Array(PRINT_CAP * 2);
  let pn = 0;
  let next = STRIDE;
  for (let i = 1; i <= n && pn < PRINT_CAP; i++) {
    while (walkDist[i] >= next && pn < PRINT_CAP) {
      prints[pn * 2] = r0 + i;
      prints[pn * 2 + 1] = Math.round(walkX[i] + (pn & 1 ? 2 : -3));
      pn++;
      next += STRIDE;
    }
  }

  // Scroll timing. The walk starts where the stop sequence leaves off and
  // arrives with the spot ~70% down the screen, never later than the end
  // of the page (so the wave is always reachable).
  const lastRun = Math.floor(Math.max(0, f.docH - f.vh) / PX) + feetScreenRow;
  const start = scene.brakeRow + WALK_DU;
  let arrive = Math.min(
    lastRun - 6,
    Math.round((waveRow * PX - f.vh * 0.7) / PX) + feetScreenRow
  );
  if (arrive < start + MIN_WALK)
    arrive = Math.min(lastRun - 6, start + MIN_WALK);
  if (arrive < start + 10) return;

  scene.walk = true;
  scene.walkX = walkX;
  scene.walkDist = walkDist;
  scene.walkRow0 = r0;
  scene.walkStart = start;
  scene.arrive = arrive;
  scene.waveRow = waveRow;
  scene.waveX = waveX;
  scene.prints = prints;
  scene.printN = pn;
}

/* ------------------------------------------------------------------------- */
/* Draw                                                                       */
/* ------------------------------------------------------------------------- */

function blit(
  scene: Scene,
  s: BakedSprite,
  left: number,
  top: number,
  clipTop: number,
  alpha = 255,
  outline = 0
) {
  const { buf, W, H } = scene;
  if (outline) {
    const ow = s.w + 2;
    for (let y = 0; y < s.h + 2; y++) {
      const sy = top + y - 1;
      if (sy < clipTop || sy >= H) continue;
      for (let x = 0; x < ow; x++) {
        const sx = left + x - 1;
        if (sx < 0 || sx >= W || !s.outline[y * ow + x]) continue;
        buf[sy * W + sx] = outline;
      }
    }
  }
  for (let y = 0; y < s.h; y++) {
    const sy = top + y;
    if (sy < clipTop || sy >= H) continue;
    const rowOff = y * s.w;
    for (let x = 0; x < s.w; x++) {
      const sx = left + x;
      if (sx < 0 || sx >= W) continue;
      const c = s.px[rowOff + x];
      if (c) buf[sy * W + sx] = alpha === 255 ? c : withAlpha(c, alpha);
    }
  }
}

function drawSky(scene: Scene, horizon: number, shift: number) {
  const { buf, W, pal, horizon0 } = scene;
  const top = Math.max(0, Math.min(horizon, scene.H));
  for (let y = 0; y < top; y++) {
    // position within the (moving) sky: 0 at zenith, 1 at horizon
    const t = clamp((y + shift) / horizon0, 0, 1) * 2;
    const band = t < 1 ? 0 : 1;
    const f = t - band;
    const lo = pal.sky[band];
    const hi = pal.sky[band + 1];
    const row = y * W;
    const by = (y & 3) << 2;
    for (let x = 0; x < W; x++) {
      buf[row + x] = f > BAYER4[by | (x & 3)] ? hi : lo;
    }
  }

  if (pal.night) {
    for (const [sx, sy, tw] of scene.stars) {
      const y = sy - shift;
      if (y < 0 || y >= top - scene.near[sx] - 2) continue;
      buf[y * W + sx] = tw > 0.7 ? pal.star : pal.starDim;
    }
    // pixel crescent moon
    const mx = Math.round(W * 0.16);
    const my = Math.round(horizon0 * 0.22) - shift;
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        if (dx * dx + dy * dy > 18) continue;
        const inShadow = (dx + 2) * (dx + 2) + (dy - 1) * (dy - 1) <= 12;
        if (inShadow) continue;
        const y = my + dy;
        const x = mx + dx;
        if (y < 0 || y >= top || x < 0 || x >= W) continue;
        buf[y * W + x] = dx < -1 ? pal.moonShade : pal.moon;
      }
    }
  } else {
    // two chunky pixel clouds
    const clouds: Array<[number, number, number]> = [
      [0.12, 0.2, 1],
      [0.58, 0.1, 0.7],
    ];
    for (const [cxF, cyF, sc] of clouds) {
      const cx = Math.round(W * cxF);
      const cy = Math.round(horizon0 * cyF) - shift;
      const puffs: Array<[number, number, number]> = [
        [0, 0, 5],
        [6, -2, 6],
        [13, 0, 5],
        [-6, 1, 3],
        [18, 1, 3],
      ];
      for (const [px, py, r] of puffs) {
        const rr = Math.round(r * sc);
        for (let dy = -rr; dy <= 1; dy++) {
          for (let dx = -rr * 2; dx <= rr * 2; dx++) {
            if ((dx * dx) / 4 + dy * dy > rr * rr) continue;
            const x = cx + Math.round(px * sc) + dx;
            const y = cy + py + dy;
            if (y < 0 || y >= top || x < 0 || x >= W) continue;
            buf[y * W + x] = dy >= 0 ? pal.cloudShade : pal.cloud;
          }
        }
      }
    }
  }
}

function drawRidges(scene: Scene, horizon: number) {
  const { buf, W, H, pal, far, near } = scene;
  if (horizon <= 0) return;
  for (let x = 0; x < W; x++) {
    // far range: flat tone with a dithered snow cap
    const fTop = horizon - far[x];
    for (let y = Math.max(0, fTop); y < Math.min(horizon, H); y++) {
      const depth = y - fTop;
      const snowy =
        depth < 3 || (depth < 6 && BAYER4[((y & 3) << 2) | (x & 3)] > 0.5);
      buf[y * W + x] = snowy ? pal.farSnow : pal.far;
    }
  }
  let lit = true;
  for (let x = 0; x < W; x++) {
    const h = near[x];
    const nTop = horizon - h;
    // Light from the upper left: faces rising to the right are lit. Use a
    // wider window + carry-over so flat stretches don't stripe.
    const d = near[Math.min(W - 1, x + 2)] - near[Math.max(0, x - 2)];
    if (d > 0) lit = true;
    else if (d < 0) lit = false;
    const cap = Math.max(2, Math.round(h * 0.28));
    for (let y = Math.max(0, nTop); y < Math.min(horizon, H); y++) {
      const depth = y - nTop;
      const fromBase = horizon - y;
      const b = BAYER4[((y & 3) << 2) | (x & 3)];
      let c: number;
      if (fromBase <= 2) c = pal.snow;
      else if (depth < cap) c = lit ? pal.snow : pal.snowShade;
      else if (depth < cap + 3 && b < 0.5 - (depth - cap) * 0.15)
        c = lit ? pal.snow : pal.snowShade;
      else c = lit ? pal.rock : pal.rockShade;
      buf[y * W + x] = c;
    }
  }
}

function drawTrees(scene: Scene, scrollRow: number, clipTop: number) {
  const { trees, pines, H } = scene;
  for (const t of trees) {
    const sprite = pines[t.kind];
    const bottom = Math.round(t.row - scrollRow * t.depth);
    const top = bottom - sprite.h + 1;
    if (bottom < clipTop || top >= H) continue;
    blit(scene, sprite, t.col - (sprite.w >> 1), top, clipTop, t.alpha);
  }
}

function drawTrail(
  scene: Scene,
  scrollRow: number,
  clipTop: number,
  maskTop: number,
  maskBottom: number
) {
  const { buf, W, H, visited, pathX, pal } = scene;
  const fin = scene.finishRow >= 0;
  let prev = -1;
  for (let sy = Math.max(0, clipTop); sy < H; sy++) {
    const r = scrollRow + sy;
    if (
      r < 0 ||
      r >= visited.length ||
      !visited[r] ||
      (fin && r > scene.stopRow)
    ) {
      prev = -1;
      continue;
    }
    const x = Math.round(pathX[r]);
    if (fin && r > scene.brakeRow) {
      // Hockey-stop skid: the two tracks smear into one sideways scrape as
      // the skis come round. Dithered in page space so it doesn't shimmer.
      const t = (r - scene.brakeRow) / STOP_D;
      const hw = Math.round(3 + t * 8);
      const by = (r & 3) << 2;
      const fill = 0.3 + 0.65 * t;
      for (let xx = x - hw; xx <= x + hw; xx++) {
        if (xx < 0 || xx >= W) continue;
        const edge = xx === x - hw || xx === x + hw;
        if (edge || BAYER4[by | (xx & 3)] < fill) buf[sy * W + xx] = pal.trail;
      }
      prev = x;
      continue;
    }
    // tracks run behind the skier's body, not through it
    if (sy >= maskTop && sy <= maskBottom) {
      prev = x;
      continue;
    }
    for (const off of [-3, 2]) {
      const cx = x + off;
      const from = prev < 0 ? cx : Math.min(prev + off, cx);
      const to = prev < 0 ? cx : Math.max(prev + off, cx);
      for (let xx = from; xx <= to; xx++) {
        if (xx >= 0 && xx < W) buf[sy * W + xx] = pal.trail;
      }
    }
    prev = x;
  }
}

/** Reduced motion: the skier holds a static lane near the right edge. */
function reducedX(scene: Scene): number {
  return (scene.vw - (scene.vw >= 1024 ? 132 : 44)) / scene.PX;
}

/** Checkered finish strip across the slope, with a striped post each side. */
function drawFinish(scene: Scene, scrollRow: number, clipTop: number) {
  if (scene.finishRow < 0) return;
  const { buf, W, H, pal } = scene;
  const top = scene.finishRow - scrollRow - 2;
  if (top + 4 <= clipTop || top - 14 >= H) return;
  for (let y = 0; y < 4; y++) {
    const sy = top + y;
    if (sy < clipTop || sy >= H) continue;
    const row = sy * W;
    for (let x = 0; x < W; x++) {
      buf[row + x] = ((x >> 1) + (y >> 1)) & 1 ? pal.finishA : pal.finishB;
    }
  }
  const red = pal.sprite.R;
  const white = pal.sprite.W;
  const ink = pal.night ? pal.outline : pal.sprite.K;
  const cx = scene.reduced ? Math.round(reducedX(scene)) : scene.finishX;
  for (const side of [-1, 1]) {
    const px = clamp(cx + side * 16, 1, W - 3);
    for (let y = -14; y < 4; y++) {
      const sy = top + y;
      if (sy < clipTop || sy >= H) continue;
      // cap, red/white bands, planted foot
      const c = y === -14 ? ink : ((y + 14) >> 1) & 1 ? white : red;
      buf[sy * W + px] = c;
      buf[sy * W + px + 1] = c;
    }
  }
}

function emitSpray(
  scene: Scene,
  x: number,
  y: number,
  vx: number,
  vy: number,
  life: number,
  world: number,
  size: number,
  floor = Number.POSITIVE_INFINITY
) {
  const sp = scene.spray;
  const k = scene.sprayHead * SPRAY_STRIDE;
  scene.sprayHead = (scene.sprayHead + 1) % SPRAY_CAP;
  sp[k] = x;
  sp[k + 1] = y;
  sp[k + 2] = vx;
  sp[k + 3] = vy;
  sp[k + 4] = life;
  sp[k + 5] = world;
  sp[k + 6] = size;
  // particles that fall back below this row have landed in the snow
  sp[k + 7] = floor;
}

function draw(scene: Scene, f: ScrollFrame) {
  const { buf, W, H, PX, pal } = scene;
  buf.fill(0);

  const scrollRow = Math.floor(f.y / PX);

  // hero camera pitch
  const heroP = clamp((f.y - scene.heroTop) / scene.heroScroll, 0, 1);
  const pitch = clamp(heroP / 0.85, 0, 1);
  // Reduced motion: no camera move, the scene simply scrolls away.
  const shift = scene.reduced
    ? Math.min(scene.horizon0 + 2, scrollRow)
    : Math.round(pitch * pitch * (3 - 2 * pitch) * (scene.horizon0 + 2));
  const horizon = scene.horizon0 - shift;
  const clipTop = Math.max(0, horizon);

  if (horizon > 0) {
    drawSky(scene, horizon, shift);
    drawRidges(scene, horizon);
  }

  drawTrees(scene, scrollRow, clipTop);
  drawFinish(scene, scrollRow, clipTop);

  // --- skier
  const feetScreenRow = scene.anchorRow + scene.skier.tuck.h - 1;
  // Where the feet would be if the run never ended: pinned to the camera.
  const runRow = scrollRow + feetScreenRow;
  const fin = scene.finishRow >= 0;
  const brakeLen = 2 * STOP_D;
  const du = fin ? runRow - scene.brakeRow : -1;
  // Hockey stop, purely a function of scroll: constant deceleration from
  // the brake point, so the skier drifts up the screen and comes to rest
  // at stopRow, then rides up with the page.
  let feetRow = runRow;
  // 0 running · 1 skid · 2 stop · 3 parked
  let stage = 0;
  if (fin && scene.reduced) {
    if (runRow >= scene.stopRow) {
      feetRow = scene.stopRow;
      stage = 3;
    }
  } else if (fin && du > 0) {
    feetRow =
      du >= brakeLen
        ? scene.stopRow
        : Math.round(scene.brakeRow + du - (du * du) / (4 * STOP_D));
    stage = du >= brakeLen + PARK_AFTER ? 3 : du >= brakeLen * SKID_END ? 2 : 1;
  }
  runState.speed =
    stage === 3 ? 0 : stage > 0 ? clamp(1 - du / brakeLen, 0, 1) : 1;
  runState.walking = false;
  const feetScreen = feetRow - scrollRow;
  const side = scene.stopDir < 0 ? "L" : "R";
  let skierX: number;
  let pose: SkierPose = "tuck";
  let slope = 0;

  if (scene.reduced) {
    skierX = reducedX(scene);
    if (stage === 3) pose = `park${side}`;
  } else {
    const n = scene.pathX.length;
    const at = (r: number) => scene.pathX[clamp(r, 0, n - 1)];
    skierX = at(feetRow);
    if (stage > 0) {
      pose =
        stage === 1
          ? `skid${side}`
          : stage === 2
            ? `stop${side}`
            : `park${side}`;
    } else {
      slope = (at(feetRow + 6) - at(feetRow - 6)) / 12;
      const a = Math.abs(slope);
      if (heroP < 0.04 && scrollRow < 4) pose = "tuck";
      else if (scene.pose === "tuck")
        pose = a > 0.16 ? (slope > 0 ? "right" : "left") : "tuck";
      else pose = a < 0.1 ? "tuck" : slope > 0 ? "right" : "left";
    }
    scene.pose = pose;

    // carve the trail
    const visited = scene.visited;
    if (
      scene.lastFeetRow >= 0 &&
      Math.abs(feetRow - scene.lastFeetRow) < 2000
    ) {
      const lo = Math.min(feetRow, scene.lastFeetRow);
      const hi = Math.max(feetRow, scene.lastFeetRow);
      for (let r = lo; r <= hi && r < visited.length; r++) {
        if (r >= 0) visited[r] = 1;
      }
    } else if (feetRow >= 0 && feetRow < visited.length) {
      visited[feetRow] = 1;
    }
    scene.lastFeetRow = feetRow;
    drawTrail(
      scene,
      scrollRow,
      Math.max(clipTop, 0),
      feetScreen - scene.skier[pose].h + 3,
      feetScreen
    );
  }

  let body = scene.skier[pose];
  let left = Math.round(skierX - body.w / 2);
  let top = feetScreen - body.h + 1;

  // --- off the skis: step out, plant them, walk down to SAY HI and wave.
  // Positions are pure functions of scroll; only the wave uses the clock.
  if (stage === 3 && scene.walk) {
    const du3 = runRow - scene.brakeRow;
    const outline = pal.night ? pal.outline : 0;
    let onFoot: SkierPose | null = null;
    let x = 0;
    let row = 0;
    if (scene.reduced) {
      if (runRow >= scene.walkStart) {
        onFoot = "stand";
        x = scene.waveX;
        row = scene.waveRow;
      }
    } else if (du3 >= PLANT_DU) {
      const n = scene.walkX.length - 1;
      const t = clamp(
        (runRow - scene.walkStart) / (scene.arrive - scene.walkStart),
        0,
        1
      );
      const i = Math.round(t * n);
      x = scene.walkX[i];
      row = scene.walkRow0 + i;
      const dist = scene.walkDist[i];
      scene.printsShown = Math.max(
        scene.printsShown,
        Math.min(scene.printN, Math.floor(dist / STRIDE))
      );
      if (runRow >= scene.arrive) {
        onFoot =
          scene.idle || ((f.t / WAVE_MS) | 0) % 2 === 0 ? "waveB" : "waveA";
      } else if (t > 0) {
        onFoot = WALK_CYCLE[Math.floor(dist / STRIDE) & 3];
        runState.walking = true;
      } else {
        onFoot = "stand";
      }
      // boot prints
      for (let k = 0; k < scene.printsShown; k++) {
        const sy = scene.prints[k * 2] - scrollRow;
        const sx = scene.prints[k * 2 + 1];
        if (sy < clipTop || sy >= H || sx < 0 || sx + 1 >= W) continue;
        buf[sy * W + sx] = pal.trail;
        buf[sy * W + sx + 1] = pal.trail;
      }
    } else if (du3 >= STEPOUT_DU) {
      body = scene.skier[`stepout${side}`];
    }
    if (onFoot) {
      // the skis stay behind, planted where he stopped
      const prop = scene.skier.prop;
      blit(
        scene,
        prop,
        Math.round(skierX - prop.w / 2),
        scene.stopRow - scrollRow - prop.h + 1,
        clipTop,
        255,
        outline
      );
      body = scene.skier[onFoot];
      left = Math.round(x) - 7;
      top = row - scrollRow - body.h + 1;
    }
  }

  // --- snow spray: off the tails while carving, a sheet of it through the
  // skid, and one big burst the moment the skis bite at the finish.
  if (!scene.reduced) {
    const speed = Math.abs(f.vy);
    if ((pose === "left" || pose === "right") && speed > 0.2 && f.vy > 0) {
      const dir = pose === "right" ? -1 : 1;
      const count = speed > 1 ? 3 : 1;
      for (let i = 0; i < count; i++) {
        // a fan of powder thrown uphill, falling back under gravity
        emitSpray(
          scene,
          skierX + dir * (4 + Math.random() * 3),
          feetScreen - 1 - Math.random() * 3,
          dir * (0.006 + Math.random() * 0.03),
          -(0.012 + Math.random() * 0.04),
          380 + Math.random() * 200,
          0,
          1
        );
      }
    }
    if ((stage === 1 || stage === 2) && du < brakeLen && f.vy > 0.05) {
      // Sheet of snow off the edges while the skis scrape sideways.
      for (let i = 0; i < 2; i++) {
        const along = Math.random() * 2 - 1;
        emitSpray(
          scene,
          skierX + along * 9,
          feetRow - 1 - Math.random() * 2,
          along * 0.02 + (Math.random() - 0.5) * 0.02,
          -(0.02 + Math.random() * 0.04),
          360 + Math.random() * 220,
          1,
          1,
          feetRow + 1
        );
      }
    }
    const th = brakeLen * SKID_END;
    if (
      fin &&
      scene.lastDu < th &&
      du >= th &&
      feetScreen > -8 &&
      feetScreen < H + 24
    ) {
      // The stop: fan a big burst of powder up the hill from the skis.
      for (let i = 0; i < BURST; i++) {
        const along = Math.random() * 2 - 1;
        const ang = Math.PI * (1.06 + Math.random() * 0.88);
        const v = 0.04 + Math.random() * 0.07;
        emitSpray(
          scene,
          skierX + along * 10,
          feetRow - 1 - Math.random() * 3,
          Math.cos(ang) * v + along * 0.02 + scene.stopDir * 0.008,
          Math.sin(ang) * v - 0.01,
          550 + Math.random() * 450,
          1,
          Math.random() < 0.5 ? 2 : 1,
          feetRow + 1
        );
      }
      scene.burstUntil = f.t + BURST_MS;
    }
    scene.lastDu = du;

    const sp = scene.spray;
    for (let i = 0; i < SPRAY_CAP; i++) {
      const k = i * SPRAY_STRIDE;
      if (sp[k + 4] <= 0) continue;
      sp[k + 4] -= f.dt;
      sp[k] += sp[k + 2] * f.dt;
      sp[k + 1] += sp[k + 3] * f.dt;
      sp[k + 3] += 0.00018 * f.dt;
      if (sp[k + 1] > sp[k + 7]) {
        sp[k + 4] = 0;
        continue;
      }
      const x = Math.round(sp[k]);
      const y = Math.round(sp[k + 1] - (sp[k + 5] ? scrollRow : 0));
      const size = sp[k + 6];
      const c = size > 1 ? pal.sprayClump : pal.spray;
      for (let yy = y; yy < y + size; yy++) {
        if (yy < clipTop || yy >= H) continue;
        for (let xx = x; xx < x + size; xx++) {
          if (xx >= 0 && xx < W) buf[yy * W + xx] = c;
        }
      }
    }
  }

  blit(scene, body, left, top, 0, 255, pal.night ? pal.outline : 0);

  // --- falling snow
  if (!scene.reduced) {
    const fl = scene.flakes;
    const dy = (f.y - scene.lastY) / PX;
    const k = f.dt / 16;
    for (let i = 0; i < FLAKE_COUNT; i++) {
      const o = i * 5;
      const depth = fl[o + 3];
      fl[o + 1] += fl[o + 2] * k - dy * depth * 0.55;
      fl[o] += Math.sin(f.t * 0.0007 + fl[o + 4]) * 0.06 * k * depth;
      if (fl[o + 1] >= H) fl[o + 1] -= H;
      else if (fl[o + 1] < 0) fl[o + 1] += H;
      if (fl[o] >= W) fl[o] -= W;
      else if (fl[o] < 0) fl[o] += W;
      const x = fl[o] | 0;
      const y = fl[o + 1] | 0;
      const c = y < horizon ? pal.flakeSky : pal.flakeSlope;
      buf[y * W + x] = depth > 0.75 ? c : withAlpha(c, 150);
    }
  }
  scene.lastY = f.y;

  scene.ctx.putImageData(scene.img as ImageData, 0, 0);
}

/* ------------------------------------------------------------------------- */
/* Component                                                                  */
/* ------------------------------------------------------------------------- */

const IDLE_FRAME_MS = 66;
const IDLE_PARK_MS = 12_000;

export function PixelRun() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastMoveRef = useRef(0);
  const sceneRef = useRef<Scene | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;
    const pal = readPalette();
    const flakes = new Float32Array(FLAKE_COUNT * 5);
    const rand = mulberry32(4242);
    for (let i = 0; i < FLAKE_COUNT; i++) {
      flakes[i * 5] = rand() * 400;
      flakes[i * 5 + 1] = rand() * 300;
      flakes[i * 5 + 2] = 0.05 + rand() * 0.16;
      flakes[i * 5 + 3] = 0.35 + rand() * 0.65;
      flakes[i * 5 + 4] = rand() * Math.PI * 2;
    }
    const scene: Scene = {
      ctx,
      canvas,
      img: null,
      buf: new Uint32Array(0),
      W: 0,
      H: 0,
      PX: PIXEL,
      vw: 0,
      vh: 0,
      mobile: false,
      reduced: false,
      pal,
      skier: {} as Scene["skier"],
      pines: [],
      anchorRow: 0,
      pathX: new Float32Array(1),
      visited: new Uint8Array(1),
      lastFeetRow: -1,
      trees: [],
      far: new Float32Array(0),
      near: new Float32Array(0),
      horizon0: 0,
      heroTop: 0,
      heroScroll: 1,
      stars: [],
      flakes,
      spray: new Float32Array(SPRAY_CAP * SPRAY_STRIDE),
      sprayHead: 0,
      pose: "tuck",
      finishRow: -1,
      brakeRow: 0,
      stopRow: 0,
      stopDir: -1,
      finishX: 0,
      lastDu: Number.NaN,
      burstUntil: 0,
      walk: false,
      walkX: new Float32Array(1),
      walkDist: new Float32Array(1),
      walkRow0: 0,
      walkStart: 0,
      arrive: 1,
      waveRow: 0,
      waveX: 0,
      prints: new Int32Array(0),
      printN: 0,
      printsShown: 0,
      idle: false,
      lastY: window.scrollY,
      lastDraw: 0,
      layoutKey: "",
    };
    bakeAll(scene);
    sceneRef.current = scene;

    // Re-palette on theme flips (next-themes toggles the `dark` class).
    const mo = new MutationObserver(() => {
      const next = readPalette();
      if (next.night !== scene.pal.night) {
        scene.pal = next;
        bakeAll(scene);
        invalidate();
      }
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => invalidate();
    mq.addEventListener("change", onMotion);
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", onMotion);
      sceneRef.current = null;
    };
  }, []);

  useScrollFrame(
    (f) => {
      const scene = sceneRef.current;
      if (!scene?.img) return false;
      if (f.scrolling || !lastMoveRef.current) lastMoveRef.current = f.t;
      // The finish burst plays in real time: full frame rate until it's
      // done, then the idle/park logic below takes over again.
      scene.idle = false;
      if (f.scrolling || scene.reduced || f.t < scene.burstUntil) {
        scene.lastDraw = f.t;
        draw(scene, f);
        return !scene.reduced;
      }
      // Idle: snowfall at ~15fps, then park the loop so an untouched tab
      // doesn't burn battery. Scrolling or invalidate() wakes it again.
      const idleFor = f.t - lastMoveRef.current;
      const animating = idleFor < IDLE_PARK_MS;
      if (animating && f.t - scene.lastDraw < IDLE_FRAME_MS) return true;
      scene.lastDraw = f.t;
      // Last frame before parking: the waver holds a still, arm-up pose.
      scene.idle = !animating;
      draw(scene, f);
      return animating;
    },
    (f) => {
      const scene = sceneRef.current;
      if (scene) measure(scene, f);
    }
  );

  return (
    <div className="pixel-run-wrap" aria-hidden="true">
      <canvas ref={canvasRef} className="pixel-run" />
    </div>
  );
}
