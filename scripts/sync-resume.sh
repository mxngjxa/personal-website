#!/usr/bin/env bash
# Render the owner's LaTeX résumé to public/resume.pdf.
#
# Source: $RESUME_SRC_DIR/resume.tex (default: $HOME/Work/resume). When the
# source is absent (CI, other machines) this is a no-op and the committed
# public/resume.pdf is served as-is. Build artifacts go to <repo>/.cache/resume;
# nothing is ever written into the source folder.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
src_dir="${RESUME_SRC_DIR:-$HOME/Work/resume}"
src_tex="$src_dir/resume.tex"
out_dir="$repo_root/.cache/resume"
dest="$repo_root/public/resume.pdf"

if [[ ! -f "$src_tex" ]]; then
  if [[ ! -s "$dest" ]]; then
    echo "sync-resume: $src_tex not found and no committed public/resume.pdf; the /resume.pdf links would 404" >&2
    exit 1
  fi
  echo "sync-resume: $src_tex not found; keeping committed public/resume.pdf"
  exit 0
fi

# GUI shells on macOS often lack the TeX Live bin dir.
if [[ -d /Library/TeX/texbin ]]; then
  PATH="/Library/TeX/texbin:$PATH"
fi
if ! command -v latexmk >/dev/null 2>&1; then
  echo "sync-resume: latexmk not found on PATH" >&2
  exit 1
fi

mkdir -p "$out_dir"

# Pin PDF timestamps/ID to the .tex mtime so an unchanged source renders
# byte-identical output (no spurious git diffs on every dev/build).
if src_mtime="$(stat -f %m "$src_tex" 2>/dev/null)"; then :; else
  src_mtime="$(stat -c %Y "$src_tex")"
fi
export SOURCE_DATE_EPOCH="$src_mtime"
export FORCE_SOURCE_DATE=1

log="$out_dir/sync-resume.log"
# Run from the source dir so \input and relative assets resolve. -g forces a
# fresh render (~1s) so a shared cache never serves a stale PDF.
if ! (cd "$src_dir" && latexmk -g -pdf -interaction=nonstopmode -halt-on-error \
  -outdir="$out_dir" -auxdir="$out_dir" resume.tex) >"$log" 2>&1; then
  echo "sync-resume: LaTeX compile failed; public/resume.pdf left unchanged" >&2
  if [[ -f "$out_dir/resume.log" ]]; then
    tail -n 40 "$out_dir/resume.log" >&2
  else
    tail -n 40 "$log" >&2
  fi
  exit 1
fi

pdf="$out_dir/resume.pdf"
if [[ ! -s "$pdf" ]]; then
  echo "sync-resume: latexmk succeeded but $pdf is missing" >&2
  exit 1
fi

if cmp -s "$pdf" "$dest"; then
  status="unchanged"
else
  mkdir -p "$(dirname "$dest")"
  cp "$pdf" "$dest.tmp"
  mv "$dest.tmp" "$dest"
  status="updated"
fi

size_kb=$(($(wc -c <"$dest") / 1024))
echo "sync-resume: public/resume.pdf ${status} (${size_kb} KB) from $src_tex"
