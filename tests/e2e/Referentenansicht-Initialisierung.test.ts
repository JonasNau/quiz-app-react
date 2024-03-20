import { test, expect } from "@playwright/test";
import { waitFor } from "@testing-library/react";
import { describe } from "node:test";
import playwrightConfig from "../../playwright.config";
import { QuizPackageList } from "@/interfaces/joi/QuizSchemas";

const ROOT_PATH = "/referentenansicht/init";

describe("Referentenasicht - Quiz Initialisieren", () => {
	test("page loads", async ({ page }) => {
		await page.goto(ROOT_PATH);
		await expect(page).toHaveTitle(/Quiz-Anwendung/);
		await expect(page.locator("h1")).toHaveText(
			"Referentenansicht - Quiz-Initialisieren"
		);
	});
	test("visual quiz editor shows alert when quiz json editor has an invalid json", async ({
		page,
	}) => {
		await page.goto(ROOT_PATH);

		const btndelete = page.locator(".code-editor-toolbar .btn-danger");
		btndelete.waitFor({ state: "visible" });
		await btndelete.click();

		const quizJSONInput = page.locator(".code-editor [contenteditable=true]");
		await quizJSONInput.waitFor({ state: "visible" });
		expect(quizJSONInput).toHaveText(JSON.stringify([]));
		await quizJSONInput.click();
		await quizJSONInput.pressSequentially("Test");
		const alert = page.locator("#visual-quiz-editor-alert");
		await alert.waitFor({ state: "visible" });
		expect(alert).toContainText("Die Quiz-JSON ist nicht valide.");
	});
	test("quiz list overview reflects the changes in the quiz-json editor", async ({
		page,
	}) => {
		await page.goto(ROOT_PATH);
		const btndelete = page.locator(".code-editor-toolbar .btn-danger");
		btndelete.waitFor({ state: "visible" });
		await btndelete.click();

		const quizJSONInput = page.locator(".code-editor [contenteditable=true]");
		await quizJSONInput.waitFor({ state: "visible" });
		await quizJSONInput.fill(
			JSON.stringify([
				{ description: "My quiz description", name: "My quiz name", quizData: [] },
			] satisfies QuizPackageList)
		);

		const quizPackageListEditor = page.locator("[class*=quizPackageListEditor]");

		const quizPackageListEntry = quizPackageListEditor.locator(
			"[data-quiz-name='My quiz name']"
		);
		await quizPackageListEntry.waitFor({ state: "visible" });
	});

	test("load from preset", () => {
		throw new Error("Not implemented");
	});
	test("format", () => {
		throw new Error("Not implemented");
	});
	test("minify", () => {
		throw new Error("Not implemented");
	});
	test("import quiz", () => {
		throw new Error("Not implemented");
	});
	test("add quiz", () => {
		throw new Error("Not implemented");
	});

	test("open quiz edit modal", () => {
		throw new Error("Not implemented");
	});
	test("export quiz", () => {
		throw new Error("Not implemented");
	});
	test("use quiz", () => {
		throw new Error("Not implemented");
	});
	test("rearange quiz", () => {
		throw new Error("Not implemented");
	});
	test("delete quiz", () => {
		throw new Error("Not implemented");
	});
	test("change name and description of quiz", () => {
		throw new Error("Not implemented");
	});
	test("add questions to quiz", () => {
		throw new Error("Not implemented");
	});
	test("rearange questions in quiz", () => {
		throw new Error("Not implemented");
	});
	test("delete question in quiz", () => {
		throw new Error("Not implemented");
	});

	test("open question edit modal", () => {
		throw new Error("Not implemented");
	});
	test("change question text of question", () => {
		throw new Error("Not implemented");
	});
	test("add question image", () => {
		throw new Error("Not implemented");
	});
	test("remove question image", () => {
		throw new Error("Not implemented");
	});
	test("add answer", () => {
		throw new Error("Not implemented");
	});
	test("modify answer text", () => {
		throw new Error("Not implemented");
	});
	test("rearange answer", () => {
		throw new Error("Not implemented");
	});
	test("delete question", () => {
		throw new Error("Not implemented");
	});
	test("change answer is correct", () => {
		throw new Error("Not implemented");
	});
});
