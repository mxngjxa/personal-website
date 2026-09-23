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

- CI (`.github/workflows/firebase-deploy.yml`) deploys on every push to `main` (or manual
  `workflow_dispatch`) with **keyless Workload Identity Federation**: GitHub's OIDC token is
  exchanged for short-lived credentials of `github-deploy@personal-website-74629.iam.gserviceaccount.com`
  (Firebase Hosting Admin only). The pool/provider only accept `mxngjxa/personal-website` on
  `refs/heads/main`. No secrets or keys are involved. One-time setup, run by a project Owner:
  `bash scripts/setup-ci-wif.sh` (idempotent). The old `FIREBASE_TOKEN` secret is obsolete.
- **Account migration (in progress, 2026-09-23):** ownership is moving from `mingjia.guan@gmail.com`
  to `jacky@mguan.org` by transferring the existing project (not rebuilding it), so the site,
  custom domain and SSL cert are untouched. Owner can't be granted by CLI on an org-less project:
  invite `jacky@mguan.org` as Owner in the Cloud Console IAM page and accept the email invite.
- `firebase-tools` is pinned (15.30.2) in the workflow; an unpinned `bunx firebase-tools` broke a
  deploy once. Bump it deliberately.
- `www.mguan.org` has no DNS record; only the apex `mguan.org` resolves. Link to the apex.

## Rules

- Pushing to `main` deploys to production. Work on a branch; the owner decides when to push.
- Never edit files under `~/Work/resume/` unless asked; `resume.tex` there is the source of
  `public/resume.pdf` (see CLAUDE.md, "Resume PDF").
