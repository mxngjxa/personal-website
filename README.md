# mguan.org

Personal site of Mingjia "Jacky" Guan. The home page, **DESCENT**, presents the résumé as a
single ski run: the top of the page is the summit (now) and scrolling descends back through
time, past jobs set as slalom gates, down to a timing board at the base.

## Stack

- Next.js 16 (App Router) with `output: "export"`, which builds a fully static site into `out/`
- React 19 and TypeScript
- Plain CSS: `src/app/descent/descent.css` plus tokens and a small reset in `src/app/globals.css`
- `next-themes` for the "night ski" dark mode
- Bun for packages and scripts, Biome for linting and formatting

## Develop

```bash
bun install
bun dev             # http://localhost:3000
bun run build       # static export to out/
bun run check:fix   # Biome lint + format
```

## Content

All résumé content lives in [`src/data/resume-data.tsx`](./src/data/resume-data.tsx), typed by
[`src/lib/types.ts`](./src/lib/types.ts). The page components under `src/app/descent/` read it
through `run-data.ts` and never hardcode résumé text. The downloadable PDF is `public/resume.pdf`,
rendered from the LaTeX source (see CLAUDE.md).

## Deploy

Pushing to `main` runs `.github/workflows/firebase-deploy.yml`, which does
`bun install --frozen-lockfile`, `bun run build`, and deploys `out/` to Firebase Hosting.

## License

MIT, see [LICENSE](./LICENSE). The project began as a fork of
[BartoszJarocki/cv](https://github.com/BartoszJarocki/cv).
