import { test, expect } from "@playwright/test";

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
  test.beforeEach(async ({}, testInfo) => {
    test.skip(
      testInfo.project.name !== "budget-android-360x800",
      "Perf tests only run on budget-android project",
    );
  });

  for (const url of PAGES) {
    test(`${url} meets performance budgets`, async ({ page }) => {
      await page.goto(url, { waitUntil: "load" });

      const metrics = await page.evaluate(() => {
        const nav = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;
        const paintEntries = performance.getEntriesByType("paint");
        const fcp = paintEntries.find(
          (e) => e.name === "first-contentful-paint",
        );
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
