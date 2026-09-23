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
