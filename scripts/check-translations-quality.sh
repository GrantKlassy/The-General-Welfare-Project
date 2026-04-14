#!/usr/bin/env bash
set -euo pipefail

# Run LLM-as-Judge translation review, but only when translation files
# have changed relative to the remote tracking branch.
# Wired into `task check` → pre-push via lefthook.

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
I18N_REL="src/i18n"
TARGETS=(es zh vi)

cd "$REPO_ROOT"

# Find the remote tracking branch
UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "")

CHANGED=()
for locale in "${TARGETS[@]}"; do
  locale_file="$I18N_REL/${locale}.ts"
  if [[ -n "$UPSTREAM" ]]; then
    # Check if translation file differs from what's on the remote
    if git diff --name-only "$UPSTREAM"..HEAD -- "$locale_file" | grep -q .; then
      CHANGED+=("$locale")
    fi
  else
    # No upstream (new repo / no remote) — review everything that exists
    if [[ -f "$locale_file" ]]; then
      CHANGED+=("$locale")
    fi
  fi
done

if [[ ${#CHANGED[@]} -eq 0 ]]; then
  echo "OK: no translation files changed — skipping quality review"
  exit 0
fi

echo "Translation files changed: ${CHANGED[*]}"
echo "Running LLM quality review..."
echo ""

EXIT_CODE=0
for locale in "${CHANGED[@]}"; do
  if ! bash "$REPO_ROOT/scripts/review-translation.sh" "$locale"; then
    EXIT_CODE=1
  fi
done

exit $EXIT_CODE
