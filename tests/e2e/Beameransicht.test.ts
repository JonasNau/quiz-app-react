import { test, expect, Page } from "@playwright/test";
import { describe } from "node:test";
import { beameransicht_locators } from "./helper-functions/locator-functions";

export const ROOT_PATH = "/beamer-ansicht";

test.beforeEach(async ({ page }) => {
	await page.goto(ROOT_PATH);
});

describe("Beamer Ansicht tests", () => {
	//Already covered by Referentenansicht-Steuerung.ts
});
