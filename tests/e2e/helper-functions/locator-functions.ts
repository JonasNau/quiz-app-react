import { Locator } from "@playwright/test";

export async function waitForLocatorVisible(locator: Locator) {
	await locator.waitFor({ state: "visible" });
}
