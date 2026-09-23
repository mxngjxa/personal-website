# DESCENT — mguan.org redesign spec

Branch: `redesign/ski-descent`. Local only. **Never push** (push to `main` auto-deploys to Firebase).

## Brief (from owner)
Neo-brutalist, a little pixelated, edgy, skiing theme. Apple-like scroll experience: as the visitor
scrolls, they ski down through Mingjia's world.

## Core concept: altitude = time
The page is one ski run. Top of page = summit = **now (2026)**. Bottom = base lodge = **2023** (start of
undergrad). Scrolling = descending = going back in time. A fixed HUD altimeter counts down
elevation (3,642 m → 1,203 m) and the year counts down with it. Every structural device encodes
something true:
- Trail-difficulty signs mark sections (● green, ■ blue, ◆ black, ◆◆ double black) — the run gets
  steeper as you go deeper into the substance.
- Jobs are **slalom gates**. Real slalom gates alternate red/blue; cards alternate left/right sides,
  red then blue, and the skier weaves through them.
- The finish is a **timing board**: split times are the years of each role.

## Tokens
Color (CSS vars on `:root`, dark = "night skiing" under floodlights):
| name | light | dark | use |
|---|---|---|---|
| `--snow` | `#EEF2F5` (cold blue-white, NOT cream) | `#0A0E14` | page bg |
| `--ink` | `#0B0D10` | `#E9EEF3` | text, 3px borders, hard shadows |
| `--gate-red` | `#FF2E1F` | `#FF4A3D` | red gates, bib, primary accent |
| `--piste-blue` | `#1640FF` | `#4F74FF` | blue gates, links |
| `--ice` | `#A9DBFF` | `#1B2B3F` | shading, secondary fills |
| `--piste-green` | `#00A651` | same | only on the green-circle sign |

Type (via `next/font/google`, expose as CSS vars):
- Display: **Archivo** variable with `wdth` axis — headlines at weight 900, `font-stretch: 125%`,
  uppercase, tight tracking (-0.02em). Reads like resort trail signage. Use with restraint: hero name,
  section titles, gate company names.
- Body: **Instrument Sans** 400/500/600.
- Utility/HUD: **Silkscreen** (pixel font) — HUD, labels, sign captions, badges, timing board. This is
  where the "pixelated" edge lives.

Brutalism rules: 3px solid `--ink` borders, hard offset shadows `6px 6px 0 var(--ink)` (no blur,
ever), zero border-radius except the green circle sign, no gradients except the dithered pixel sky
in the canvas. Hover on cards: translate(-3px,-3px) + shadow grows to 9px. Active: shadow 0.

## Signature: the pixel run (canvas)
A fixed full-viewport `<canvas>` behind content rendered at **low internal resolution** (viewport / 4,
min 1) and upscaled with `image-rendering: pixelated`. Drawn every rAF frame only while scrolling or
while particles animate (pause when tab hidden). Contents:
1. **Sky & mountain (hero only)**: at scroll 0 the camera looks at a summit: dithered sky (ordered
   Bayer 4x4 dither between 2–3 palette colors, no smooth gradients), a jagged pixel ridge line with
   snow cap. As the hero scrolls out, the camera "pitches down" — the ridge slides up and off, and the
   view becomes the white slope (bg color).
2. **Snow particles**: sparse 1-px flakes drifting, parallax with scroll (they move up faster when
   scrolling = sense of speed). ~120 flakes. Disabled with reduced motion.
3. **Pixel trees**: small pixel pine sprites scattered along the left/right page edges in world space
   (scroll with the page, slight parallax), so the content column feels like a groomed piste between
   tree lines. Keep them out of the content column on desktop; on mobile keep only a few at edges at
   low opacity.
4. **The skier**: 16x16-ish pixel sprite (hand-coded as a string/array bitmap, palette: ink, gate-red
   jacket, ice goggles, piste-blue pants) with 3 poses: carve-left, carve-right, tuck. Fixed at ~38%
   viewport height. Horizontal position follows a smooth S-path through the slalom gates: when a gate
   is near the skier's screen Y, the skier's x swings around that gate's pole (poles are DOM elements;
   read their bounding rects on resize/scroll, cache them). Between gates, gentle sine carve. Pose =
   sign of dx. Speed readout on HUD = scroll velocity mapped to km/h (clamped 0–112).
5. **Ski trail**: the skier leaves a 1px-wide double track in world coordinates (store points in
   page-Y space, draw the visible ones) in a slightly darker snow tone. Trail persists so scrolling
   back up shows the carved S-curves. Cap stored points (e.g., 4000).

On mobile (<768px) the skier sits lower-left of center and weaves in a narrower band; trail still
drawn. Reduced motion: no particles, skier static in tuck at the right edge, no trail animation;
content fully readable.

## Page structure (top to bottom)
Fixed **HUD bar** (top, full width, 3px bottom border, Silkscreen, `--snow` bg):
`MGUAN.ORG` · `RUN: THE GUAN` · `ALT 3,642M` · `YR 2026` · `SPD 38 KM/H` · night-ski toggle
(next-themes; label "NIGHT SKI ON/OFF") · `CLASSIC CV ↗` link to `/classic`. On mobile collapse to
ALT + YR + toggle.

