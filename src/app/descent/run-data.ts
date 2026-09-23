import { RESUME_DATA } from "@/data/resume-data";

/**
 * Everything the DESCENT page derives from RESUME_DATA lives here, so the
 * components never hardcode resume content.
 */

export const NOW_YEAR = new Date().getFullYear();

const years = [...RESUME_DATA.work, ...RESUME_DATA.education]
  .map((e) => Number.parseInt(e.start, 10))
  .filter((n) => Number.isFinite(n));

/** Base lodge = the earliest start year on the resume. */
export const BASE_YEAR = years.length ? Math.min(...years) : NOW_YEAR;

/** Summit/base elevations for the HUD altimeter (metres). */
export const ALT_TOP = 3642;
export const ALT_BASE = 1203;

/** Split `Mingjia "Jacky" Guan` into its parts. */
export function nameParts(full: string) {
  const nick = full.match(/["“](.+?)["”]/)?.[1] ?? null;
  const plain = full
    .replace(/\s*["“].+?["”]\s*/, " ")
    .trim()
    .split(/\s+/);
  const first = plain[0] ?? full;
  const last = plain.length > 1 ? plain[plain.length - 1] : "";
  return { first, last, nick, plain: plain.join(" ") };
}

export const NAME = nameParts(RESUME_DATA.name);

export function yearSpan(start: string, end: string | null) {
  const e = end ?? "NOW";
  return start === e ? start : `${start} — ${e}`;
}

export interface Split {
  label: string;
  who: string;
  detail: string;
  start: string;
  end: string;
}

/** Timing-board rows: every role + degree, newest first (order of descent). */
export function buildSplits(): Split[] {
  const rows: Split[] = [
    ...RESUME_DATA.work.map((w) => ({
      label: "",
      who: w.company,
      detail: w.title,
      start: w.start,
      end: w.end ?? "NOW",
    })),
    ...RESUME_DATA.education.map((e) => ({
      label: "",
      who: e.school,
      detail: e.degree,
      start: e.start,
      end: e.end,
    })),
  ];
  const endRank = (s: string) =>
    s === "NOW" ? Number.POSITIVE_INFINITY : Number.parseInt(s, 10);
  rows.sort(
    (a, b) =>
      Number.parseInt(b.start, 10) - Number.parseInt(a.start, 10) ||
      endRank(b.end) - endRank(a.end)
  );
  return rows.map((r, i) => ({
    ...r,
    label: `SPLIT ${String(i + 1).padStart(2, "0")}`,
  }));
}

/** Deterministic pseudo-random in [0,1) from an integer seed. */
export function seeded(n: number) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Section ids in run order, shared by the trail map and the canvas. */
export const RUN_SECTIONS = [
  { id: "summit", sign: "summit", label: "SUMMIT" },
  { id: "the-line", sign: "green", label: "THE LINE" },
  { id: "gates", sign: "blue", label: "GATES" },
  { id: "off-piste", sign: "black", label: "OFF-PISTE" },
  { id: "gear-check", sign: "double", label: "GEAR CHECK" },
  { id: "podium", sign: "podium", label: "PODIUM" },
  { id: "finish", sign: "finish", label: "FINISH" },
] as const;

export type SignKind = (typeof RUN_SECTIONS)[number]["sign"];
