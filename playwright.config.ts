import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "html",
  projects: [
    {
      name: "budget-android-360x800",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 360, height: 800 },
        isMobile: true,
        launchOptions: {
          // Chrome quantizes performance.memory.usedJSHeapSize to 10 MB
          // buckets for privacy. This flag returns the real value so the
          // perf budget check and README actuals are meaningful.
          args: ["--enable-precise-memory-info"],
        },
      },
    },
    {
      name: "iphone-390x844",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
      },
    },
    {
      name: "iphone-414x896",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 414, height: 896 },
        isMobile: true,
      },
    },
    {
      name: "iphone-18-402x874",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 402, height: 874 },
        isMobile: true,
      },
    },
    {
      name: "desktop-1080p",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],
  webServer: {
    command: "pnpm run build && pnpm run preview",
    port: 4321,
    reuseExistingServer: !process.env.CI,
  },
});
