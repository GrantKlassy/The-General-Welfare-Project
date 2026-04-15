#!/usr/bin/env bash
set -euo pipefail

# Check that translation files are not stale relative to en.ts.
# "Stale" = en.ts was committed more recently than a locale file.
# Fast, offline check — no LLM calls.

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
I18N_REL="src/i18n"
EN_REL="$I18N_REL/en.ts"
TARGETS=(es zh vi tl)

cd "$REPO_ROOT"

# Get the timestamp of the most recent commit that touched en.ts
EN_LAST_COMMIT=$(git log -1 --format='%H' -- "$EN_REL" 2>/dev/null || echo "")

if [[ -z "$EN_LAST_COMMIT" ]]; then
  echo "OK: en.ts has no git history yet, skipping staleness check"
  exit 0
fi

EN_TIMESTAMP=$(git log -1 --format='%ct' "$EN_LAST_COMMIT")

STALE=()

for locale in "${TARGETS[@]}"; do
  locale_file="$I18N_REL/${locale}.ts"

  if [[ ! -f "$locale_file" ]]; then
    STALE+=("$locale (file missing)")
    continue
  fi

  LOCALE_LAST_COMMIT=$(git log -1 --format='%H' -- "$locale_file" 2>/dev/null || echo "")

  if [[ -z "$LOCALE_LAST_COMMIT" ]]; then
    STALE+=("$locale (no git history)")
    continue
  fi

  LOCALE_TIMESTAMP=$(git log -1 --format='%ct' "$LOCALE_LAST_COMMIT")

  if [[ "$EN_TIMESTAMP" -gt "$LOCALE_TIMESTAMP" ]]; then
    STALE+=("$locale")
  fi
done

if [[ ${#STALE[@]} -gt 0 ]]; then
  echo "ERROR: Translations are stale. en.ts was updated more recently than:"
  for s in "${STALE[@]}"; do
    echo "  - ${s}.ts"
  done
  echo ""
  echo "Run 'task translate' to update translations."
  exit 1
fi

echo "OK: All translations are up to date with en.ts"
