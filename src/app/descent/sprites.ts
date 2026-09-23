/**
 * Hand-drawn pixel sprites for the DESCENT canvas.
 *
 * Each sprite is an array of equal-length strings. Every character maps to a
 * palette slot (see SpriteKey); "." is transparent. Palettes are resolved per
 * theme in PixelRun so the same bitmap works for day and night skiing.
 */

export type SpriteKey =
  | "K" // ink outline / boots / gloves
  | "R" // gate-red jacket
  | "D" // jacket shade
  | "B" // piste-blue pants
  | "N" // pants shade
  | "I" // ice goggles
  | "W" // white (helmet, glints, snow)
  | "F" // skin
  | "G" // pole shaft (metal)
  | "S" // ski base (red tip + ink)
  | "T" // pine needles
  | "t" // pine shade
  | "k" // trunk
  | "s"; // snow shadow on branches

export type Bitmap = readonly string[];

/**
 * Skier, front view (facing down the slope, toward the viewer).
 * TUCK: crouched, poles tucked under the arms and sticking out behind.
 */
export const SKIER_TUCK: Bitmap = [
  "G..............G",
  ".G....KKKK....G.",
  "..G..KWWWWK..G..",
  "..G.KWRRRRWK.G..",
  "...GKKKKKKKKG...",
  "...GKIIIIWIKG...",
  "...KKIIIIIIKK...",
  "..KRKKFFFFKKRK..",
  ".KRRRRKKKKRRRRK.",
  ".KRDRRRRRRRRDRK.",
  "KKKDRRRRRRRRDKKK",
  "KKK.KRRRRRRK.KKK",
  "...KBBBBBBBBK...",
  "..KBBNBKKBNBBK..",
  "..KBBK....KBBK..",
  "..KWWK....KWWK..",
  "..KWWK....KWWK..",
  "..KKKK....KKKK..",
  "...KK......KK...",
  "...KK......KK...",
  "...KK......KK...",
  "...RR......RR...",
];

/**
 * CARVE (moving to the viewer's right). Skis angled down-right, body angulated
 * into the hill (upper body to the left), inside pole planted, outside pole
 * trailing. The left-carving pose is this bitmap mirrored.
 */
export const SKIER_CARVE_RIGHT: Bitmap = [
  "....KKKK........",
  "...KWWWWK.......",
  "..KWRRRRWK......",
  "..KKKKKKKK......",
  "..KIIIWIIK......",
  "..KKIIIIKK......",
  "...KKFFKK.......",
  "..KRRKKRRKK.....",
  ".KRRRRRRRRRK....",
  ".KDRRRRRRRRRK...",
  "KKDDRRRRRRRRKKK.",
  "KKKDRRRRRRDKKKKG",
  "G.KKBBBBBBBBK.G.",
  "G..KBBNBBBNBK.G.",
  ".KKKBBKKBBK...G.",
  "...KWWKKBBK...G.",
  ".KK..KKKBBK....G",
  "...KK..KBBK....G",
  ".....KKKWWK....G",
  ".......KK..RR..K",
  ".........KK.....",
  "...........RR...",
];

/** Mirror a bitmap horizontally. */
export function mirror(bitmap: Bitmap): Bitmap {
  return bitmap.map((row) => row.split("").reverse().join(""));
}

export const SKIER_CARVE_LEFT: Bitmap = mirror(SKIER_CARVE_RIGHT);

/*
 * HOCKEY STOP. Upper body keeps facing down the fall line (toward the viewer)
 * while the legs twist the skis across the slope, tips to the viewer's left.
 * The right-hand versions are these bitmaps mirrored.
 */

/** SKID: skis swinging across, ~30° off horizontal, dropping into a crouch. */
export const SKIER_SKID_LEFT: Bitmap = [
  "..........KKKK......",
  ".........KWWWWK.....",
  "........KWRRRRWK....",
  "........KKKKKKKK....",
  "........KIIWIIIK....",
  "........KKIIIIKK....",
  ".........KKFFKK.....",
  ".......KKRRKKRRKK...",
  "......KRRRRRRRRRRK..",
  ".....KRDRRRRRRRRDRK.",
  "...KKKDRRRRRRRRRDKKK",
  "..KKK.KRRRRRRRRK.KKG",
  ".G...KBBBBBBBBBBK.G.",
  ".G..KBBNBBBBBBNBKG..",
  "G..KBBBBBBBBBBBBK...",
  "G..KBBBBKKKKKBBBBKKK",
  "G...KBBBK..KWWWKKK..",
  "....KBBBK.KKKKKK....",
  ".....KWWWKKKK.......",
  "..RR.KKKKKK.........",
  "....KKKK............",
  "RRKK................",
];

