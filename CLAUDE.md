# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal site for mguan.org. The home page is **DESCENT**, a neo-brutalist, pixel-art ski-run
presentation of the résumé (design spec: `docs/ski-descent-spec.md`). Next.js 16 App Router with
`output: "export"` (fully static, no server), React 19, TypeScript, plain CSS. There is no
Tailwind, no component library, and no API route.

## Commands

```bash
bun dev            # Dev server on http://localhost:3000 (predev renders the resume PDF)
bun run build      # Static export to out/ (prebuild renders the resume PDF)
bun run resume     # Re-render public/resume.pdf from the LaTeX source
bun run check      # Biome lint + format check (src/)
bun run check:fix  # Biome lint + format with auto-fix
bunx tsc --noEmit  # Type-check
```

The project uses **Biome** (not ESLint/Prettier). Run `bun run check:fix` before committing.
There is no `start` script: static export has no Next server, so preview a build by serving `out/`.

## Architecture

- `src/data/resume-data.tsx`: the single source of résumé content (`RESUME_DATA`), typed by
  `src/lib/types.ts`. Keep it in sync with the LaTeX résumé.
- `src/app/page.tsx`: the DESCENT page; composes the components in `src/app/descent/`.
- `src/app/descent/run-data.ts`: everything derived from `RESUME_DATA` (year range, splits,
  name parts). Components must not hardcode résumé text.
- `src/app/descent/descent.css`: all page styling. `src/app/globals.css` holds the color tokens
  (`--snow`, `--ink`, `--gate-red`, ...), their `.dark` overrides, and a small base reset.
- `src/app/layout.tsx`: fonts (Archivo, Instrument Sans, Silkscreen), metadata, theme provider.
- `src/lib/structured-data.ts`: JSON-LD for the page.

`work[].start`/`end` and `education[].start`/`end` are year strings (`end: null` = present) that
drive the altimeter and timing board. Optional `startDate`/`endDate` ("YYYY-MM") carry month
precision. `awards` renders as the PODIUM section (latest three as podium steps, the rest as a results sheet).

## Resume PDF (replaces the old /classic web CV)
The `/classic` route was removed. The "RESUME PDF" links (HUD and the finish section) open `/resume.pdf` in a new tab.
- `bun run resume` (also run by `predev`/`prebuild`) compiles `$RESUME_SRC_DIR/resume.tex` (default `$HOME/Work/resume`) with `latexmk` into `.cache/resume/` (gitignored), then copies the PDF to `public/resume.pdf`. It never writes into the source folder. If the compile fails it exits non-zero and leaves `public/resume.pdf` as it was.
- `public/resume.pdf` is committed. CI has no LaTeX source, so the script is a no-op there and the build ships the committed copy. After editing the .tex, run `bun run resume` and commit the updated PDF.
- The output is reproducible: `SOURCE_DATE_EPOCH` is set from the .tex mtime, so re-rendering an unchanged source produces no git diff.

## Deployment

Pushing to `main` triggers `.github/workflows/firebase-deploy.yml`: `bun install --frozen-lockfile`,
`bun run build`, then Firebase Hosting deploys `out/` (config in `firebase.json`). Change
dependencies only with `bun add` / `bun remove` so `bun.lock` stays consistent.

Deploy accounts, manual deploys and the CI token: see AGENTS.md (imported below).

@AGENTS.md
