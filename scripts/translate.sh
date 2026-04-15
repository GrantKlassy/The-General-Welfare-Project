#!/usr/bin/env bash
set -euo pipefail

# Translate en.ts to target locale(s) using claude -p
# Usage: ./scripts/translate.sh [locale]
#   locale: es, zh, or vi (omit for all three)
#   MODEL env var overrides model (default: sonnet)

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
I18N_DIR="$REPO_ROOT/src/i18n"
EN_FILE="$I18N_DIR/en.ts"
MODEL="${MODEL:-sonnet}"

ALL_TARGETS=(es zh vi tl)

declare -A LOCALE_NAMES=(
  [es]="Spanish as spoken by US-based Latino communities (use tú, not usted)"
  [zh]="Simplified Chinese as used by US-based Chinese-speaking communities"
  [vi]="Vietnamese as used by US-based Vietnamese-speaking communities"
  [tl]="Tagalog as spoken by US-based Filipino communities"
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

EN_KEY_COUNT=$(grep -cP '^\s*"[^"]+":\s' "$EN_FILE")
EN_CONTENT=$(<"$EN_FILE")

translate_locale() {
  local locale="$1"
  local target_file="$I18N_DIR/${locale}.ts"
  local locale_name="${LOCALE_NAMES[$locale]}"
  local tmp_file
  tmp_file=$(mktemp)

  echo "[$locale] Translating en.ts → ${locale}.ts (model: $MODEL)..."

  local prompt
  prompt=$(cat <<PROMPT_EOF
You are a professional translator for a US civil rights website called The General Welfare Project. This site helps underprivileged people in the United States learn about and access their legal rights. People find this site via QR codes on flyers or links from community organizations. The audience is everyday people — many in crisis — not lawyers or academics.

Translate the following TypeScript i18n file from English to ${locale_name}.

<rules>
OUTPUT FORMAT:
- Output ONLY the TypeScript file content. No explanation. No markdown fences. No commentary before or after.
- The first line must be exactly: export default {
- The last line must be exactly: } as Record<string, string>;
- Preserve ALL section comments exactly as they appear (// Site, // Common, // Housing, etc.)
- Preserve the exact same key order as the English source.

DO NOT TRANSLATE:
- The keys (left side of the colon) — they stay exactly as-is
- Phone numbers: "211", "988", "866-OUR-VOTE (866-687-8683)", "866-488-7386", "1-866-4-USWAGE (1-866-487-2365)"
- Organization names and acronyms: ACLU, OSHA, Lambda Legal, The Trevor Project, Department of Labor, Section 8, LGBTQ+

DO TRANSLATE:
- "Legal Hotline" (freeSpeech.phone value)
- All other string values

TONE AND STYLE:
- Direct, empowering, plain language. NOT formal, NOT bureaucratic, NOT legal jargon.
- Write for someone who is scared, stressed, or in crisis. Be warm and clear.
- Short sentences. Active voice. "You can" not "One may."
- Match the emotional intensity of the English. If English says "Your Boss Owes You Every Dollar" the translation must be equally blunt and direct.
- This is a rights site for real people, not a government form.
</rules>

<source>
${EN_CONTENT}
</source>
PROMPT_EOF
)

  if ! claude -p --model "$MODEL" --no-session-persistence "$prompt" > "$tmp_file" 2>/dev/null; then
    echo "[$locale] ERROR: claude -p failed"
    rm -f "$tmp_file"
    return 1
  fi

  # Strip markdown fences if present
  sed -i '/^```\(typescript\|ts\)\?$/d' "$tmp_file"

  # Strip any leading blank lines before "export default"
  sed -i '1,/^export default {/{ /^export default {/!{ /^$/d } }' "$tmp_file"

  # Validate: file must start with "export default {"
  if ! head -1 "$tmp_file" | grep -q '^export default {'; then
    echo "[$locale] ERROR: output does not start with 'export default {'"
    echo "  First line: $(head -1 "$tmp_file")"
    rm -f "$tmp_file"
    return 1
  fi

  # Validate: must end with the type assertion
  if ! tail -1 "$tmp_file" | grep -q 'as Record<string, string>'; then
    echo "[$locale] ERROR: output does not end with '} as Record<string, string>;'"
    echo "  Last line: $(tail -1 "$tmp_file")"
    rm -f "$tmp_file"
    return 1
  fi

  # Validate: key count must match en.ts
  local target_key_count
  target_key_count=$(grep -cP '^\s*"[^"]+":\s' "$tmp_file")
  if [[ "$target_key_count" -ne "$EN_KEY_COUNT" ]]; then
    echo "[$locale] ERROR: output has ${target_key_count} keys, expected ${EN_KEY_COUNT}"
    rm -f "$tmp_file"
    return 1
  fi

  mv "$tmp_file" "$target_file"
  pnpm exec prettier --write "$target_file" > /dev/null 2>&1 || true

  echo "[$locale] OK (${target_key_count} keys)"
}

FAILED=0
for locale in "${TARGETS[@]}"; do
  if ! translate_locale "$locale"; then
    FAILED=1
  fi
done

if [[ "$FAILED" -eq 1 ]]; then
  echo "Some translations failed."
  exit 1
fi

echo "Done."
