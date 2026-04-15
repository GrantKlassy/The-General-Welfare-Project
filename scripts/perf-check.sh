#!/usr/bin/env bash
# Non-blocking performance check for lefthook pre-push.
# Prints results but always exits 0 — never blocks a deploy.

echo "=== Performance Check (informational — does not block push) ==="
echo ""

echo "--- Playwright Performance Tests ---"
if pnpm exec playwright test tests/perf.spec.ts --project=budget-android-360x800 --reporter=list 2>&1; then
  echo "PASS: Playwright perf tests passed"
else
  echo "WARN: Playwright perf tests had failures (see above)"
  echo "  Run 'task perf:playwright' locally for details"
fi

echo ""
echo "--- Lighthouse CI ---"
if pnpm exec lhci autorun 2>&1; then
  echo "PASS: Lighthouse CI passed"
else
  echo "WARN: Lighthouse CI had budget violations (see above)"
  echo "  Run 'task perf:lighthouse' locally for details"
fi

echo ""
echo "=== Performance check complete ==="
exit 0
