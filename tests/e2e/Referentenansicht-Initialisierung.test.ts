import { test, expect, Page } from "@playwright/test";
import { waitFor } from "@testing-library/react";
import { describe } from "node:test";
import playwrightConfig from "../../playwright.config";
import {
	AnswerEntry,
	QuestionEntry,
	QuizPackage,
	QuizPackageList,
} from "@/interfaces/joi/QuizSchemas";
import {
	waitForLocatorVisible,
	locators as globalLocators,
	PATHS,
	beameransicht_locators,
} from "./helper-functions/locator-functions";
import { templateQuizPackageList } from "@/app/referentenansicht/init/constants";
import { AddQuizPackageDefault } from "@/app/components/QuizPackageListEditor/constants";
import { io } from "socket.io-client";
import { ERoomNames, ESocketEventNames } from "@/app/includes/ts/socketIO/socketNames";
import { getServerURL } from "@/app/includes/ts/settings/server-url";
import { templateQuestion } from "@/app/components/QuizPackageEditor/constants";
import { BUS_IMAGE_BASE_64 } from "./helper-functions/images";
import { fileToBase64Data } from "@/app/includes/ts/file-converter-functions";
import { DefaultAnswerToAdd } from "@/app/components/QuestionEditor/constants";

export const ROOT_PATH = PATHS.REFERENTENANSICHT.INIT;
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
					`button.add-question`
				);
			},
			getDeleteButton: (page: Page, questionTitle: string) => {
				return locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getQuizPackageEditor(page).locator(
					`[title="${questionTitle}"] button[title="Frage Löschen"]`
				);
			},

			getDownButton: (page: Page, questionTitle: string) => {
				return locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getQuizPackageEditor(page).locator(
					`[title="${questionTitle}"] button[title="Nach hinten schieben"]`
				);
			},

			getUpButton: (page: Page, questionTitle: string) => {
				return locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getQuizPackageEditor(page).locator(
					`[title="${questionTitle}"] button[title="Nach vorne schieben"]`
				);
			},
			getEditButton: (page: Page, questionTitle: string) => {
				return locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getQuizPackageEditor(page).locator(
					`[title="${questionTitle}"] button[title="Frage Bearbeiten"]`
				);
			},
		},
		EDIT_QUESTION: {
			getQuestionEditor: (page: Page) => {
				return page.locator(`${locators.SWAL.MODAL_CONTAINER} [class*=questionEditor]`);
			},
			getQuestionTextTextarea: (page: Page) => {
				return locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getQuestionEditor(page).locator(
					`.question textarea`
				);
			},
			getImageUploadButton: (page: Page) => {
				return locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getQuestionEditor(page).locator(
					`.question input#formFile`
				);
			},
			getImage: (page: Page) => {
				return locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getQuestionEditor(page).locator(
					`.question .image-wrapper img`
				);
			},
			getImageDeleteBtn: (page: Page) => {
				return locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getQuestionEditor(page).locator(
					`.question button.img-delete`
				);
			},

			getAddAnswerButton: (page: Page) => {
				return locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getQuestionEditor(page).locator(
					`button.add-answer`
				);
			},
			getDeleteButton: (page: Page, answerText: string) => {
				return locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getQuestionEditor(page).locator(
					`[data-answer-text=\"${answerText}\"] button[title="Antwort löschen"]`
				);
			},

			getDownButton: (page: Page, answerText: string) => {
				return locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getQuestionEditor(page).locator(
					`[data-answer-text=\"${answerText}\"] button[title="Antwort nach unten schieben"]`
				);
			},

			getUpButton: (page: Page, questionTitle: string) => {
				return locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getQuestionEditor(page).locator(
					`[data-answer-text=\"${questionTitle}\"] button[title="Antwort nach oben schieben"]`
				);
			},
			getToggleCorrectButton: (page: Page, questionTitle: string) => {
				return locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getQuestionEditor(page).locator(
					`[data-answer-text=\"${questionTitle}\"] button[title="Antwortmöglichkeit Korrektheit umschalten"]`
				);
			},
			getAnswerTextarea: (page: Page, answerText: string) => {
				return locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getQuestionEditor(page).locator(
					`[data-answer-text=\"${answerText}\"] .content textarea`
				);
			},
		},
	},
	SWAL: globalLocators.SWAL,
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
		await beamerAnsichtPage.goto(PATHS.BEAMERANSICHT);

		const beamerAnsichtWaiting = beamerAnsichtPage.locator(
			beameransicht_locators.WAITING
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

		const questionText =
			beameransicht_locators.QUIZ_READ_ONLY.getQuestion(beamerAnsichtPage);
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

		await waitForLocatorVisible(quiz1DownButton);
		await waitForLocatorVisible(quiz1UpButton);
		await waitForLocatorVisible(quiz2DownButton);
		await waitForLocatorVisible(quiz2UpButton);

		await expect(quiz1UpButton).toBeDisabled();
		await expect(quiz2DownButton).toBeDisabled();

		await expect(quiz1DownButton).toBeEnabled();
		await expect(quiz2UpButton).toBeEnabled();

		await quiz1DownButton.click();

		await expect(async () => {
			expect(await codeEditor.innerText()).toBe(
				JSON.stringify([quiz2, quiz1] satisfies QuizPackageList)
			);
		}).toPass({ timeout: 5000 });

		await expect(quiz1UpButton).toBeEnabled();
		await expect(quiz2DownButton).toBeEnabled();

		await expect(quiz1DownButton).toBeDisabled();
		await expect(quiz2UpButton).toBeDisabled();

		await quiz1UpButton.click();

		await expect(async () => {
			expect(await codeEditor.innerText()).toBe(
				JSON.stringify([quiz1, quiz2] satisfies QuizPackageList)
			);
		}).toPass({ timeout: 5000 });

		await expect(quiz1UpButton).toBeDisabled();
		await expect(quiz2DownButton).toBeDisabled();

		await expect(quiz1DownButton).toBeEnabled();
		await expect(quiz2UpButton).toBeEnabled();
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

		const numberOfQuestions = 50;

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
	test("rearange questions in quiz", async ({ page }) => {
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);

		await expect(async () => {
			expect((await codeEditor.innerText()).trim()).not.toBe("");
		}).toPass({ timeout: 5000 });

		const question1 = { question: "Frage 1?", answers: [] } satisfies QuestionEntry;
		const question2 = { question: "Frage 2?", answers: [] } satisfies QuestionEntry;

		const quiz = {
			name: "Quiz 1",
			description: "Description of Quiz 1",
			quizData: [question1, question2],
		} satisfies QuizPackage;

		await codeEditor.fill(JSON.stringify([quiz] satisfies QuizPackageList));

		const quizEditButton = locators.VISUAL_CODE_EDITOR.getEditButton(page, quiz.name);
		await waitForLocatorVisible(quizEditButton);

		await quizEditButton.click();

		const modalTitle = page.locator(locators.SWAL.TITLE);
		await waitForLocatorVisible(modalTitle);
		expect(await modalTitle.innerText()).toBe("Quiz bearbeiten");

		const quiz1DownButton = locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getDownButton(
			page,
			question1.question
		);
		const quiz1UpButton = locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getUpButton(
			page,
			question1.question
		);
		const quiz2DownButton = locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getDownButton(
			page,
			question2.question
		);
		const quiz2UpButton = locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getUpButton(
			page,
			question2.question
		);

		await waitForLocatorVisible(quiz1DownButton);
		await waitForLocatorVisible(quiz1UpButton);
		await waitForLocatorVisible(quiz2DownButton);
		await waitForLocatorVisible(quiz2UpButton);

		await expect(quiz1UpButton).toBeDisabled();
		await expect(quiz2DownButton).toBeDisabled();

		await expect(quiz1DownButton).toBeEnabled();
		await expect(quiz2UpButton).toBeEnabled();

		await quiz1DownButton.click();

		await expect(async () => {
			expect(await codeEditor.innerText()).toBe(
				JSON.stringify([
					{ ...quiz, quizData: [question2, question1] },
				] satisfies QuizPackageList)
			);
		}).toPass({ timeout: 5000 });

		await expect(quiz1UpButton).toBeEnabled();
		await expect(quiz2DownButton).toBeEnabled();

		await expect(quiz1DownButton).toBeDisabled();
		await expect(quiz2UpButton).toBeDisabled();

		await quiz1UpButton.click();

		await expect(async () => {
			expect(await codeEditor.innerText()).toBe(
				JSON.stringify([
					{ ...quiz, quizData: [question1, question2] },
				] satisfies QuizPackageList)
			);
		}).toPass({ timeout: 5000 });

		await expect(quiz1UpButton).toBeDisabled();
		await expect(quiz2DownButton).toBeDisabled();

		await expect(quiz1DownButton).toBeEnabled();
		await expect(quiz2UpButton).toBeEnabled();
	});
	test("delete question in quiz", async ({ page }) => {
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);

		await expect(async () => {
			expect((await codeEditor.innerText()).trim()).not.toBe("");
		}).toPass({ timeout: 5000 });

		const question1 = { question: "Frage 1?", answers: [] } satisfies QuestionEntry;
		const question2 = { question: "Frage 2?", answers: [] } satisfies QuestionEntry;

		const quiz = {
			name: "Quiz 1",
			description: "Description of Quiz 1",
			quizData: [question1, question2],
		} satisfies QuizPackage;

		await codeEditor.fill(JSON.stringify([quiz] satisfies QuizPackageList));

		const quizEditButton = locators.VISUAL_CODE_EDITOR.getEditButton(page, quiz.name);
		await waitForLocatorVisible(quizEditButton);

		await quizEditButton.click();

		const modalTitle = page.locator(locators.SWAL.TITLE);
		await waitForLocatorVisible(modalTitle);
		expect(await modalTitle.innerText()).toBe("Quiz bearbeiten");

		const deleteQuestion1Btn = locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getDeleteButton(
			page,
			question1.question
		);
		await waitForLocatorVisible(deleteQuestion1Btn);

		await deleteQuestion1Btn.click();

		await expect(async () => {
			expect(await codeEditor.innerText()).toBe(
				JSON.stringify([{ ...quiz, quizData: [question2] }] satisfies QuizPackageList)
			);
		}).toPass({ timeout: 5000 });
	});

	test("open question edit modal", async ({ page }) => {
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);

		await expect(async () => {
			expect((await codeEditor.innerText()).trim()).not.toBe("");
		}).toPass({ timeout: 5000 });

		const question1 = { question: "Frage 1?", answers: [] } satisfies QuestionEntry;
		const question2 = { question: "Frage 2?", answers: [] } satisfies QuestionEntry;

		const quiz = {
			name: "Quiz 1",
			description: "Description of Quiz 1",
			quizData: [question1, question2],
		} satisfies QuizPackage;

		await codeEditor.fill(JSON.stringify([quiz] satisfies QuizPackageList));

		const quizEditButton = locators.VISUAL_CODE_EDITOR.getEditButton(page, quiz.name);
		await waitForLocatorVisible(quizEditButton);

		await quizEditButton.click();

		const modalTitle = page.locator(locators.SWAL.TITLE);
		await waitForLocatorVisible(modalTitle);
		expect(await modalTitle.innerText()).toBe("Quiz bearbeiten");

		const editQuestionBtn = locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getEditButton(
			page,
			question1.question
		);
		await waitForLocatorVisible(editQuestionBtn);

		await editQuestionBtn.click();

		await waitForLocatorVisible(modalTitle);
		expect(await modalTitle.innerText()).toBe("Frage bearbeiten");
	});
	test("change question text of question", async ({ page }) => {
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);

		await expect(async () => {
			expect((await codeEditor.innerText()).trim()).not.toBe("");
		}).toPass({ timeout: 5000 });

		const question1 = { question: "Frage 1?", answers: [] } satisfies QuestionEntry;
		const newQuestion = {
			...question1,
			question: "This is the new question text?",
		} satisfies QuestionEntry;

		const quiz = {
			name: "Quiz 1",
			description: "Description of Quiz 1",
			quizData: [question1],
		} satisfies QuizPackage;

		await codeEditor.fill(JSON.stringify([quiz] satisfies QuizPackageList));

		const quizEditButton = locators.VISUAL_CODE_EDITOR.getEditButton(page, quiz.name);
		await waitForLocatorVisible(quizEditButton);

		await quizEditButton.click();

		const modalTitle = page.locator(locators.SWAL.TITLE);
		await waitForLocatorVisible(modalTitle);
		expect(await modalTitle.innerText()).toBe("Quiz bearbeiten");

		const editQuestionBtn = locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getEditButton(
			page,
			question1.question
		);
		await waitForLocatorVisible(editQuestionBtn);

		await editQuestionBtn.click();

		await waitForLocatorVisible(modalTitle);
		expect(await modalTitle.innerText()).toBe("Frage bearbeiten");

		const questionTextTextarea =
			locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getQuestionTextTextarea(page);
		await waitForLocatorVisible(questionTextTextarea);

		await questionTextTextarea.fill(newQuestion.question);

		await expect(async () => {
			expect(await codeEditor.innerText()).toBe(
				JSON.stringify([{ ...quiz, quizData: [newQuestion] }] satisfies QuizPackageList)
			);
		}).toPass({ timeout: 5000 });
	});
	test("add question image", async ({ page }) => {
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);

		await expect(async () => {
			expect((await codeEditor.innerText()).trim()).not.toBe("");
		}).toPass({ timeout: 5000 });

		const question1 = { question: "Frage 1?", answers: [] } satisfies QuestionEntry;
		const newQuestion = {
			...question1,
			image: { base64: BUS_IMAGE_BASE_64.data },
		} satisfies QuestionEntry;

		const quiz = {
			name: "Quiz 1",
			description: "Description of Quiz 1",
			quizData: [question1],
		} satisfies QuizPackage;

		await codeEditor.fill(JSON.stringify([quiz] satisfies QuizPackageList));

		const quizEditButton = locators.VISUAL_CODE_EDITOR.getEditButton(page, quiz.name);
		await waitForLocatorVisible(quizEditButton);

		await quizEditButton.click();

		const modalTitle = page.locator(locators.SWAL.TITLE);
		await waitForLocatorVisible(modalTitle);
		expect(await modalTitle.innerText()).toBe("Quiz bearbeiten");

		const editQuestionBtn = locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getEditButton(
			page,
			question1.question
		);
		await waitForLocatorVisible(editQuestionBtn);

		await editQuestionBtn.click();

		await waitForLocatorVisible(modalTitle);
		expect(await modalTitle.innerText()).toBe("Frage bearbeiten");

		const imageUploadButton =
			locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getImageUploadButton(page);
		await waitForLocatorVisible(imageUploadButton);

		const fileChooserPromise = page.waitForEvent("filechooser");
		await imageUploadButton.click();
		const fileChooser = await fileChooserPromise;

		expect(fileChooser.isMultiple()).toBe(false);

		const buffer = Buffer.from(BUS_IMAGE_BASE_64.data, "base64");

		await fileChooser.setFiles([
			{
				buffer: buffer,
				mimeType: BUS_IMAGE_BASE_64.mimeType,
				name: `test.${BUS_IMAGE_BASE_64.fileEnding}`,
			},
		]);

		await expect(async () => {
			expect(await codeEditor.innerText()).not.toBe(
				JSON.stringify([{ ...quiz, quizData: [newQuestion] }] satisfies QuizPackageList)
			);
		}).toPass({ timeout: 5000 });

		const img = locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getImage(page);
		await waitForLocatorVisible(img);
		expect(await img.getAttribute("src")).toContain(BUS_IMAGE_BASE_64.data);

		await imageUploadButton.waitFor({ state: "hidden" });

		const deleteImgButton =
			locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getImageDeleteBtn(page);
		await waitForLocatorVisible(deleteImgButton);
	});
	test("remove question image", async ({ page }) => {
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);

		await expect(async () => {
			expect((await codeEditor.innerText()).trim()).not.toBe("");
		}).toPass({ timeout: 5000 });

		const question1 = { question: "Frage 1?", answers: [] } satisfies QuestionEntry;
		const newQuestion = {
			...question1,
			image: { base64: BUS_IMAGE_BASE_64.data },
		} satisfies QuestionEntry;

		const quiz = {
			name: "Quiz 1",
			description: "Description of Quiz 1",
			quizData: [question1],
		} satisfies QuizPackage;

		await codeEditor.fill(JSON.stringify([quiz] satisfies QuizPackageList));

		const quizEditButton = locators.VISUAL_CODE_EDITOR.getEditButton(page, quiz.name);
		await waitForLocatorVisible(quizEditButton);

		await quizEditButton.click();

		const modalTitle = page.locator(locators.SWAL.TITLE);
		await waitForLocatorVisible(modalTitle);
		expect(await modalTitle.innerText()).toBe("Quiz bearbeiten");

		const editQuestionBtn = locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getEditButton(
			page,
			question1.question
		);
		await waitForLocatorVisible(editQuestionBtn);

		await editQuestionBtn.click();

		await waitForLocatorVisible(modalTitle);
		expect(await modalTitle.innerText()).toBe("Frage bearbeiten");

		const imageUploadButton =
			locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getImageUploadButton(page);
		await waitForLocatorVisible(imageUploadButton);

		const fileChooserPromise = page.waitForEvent("filechooser");
		await imageUploadButton.click();
		const fileChooser = await fileChooserPromise;

		expect(fileChooser.isMultiple()).toBe(false);

		const buffer = Buffer.from(BUS_IMAGE_BASE_64.data, "base64");

		const fileName = `test.${BUS_IMAGE_BASE_64.fileEnding}`;

		await fileChooser.setFiles([
			{
				buffer: buffer,
				mimeType: BUS_IMAGE_BASE_64.mimeType,
				name: fileName,
			},
		]);

		await expect(async () => {
			expect(await codeEditor.innerText()).toContain(BUS_IMAGE_BASE_64.data);
		}).toPass({ timeout: 5000 });

		const img = locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getImage(page);
		await waitForLocatorVisible(img);
		expect(await img.getAttribute("src")).toContain(BUS_IMAGE_BASE_64.data);

		await imageUploadButton.waitFor({ state: "hidden" });

		const deleteImgButton =
			locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getImageDeleteBtn(page);
		await waitForLocatorVisible(deleteImgButton);

		await deleteImgButton.click();

		await deleteImgButton.waitFor({ state: "hidden" });
		await img.waitFor({ state: "hidden" });

		await waitForLocatorVisible(imageUploadButton);

		await expect(async () => {
			expect(await codeEditor.innerText()).not.toContain(BUS_IMAGE_BASE_64.data);
		}).toPass({ timeout: 10000 });
	});
	test("add answer", async ({ page }) => {
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);

		await expect(async () => {
			expect((await codeEditor.innerText()).trim()).not.toBe("");
		}).toPass({ timeout: 5000 });

		const questionBefore = {
			question: "Question?",
			answers: [],
		} satisfies QuestionEntry;

		//TODO: Examinate why 120 and higher doesnt work
		const numberOfAnswers = 100;

		const questionAfter = {
			...questionBefore,
			answers: [...Array(numberOfAnswers).keys()].map(() => {
				return DefaultAnswerToAdd;
			}),
		} satisfies QuestionEntry;

		const quiz = {
			name: "My cool quiz",
			description: "My cool description",
			quizData: [questionBefore],
		} satisfies QuizPackage;

		await codeEditor.fill(JSON.stringify([quiz] satisfies QuizPackageList));

		const quizEditButton = locators.VISUAL_CODE_EDITOR.getEditButton(page, quiz.name);
		await waitForLocatorVisible(quizEditButton);
		await quizEditButton.click();

		const modalTitle = page.locator(locators.SWAL.TITLE);
		await waitForLocatorVisible(modalTitle);
		expect(await modalTitle.innerText()).toBe("Quiz bearbeiten");

		const questionEditButton = locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getEditButton(
			page,
			questionBefore.question
		);
		await waitForLocatorVisible(questionEditButton);

		await questionEditButton.click();

		await waitForLocatorVisible(modalTitle);
		expect(await modalTitle.innerText()).toBe("Frage bearbeiten");

		const addAnswerButton =
			locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getAddAnswerButton(page);
		await waitForLocatorVisible(addAnswerButton);

		for (let times = 0; times < numberOfAnswers; times++) {
			await addAnswerButton.click({ timeout: 5000 });
		}
		await expect(async () => {
			expect(await codeEditor.innerText()).toBe(
				JSON.stringify([{ ...quiz, quizData: [questionAfter] }] satisfies QuizPackageList)
			);
		}).toPass({ timeout: 10000 });
		const modalOkayButton = page.locator(locators.SWAL.CONFIRM);
		await waitForLocatorVisible(modalOkayButton);
		await modalOkayButton.click();
	});
	test("delete answer", async ({ page }) => {
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);

		await expect(async () => {
			expect((await codeEditor.innerText()).trim()).not.toBe("");
		}).toPass({ timeout: 5000 });

		const answer1 = {
			text: "This is the first answer entry.",
			isCorrect: false,
		} satisfies AnswerEntry;
		const answer2 = {
			text: "This is the second answer entry.",
			isCorrect: true,
		} satisfies AnswerEntry;

		const questionBefore = {
			question: "This is the question text?",
			answers: [answer1, answer2],
		} satisfies QuestionEntry;

		const quiz = {
			name: "My cool quiz",
			description: "My cool description",
			quizData: [questionBefore],
		} satisfies QuizPackage;

		await codeEditor.fill(JSON.stringify([quiz] satisfies QuizPackageList));

		const quiz1EditButton = locators.VISUAL_CODE_EDITOR.getEditButton(page, quiz.name);
		await waitForLocatorVisible(quiz1EditButton);

		await quiz1EditButton.click();

		const modalTitle = page.locator(locators.SWAL.TITLE);
		await waitForLocatorVisible(modalTitle);
		expect(await modalTitle.innerText()).toBe("Quiz bearbeiten");

		const question1EditButton = locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getEditButton(
			page,
			questionBefore.question
		);
		await waitForLocatorVisible(question1EditButton);

		await question1EditButton.click();

		const answer1TextInput = locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getAnswerTextarea(
			page,
			answer1.text
		);
		const answer2TextInput = locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getAnswerTextarea(
			page,
			answer2.text
		);

		await waitForLocatorVisible(answer1TextInput);
		await waitForLocatorVisible(answer2TextInput);

		const answer1DeleteButton = locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getDeleteButton(
			page,
			answer1.text
		);
		await waitForLocatorVisible(answer1DeleteButton);

		await answer1DeleteButton.click();

		await answer1TextInput.waitFor({ state: "hidden" });

		await expect(async () => {
			expect(await codeEditor.innerText()).toBe(
				JSON.stringify([
					{ ...quiz, quizData: [{ ...questionBefore, answers: [answer2] }] },
				] satisfies QuizPackageList)
			);
		}).toPass();
	});
	test("modify answer text", async ({ page }) => {
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);

		await expect(async () => {
			expect((await codeEditor.innerText()).trim()).not.toBe("");
		}).toPass({ timeout: 5000 });

		const answerBefore = {
			text: "This is the first answer entry.",
			isCorrect: false,
		} satisfies AnswerEntry;

		const answerAfter = {
			...answerBefore,
			text: "This is the first edited answer entry.",
		} satisfies AnswerEntry;

		const question = {
			question: "This is the question text?",
			answers: [answerBefore],
		} satisfies QuestionEntry;

		const quiz = {
			name: "My cool quiz",
			description: "My cool description",
			quizData: [question],
		} satisfies QuizPackage;

		await codeEditor.fill(JSON.stringify([quiz] satisfies QuizPackageList));

		const quiz1EditButton = locators.VISUAL_CODE_EDITOR.getEditButton(page, quiz.name);
		await waitForLocatorVisible(quiz1EditButton);

		await quiz1EditButton.click();

		const modalTitle = page.locator(locators.SWAL.TITLE);
		await waitForLocatorVisible(modalTitle);
		expect(await modalTitle.innerText()).toBe("Quiz bearbeiten");

		const question1EditButton = locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getEditButton(
			page,
			question.question
		);
		await waitForLocatorVisible(question1EditButton);

		await question1EditButton.click();

		const answer1TextInput = locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getAnswerTextarea(
			page,
			answerBefore.text
		);

		await waitForLocatorVisible(answer1TextInput);

		await answer1TextInput.fill(answerAfter.text);

		await expect(async () => {
			expect(await codeEditor.innerText()).toBe(
				JSON.stringify([
					{ ...quiz, quizData: [{ ...question, answers: [answerAfter] }] },
				] satisfies QuizPackageList)
			);
		}).toPass();
	});
	test("rearange answer", async ({ page }) => {
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);

		await expect(async () => {
			expect((await codeEditor.innerText()).trim()).not.toBe("");
		}).toPass({ timeout: 5000 });

		const answer1 = {
			text: "This is the first answer entry.",
			isCorrect: false,
		} satisfies AnswerEntry;

		const answer2 = {
			text: "This is the second answer entry.",
			isCorrect: true,
		} satisfies AnswerEntry;

		const question = {
			question: "This is the question text?",
			answers: [answer1, answer2],
		} satisfies QuestionEntry;

		const quiz = {
			name: "My cool quiz",
			description: "My cool description",
			quizData: [question],
		} satisfies QuizPackage;

		await codeEditor.fill(JSON.stringify([quiz] satisfies QuizPackageList));

		const quiz1EditButton = locators.VISUAL_CODE_EDITOR.getEditButton(page, quiz.name);
		await waitForLocatorVisible(quiz1EditButton);

		await quiz1EditButton.click();

		const modalTitle = page.locator(locators.SWAL.TITLE);
		await waitForLocatorVisible(modalTitle);
		expect(await modalTitle.innerText()).toBe("Quiz bearbeiten");

		const questionEditButton = locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getEditButton(
			page,
			question.question
		);
		await waitForLocatorVisible(questionEditButton);

		await questionEditButton.click();

		const answer1DownButton = locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getDownButton(
			page,
			answer1.text
		);
		const answer1UpButton = locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getUpButton(
			page,
			answer1.text
		);

		const answer2DownButton = locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getDownButton(
			page,
			answer2.text
		);
		const answer2UpButton = locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getUpButton(
			page,
			answer2.text
		);

		await waitForLocatorVisible(answer1DownButton);
		await waitForLocatorVisible(answer1UpButton);
		await waitForLocatorVisible(answer2DownButton);
		await waitForLocatorVisible(answer2UpButton);

		await expect(answer1DownButton).toBeEnabled();
		await expect(answer1UpButton).toBeDisabled();

		await expect(answer2DownButton).toBeDisabled();
		await expect(answer2UpButton).toBeEnabled();

		await answer1DownButton.click();

		await expect(async () => {
			expect(await codeEditor.innerText()).toBe(
				JSON.stringify([
					{ ...quiz, quizData: [{ ...question, answers: [answer2, answer1] }] },
				] satisfies QuizPackageList)
			);
		}).toPass();

		await expect(answer1DownButton).toBeDisabled();
		await expect(answer1UpButton).toBeEnabled();

		await expect(answer2DownButton).toBeEnabled();
		await expect(answer2UpButton).toBeDisabled();

		await answer1UpButton.click();

		await expect(answer1DownButton).toBeEnabled();
		await expect(answer1UpButton).toBeDisabled();

		await expect(answer2DownButton).toBeDisabled();
		await expect(answer2UpButton).toBeEnabled();

		await expect(async () => {
			expect(await codeEditor.innerText()).toBe(
				JSON.stringify([
					{ ...quiz, quizData: [{ ...question, answers: [answer1, answer2] }] },
				] satisfies QuizPackageList)
			);
		}).toPass();
	});

	test("change answer is correct", async ({ page }) => {
		const codeEditor = page.locator(locators.CODE_EDITOR);
		await waitForLocatorVisible(codeEditor);

		await expect(async () => {
			expect((await codeEditor.innerText()).trim()).not.toBe("");
		}).toPass({ timeout: 5000 });

		const answer = {
			text: "This is the first answer entry.",
			isCorrect: false,
		} satisfies AnswerEntry;

		const question = {
			question: "This is the question text?",
			answers: [answer],
		} satisfies QuestionEntry;

		const quiz = {
			name: "My cool quiz",
			description: "My cool description",
			quizData: [question],
		} satisfies QuizPackage;

		await codeEditor.fill(JSON.stringify([quiz] satisfies QuizPackageList));

		const quiz1EditButton = locators.VISUAL_CODE_EDITOR.getEditButton(page, quiz.name);
		await waitForLocatorVisible(quiz1EditButton);

		await quiz1EditButton.click();

		const modalTitle = page.locator(locators.SWAL.TITLE);
		await waitForLocatorVisible(modalTitle);
		expect(await modalTitle.innerText()).toBe("Quiz bearbeiten");

		const question1EditButton = locators.VISUAL_CODE_EDITOR.EDIT_QUIZ.getEditButton(
			page,
			question.question
		);
		await waitForLocatorVisible(question1EditButton);

		await question1EditButton.click();

		const answer1IsCorrectToggleButton =
			locators.VISUAL_CODE_EDITOR.EDIT_QUESTION.getToggleCorrectButton(page, answer.text);

		await waitForLocatorVisible(answer1IsCorrectToggleButton);

		await answer1IsCorrectToggleButton.click();

		await expect(async () => {
			expect(await codeEditor.innerText()).toBe(
				JSON.stringify([
					{
						...quiz,
						quizData: [{ ...question, answers: [{ ...answer, isCorrect: true }] }],
					},
				] satisfies QuizPackageList)
			);
		}).toPass();

		await answer1IsCorrectToggleButton.click();

		await expect(async () => {
			expect(await codeEditor.innerText()).toBe(
				JSON.stringify([
					{
						...quiz,
						quizData: [{ ...question, answers: [{ ...answer, isCorrect: false }] }],
					},
				] satisfies QuizPackageList)
			);
		}).toPass();
	});
});