/** STOP: skis fully sideways, deep crouch, downhill pole planted. */
export const SKIER_STOP_LEFT: Bitmap = [
  "............KKKK......",
  "...........KWWWWK.....",
  "..........KWRRRRWK....",
  "..........KKKKKKKK....",
  "..........KIIWIIIK....",
  "..........KKIIIIKK....",
  "...........KKFFKK.....",
  ".........KKRRKKRRKK...",
  "........KRRRRRRRRRRK..",
  ".......KRDRRRRRRRRDRK.",
  ".....KKKDRRRRRRRRRDKKK",
  "...KKK.KRRRRRRRRRK.KKK",
  "..GK...KBBBBBBBBBBK.G.",
  "..G...KBBNBBBBBBNBBKG.",
  ".G...KBBBBBBBBBBBBBG..",
  ".G..KBBBBBKKKKKBBBBK..",
  "G...KBBBBK....KBBBBK..",
  "G....KBBBK....KBBBK...",
  "G....KWWWK....KWWWK...",
  "..RRKKKKKKKKKKKKKKKKKK",
  "RRKKKKKKKKKKKKKKKKKKK.",
];

/** PARKED: stopped, standing tall, skis across the hill, poles planted. */
export const SKIER_PARK_LEFT: Bitmap = [
  "..........KKKK........",
  ".........KWWWWK.......",
  "........KWRRRRWK......",
  "........KKKKKKKK......",
  "........KIIWIIIK......",
  "........KKIIIIKK......",
  ".........KKFFKK.......",
  ".......KKRRKKRRKK.....",
  "......KRRRRRRRRRRK....",
  ".....KRDRRRRRRRRDRK...",
  "....KRDRRRRRRRRRRDRK..",
  "....KRKDRRRRRRRRDKRK..",
  "...KKKKKDRRRRRRDKKKKK.",
  "...KKKKKBBBBBBBBKKKKK.",
  "...G...KBBNBBNBBK...G.",
  "...G...KBBBKKBBBK...G.",
  "..G....KBBBKKBBBK....G",
  "..G....KBBBKKBBBK....G",
  "..G....KWWWKKWWWK....G",
  ".G.....KKKKKKKKKK....G",
  "..RRKKKKKKKKKKKKKKKKKK",
  "RRKKKKKKKKKKKKKKKKKKK.",
];

export const SKIER_SKID_RIGHT: Bitmap = mirror(SKIER_SKID_LEFT);
export const SKIER_STOP_RIGHT: Bitmap = mirror(SKIER_STOP_LEFT);
export const SKIER_PARK_RIGHT: Bitmap = mirror(SKIER_PARK_LEFT);

/**
 * STEP OUT: the parked pose with the viewer's-right boot lifted clear of its
 * binding (the empty binding shows on the ski). Same grid as PARK so the
 * swap doesn't jump.
 */
export const SKIER_STEPOUT_LEFT: Bitmap = [
  "..........KKKK........",
  ".........KWWWWK.......",
  "........KWRRRRWK......",
  "........KKKKKKKK......",
  "........KIIWIIIK......",
  "........KKIIIIKK......",
  ".........KKFFKK.......",
  ".......KKRRKKRRKK.....",
  "......KRRRRRRRRRRK....",
  ".....KRDRRRRRRRRDRK...",
  "....KRDRRRRRRRRRRDRK..",
  "....KRKDRRRRRRRRDKRK..",
  "...KKKKKDRRRRRRDKKKKK.",
  "...KKKKKBBBBBBBBKKKKK.",
  "...G...KBBNBBNBBK...G.",
  "...G...KBBBKKBBBK...G.",
  "..G....KBBBKKWWWK....G",
  "..G....KBBBKKWWWK....G",
  "..G....KWWWKKKKKK....G",
  ".G.....KKKKK.GGG.....G",
  "..RRKKKKKKKKKKKKKKKKKK",
  "RRKKKKKKKKKKKKKKKKKKK.",
];
export const SKIER_STEPOUT_RIGHT: Bitmap = mirror(SKIER_STEPOUT_LEFT);