Fixed **trail map rail** (right edge, desktop only): a vertical line with the section signs as stops,
a red dot tracking progress. Signs are links (anchor jump, smooth scroll respecting reduced motion).

1. **SUMMIT (hero, ~220vh tall, inner content `position: sticky`)** — Apple-style pinned scene.
   - Race bib card (brutal border + shadow) top-left: `BIB 01` in Silkscreen, big.
   - Name in Archivo 900 expanded, huge (clamp 3.5rem–11rem), two lines: `MINGJIA` / `GUAN`, with a
     small `"JACKY"` tag rotated -4° like a sticker.
   - One line under it: RESUME_DATA.about.
   - Pixel prompt bottom: `DROP IN ↓` blinking cursor-style in Silkscreen.
   - Scroll-linked: over the pinned distance, the name scales down 1 → 0.85 and translates up, the
     bib slides out left, canvas camera pitches down; at the end a `3 · 2 · 1 · GO` start-gate
     countdown flashes in Silkscreen (driven by scroll progress, not time).
2. **● GREEN — "THE LINE"** (summary). Large body text (clamp 1.4rem–2.4rem) where words fade from
   25% → 100% opacity as they scroll through the viewport (Apple product-page reveal). Location +
   contact buttons (email, phone, GitHub, LinkedIn) as brutal square buttons with pixel labels.
3. **■ BLUE — "GATES"** (work). Section title sign. Each `work` item = a slalom gate: a vertical pole
   (thin DOM element with alternating red/blue stripes, `data-gate`) with a flag panel = brutal card
   with gate color top strip, company (Archivo expanded), title, years in Silkscreen (`2025 — NOW`),
   description, badges as pixel stickers. Cards alternate left/right of center on desktop (gate 1
   red-left, gate 2 blue-right...); single column on mobile with pole on the left edge. Each card
   slides in from its side + rotates from ±3° to 0 as it enters (IntersectionObserver or scroll-linked).
   Current roles (end = null) get a blinking `LIVE` tag.
4. **◆ BLACK DIAMOND — "OFF-PISTE"** (projects). Big brutal cards, full-width, heavy. Tech stack as
   pixel chips. Link button if `link` present. Warning-sign aesthetic: a small `EXPERTS ONLY` label.
5. **◆◆ DOUBLE BLACK — "GEAR CHECK"** (skills). A grid of pixel-bordered stickers (each skill a chip
   with slight random-but-deterministic rotation, seeded by index), like stickers slapped on a ski.
   Hover: rotation snaps to 0 and chip jumps.
5b. **PODIUM** (`awards`), pixel-medal sign. The latest three sit on a 3-step podium that steps
   down left to right, newest first. These are sequence numbers, not placings. The rest go in a
   results sheet table (#, award, issuer, date) that stacks into rows under 768px.
6. **BASE LODGE — "FINISH"** (education + contact).
   - Timing board: a black LED-style board (Silkscreen, ink bg, gate-red/ice text) listing splits:
     each work + education entry as a row `SPLIT  COMPANY/SCHOOL  START–END`.
   - Education cards (brutal).
   - Big CTA: `SAY HI` mailto button in gate-red, plus socials.
   - Footer line in Silkscreen: `© 2026 MINGJIA GUAN · BUILT FOR THE DESCENT · CHAIRLIFT BACK UP ↑`
     (the last bit scrolls to top).

## Engineering constraints
- Next 16 App Router, static export (`output: 'export'`) — everything must work with no server.
  `bun run build` must pass. Use `bun`, not npm.
- Move the current page to `src/app/classic/page.tsx` (reuse existing components as-is, keep its
  print styles) so the old CV stays available at `/classic`. Update sitemap to include it.
- New home in `src/app/page.tsx` (server component) rendering data from `RESUME_DATA`
  (`src/data/resume-data.tsx`) — do not hardcode resume content; derive years/splits from data.
  Keep JSON-LD structured data and metadata.
- Put new components under `src/app/descent/` (e.g., `PixelRun.tsx` canvas client component,
  `Hud.tsx`, `TrailMap.tsx`, `Summit.tsx`, `Gates.tsx`, `sprites.ts`, `useScrollProgress.ts`, and a
  `descent.css` or scoped CSS). Client components only where needed (`"use client"`).
- No new npm deps. No GSAP/Framer. Vanilla rAF + passive scroll listeners + IntersectionObserver.
  Throttle DOM reads; write to CSS custom properties (`--p`) for scroll-linked transforms so React
  doesn't re-render per frame. HUD numbers update via refs, not state.
- The root layout currently uses Inter; swap to the three fonts above (CSS vars) but make sure
  `/classic` still looks fine (it can use the body font).
- Accessibility: semantic headings (one h1 = name), `prefers-reduced-motion` honored everywhere,
  canvas `aria-hidden`, visible 3px focus outlines in `--piste-blue`, contrast AA on text, skip link.
- Print: `@media print` hides canvas/HUD/rail and renders content plainly (or recommend /classic).
- Responsive down to 360px, no horizontal scroll (watch the sticker rotations and slide-ins —
  use `overflow-x: clip` on the wrapper).
- Run `bun run check:fix` (Biome) and `bun run build` at the end; both must pass. Report exactly
  what you ran and the output.
- Commit on the branch with clear messages. Do not push.
