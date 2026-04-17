#!/usr/bin/env node
// Regenerates the Lighthouse and Playwright tables in README.md from the
// most recent local test output (.lighthouseci/ and .perf-results/).
//
// - No-op (exit 0) when results are missing — lets the pre-commit hook run
//   without forcing a test run.
// - "Actual" columns report the worst observed value across all pages for
//   timing/size metrics, and the lowest score across all pages for scores.
//   Worst-case = what the budget check actually guarded against.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const README = path.join(ROOT, "README.md");
const LH_DIR = path.join(ROOT, ".lighthouseci");
const PW_DIR = path.join(ROOT, ".perf-results");

const LH_BUDGETS = {
  fcp: 1800,
  speedIndex: 2000,
  cls: 0.1,
  accessibility: 90,
  bestPractices: 90,
  domSize: 1500,
};
const PW_BUDGETS = {
  loadTime: 2000,
  fcp: 1500,
  transferBytes: 300 * 1024,
  heapBytes: 10 * 1024 * 1024,
  domNodes: 1500,
};

function readLighthouse() {
  const manifestPath = path.join(LH_DIR, "manifest.json");
  if (!fs.existsSync(manifestPath)) return null;
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const reports = manifest
    .map((m) => {
      if (!fs.existsSync(m.jsonPath)) return null;
      return JSON.parse(fs.readFileSync(m.jsonPath, "utf8"));
    })
    .filter(Boolean);
  if (reports.length === 0) return null;

  const vals = (pick) => reports.map(pick).filter((v) => v != null);
  const max = (xs) => Math.max(...xs);
  const min = (xs) => Math.min(...xs);

  return {
    fcp: max(vals((r) => r.audits?.["first-contentful-paint"]?.numericValue)),
    speedIndex: max(vals((r) => r.audits?.["speed-index"]?.numericValue)),
    cls: max(vals((r) => r.audits?.["cumulative-layout-shift"]?.numericValue)),
    accessibility: min(vals((r) => r.categories?.accessibility?.score)) * 100,
    bestPractices:
      min(vals((r) => r.categories?.["best-practices"]?.score)) * 100,
    domSize: max(vals((r) => r.audits?.["dom-size"]?.numericValue)),
    pages: reports.length,
  };
}

function readPlaywright() {
  if (!fs.existsSync(PW_DIR)) return null;
  const files = fs
    .readdirSync(PW_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(PW_DIR, f), "utf8")));
  if (files.length === 0) return null;

  const vals = (pick) => files.map(pick).filter((v) => v != null);
  const maxOrNull = (xs) => (xs.length === 0 ? null : Math.max(...xs));

  return {
    loadTime: maxOrNull(vals((r) => r.loadTime)),
    fcp: maxOrNull(vals((r) => r.fcp)),
    transferBytes: maxOrNull(vals((r) => r.transferSize)),
    heapBytes: maxOrNull(vals((r) => r.heapUsed)),
    domNodes: maxOrNull(vals((r) => r.domNodes)),
    pages: files.length,
  };
}

const fmt = {
  ms: (n) => `${Math.round(n).toLocaleString("en-US")} ms`,
  cls: (n) =>
    n === 0 ? "0" : n.toFixed(3).replace(/0+$/, "").replace(/\.$/, ""),
  score: (n) => Math.round(n).toString(),
  count: (n) => Math.round(n).toLocaleString("en-US"),
  kb: (n) => `${Math.round(n / 1024)} KB`,
  mb: (n) => {
    const v = n / 1024 / 1024;
    return `${v < 10 ? v.toFixed(1) : Math.round(v)} MB`;
  },
};

function buildTable(rows) {
  const widths = [0, 1, 2].map((col) =>
    Math.max(...rows.map((r) => r[col].length)),
  );
  const pad = (s, w) => s + " ".repeat(w - s.length);
  const line = (cells) =>
    `  | ${cells.map((c, i) => pad(c, widths[i])).join(" | ")} |`;
  const sep = `  | ${widths.map((w) => "-".repeat(w)).join(" | ")} |`;
  return [line(rows[0]), sep, ...rows.slice(1).map(line)].join("\n");
}

function replaceBlock(md, marker, replacement) {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const start = `<!-- metrics:${marker}:start -->`;
  const end = `<!-- metrics:${marker}:end -->`;
  const re = new RegExp(`${esc(start)}[\\s\\S]*?${esc(end)}`);
  if (!re.test(md)) {
    throw new Error(`README.md missing ${marker} markers`);
  }
  return md.replace(re, `${start}\n\n${replacement}\n\n  ${end}`);
}

function main() {
  const lh = readLighthouse();
  const pw = readPlaywright();

  if (!lh && !pw) {
    console.log(
      "update-readme-metrics: no results found in .lighthouseci/ or .perf-results/ — skipping.",
    );
    return 0;
  }

  let md = fs.readFileSync(README, "utf8");
  const before = md;

  if (lh) {
    const rows = [
      ["Metric", "Budget", "Actual"],
      ["First Contentful Paint (FCP)", fmt.ms(LH_BUDGETS.fcp), fmt.ms(lh.fcp)],
      ["Speed Index", fmt.ms(LH_BUDGETS.speedIndex), fmt.ms(lh.speedIndex)],
      [
        "Cumulative Layout Shift (CLS)",
        String(LH_BUDGETS.cls),
        fmt.cls(lh.cls),
      ],
      [
        "Accessibility score",
        fmt.score(LH_BUDGETS.accessibility),
        fmt.score(lh.accessibility),
      ],
      [
        "Best practices score",
        fmt.score(LH_BUDGETS.bestPractices),
        fmt.score(lh.bestPractices),
      ],
      ["DOM size", fmt.count(LH_BUDGETS.domSize), fmt.count(lh.domSize)],
    ];
    md = replaceBlock(md, "lighthouse", buildTable(rows));
    console.log(
      `update-readme-metrics: lighthouse updated from ${lh.pages} reports`,
    );
  } else {
    console.log(
      "update-readme-metrics: no lighthouse results — keeping existing table",
    );
  }

  if (pw) {
    const dash = "—";
    const actual = (val, formatter) => (val == null ? dash : formatter(val));
    const rows = [
      ["Metric", "Budget", "Actual"],
      [
        "Page load time",
        fmt.ms(PW_BUDGETS.loadTime),
        actual(pw.loadTime, fmt.ms),
      ],
      ["FCP", fmt.ms(PW_BUDGETS.fcp), actual(pw.fcp, fmt.ms)],
      [
        "Transfer size",
        fmt.kb(PW_BUDGETS.transferBytes),
        actual(pw.transferBytes, fmt.kb),
      ],
      [
        "JS heap memory",
        fmt.mb(PW_BUDGETS.heapBytes),
        actual(pw.heapBytes, fmt.mb),
      ],
      [
        "DOM nodes",
        fmt.count(PW_BUDGETS.domNodes),
        actual(pw.domNodes, fmt.count),
      ],
    ];
    md = replaceBlock(md, "playwright", buildTable(rows));
    console.log(
      `update-readme-metrics: playwright updated from ${pw.pages} pages`,
    );
  } else {
    console.log(
      "update-readme-metrics: no playwright results — keeping existing table",
    );
  }

  if (md !== before) {
    fs.writeFileSync(README, md);
    console.log("update-readme-metrics: README.md rewritten");
    return 10; // signal "changed" so callers can re-stage
  }
  console.log("update-readme-metrics: README.md already current");
  return 0;
}

process.exit(main());
