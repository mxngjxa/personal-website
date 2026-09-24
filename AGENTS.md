# AGENTS.md

Notes for any coding agent (Claude Code, Codex, etc.) working in this repo.

## Deploying mguan.org

- Hosting: Firebase Hosting, project **`personal-website-74629`**, site `personal-website-74629`
  (named explicitly in `firebase.json`). mguan.org points at it.
- **Owner: `jacky@mguan.org`.** The project lives in the `mguan.org` Cloud organization
  (`765511718798`). It was migrated from `mingjia.guan@gmail.com` on 2026-09-23 (Gmail no longer
  has access). Manual deploy, if ever needed:

  ```bash
  bun run build
  bunx firebase-tools@15.30.2 deploy --only hosting --account jacky@mguan.org
  ```

- CI (`.github/workflows/firebase-deploy.yml`) deploys on every push to `main` (or manual
  `workflow_dispatch`) with **keyless Workload Identity Federation**: GitHub's OIDC token is
  exchanged for short-lived credentials of `github-deploy@personal-website-74629.iam.gserviceaccount.com`
  (Firebase Hosting Admin only). The pool/provider only accept `mxngjxa/personal-website` on
  `refs/heads/main`. No secrets or keys are involved. One-time setup, run by a project Owner:
  `bash scripts/setup-ci-wif.sh` (idempotent). The repo has no Actions secrets; don't add
  `FIREBASE_TOKEN` or service-account keys.
- `firebase-tools` is pinned (15.30.2) in the workflow; an unpinned `bunx firebase-tools` broke a
  deploy once. Bump it deliberately. Bun is pinned too (`bun-version` in both workflows; keep
  them in step).
- Both workflows gate on `bunx biome check ./src` and `bunx tsc --noEmit` before `bun run build`.
  Pull requests run the same gate via `.github/workflows/ci.yml`, which builds but never deploys
  and has no `id-token` permission. Dependabot (`.github/dependabot.yml`) opens weekly PRs for
  Actions and grouped minor/patch npm bumps.
- Caching (`firebase.json`): `/_next/static/**` is hashed, so it's `immutable` for a year; HTML,
  clean URLs, `/resume.pdf`, `/sitemap.xml` and `/robots.txt` revalidate on every request; unhashed
  images/icons get one day. Header rules apply in order and later rules win per key, so keep the
  `/_next/static/**` rule last.
- SEO dates are fixed constants: when résumé content changes, bump `SITE_UPDATED` in
  `src/lib/structured-data.ts` (sitemap `lastModified` and ProfilePage `dateModified`). If the name
  changes, regenerate the OG/Twitter cards with `uv run scripts/og-image.py`.
- `www.mguan.org` has no DNS record; only the apex `mguan.org` resolves. Link to the apex.

## Rules

- Pushing to `main` deploys to production. Work on a branch; the owner decides when to push.
- Never edit files under `~/Work/resume/` unless asked; `resume.tex` there is the source of
  `public/resume.pdf` (see CLAUDE.md, "Resume PDF").
