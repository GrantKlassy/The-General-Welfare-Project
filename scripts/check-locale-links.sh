#!/usr/bin/env bash
# Check that locale-aware files never use hardcoded internal links.
# All internal links in [locale] pages and shared components must use localePath().

set -euo pipefail

ROUTES="housing|voting|lgbtq-rights|free-speech|workers-rights|donate"
FAIL=0

# 1. Locale pages: any href="/..." string literal is a bug (should use localePath)
#    Match href="/ but exclude href="/fonts", href="/favicon", href="/flag_", href="/#"
while IFS= read -r file; do
  matches=$(grep -nE 'href="/' "$file" | grep -vE 'href="/(fonts|favicon|flag_|#|https?:)' || true)
  if [ -n "$matches" ]; then
    echo "ERROR: Hardcoded internal link in locale page: $file"
    echo "$matches"
    echo "  Use localePath(locale, \"/path\") instead"
    echo
    FAIL=1
  fi
done < <(find src/pages/\[locale\] -name '*.astro' 2>/dev/null)

# 2. Components: hardcoded links to known routes are a bug
while IFS= read -r file; do
  matches=$(grep -nE "href=\"/($ROUTES)\"" "$file" || true)
  if [ -n "$matches" ]; then
    echo "ERROR: Hardcoded route link in component: $file"
    echo "$matches"
    echo "  Use localePath(locale, \"/path\") instead"
    echo
    FAIL=1
  fi
done < <(find src/components -name '*.astro' 2>/dev/null)

if [ "$FAIL" -eq 1 ]; then
  echo "FAILED: Hardcoded internal links detected — language context will be lost"
  exit 1
fi

echo "OK: No hardcoded internal links found — language context preserved"