/*
 * ON FOOT (after the finish). Same helmet / goggles / jacket / pants as the
 * skier, white ski boots, no skis. Front view, walking toward the viewer.
 * All share one 14-wide grid with the soles on the last row, so frames can
 * be swapped without the feet jumping. The body sits in columns 1..12.
 */
const HEAD: Bitmap = [
  ".....KKKK.....",
  "....KWWWWK....",
  "...KWRRRRWK...",
  "...KKKKKKKK...",
  "...KIIWIIIK...",
  "...KKIIIIKK...",
  "....KKFFKK....",
];

/** Standing still, arms at the sides. Also the "passing" walk frame. */
export const WALKER_STAND: Bitmap = [
  ...HEAD,
  "..KKRRKKRRKK..",
  ".KRRRRRRRRRRK.",
  ".KRDRRRRRRDRK.",
  ".KRKDRRRRDKRK.",
  ".KRKRRRRRRKRK.",
  ".KDKRRRRRRKDK.",
  ".KKKDRRRRDKKK.",
  "..KKBBBBBBKK..",
  "...KBBNNBBK...",
  "...KBBKKBBK...",
  "...KBBKKBBK...",
  "...KBNKKNBK...",
  "..KWWWKKWWWK..",
  "..KWWWKKWWWK..",
  "..KKKKKKKKKK..",
];

/**
 * Stride: viewer's-left boot planted, the other lifted a pixel mid-step;
 * arms swing opposite (left hand back and hidden, right hand forward).
 */
export const WALKER_STEP_L: Bitmap = [
  ...HEAD,
  "..KKRRKKRRKK..",
  ".KRRRRRRRRRRK.",
  ".KRDRRRRRRDRK.",
  ".KRKDRRRRDKRK.",
  ".KDKRRRRRRKRK.",
  ".KKKRRRRRRKRK.",
  "...KDRRRRDKDK.",
  "..KKBBBBBBKKK.",
  "...KBBNNBBK...",
  "...KBBKKBBK...",
  "...KBBKKBBK...",
  "...KBNKKWWWK..",
  "..KWWWKKWWWK..",
  "..KWWWKKKKKK..",
  "..KKKKK.......",
];

/** Mirror only the body, so the goggle glint stays put while walking. */
function mirrorBody(bitmap: Bitmap): Bitmap {
  return [...HEAD, ...mirror(bitmap.slice(HEAD.length))];
}

export const WALKER_STEP_R: Bitmap = mirrorBody(WALKER_STEP_L);

/**
 * WAVE: right arm up, forearm rocking out (A) and upright (B). 18 wide; the
 * body occupies the same columns as the 14-wide frames so the figure stays
 * planted while the hand moves. B doubles as the held "still waving" pose.
 */
export const WALKER_WAVE_A: Bitmap = [
  ".....KKKK.........",
  "....KWWWWK.....KKK",
  "...KWRRRRWK...KKKK",
  "...KKKKKKKK..KRKKK",
  "...KIIWIIIK.KRRK..",
  "...KKIIIIKKKRRK...",
  "....KKFFKK.KRK....",
  "..KKRRKKRRKRRK....",
  ".KRRRRRRRRRRRK....",
  ".KRDRRRRRRDRK.....",
  ".KRKDRRRRRDK......",
  ".KRKRRRRRRK.......",
  ".KDKRRRRRRK.......",
  ".KKKDRRRRDK.......",
  "..KKBBBBBBKK......",
  "...KBBNNBBK.......",
  "...KBBKKBBK.......",
  "...KBBKKBBK.......",
  "...KBNKKNBK.......",
  "..KWWWKKWWWK......",
  "..KWWWKKWWWK......",
  "..KKKKKKKKKK......",
];

export const WALKER_WAVE_B: Bitmap = [
  ".....KKKK...KKK...",
  "....KWWWWK.KKKKK..",
  "...KWRRRRWK.KKK...",
  "...KKKKKKKK.KRK...",
  "...KIIWIIIK.KRK...",
  "...KKIIIIKK.KRK...",
  "....KKFFKK.KRRK...",
  "..KKRRKKRRKRRK....",
  ".KRRRRRRRRRRRK....",
  ".KRDRRRRRRDRK.....",
  ".KRKDRRRRRDK......",
  ".KRKRRRRRRK.......",
  ".KDKRRRRRRK.......",
  ".KKKDRRRRDK.......",
  "..KKBBBBBBKK......",
  "...KBBNNBBK.......",
  "...KBBKKBBK.......",
  "...KBBKKBBK.......",
  "...KBNKKNBK.......",
  "..KWWWKKWWWK......",
  "..KWWWKKWWWK......",
  "..KKKKKKKKKK......",
];

