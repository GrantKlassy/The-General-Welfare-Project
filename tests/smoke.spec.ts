import { test, expect } from "@playwright/test";

test("homepage loads with correct title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("The General Welfare Project");
});

test("homepage has visible heading", async ({ page }) => {
  await page.goto("/");
  const heading = page.getByRole("heading", {
    level: 1,
    name: "The General Welfare Project",
  });
  await expect(heading).toBeVisible();
});

test("nav and footer are present", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("nav").first()).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
});

test("body becomes visible (font loading)", async ({ page }) => {
  await page.goto("/");
  const body = page.locator("body");
  await expect(body).toHaveCSS("opacity", "1", { timeout: 5000 });
});
