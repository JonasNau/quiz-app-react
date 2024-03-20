import { test, expect } from "@playwright/test";
import { waitFor } from "@testing-library/react";
import { describe } from "node:test";
import playwrightConfig from "../../playwright.config";

describe("Start Page", () => {
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
	test("Link to /referentenansicht/init works", async ({ page }) => {
		await page.goto("/");
		const link = page.getByRole("link", { name: "Quiz initialisieren" });
		await expect(link).toBeVisible();
		await link.click();
		await page.waitForURL("**/referentenansicht/init");
	});
	test("Link to /referentenansicht/control works", async ({ page }) => {
		await page.goto("/");
		const link = page.getByRole("link", { name: "Kontrollansicht" });
		await expect(link).toBeVisible();
		await link.click();
		await page.waitForURL("**/referentenansicht/control");
	});
	test("Link to /beamer-ansicht works", async ({ page }) => {
		await page.goto("/");
		const link = page.getByRole("link", { name: "Beameransicht" });
		await expect(link).toBeVisible();
		await link.click();
		await page.waitForURL("**/beamer-ansicht");
	});
});
