import { test, expect, Page, selectors } from "@playwright/test";
import { waitFor } from "@testing-library/react";
import { describe } from "node:test";
import playwrightConfig from "../../playwright.config";
import {
	QuestionEntry,
	QuizPackage,
	QuizPackageList,
} from "@/interfaces/joi/QuizSchemas";
import { waitForLocatorVisible } from "./helper-functions/locator-functions";
import { templateQuizPackageList } from "@/app/referentenansicht/init/constants";
import { AddQuizPackageDefault } from "@/app/components/QuizPackageListEditor/constants";
import { ROOT_PATH as ROOT_PATH_BEAMER_ANSICHT } from "./Beameransicht.test";
import { locators as locators_beamer_ansicht } from "./Beameransicht.test";
import { io } from "socket.io-client";
import { ERoomNames, ESocketEventNames } from "@/app/includes/ts/socketIO/socketNames";
import { getServerURL } from "@/app/includes/ts/settings/server-url";
import { templateQuestion } from "@/app/components/QuizPackageEditor/constants";

export const ROOT_PATH = "/referentenansicht/init";
const locators = {
	QUIZ_PACKAGE_LIST_EDITOR: "[class*=quizPackageListEditor]",
	CODE_EDITOR: ".code-section .code-editor [contenteditable=true]",
	VISUAL_QUIZ_EDITOR_ALERT: "#visual-quiz-editor-alert",
	JSON_EDITOR: {
		DELETE: ".code-editor-toolbar .delete",
		PRESET: ".code-editor-toolbar .preset",
		FORMAT: ".code-editor-toolbar .format",
		MINIFY: ".code-editor-toolbar .minify",
	},
	VISUAL_CODE_EDITOR: {
		ADD_QUIZ: ".add-quiz",
		IMPORT_QUIZ: ".import-quiz",
		CONTENT: {
			getQuizNameElement: (page: Page, quizName: string) => {
				return page.locator(
					`${locators.QUIZ_PACKAGE_LIST_EDITOR} [data-quiz-name="${quizName}"] .quiz-name`
				);
			},
		},
		getDeleteButton: (page: Page, quizName: string) => {
			return page.locator(
				`${locators.QUIZ_PACKAGE_LIST_EDITOR} [data-quiz-name="${quizName}"] button[title="Quiz löschen"]`
			);
		},

		getDownButton: (page: Page, quizName: string) => {
			return page.locator(
				`${locators.QUIZ_PACKAGE_LIST_EDITOR} [data-quiz-name="${quizName}"] button[title="Quiz nach unten verschieben"]`
			);
		},

		getUpButton: (page: Page, quizName: string) => {
			return page.locator(
				`${locators.QUIZ_PACKAGE_LIST_EDITOR} [data-quiz-name="${quizName}"] button[title="Quiz nach oben verschieben"]`
			);
		},
		getEditButton: (page: Page, quizName: string) => {
			return page.locator(
				`${locators.QUIZ_PACKAGE_LIST_EDITOR} [data-quiz-name="${quizName}"] button[title="Quiz bearbeiten"]`
			);
		},
		EDIT_QUIZ: {
			getQuizPackageEditor: (page: Page) => {
				return page.locator(
					`${locators.SWAL.MODAL_CONTAINER} [class*=quizPackageEditor]`
				);
			},
			getQuizNameTextarea: (page: Page) => {
				return locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getQuizPackageEditor(page).locator(
					`textarea.name`
				);
			},
			getQuizDescriptionTextarea: (page: Page) => {
				return locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getQuizPackageEditor(page).locator(
					`textarea.description`
				);
			},
			getAddQuestionButton: (page: Page) => {
				return locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getQuizPackageEditor(page).locator(
					`button.add-answer`
				);
			},
		},
	},
	SWAL: {
		MODAL_CONTAINER: ".swal2-container",
		CODE_EDITOR:
			".swal2-container .swal2-html-container .code-editor [contenteditable=true]",
		CONFIRM: ".swal2-container .swal2-confirm",
		TITLE: ".swal2-container .swal2-title",
		MESSAGE: ".swal2-container .swal2-html-container",
	},
};
const templateQuizPackageListForTest = templateQuizPackageList;

