const { execSync } = require("child_process");

function findChromePath() {
  // Use Playwright's bundled Chromium
  try {
    const browserPath = execSync(
      "node -e \"const pw = require('@playwright/test'); console.log(pw.chromium.executablePath())\"",
      { encoding: "utf8" },
    ).trim();
    if (browserPath) return browserPath;
  } catch {}
  return undefined;
}

/** @type {import('@lhci/cli').LighthouseConfig} */
module.exports = {
  ci: {
    collect: {
      chromePath: findChromePath(),
      chromeFlags: ["--headless=new", "--no-sandbox"],
      url: [
        "http://localhost:4321/",
        "http://localhost:4321/housing",
        "http://localhost:4321/food",
        "http://localhost:4321/voting",
        "http://localhost:4321/workers-rights",
        "http://localhost:4321/lgbtq-rights",
        "http://localhost:4321/free-speech",
        "http://localhost:4321/donate",
        "http://localhost:4321/es/",
      ],
      startServerCommand: "pnpm run build && pnpm run preview",
      startServerReadyPattern: "localhost",
      numberOfRuns: 3,
      settings: {
        throttling: {
          rttMs: 70,
          throughputKbps: 12000,
          cpuSlowdownMultiplier: 4,
        },
        screenEmulation: {
          mobile: true,
          width: 360,
          height: 800,
          deviceScaleFactor: 2,
        },
        formFactor: "mobile",
        onlyCategories: ["performance", "accessibility", "best-practices"],
      },
    },
    assert: {
      assertions: {
        // Category scores
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        // Timing metrics (LCP/TBT/TTI unreliable due to font-loading opacity trick)
        "first-contentful-paint": ["error", { maxNumericValue: 1800 }],
        "speed-index": ["error", { maxNumericValue: 2000 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "max-potential-fid": ["error", { maxNumericValue: 200 }],
        // Structural budgets
        "dom-size": ["error", { maxNumericValue: 1500 }],
        "server-response-time": ["error", { maxNumericValue: 500 }],
        "mainthread-work-breakdown": ["warn", { maxNumericValue: 2000 }],
        "bootup-time": ["warn", { maxNumericValue: 1000 }],
        // Note: total-byte-weight and resource-summary excluded because
        // Lighthouse counts its own injected scripts (~1.9MB overhead).
        // Transfer size is measured accurately by Playwright perf tests.
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
