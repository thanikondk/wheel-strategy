import { expect, test } from "@playwright/test";

test("loads core pages", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.goto("/csp-screener");
  await expect(page.getByRole("heading", { name: "Cash-Secured Put Screener" })).toBeVisible();

  await page.goto("/trades");
  await expect(page.getByRole("heading", { name: "Trade Tracker" })).toBeVisible();
});