test.beforeEach(async ({ page }) => {
	await page.goto(ROOT_PATH);
	await page.evaluate(() => window.localStorage.clear());
});

describe("Referentenasicht - Quiz Initialisieren", () => {
	test("page loads", async ({ page }) => {
		await expect(page).toHaveTitle(/Quiz-Anwendung/);
		await expect(page.locator("h1")).toHaveText(
			"Referentenansicht - Quiz-Initialisieren"
		);
	});
	test("visual quiz editor shows alert when quiz json editor has an invalid json", async ({
		page,
	}) => {
		const btndelete = page.locator(locators.JSON_EDITOR.DELETE);
		btndelete.waitFor({ state: "visible" });
		await btndelete.click();

		const quizJSONInput = page.locator(locators.CODE_EDITOR);
		await quizJSONInput.waitFor({ state: "visible" });
		expect(quizJSONInput).toHaveText(JSON.stringify([]));
		await quizJSONInput.click();
		await quizJSONInput.pressSequentially("Test");
		const alert = page.locator(locators.VISUAL_QUIZ_EDITOR_ALERT);
		await alert.waitFor({ state: "visible" });
		expect(alert).toContainText("Die Quiz-JSON ist nicht valide.");
	});
	test("quiz list overview reflects the changes in the quiz-json editor", async ({
		page,
	}) => {
		const btndelete = page.locator(locators.JSON_EDITOR.DELETE);
		btndelete.waitFor({ state: "visible" });
		await btndelete.click();

		const quizJSONInput = page.locator(locators.CODE_EDITOR);
		await quizJSONInput.waitFor({ state: "visible" });
		await quizJSONInput.fill(
			JSON.stringify([
				{ description: "My quiz description", name: "My quiz name", quizData: [] },
			] satisfies QuizPackageList)
		);

		const quizPackageListEditor = page.locator(locators.QUIZ_PACKAGE_LIST_EDITOR);

		const quizPackageListEntry = quizPackageListEditor.locator(
			"[data-quiz-name='My quiz name']"
		);
		await quizPackageListEntry.waitFor({ state: "visible" });
	});

	test("load from preset", async ({ page }) => {
		const expectedPreset = templateQuizPackageList;

		const presetBtn = page.locator(locators.JSON_EDITOR.PRESET);
		await waitForLocatorVisible(presetBtn);
		await presetBtn.click();
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);

		expect(await codeEditor.textContent()).toBe(JSON.stringify(expectedPreset));
	});
	test("format", async ({ page }) => {
		const formatBtn = page.locator(locators.JSON_EDITOR.FORMAT);
		await waitForLocatorVisible(formatBtn);
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);
		const templateQuizPackageForTestString = JSON.stringify(
			templateQuizPackageListForTest
		);
		await codeEditor.fill(templateQuizPackageForTestString);
		expect(await codeEditor.innerText()).toBe(templateQuizPackageForTestString);
		await formatBtn.click();

		const expectedString = JSON.stringify(templateQuizPackageListForTest, null, 2);

		await expect(async () => {
			expect(await codeEditor.innerText()).toBe(expectedString);
		}).toPass({ timeout: 2000 });
	});
	test("minify", async ({ page }) => {
		const minifyBtn = page.locator(locators.JSON_EDITOR.MINIFY);
		await waitForLocatorVisible(minifyBtn);
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);
		const formattedJSONString = JSON.stringify(templateQuizPackageListForTest, null, 2);
		await codeEditor.fill(formattedJSONString);
		expect(await codeEditor.innerText()).toBe(formattedJSONString);
		await minifyBtn.click();

		const expectedString = JSON.stringify(templateQuizPackageListForTest);

		await expect(async () => {
			expect(await codeEditor.innerText()).toBe(expectedString);
		}).toPass({ timeout: 2000 });
	});
	test("import quiz", async ({ page }) => {
		const importQuizBtn = page.locator(locators.VISUAL_CODE_EDITOR.IMPORT_QUIZ);
		await waitForLocatorVisible(importQuizBtn);
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);

		const btnDelete = page.locator(locators.JSON_EDITOR.DELETE);
		await waitForLocatorVisible(btnDelete);
		await btnDelete.click();
		await expect(async () =>
			expect(await codeEditor.innerText()).toBe(JSON.stringify([]))
		).toPass({ timeout: 1000 });

		await importQuizBtn.click();

		const codeEditorInPopUp = page.locator(
			".swal2-container .code-editor [contenteditable=true]"
		);
		await waitForLocatorVisible(codeEditorInPopUp);

		const quizToImport = {
			name: "My test quiz",
			description: "My test description",
			quizData: [],
		} satisfies QuizPackage;

		expect((await codeEditorInPopUp.innerText()).trim()).toBe("");

		await codeEditorInPopUp.fill(JSON.stringify(quizToImport));

		const okayBtn = page.locator(".swal2-container .swal2-confirm");
		waitForLocatorVisible(okayBtn);

		await okayBtn.click();

		expect(async () =>
			expect(await codeEditor.innerText()).toBe(JSON.stringify([quizToImport]))
		).toPass({ timeout: 1000 });
	});
	test("import quiz invalid", async ({ page }) => {
		const importQuizBtn = page.locator(locators.VISUAL_CODE_EDITOR.IMPORT_QUIZ);
		await waitForLocatorVisible(importQuizBtn);
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);

		const btnDelete = page.locator(locators.JSON_EDITOR.DELETE);
		await waitForLocatorVisible(btnDelete);
		await btnDelete.click();
		await expect(async () =>
			expect(await codeEditor.innerText()).toBe(JSON.stringify([]))
		).toPass({ timeout: 1000 });

		// Case 1: No valid JSON was entered
		await importQuizBtn.click();

		const codeEditorInPopUp = page.locator(
			".swal2-container .code-editor [contenteditable=true]"
		);
		await waitForLocatorVisible(codeEditorInPopUp);

		expect((await codeEditorInPopUp.innerText()).trim()).toBe("");

		await codeEditorInPopUp.fill("INVALID JSON");

		const okayBtn = page.locator(locators.SWAL.CONFIRM);

		const modalTitle = page.locator(locators.SWAL.TITLE);
		const modalMessage = page.locator(locators.SWAL.MESSAGE);
		await waitForLocatorVisible(okayBtn);
		await okayBtn.click();
		await waitForLocatorVisible(modalTitle);
		await waitForLocatorVisible(modalMessage);

		expect(await modalTitle.innerText()).toBe("Fehler");
		expect(await modalMessage.innerText()).toBe("Das Format der JSON ist nicht valide.");
		await waitForLocatorVisible(okayBtn);
		await okayBtn.click();

		// Case 2: JSON is not a type of QuizPackageJSON

		const invalidQuizJSONToImport = {
			name: "My test quiz",
			description: "My test description",
			quizData: {},
		};
		await waitForLocatorVisible(importQuizBtn);
		await importQuizBtn.click();
		await waitForLocatorVisible(codeEditorInPopUp);
		await codeEditorInPopUp.fill(JSON.stringify(invalidQuizJSONToImport));
		await waitForLocatorVisible(okayBtn);
		await okayBtn.click();

		await waitForLocatorVisible(modalTitle);
		await waitForLocatorVisible(modalMessage);

		expect(await modalTitle.innerText()).toBe("Fehler");
		expect(await modalMessage.innerText()).toBe(
			"Das Format der Quiz-Package-JSON ist nicht valide."
		);
		await waitForLocatorVisible(okayBtn);
		await okayBtn.click();

		expect(async () =>
			expect(await codeEditor.innerText()).toBe(JSON.stringify([]))
		).toPass({ timeout: 1000 });
	});
	test("add quiz", async ({ page }) => {
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);
		await codeEditor.fill(JSON.stringify([]));
		const addQuizBtn = page.locator(locators.VISUAL_CODE_EDITOR.ADD_QUIZ);
		await waitForLocatorVisible(addQuizBtn);
		await addQuizBtn.click();
		await expect(async () => {
			expect(await codeEditor.innerText()).toBe(JSON.stringify([AddQuizPackageDefault]));
		}).toPass({ timeout: 1000 });
	});

	test("open quiz edit modal", async ({ page }) => {
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);
		await codeEditor.fill(
			JSON.stringify([
				{ description: "My cool quiz", name: "My cool quiz", quizData: [] },
			] satisfies QuizPackageList)
		);

		const editQuizBtn = page.locator(
			`${locators.QUIZ_PACKAGE_LIST_EDITOR} [data-quiz-name="My cool quiz"] button[title="Quiz bearbeiten"]`
		);
		await waitForLocatorVisible(editQuizBtn);
		await editQuizBtn.click();

		const modalTitle = page.locator(locators.SWAL.TITLE);
		await waitForLocatorVisible(modalTitle);
		expect(await modalTitle.innerText()).toBe("Quiz bearbeiten");
	});
	test("export quiz", async ({ page }) => {
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);

		const quizPackageJSONToExport = {
			name: "My cool quiz",
			description: "My cool description",
			quizData: [],
		} satisfies QuizPackage;

		await codeEditor.fill(JSON.stringify([quizPackageJSONToExport]));

		const exportQuizBtn = page.locator(
			`${locators.QUIZ_PACKAGE_LIST_EDITOR} [data-quiz-name="My cool quiz"] button[title="Quiz exportieren"]`
		);
		await waitForLocatorVisible(exportQuizBtn);
		await exportQuizBtn.click();

		const modalTitle = page.locator(locators.SWAL.TITLE);
		await waitForLocatorVisible(modalTitle);
		expect(await modalTitle.innerText()).toBe("Hier ist der JSON-Code des Quizzes:");

		const modalCodeEditor = page.locator(locators.SWAL.CODE_EDITOR);
		await waitForLocatorVisible(modalCodeEditor);

		const exportedJSON = JSON.parse(await modalCodeEditor.innerText());

		expect(quizPackageJSONToExport).toStrictEqual(exportedJSON);
	});
	test("use quiz", async ({ page, context, browser }) => {
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);

		await expect(async () => {
			expect((await codeEditor.innerText()).trim()).not.toBe("");
		}).toPass({ timeout: 5000 });

		const testQuizJSON = {
			description: "My cool quiz",
			name: "My cool quiz",
			quizData: [
				{
					question: "Wird dieser Test bestehen?",
					answers: [
						{ isCorrect: true, text: "Ja" },
						{ isCorrect: false, text: "Nein" },
					],
				},
			],
		} satisfies QuizPackage;

		await codeEditor.clear();
		await codeEditor.fill(JSON.stringify([testQuizJSON] satisfies QuizPackageList));

		const useQuizBtn = page.locator(
			`${locators.QUIZ_PACKAGE_LIST_EDITOR} [data-quiz-name="My cool quiz"] button[title="Quiz verwenden und hochladen"]`
		);
		await waitForLocatorVisible(useQuizBtn);

		const beamerAnsichtSocketIO = io(getServerURL().toString(), { autoConnect: true });

		beamerAnsichtSocketIO.on("connect_error", (err) => {
			console.error(`connect_error due to ${err.message}`);
		});

		await expect(() => expect(beamerAnsichtSocketIO.connected).toBe(true)).toPass({
			timeout: 5000,
		});

		let quizDataOnServer = 0;
		beamerAnsichtSocketIO.on(ESocketEventNames.SEND_QUIZ_DATA, (quizData) => {
			quizDataOnServer = quizData;
		});

		beamerAnsichtSocketIO.emit(ESocketEventNames.JOIN_ROOM, ERoomNames.REFERENT);
		beamerAnsichtSocketIO.emit(ESocketEventNames.INIT_QUIZ, null);
		beamerAnsichtSocketIO.emit(ESocketEventNames.GET_QUIZ_DATA);

		await expect(async () => {
			expect(quizDataOnServer).toBe(null);
		}).toPass({ timeout: 5000 });

		const beamerAnsichtPage = await context.newPage();
		await beamerAnsichtPage.goto(ROOT_PATH_BEAMER_ANSICHT);

		const beamerAnsichtWaiting = beamerAnsichtPage.locator(
			locators_beamer_ansicht.WAITING
		);
		await expect(async () => {
			await waitForLocatorVisible(beamerAnsichtWaiting);
			expect(await beamerAnsichtWaiting.innerText()).toContain("Warte auf Daten");
		}).toPass({ timeout: 5000 });

		await useQuizBtn.click();

		const modalTitle = page.locator(locators.SWAL.TITLE);
		await waitForLocatorVisible(modalTitle);
		expect(await modalTitle.innerText()).toBe("Erfolg");

		const modalMessage = page.locator(locators.SWAL.MESSAGE);
		await waitForLocatorVisible(modalMessage);
		expect(await modalMessage.innerText()).toBe(
			"Die Quiz-JSON wurde erfolgreich hochgeladen. Möchtest du auf die Kontrollansicht weitergeleitet werden?"
		);

		await expect(async () => {
			await beamerAnsichtWaiting.waitFor({ state: "hidden" });
		}).toPass({ timeout: 5000 });

		const questionText = beamerAnsichtPage.locator(locators_beamer_ansicht.QUESTION);
		await waitForLocatorVisible(questionText);
		expect(await questionText.innerText()).toBe(testQuizJSON.quizData[0].question);

		for (const answer of testQuizJSON.quizData[0].answers) {
			await waitForLocatorVisible(
				beamerAnsichtPage.locator(`[data-answer-text=\"${answer.text}\"]`)
			);
		}
	});
	test("rearange quiz", async ({ page }) => {
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);

		await expect(async () => {
			expect((await codeEditor.innerText()).trim()).not.toBe("");
		}).toPass({ timeout: 5000 });

		const quiz1 = {
			name: "Quiz 1",
			description: "Description of Quiz 1",
			quizData: [],
		} satisfies QuizPackage;
		const quiz2 = {
			name: "Quiz 2",
			description: "Description of Quiz 2",
			quizData: [],
		} satisfies QuizPackage;

		await codeEditor.fill(JSON.stringify([quiz1, quiz2] satisfies QuizPackageList));

		const quiz1DownButton = locators.VISUAL_CODE_EDITOR.getDownButton(page, quiz1.name);
		const quiz1UpButton = locators.VISUAL_CODE_EDITOR.getUpButton(page, quiz1.name);
		const quiz2DownButton = locators.VISUAL_CODE_EDITOR.getDownButton(page, quiz2.name);
		const quiz2UpButton = locators.VISUAL_CODE_EDITOR.getUpButton(page, quiz2.name);

		waitForLocatorVisible(quiz1DownButton);
		waitForLocatorVisible(quiz1UpButton);
		waitForLocatorVisible(quiz2DownButton);
		waitForLocatorVisible(quiz2UpButton);

		expect(quiz1UpButton).toBeDisabled();
		expect(quiz2DownButton).toBeDisabled();

		expect(quiz1DownButton).toBeEnabled();
		expect(quiz2UpButton).toBeEnabled();

		await quiz1DownButton.click();

		expect(await codeEditor.innerText()).toBe(
			JSON.stringify([quiz2, quiz1] satisfies QuizPackageList)
		);

		expect(quiz1UpButton).toBeEnabled();
		expect(quiz2DownButton).toBeEnabled();

		expect(quiz1DownButton).toBeDisabled();
		expect(quiz2UpButton).toBeDisabled();

		await quiz1UpButton.click();

		expect(await codeEditor.innerText()).toBe(
			JSON.stringify([quiz1, quiz2] satisfies QuizPackageList)
		);

		expect(quiz1UpButton).toBeDisabled();
		expect(quiz2DownButton).toBeDisabled();

		expect(quiz1DownButton).toBeEnabled();
		expect(quiz2UpButton).toBeEnabled();
	});
	test("delete quiz", async ({ page }) => {
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);

		await expect(async () => {
			expect((await codeEditor.innerText()).trim()).not.toBe("");
		}).toPass({ timeout: 5000 });

		const quiz1 = {
			name: "Quiz 1",
			description: "Description of Quiz 1",
			quizData: [],
		} satisfies QuizPackage;
		const quiz2 = {
			name: "Quiz 2",
			description: "Description of Quiz 2",
			quizData: [],
		} satisfies QuizPackage;

		await codeEditor.fill(JSON.stringify([quiz1, quiz2] satisfies QuizPackageList));

		const quizName1 = locators.VISUAL_CODE_EDITOR.CONTENT.getQuizNameElement(
			page,
			quiz1.name
		);
		const quizName2 = locators.VISUAL_CODE_EDITOR.CONTENT.getQuizNameElement(
			page,
			quiz2.name
		);

		await waitForLocatorVisible(quizName1);
		await waitForLocatorVisible(quizName2);

		const quiz1DeleteBtn = locators.VISUAL_CODE_EDITOR.getDeleteButton(page, quiz1.name);
		waitForLocatorVisible(quiz1DeleteBtn);

		await quiz1DeleteBtn.click();

		await quizName1.waitFor({ state: "hidden" });

		expect(await codeEditor.innerText()).toBe(
			JSON.stringify([quiz2] satisfies QuizPackageList)
		);
	});
	test("change name and description of quiz", async ({ page }) => {
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);

		await expect(async () => {
			expect((await codeEditor.innerText()).trim()).not.toBe("");
		}).toPass({ timeout: 5000 });

		const quizBefore = {
			name: "Quiz 1",
			description: "Description of Quiz 1",
			quizData: [],
		} satisfies QuizPackage;
		const quizAfter = {
			name: "Quiz 2",
			description: "Description of Quiz 2",
			quizData: [],
		} satisfies QuizPackage;

		await codeEditor.fill(JSON.stringify([quizBefore] satisfies QuizPackageList));

		const quizNameSelectorBefore = locators.VISUAL_CODE_EDITOR.CONTENT.getQuizNameElement(
			page,
			quizBefore.name
		);
		await waitForLocatorVisible(quizNameSelectorBefore);

		const quizBeforeEditButton = locators.VISUAL_CODE_EDITOR.getEditButton(
			page,
			quizBefore.name
		);
		waitForLocatorVisible(quizBeforeEditButton);

		await quizBeforeEditButton.click();

		const modalTitle = page.locator(locators.SWAL.TITLE);
		waitForLocatorVisible(modalTitle);
		expect(await modalTitle.innerText()).toBe("Quiz bearbeiten");

		const quizNameTextarea =
			locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getQuizNameTextarea(page);
		waitForLocatorVisible(quizNameTextarea);

		const quizDescriptionTextarea =
			locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getQuizDescriptionTextarea(page);
		waitForLocatorVisible(quizDescriptionTextarea);

		expect(await quizNameTextarea.inputValue()).toBe(quizBefore.name);
		expect(await quizDescriptionTextarea.inputValue()).toBe(quizBefore.description);

		await quizNameTextarea.fill(quizAfter.name);
		await quizDescriptionTextarea.fill(quizAfter.description);

		await expect(async () => {
			expect(await codeEditor.innerText()).toBe(
				JSON.stringify([quizAfter] satisfies QuizPackageList)
			);
		}).toPass({ timeout: 5000 });

		const modalOkayButton = page.locator(locators.SWAL.CONFIRM);
		waitForLocatorVisible(modalOkayButton);
		await modalOkayButton.click();
	});
	test("add questions to quiz", async ({ page }) => {
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);

		await expect(async () => {
			expect((await codeEditor.innerText()).trim()).not.toBe("");
		}).toPass({ timeout: 5000 });

		const quizBefore = {
			...AddQuizPackageDefault,
		} satisfies QuizPackage;

		const numberOfQuestions = 150;

		const quizAfter = {
			...quizBefore,
			quizData: [...Array(numberOfQuestions).keys()].map(() => {
				return templateQuestion;
			}),
		} satisfies QuizPackage;

		await codeEditor.fill(JSON.stringify([quizBefore] satisfies QuizPackageList));

		const quizEditButton = locators.VISUAL_CODE_EDITOR.getEditButton(
			page,
			quizBefore.name
		);
		await waitForLocatorVisible(quizEditButton);
		await quizEditButton.click();

		const addQuestionButton =
			locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getAddQuestionButton(page);
		waitForLocatorVisible(addQuestionButton);

		for (let times = 0; times < numberOfQuestions; times++) {
			await addQuestionButton.click({ timeout: 5000 });
		}
		await expect(async () => {
			expect(await codeEditor.innerText()).toBe(
				JSON.stringify([quizAfter] satisfies QuizPackageList)
			);
		}).toPass({ timeout: 5000 });
		const modalOkayButton = page.locator(locators.SWAL.CONFIRM);
		waitForLocatorVisible(modalOkayButton);
		await modalOkayButton.click();
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
