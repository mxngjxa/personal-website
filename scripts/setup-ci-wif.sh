#!/usr/bin/env bash
# One-time setup: keyless GitHub Actions -> Firebase Hosting deploys via
# Workload Identity Federation. Safe to re-run (every step is idempotent).
#
# Creates, in project personal-website-74629:
#   - service account github-deploy@...  (Firebase Hosting Admin only)
#   - workload identity pool "github" + OIDC provider "github-oidc", which only
#     accepts tokens from mxngjxa/personal-website on refs/heads/main
#   - a binding letting that repo's main-branch runs impersonate the account
# No keys are created; nothing needs to be stored in GitHub secrets.
#
# Run as a project Owner (default jacky@mguan.org; override with GCLOUD_ACCOUNT):
#   bash scripts/setup-ci-wif.sh
set -euo pipefail

ACCOUNT="${GCLOUD_ACCOUNT:-jacky@mguan.org}"
PROJECT_ID="personal-website-74629"
REPO="mxngjxa/personal-website"
SA_NAME="github-deploy"
POOL="github"
PROVIDER="github-oidc"

g() { gcloud --account "$ACCOUNT" --project "$PROJECT_ID" --quiet "$@"; }

PROJECT_NUMBER="$(g projects describe "$PROJECT_ID" --format='value(projectNumber)')"
SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

echo "==> Enabling APIs"
g services enable iam.googleapis.com iamcredentials.googleapis.com \
  sts.googleapis.com firebasehosting.googleapis.com

echo "==> Service account $SA_EMAIL"
if ! g iam service-accounts describe "$SA_EMAIL" >/dev/null 2>&1; then
  g iam service-accounts create "$SA_NAME" \
    --display-name="GitHub Actions deploy (mguan.org)"
fi

echo "==> Granting deploy roles"
for role in roles/firebasehosting.admin roles/serviceusage.serviceUsageConsumer; do
  g projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SA_EMAIL" --role="$role" \
    --condition=None >/dev/null
done

echo "==> Workload identity pool '$POOL'"
if ! g iam workload-identity-pools describe "$POOL" --location=global >/dev/null 2>&1; then
  g iam workload-identity-pools create "$POOL" --location=global \
    --display-name="GitHub Actions"
fi

echo "==> OIDC provider '$PROVIDER' (repo $REPO, main only)"
CONDITION="assertion.repository == '$REPO' && assertion.ref == 'refs/heads/main'"
if ! g iam workload-identity-pools providers describe "$PROVIDER" \
  --location=global --workload-identity-pool="$POOL" >/dev/null 2>&1; then
  g iam workload-identity-pools providers create-oidc "$PROVIDER" \
    --location=global --workload-identity-pool="$POOL" \
    --display-name="GitHub OIDC" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref" \
    --attribute-condition="$CONDITION"
fi

echo "==> Letting $REPO impersonate $SA_EMAIL"
g iam service-accounts add-iam-policy-binding "$SA_EMAIL" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL/attribute.repository/$REPO" \
  >/dev/null

cat <<EOF

Done. The workflow should reference:
  workload_identity_provider: projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL/providers/$PROVIDER
  service_account:            $SA_EMAIL
(New IAM bindings can take a minute or two to propagate.)
Once a CI deploy succeeds, the old secret can go:
  gh secret delete FIREBASE_TOKEN -R $REPO
EOF
