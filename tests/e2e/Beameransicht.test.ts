import { test, expect, Page } from "@playwright/test";
import { waitFor } from "@testing-library/react";
import { describe } from "node:test";
import { beameransicht_locators } from "./helper-functions/locator-functions";

export const ROOT_PATH = "/beamer-ansicht";

test.beforeEach(async ({ page }) => {
	await page.goto(ROOT_PATH);
});

describe("Referentenansicht Steuerung", () => {
	test("no question data loaded", () => {
		//Schon durch Initialisierung abgedeckt
		throw new Error("Not implemented");
	});
	test("show solutions", () => {
		throw new Error("Not implemented");
	});
	test("change question", () => {
		throw new Error("Not implemented");
	});
	test("user score display", () => {
		throw new Error("Not implemented");
	});
});
