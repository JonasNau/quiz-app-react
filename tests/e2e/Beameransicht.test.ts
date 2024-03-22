import { test, expect } from "@playwright/test";
import { waitFor } from "@testing-library/react";
import { describe } from "node:test";

export const ROOT_PATH = "/beamer-ansicht";

export const locators = {
	QUIZ_READ_ONLY: "[class*=quizReadOnly]",
	QUESTION: "[class*=quizReadOnly] .question",
	ANSWERS_LIST: "[class*=quizReadOnly] .answersList",
	IMAGE: "[class*=quizReadOnly] .image-wrapper img",
	WAITING: "[class*=beamer-ansicht_waiting]",
};

test.beforeEach(async ({ page }) => {
	await page.goto(ROOT_PATH);
});

describe("Referentenansicht Steuerung", () => {
	test("no question data loaded", () => {
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
