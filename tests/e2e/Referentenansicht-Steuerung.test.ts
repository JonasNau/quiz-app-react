import { test, expect } from "@playwright/test";
import { describe } from "node:test";
import { io } from "socket.io-client";
import { getServerURL } from "@/app/includes/ts/settings/server-url";
import { ERoomNames, ESocketEventNames } from "@/app/includes/ts/socketIO/socketNames";
import {
	locators as globalLocators,
	waitForLocatorVisible,
} from "./helper-functions/locator-functions";

export const ROOT_PATH = "/referentenansicht/control";

test.beforeEach(async ({ page }) => {
	await page.goto(ROOT_PATH);

	const initSocketIO = io(getServerURL().toString(), { autoConnect: true });

	initSocketIO.on("connect_error", (err) => {
		console.error(`connect_error due to ${err.message}`);
	});

	await expect(() => expect(initSocketIO.connected).toBe(true)).toPass({
		timeout: 5000,
	});

	let quizDataOnServer = 0;
	initSocketIO.on(ESocketEventNames.SEND_QUIZ_DATA, (quizData) => {
		quizDataOnServer = quizData;
	});

	initSocketIO.emit(ESocketEventNames.JOIN_ROOM, ERoomNames.REFERENT_CONTROL);
	initSocketIO.emit(ESocketEventNames.INIT_QUIZ, null);
	initSocketIO.emit(ESocketEventNames.GET_QUIZ_DATA);

	await expect(async () => {
		expect(quizDataOnServer).toBe(null);
	}).toPass({ timeout: 5000 });

	const modalTitle = page.locator(globalLocators.SWAL.TITLE);
	await waitForLocatorVisible(modalTitle);

	const modalMessage = page.locator(globalLocators.SWAL.MESSAGE);
	await waitForLocatorVisible(modalMessage);

	expect(await modalMessage.innerText()).toBe(
		"Es gibt noch keine Quizdaten. Bitte initialisiere das Quiz zuerst. Möchtest du das Quiz jetzt initialisieren?"
	);

	const cancelButton = page.locator(globalLocators.SWAL.CANCEL);
	await waitForLocatorVisible(cancelButton);

	await cancelButton.click();

	await modalTitle.waitFor({ state: "hidden" });
});

describe("Referentenansicht Steuerung", () => {
	test("link back to start page works", async ({ page }) => {
		const link = page.getByRole("link", { name: "Zur Übersicht" });
		await expect(link).toBeVisible();
		await link.click();
		await page.waitForURL("/");
	});
	test("question change", () => {
		throw new Error("Not implemented");
	});
	test("show solutions in preview", () => {
		throw new Error("Not implemented");
	});
	test("set score mode", () => {
		throw new Error("Not implemented");
	});
	test("show solutions", () => {
		throw new Error("Not implemented");
	});
	test("show scores global mode ", () => {
		throw new Error("Not implemented");
	});
	test("show scores user mode", () => {
		throw new Error("Not implemented");
	});
	test("first question to last question button", () => {
		throw new Error("Not implemented");
	});
	test("last question to first question button", () => {
		throw new Error("Not implemented");
	});
	test("increment and decrement count user mode", () => {
		throw new Error("Not implemented");
	});
	test("increment and decrement count global mode", () => {
		throw new Error("Not implemented");
	});
	test("", () => {
		throw new Error("Not implemented");
	});
});
