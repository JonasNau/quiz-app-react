import { test, expect } from "@playwright/test";

test("Start page has title", async ({ page }) => {
	await page.goto("/");
	await expect(page).toHaveTitle(/Quiz-Anwendung/);
});

test("Start page has heading", async ({ page }) => {
	await page.goto("/");
	const heading = page.locator("h1");
	await expect(heading).toBeVisible();
	await expect(heading).toContainText(/Quiz-Anwendung/);
});
