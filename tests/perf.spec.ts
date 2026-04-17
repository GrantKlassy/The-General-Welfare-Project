import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const RESULTS_DIR = path.join(process.cwd(), ".perf-results");

const PAGES = [
  "/",
  "/housing",
  "/food",
  "/voting",
  "/workers-rights",
  "/lgbtq-rights",
  "/free-speech",
  "/donate",
  "/es/",
];

const BUDGETS = {
  loadTimeMs: 2000,
  fcpMs: 1500,
  transferBytes: 300 * 1024,
  heapBytes: 10 * 1024 * 1024,
  domNodes: 1500,
};

test.describe("Performance budgets", () => {
  test.beforeAll(({}, testInfo) => {
    // Fresh results dir on the project that actually produces results. Other
    // projects skip the tests, but their beforeAll would race and wipe the
    // dir after it was populated.
    if (testInfo.project.name !== "budget-android-360x800") return;
    fs.rmSync(RESULTS_DIR, { recursive: true, force: true });
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  });

  test.beforeEach(async ({}, testInfo) => {
    test.skip(
      testInfo.project.name !== "budget-android-360x800",
      "Perf tests only run on budget-android project",
    );
  });

  for (const url of PAGES) {
    test(`${url} meets performance budgets`, async ({ page }) => {
      await page.goto(url, { waitUntil: "load" });

      const metrics = await page.evaluate(async () => {
        // Base.astro keeps body opacity:0 until fonts load, which delays FCP
        // past the load event. Poll for the paint entry with PerformanceObserver
        // as a fallback to catch late paint emissions.
        let fcpEntry: PerformanceEntry | undefined = performance
          .getEntriesByType("paint")
          .find((e) => e.name === "first-contentful-paint");

        if (!fcpEntry) {
          fcpEntry = await new Promise<PerformanceEntry | undefined>(
            (resolve) => {
              const timer = setTimeout(() => resolve(undefined), 3000);
              const obs = new PerformanceObserver((list) => {
                const entry = list
                  .getEntries()
                  .find((e) => e.name === "first-contentful-paint");
                if (entry) {
                  clearTimeout(timer);
                  obs.disconnect();
                  resolve(entry);
                }
              });
              obs.observe({ type: "paint", buffered: true });
            },
          );
        }

        const nav = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;
        const fcp = fcpEntry;
        const resources = performance.getEntriesByType(
          "resource",
        ) as PerformanceResourceTiming[];

        // Filter out prefetched pages (Astro prefetchAll loads linked pages
        // in the background). Only count assets: CSS, JS, fonts, images, SVGs.
        const assetPattern =
          /\.(css|js|mjs|woff2?|ttf|otf|png|jpe?g|gif|svg|webp|avif|ico)(\?|$)/;
        const pageAssets = resources.filter((r) => assetPattern.test(r.name));

        const transferSize =
          (nav?.transferSize ?? 0) +
          pageAssets.reduce((sum, r) => sum + (r.transferSize ?? 0), 0);

        const mem = (performance as any).memory;

        return {
          loadTime: nav ? nav.loadEventEnd - nav.startTime : null,
          fcp: fcp?.startTime ?? null,
          transferSize,
          heapUsed: mem?.usedJSHeapSize ?? null,
          domNodes: document.querySelectorAll("*").length,
        };
      });

      const slug = url.replace(/[^\w]+/g, "_").replace(/^_|_$/g, "") || "home";
      fs.writeFileSync(
        path.join(RESULTS_DIR, `${slug}.json`),
        JSON.stringify({ url, ...metrics }, null, 2),
      );

      if (metrics.loadTime !== null) {
        expect(
          metrics.loadTime,
          `Page load time ${metrics.loadTime.toFixed(0)}ms exceeds ${BUDGETS.loadTimeMs}ms`,
        ).toBeLessThan(BUDGETS.loadTimeMs);
      }

      if (metrics.fcp !== null) {
        expect(
          metrics.fcp,
          `FCP ${metrics.fcp.toFixed(0)}ms exceeds ${BUDGETS.fcpMs}ms`,
        ).toBeLessThan(BUDGETS.fcpMs);
      }

      expect(
        metrics.transferSize,
        `Transfer size ${(metrics.transferSize / 1024).toFixed(0)}KB exceeds ${BUDGETS.transferBytes / 1024}KB`,
      ).toBeLessThan(BUDGETS.transferBytes);

      if (metrics.heapUsed !== null) {
        expect(
          metrics.heapUsed,
          `JS heap ${(metrics.heapUsed / 1024 / 1024).toFixed(1)}MB exceeds ${BUDGETS.heapBytes / 1024 / 1024}MB`,
        ).toBeLessThan(BUDGETS.heapBytes);
      }

      expect(
        metrics.domNodes,
        `DOM nodes ${metrics.domNodes} exceeds ${BUDGETS.domNodes}`,
      ).toBeLessThan(BUDGETS.domNodes);
    });
  }
});