/**
 * The skis left behind: planted upright tails-down in a little snow pile
 * with the poles stuck in either side, like outside a lodge. (Not crossed:
 * crossed skis on a slope is the signal for an injured skier.) Base row
 * is the snow line.
 */
export const SKI_PROP: Bitmap = [
  ".K...RR.RR..K.",
  ".K...RR.RR..K.",
  ".G...KK.KK..G.",
  ".G...KK.KK..G.",
  ".G...KK.KK..G.",
  ".G...KK.KK..G.",
  ".G...KK.KK..G.",
  ".G...KK.KK..G.",
  ".G...KK.KK..G.",
  "..G..GW.WG.G..",
  "..G..GG.GG.G..",
  "..G..KK.KK.G..",
  "..G..KK.KK.G..",
  "..G..KK.KK.G..",
  "..G..KK.KK.G..",
  "..G..KK.KK.G..",
  "..G..KK.KK.G..",
  ".KKK.KK.KK.KKK",
  "..G..KK.KK.G..",
  "..G.sKK.KKsG..",
  "...sWWWWWWWs..",
  "..sWWWWWWWWWs.",
  ".ssssssssssss.",
];

/** Pixel pines, snow on the branch tips. Three sizes for depth. */
export const PINE_LARGE: Bitmap = [
  "......W......",
  ".....WTW.....",
  ".....TTT.....",
  "....WTtTW....",
  "....TTTTT....",
  "...WsTTtTW...",
  "...TTTTTTT...",
  "..WWTTtTTsW..",
  "...TTTTTtT...",
  "..WTTtTTTTW..",
  "..TTTTTTTtT..",
  ".WWsTTTtTTWW.",
  ".TTTTtTTTTTT.",
  "WTTTTTTTtTTTW",
  "TTtTTTTTTTtTT",
  ".....kkk.....",
  ".....kkk.....",
];

export const PINE_MEDIUM: Bitmap = [
  "....W....",
  "...WTW...",
  "...TTT...",
  "..WTtTW..",
  "..TTTTT..",
  ".WsTTtTW.",
  ".TTTTTTT.",
  "WTTtTTTsW",
  "TTTTTtTTT",
  "....k....",
  "....k....",
];

export const PINE_SMALL: Bitmap = [
  "...W...",
  "..WTW..",
  "..TTT..",
  ".WTtTW.",
  ".TTTTT.",
  "WTTtTTW",
  "...k...",
];

export const PINES: readonly Bitmap[] = [PINE_SMALL, PINE_MEDIUM, PINE_LARGE];

/** Ordered 4x4 Bayer matrix, normalised to (0, 1). */
export const BAYER4: readonly number[] = [
  0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5,
].map((v) => (v + 0.5) / 16);

export interface CompiledSprite {
  w: number;
  h: number;
  /** palette key per pixel, "" for transparent */
  keys: string[];
  /** 1 where a transparent pixel touches an opaque one (4-neighbourhood) */
  outline: Uint8Array;
}

/** Pre-parse a bitmap once so the hot loop only does array lookups. */
export function compileSprite(bitmap: Bitmap): CompiledSprite {
  const h = bitmap.length;
  const w = bitmap[0].length;
  const keys: string[] = new Array(w * h);
  for (let y = 0; y < h; y++) {
    const row = bitmap[y];
    for (let x = 0; x < w; x++) {
      const c = row[x] ?? ".";
      keys[y * w + x] = c === "." ? "" : c;
    }
  }
  // Outline is computed on a (w+2)x(h+2) grid so it can wrap the edges.
  const ow = w + 2;
  const oh = h + 2;
  const outline = new Uint8Array(ow * oh);
  const solid = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < w && y < h && keys[y * w + x] !== "";
  for (let y = -1; y <= h; y++) {
    for (let x = -1; x <= w; x++) {
      if (solid(x, y)) continue;
      if (
        solid(x - 1, y) ||
        solid(x + 1, y) ||
        solid(x, y - 1) ||
        solid(x, y + 1)
      ) {
        outline[(y + 1) * ow + (x + 1)] = 1;
      }
    }
  }
  return { w, h, keys, outline };
}
