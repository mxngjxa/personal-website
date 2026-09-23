# AGENTS.md

Notes for any coding agent (Claude Code, Codex, etc.) working in this repo.

## Deploying mguan.org

- Hosting: Firebase Hosting, project **`personal-website-74629`**, site `personal-website-74629`
  (named explicitly in `firebase.json`). mguan.org points at it.
- **The project is owned by `mingjia.guan@gmail.com`, not `jacky@mguan.org`.** The Firebase CLI
  on the owner's Mac defaults to `jacky@mguan.org`, which cannot see this project and fails with
  "Failed to get Firebase project personal-website-74629". Always deploy with the Gmail account:

  ```bash
  bunx firebase-tools@15.30.2 login:add mingjia.guan@gmail.com   # once; pick the Gmail account in the browser
  bun run build
  bunx firebase-tools@15.30.2 deploy --only hosting --account mingjia.guan@gmail.com
  ```

- CI (`.github/workflows/firebase-deploy.yml`) deploys on every push to `main` using the
  `FIREBASE_TOKEN` repo secret. That token expired on 2026-09-23 (HTTP 401). Regenerate it **with
  the Gmail account** (`bunx firebase-tools@15.30.2 login:ci`) and store it with
  `gh secret set FIREBASE_TOKEN -R mxngjxa/personal-website`. `--token` auth is deprecated by
  Firebase; a service-account key is the long-term fix.
- `firebase-tools` is pinned (15.30.2) in the workflow; an unpinned `bunx firebase-tools` broke a
  deploy once. Bump it deliberately.
- `www.mguan.org` has no DNS record; only the apex `mguan.org` resolves. Link to the apex.

## Rules

- Pushing to `main` deploys to production. Work on a branch; the owner decides when to push.
- Never edit files under `~/Work/resume/` unless asked; `resume.tex` there is the source of
  `public/resume.pdf` (see CLAUDE.md, "Resume PDF").
