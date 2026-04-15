#!/usr/bin/env bash
set -euo pipefail

# LLM-as-Judge review of translation quality against en.ts
# Usage: ./scripts/review-translation.sh [locale]
#   locale: es, zh, or vi (omit for all three)
#   MODEL env var overrides model (default: sonnet)

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
I18N_DIR="$REPO_ROOT/src/i18n"
EN_FILE="$I18N_DIR/en.ts"
MODEL="${MODEL:-sonnet}"

ALL_TARGETS=(es zh vi tl)

declare -A LOCALE_NAMES=(
  [es]="US Spanish"
  [zh]="Simplified Chinese (US context)"
  [vi]="Vietnamese (US context)"
  [tl]="Tagalog (US context)"
)

if [[ $# -ge 1 ]]; then
  if [[ -z "${LOCALE_NAMES[$1]+x}" ]]; then
    echo "ERROR: Unknown locale '$1'. Valid: es, zh, vi"
    exit 1
  fi
  TARGETS=("$1")
else
  TARGETS=("${ALL_TARGETS[@]}")
fi

EN_CONTENT=$(<"$EN_FILE")

review_locale() {
  local locale="$1"
  local target_file="$I18N_DIR/${locale}.ts"
  local locale_name="${LOCALE_NAMES[$locale]}"

  if [[ ! -f "$target_file" ]]; then
    echo "[$locale] ERROR: $target_file does not exist"
    return 1
  fi

  echo "[$locale] Reviewing ${locale}.ts..."
  echo ""

  local target_content
  target_content=$(<"$target_file")

  local prompt
  prompt=$(cat <<PROMPT_EOF
You are a native ${locale_name} speaker reviewing translations of a US civil rights website that helps underprivileged people access their legal rights.

Review the translation below against the English source. Check for these specific issues:

<checklist>
1. ACCURACY: Does each translated value convey the same meaning as the English?
2. TONE: The site targets stressed, scared people. Tone must be direct, warm, empowering, plain language. NOT formal, NOT bureaucratic. For Spanish: must use tú, not usted.
3. NATURALNESS: Would a native ${locale_name} speaker in the US actually say this? Flag anything that sounds like machine translation.
4. OVER-TRANSLATION: These must stay in English: phone numbers, ACLU, OSHA, Lambda Legal, The Trevor Project, Department of Labor, Section 8, LGBTQ+.
5. MISSING/EXTRA KEYS: Does the translation have exactly the same keys as English?
6. UNTRANSLATED VALUES: Are any values still in English when they should be translated?
7. CONSISTENCY: Are equivalent terms translated the same way throughout?
</checklist>

Output format — use EXACTLY this:

VERDICT: PASS or FAIL

If FAIL, list each issue as:
- [key.name] description of the problem → suggested fix

If PASS with minor suggestions, list them as:
- [key.name] (minor) suggestion

If PASS with no issues, write: All translations are accurate, natural, and tonally appropriate.

<english>
${EN_CONTENT}
</english>

<translation locale="${locale}">
${target_content}
</translation>
PROMPT_EOF
)

  local result
  if ! result=$(claude -p --model "$MODEL" --no-session-persistence "$prompt" 2>/dev/null); then
    echo "[$locale] ERROR: claude -p failed"
    return 1
  fi

  echo "$result"
  echo ""

  if echo "$result" | grep -qi "VERDICT: FAIL"; then
    return 1
  fi
  return 0
}

EXIT_CODE=0
for locale in "${TARGETS[@]}"; do
  if ! review_locale "$locale"; then
    EXIT_CODE=1
  fi
  echo "---"
  echo ""
done

exit $EXIT_CODE
