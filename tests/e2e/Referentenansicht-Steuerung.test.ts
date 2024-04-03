import { test, expect, Page } from "@playwright/test";
import { describe } from "node:test";
import { io } from "socket.io-client";
import { getServerURL } from "@/app/includes/ts/settings/server-url";
import { ERoomNames, ESocketEventNames } from "@/app/includes/ts/socketIO/socketNames";
import {
	PATHS,
	locators as globalLocators,
	waitForLocatorVisible,
} from "./helper-functions/locator-functions";
import { QuestionEntry, QuizPackage } from "@/interfaces/joi";
import {
	beameransicht_locators,
	referentenansicht_control_locators as locators,
} from "./helper-functions/locator-functions";
import { ScoreMode } from "@/interfaces/scoreMode";
import { UserWithCount, UserWithCountList } from "@/interfaces/user-counter";

export const ROOT_PATH = PATHS.REFERENTENANSICHT.CONTROL;

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

	let showScoreDisplayOnServer = 0;
	initSocketIO.on(ESocketEventNames.SEND_SHOW_SCORE_DISPLAY, (showScoreDisplay) => {
		showScoreDisplayOnServer = showScoreDisplay;
	});

	initSocketIO.emit(ESocketEventNames.JOIN_ROOM, ERoomNames.REFERENT_CONTROL);
	initSocketIO.emit(ESocketEventNames.INIT_QUIZ, null);
	initSocketIO.emit(ESocketEventNames.SEND_COUNTER_VALUE, 0);
	initSocketIO.emit(ESocketEventNames.SEND_SCORE_MODE, ScoreMode.GLOBAL);
	initSocketIO.emit(ESocketEventNames.SEND_SHOW_SOLUTIONS, false);
	initSocketIO.emit(ESocketEventNames.SEND_SHOW_SCORE_DISPLAY, false);
	initSocketIO.emit(
		ESocketEventNames.SEND_USER_WITH_COUNT_LIST,
		[] satisfies UserWithCountList
	);
	initSocketIO.emit(
		ESocketEventNames.SEND_USER_WITH_COUNT_LIST,
		[] satisfies UserWithCountList
	);

	initSocketIO.emit(ESocketEventNames.GET_QUIZ_DATA);
	initSocketIO.emit(ESocketEventNames.GET_SHOW_SCORE_DISPLAY);

	await expect(async () => {
		expect(quizDataOnServer).toBe(null);
	}).toPass({ timeout: 5000 });

	await expect(async () => {
		expect(showScoreDisplayOnServer).toBe(false);
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

	const initQuizMessage = locators.PREVIEW.getInitQuizMessage(page);
	await waitForLocatorVisible(initQuizMessage);
	expect(await initQuizMessage.innerText()).toBe(
		"Bitte initialisiere das Quiz zuerst oder füge eine Frage hinzu."
	);

	await modalTitle.waitFor({ state: "hidden" });
});

const testQuiz = {
	name: "IT-Azubi Quiz",
	description: "Ein Quiz für angehende IT-Azubis.",
	quizData: [
		{
			question:
				"Was ist ein IP-Adressbereich, der ausschließlich für private Netzwerke reserviert ist?",
			answers: [
				{ text: "A) 192.168.0.0 – 192.168.255.255", isCorrect: true },
				{ text: "B) 172.16.0.0 – 172.31.255.255", isCorrect: false },
				{ text: "C) 10.0.0.0 – 10.255.255.255", isCorrect: false },
			],
		},
		{
			question:
				"Welche Programmiersprache wird oft für die Entwicklung von Webanwendungen verwendet?",
			answers: [
				{ text: "A) Java", isCorrect: false },
				{ text: "B) Python", isCorrect: false },
				{ text: "C) JavaScript", isCorrect: true },
			],
		},
		{
			question: "Was ist eine SQL-Injection?",
			answers: [
				{
					text: "A) Eine Methode zum Schutz vor unerlaubtem Zugriff auf eine Datenbank.",
					isCorrect: false,
				},
				{
					text: "B) Eine Technik, bei der schädlicher SQL-Code in eine Anwendung eingeschleust wird.",
					isCorrect: true,
				},
				{ text: "C) Ein Befehl, um eine SQL-Datenbank zu löschen.", isCorrect: false },
			],
		},
		{
			question: "Was bedeutet die Abkürzung 'HTML'?",
			answers: [
				{ text: "A) Hyperlink Text Markup Language", isCorrect: false },
				{ text: "B) Hyper Text Markup Language", isCorrect: true },
				{ text: "C) Home Tool Markup Language", isCorrect: false },
			],
		},
		{
			question: "Welche der folgenden Aussagen beschreibt 'Big Data' am besten?",
			answers: [
				{ text: "A) Eine einzelne große Datenbank.", isCorrect: false },
				{
					text: "B) Die Verarbeitung und Analyse großer Datenmengen, die herkömmliche Datenbanken überfordern.",
					isCorrect: true,
				},
				{ text: "C) Eine Technologie zur Datenverschlüsselung.", isCorrect: false },
			],
		},
		{
			question: "Was ist ein 'LAN'?",
			answers: [
				{ text: "A) Large Access Network", isCorrect: false },
				{ text: "B) Local Area Network", isCorrect: true },
				{ text: "C) Long Antenna Node", isCorrect: false },
			],
		},
		{
			question:
				"Welche der folgenden Technologien wird oft für Versionskontrolle in der Softwareentwicklung verwendet?",
			answers: [
				{ text: "A) SVN", isCorrect: false },
				{ text: "B) Git", isCorrect: true },
				{ text: "C) FTP", isCorrect: false },
			],
		},
		{
			question: "Was ist ein 'Firewall'?",
			answers: [
				{ text: "A) Eine Sicherheitssoftware, die vor Viren schützt.", isCorrect: false },
				{
					text: "B) Eine Netzwerkvorrichtung, die den Datenverkehr überwacht und kontrolliert.",
					isCorrect: true,
				},
				{
					text: "C) Ein physischer Schutzmechanismus für Serverräume.",
					isCorrect: false,
				},
			],
		},
		{
			question: "Was ist 'Open Source' Software?",
			answers: [
				{ text: "A) Software, die frei heruntergeladen werden kann.", isCorrect: false },
				{
					text: "B) Software, deren Quellcode öffentlich zugänglich ist und von der Community entwickelt wird.",
					isCorrect: true,
				},
				{ text: "C) Software, die keine Lizenzgebühren erfordert.", isCorrect: false },
			],
		},
		{
			question: "Was ist 'Cloud Computing'?",
			answers: [
				{ text: "A) Eine Technologie zur Wettervorhersage.", isCorrect: false },
				{
					text: "B) Die Bereitstellung von IT-Ressourcen über das Internet.",
					isCorrect: true,
				},
				{ text: "C) Eine Methode zur Datenverschlüsselung.", isCorrect: false },
			],
		},
	],
} satisfies QuizPackage;

const initQuizViaSocketIO = async (quizPackage: QuizPackage) => {
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

	initSocketIO.emit(ESocketEventNames.INIT_QUIZ, quizPackage);
	initSocketIO.emit(ESocketEventNames.GET_QUIZ_DATA);

	await expect(async () => {
		expect(quizDataOnServer).toEqual(quizPackage);
	}).toPass({ timeout: 5000 });
};

const initUserScoreWithCountListViaSocketIO = async (
	userWithCountList: UserWithCountList
) => {
	const initSocketIO = io(getServerURL().toString(), { autoConnect: true });

	initSocketIO.on("connect_error", (err) => {
		console.error(`connect_error due to ${err.message}`);
	});

	await expect(() => expect(initSocketIO.connected).toBe(true)).toPass({
		timeout: 5000,
	});

	let userWithCountListOnServer = 0;
	initSocketIO.on(ESocketEventNames.SEND_USER_WITH_COUNT_LIST, (userWithCountList) => {
		userWithCountListOnServer = userWithCountList;
	});

	initSocketIO.emit(ESocketEventNames.SEND_USER_WITH_COUNT_LIST, userWithCountList);
	initSocketIO.emit(ESocketEventNames.GET_USER_WITH_COUNT_LIST);

	await expect(async () => {
		expect(userWithCountListOnServer).toEqual(userWithCountList);
	}).toPass({ timeout: 5000 });
};

describe("Referentenansicht Steuerung", () => {
	test("link back to start page works", async ({ page }) => {
		const link = page.getByRole("link", { name: "Zur Übersicht" });
		await expect(link).toBeVisible();
		await link.click();
		await page.waitForURL("/");
	});
	test("question change", async ({ page, context }) => {
		await initQuizViaSocketIO(testQuiz);

		const previewQuiz = locators.PREVIEW.QUIZ_READ_ONLY.getQuizReadOnly(page);
		await waitForLocatorVisible(previewQuiz);

		const beameransichtPage = await context.newPage();
		await beameransichtPage.goto(PATHS.BEAMERANSICHT);

		const quiz = beameransicht_locators.QUIZ_READ_ONLY.getQuizReadOnly(beameransichtPage);
		await waitForLocatorVisible(quiz);

		const questionNumberCurrent = locators.CONTROLLER.getQuestionNumberCurrent(page);
		const questionNumberMax = locators.CONTROLLER.getQuestionNumberMax(page);

		expect(testQuiz.quizData.length).toBeGreaterThanOrEqual(2);

		expect(await questionNumberCurrent.innerText()).toBe(String(1));
		expect(await questionNumberMax.innerText()).toBe(String(testQuiz.quizData.length));

		const nextQuestionButton = locators.CONTROLLER.getBtnNext(page);
		const previousQuestionButton = locators.CONTROLLER.getBtnNext(page);

		await waitForLocatorVisible(nextQuestionButton);
		await waitForLocatorVisible(previousQuestionButton);

		const questionsAreSyncedAndHaveCorrectValue = async (question: QuestionEntry) => {
			const questionTextPreview = locators.PREVIEW.QUIZ_READ_ONLY.getQuestion(page);
			await waitForLocatorVisible(questionTextPreview);

			const questionTextQuiz =
				beameransicht_locators.QUIZ_READ_ONLY.getQuestion(beameransichtPage);
			await waitForLocatorVisible(questionTextQuiz);

			expect(await questionTextPreview.innerText()).toBe(question.question);
			expect(await questionTextQuiz.innerText()).toBe(question.question);
		};

		await questionsAreSyncedAndHaveCorrectValue(testQuiz.quizData[0]);

		await nextQuestionButton.click();

		expect(await questionNumberCurrent.innerText()).toBe(String(1));
		await questionsAreSyncedAndHaveCorrectValue(testQuiz.quizData[1]);

		await previousQuestionButton.click();

		expect(await questionNumberCurrent.innerText()).toBe(String(0));
		await questionsAreSyncedAndHaveCorrectValue(testQuiz.quizData[0]);
	});
	test("show solutions in preview", async ({ page }) => {
		await initQuizViaSocketIO(testQuiz);

		const previewQuiz = locators.PREVIEW.QUIZ_READ_ONLY.getQuizReadOnly(page);
		await waitForLocatorVisible(previewQuiz);

		const showSolutionsPreviewSwitch =
			locators.CONTROLLER.getShowSolutionsPreviewSwitch(page);
		await waitForLocatorVisible(showSolutionsPreviewSwitch);

		expect(await showSolutionsPreviewSwitch.isChecked()).toBe(false);

		const getCountCorrectAnswersInQuestionEntry = (questionEntry: QuestionEntry) => {
			return questionEntry.answers.filter((current) => current.isCorrect).length;
		};
		const getCountCorrectAnswersInQuiz = async (page: Page) => {
			return (await page.$$(beameransicht_locators.QUIZ_READ_ONLY.ANSWER.CORRECT)).length;
		};
		const getCountWrongAnswersInQuestionEntry = (questionEntry: QuestionEntry) => {
			return questionEntry.answers.filter((current) => !current.isCorrect).length;
		};
		const getCountWrongAnswersInQuiz = async (page: Page) => {
			return (await page.$$(beameransicht_locators.QUIZ_READ_ONLY.ANSWER.WRONG)).length;
		};

		await showSolutionsPreviewSwitch.click();

		expect(await getCountCorrectAnswersInQuiz(page)).toBe(
			getCountCorrectAnswersInQuestionEntry(testQuiz.quizData[0])
		);
		expect(await getCountWrongAnswersInQuiz(page)).toBe(
			getCountWrongAnswersInQuestionEntry(testQuiz.quizData[0])
		);
	});
	test("set score mode", async ({ page }) => {
		const scoreModeSwitch = locators.CONTROLLER.getScoreModeSwitch(page);
		await waitForLocatorVisible(scoreModeSwitch);

		const userCounters =
			locators.CONTROLLER.SCORE_CONTROLLER.USER.getUserCounterController(page);
		const globalCounter =
			locators.CONTROLLER.SCORE_CONTROLLER.GLOBAL.getGlobalCounterController(page);

		expect(await scoreModeSwitch.isChecked()).toBe(false);

		await globalCounter.waitFor({ state: "visible" });
		await userCounters.waitFor({ state: "hidden" });

		await scoreModeSwitch.click();

		await userCounters.waitFor({ state: "visible" });
		await globalCounter.waitFor({ state: "hidden" });
	});
	test("show scores global mode ", async ({ page, context }) => {
		await initQuizViaSocketIO(testQuiz);
		const scoreModeSwitch = locators.CONTROLLER.getScoreModeSwitch(page);
		await waitForLocatorVisible(scoreModeSwitch);

		const showScoreDisplayBtn = locators.CONTROLLER.getBtnShowScoreDisplay(page);
		await waitForLocatorVisible(showScoreDisplayBtn);

		const userCounters =
			locators.CONTROLLER.SCORE_CONTROLLER.USER.getUserCounterController(page);
		const globalCounter =
			locators.CONTROLLER.SCORE_CONTROLLER.GLOBAL.getGlobalCounterController(page);

		expect(await scoreModeSwitch.isChecked()).toBe(false);

		await userCounters.waitFor({ state: "hidden" });
		await globalCounter.waitFor({ state: "visible" });

		const beameransichtPage = await context.newPage();
		await beameransichtPage.goto(PATHS.BEAMERANSICHT);

		const quiz = beameransicht_locators.QUIZ_READ_ONLY.getQuizReadOnly(beameransichtPage);
		await waitForLocatorVisible(quiz);
		const quizScore =
			beameransicht_locators.SCORE_DISPLAY.GLOBAL.getScore(beameransichtPage);

		const showScoresBtn = locators.CONTROLLER.getBtnShowScoreDisplay(page);
		await waitForLocatorVisible(showScoresBtn);

		const incrementBtn =
			locators.CONTROLLER.SCORE_CONTROLLER.GLOBAL.getBtnIncrement(page);
		const decrementBtn =
			locators.CONTROLLER.SCORE_CONTROLLER.GLOBAL.getBtnDecrement(page);
		const controllerScore =
			locators.CONTROLLER.SCORE_CONTROLLER.GLOBAL.getCurrentScore(page);

		await waitForLocatorVisible(incrementBtn);
		await waitForLocatorVisible(decrementBtn);
		await waitForLocatorVisible(controllerScore);

		const expectControllerScoreIs = async (score: number) => {
			await expect(async () =>
				expect(await controllerScore.innerText()).toBe(String(score))
			).toPass({ timeout: 1000 });
		};

		const expectQuizScoreIs = async (score: number) => {
			await expect(async () =>
				expect(await quizScore.innerText()).toBe(String(score))
			).toPass({ timeout: 1000 });
		};

		await quizScore.waitFor({ state: "hidden" });
		expect(await showScoreDisplayBtn.getAttribute("data-show-score-display")).toBe(
			String(false)
		);

		await showScoreDisplayBtn.click();

		await quizScore.waitFor({ state: "visible" });

		expect(await showScoreDisplayBtn.getAttribute("data-show-score-display")).toBe(
			String(true)
		);

		await expectControllerScoreIs(0);
		await expectQuizScoreIs(0);

		for (let i = 0; i > -100; i--) {
			await decrementBtn.click();
			await expectControllerScoreIs(i - 1);
			await expectQuizScoreIs(i - 1);
		}
		await controllerScore.dblclick();
		await expectControllerScoreIs(0);
		await expectQuizScoreIs(0);

		for (let i = 0; i < 100; i++) {
			await incrementBtn.click();
			await expectControllerScoreIs(i + 1);
			await expectQuizScoreIs(i + 1);
		}

		await controllerScore.dblclick();
		await expectControllerScoreIs(0);
		await expectQuizScoreIs(0);
	});
	test("show scores user mode", async ({ page, context }) => {
		await initQuizViaSocketIO(testQuiz);
		await initUserScoreWithCountListViaSocketIO([]);
		const scoreModeSwitch = locators.CONTROLLER.getScoreModeSwitch(page);
		await waitForLocatorVisible(scoreModeSwitch);

		const showScoreDisplayBtn = locators.CONTROLLER.getBtnShowScoreDisplay(page);
		await waitForLocatorVisible(showScoreDisplayBtn);

		expect(await showScoreDisplayBtn.getAttribute("data-show-score-display")).toBe(
			String(false)
		);

		const userCounters =
			locators.CONTROLLER.SCORE_CONTROLLER.USER.getUserCounterController(page);
		const globalCounter =
			locators.CONTROLLER.SCORE_CONTROLLER.GLOBAL.getGlobalCounterController(page);

		expect(await scoreModeSwitch.isChecked()).toBe(false);

		await userCounters.waitFor({ state: "hidden" });
		await globalCounter.waitFor({ state: "visible" });

		await scoreModeSwitch.click();
		expect(await scoreModeSwitch.isChecked()).toBe(true);

		await userCounters.waitFor({ state: "visible" });
		await globalCounter.waitFor({ state: "hidden" });

		const beameransichtPage = await context.newPage();
		await beameransichtPage.goto(PATHS.BEAMERANSICHT);

		const quiz = beameransicht_locators.QUIZ_READ_ONLY.getQuizReadOnly(beameransichtPage);
		await waitForLocatorVisible(quiz);

		const showScoresBtn = locators.CONTROLLER.getBtnShowScoreDisplay(page);
		await waitForLocatorVisible(showScoresBtn);

		await showScoreDisplayBtn.click();

		expect(await showScoreDisplayBtn.getAttribute("data-show-score-display")).toBe(
			String(true)
		);

		const editUsersBtn = locators.CONTROLLER.SCORE_CONTROLLER.USER.getEditUsersBtn(page);
		await waitForLocatorVisible(editUsersBtn);

		const usersWithCountList = [
			{ username: "Jonas", count: 1 },
			{ username: "Niklas", count: 1 },
			{ username: "Dominik", count: 0 },
		] satisfies UserWithCountList;

		const createUserWithCountListVisually = async (
			userWithCountList: UserWithCountList
		) => {
			await editUsersBtn.click();
			const modalTitle = page.locator(globalLocators.SWAL.TITLE);

			const addUserBtn =
				locators.CONTROLLER.SCORE_CONTROLLER.USER.USER_EDITOR.getAddUserBtn(page);
			await waitForLocatorVisible(addUserBtn);

			const usernameInput =
				locators.CONTROLLER.SCORE_CONTROLLER.USER.getEnterNameInput(page);

			const okBtn = page.locator(globalLocators.SWAL.CONFIRM);

			for (const user of userWithCountList) {
				await waitForLocatorVisible(modalTitle);
				expect(await modalTitle.innerText()).toBe("Benutzer bearbeiten");
				await addUserBtn.click();
				await waitForLocatorVisible(modalTitle);
				expect(await modalTitle.innerText()).toBe("Name eingeben");
				await waitForLocatorVisible(usernameInput);
				await usernameInput.fill(user.username);
				await waitForLocatorVisible(okBtn);
				await okBtn.click();
				await waitForLocatorVisible(modalTitle);
				expect(await modalTitle.innerText()).toBe("Benutzer bearbeiten");
				await waitForLocatorVisible(
					locators.CONTROLLER.SCORE_CONTROLLER.USER.USER_EDITOR.getUserEntry(
						page,
						user.username
					)
				);
			}

			await waitForLocatorVisible(okBtn);
			await okBtn.click();

			for (const user of userWithCountList) {
				const userIncrementBtn =
					locators.CONTROLLER.SCORE_CONTROLLER.USER.USER_ENTRY.getIncrementBtn(
						page,
						user.username
					);
				const userDecrementBtn =
					locators.CONTROLLER.SCORE_CONTROLLER.USER.USER_ENTRY.getDecrementBtn(
						page,
						user.username
					);
				const usercount = locators.CONTROLLER.SCORE_CONTROLLER.USER.USER_ENTRY.getCount(
					page,
					user.username
				);

				expect(await usercount.innerText()).toBe(String(0));

				if (user.count === 0) continue;

				if (user.count > 0) {
					for (let i = 0; i < user.count; i++) {
						await userIncrementBtn.click();
						expect(await usercount.innerText()).toBe(String(i + 1));
					}
				} else {
					for (let i = 0; i > user.count; i--) {
						await userDecrementBtn.click();
						expect(await usercount.innerText()).toBe(String(i - 1));
					}
				}
			}
		};

		await createUserWithCountListVisually(usersWithCountList);

		const expectUserScoreTableHasEntriesInOrder = async (
			orderList: Array<{ username: string; score: number; order: number }>
		) => {
			const userScoreEntries = await beameransichtPage.$$(
				".user-score-table .user-score-entry"
			);
			expect(userScoreEntries.length).toBe(orderList.length);
			const actualOrderList: Array<{
				username: string | undefined;
				score: number | undefined;
				order: number | undefined;
			}> = [];

			for (const entry of userScoreEntries) {
				const order = await (await entry.$(".index"))?.innerText();

				const username = await (await entry.$(".username"))?.innerText();
				const score = await (await entry.$(".count"))?.innerText();
				actualOrderList.push({
					username: username,
					score: Number(score),
					order: Number(order),
				});
			}

			expect(actualOrderList).toEqual(orderList);
		};

		await expectUserScoreTableHasEntriesInOrder([
			{ username: "Jonas", score: 1, order: 1 },
			{ username: "Niklas", score: 1, order: 1 },
			{ username: "Dominik", score: 0, order: 3 },
		]);
	});
	test("last question to first question button", async ({ page }) => {
		await initQuizViaSocketIO(testQuiz);
		const questionNumberCurrent = locators.CONTROLLER.getQuestionNumberCurrent(page);
		const questionNumberMax = locators.CONTROLLER.getQuestionNumberMax(page);

		expect(testQuiz.quizData.length).toBeGreaterThanOrEqual(1);

		expect(await questionNumberCurrent.innerText()).toBe(String(1));
		expect(await questionNumberMax.innerText()).toBe(String(testQuiz.quizData.length));

		const nextQuestionButton = locators.CONTROLLER.getBtnNext(page);
		const previousQuestionButton = locators.CONTROLLER.getBtnPrevious(page);

		await waitForLocatorVisible(nextQuestionButton);
		await waitForLocatorVisible(previousQuestionButton);

		await expect(
			nextQuestionButton.locator("[data-icon='rotate-right']")
		).not.toBeVisible();

		// Go to last question
		for (let i = 1; i < testQuiz.quizData.length; i++) {
			await nextQuestionButton.click();
			expect(await questionNumberCurrent.innerText()).toBe(String(i + 1));
		}

		await expect(nextQuestionButton.locator("[data-icon='rotate-right']")).toBeVisible();

		await nextQuestionButton.click();

		const modalTitle = page.locator(globalLocators.SWAL.TITLE);
		await waitForLocatorVisible(modalTitle);

		const modalMessage = page.locator(globalLocators.SWAL.MESSAGE);
		await waitForLocatorVisible(modalMessage);

		expect(await modalTitle.innerText()).toBe("Warnung");
		expect(await modalMessage.innerText()).toBe(
			"Es gibt keine weitere Frage. Möchtest du von vorne beginnen?"
		);

		const cancelButton = page.locator(globalLocators.SWAL.CANCEL);
		await waitForLocatorVisible(cancelButton);

		await cancelButton.click();
		expect(await questionNumberCurrent.innerText()).toBe(
			String(testQuiz.quizData.length)
		);

		await nextQuestionButton.click();

		await waitForLocatorVisible(modalMessage);

		expect(await modalTitle.innerText()).toBe("Warnung");
		expect(await modalMessage.innerText()).toBe(
			"Es gibt keine weitere Frage. Möchtest du von vorne beginnen?"
		);

		const okBtn = page.locator(globalLocators.SWAL.CONFIRM);
		await okBtn.click();
		expect(await questionNumberCurrent.innerText()).toBe(String(1));
	});
	test("first question to last question button", async ({ page }) => {
		await initQuizViaSocketIO(testQuiz);
		const questionNumberCurrent = locators.CONTROLLER.getQuestionNumberCurrent(page);
		const questionNumberMax = locators.CONTROLLER.getQuestionNumberMax(page);

		expect(testQuiz.quizData.length).toBeGreaterThanOrEqual(1);

		expect(await questionNumberCurrent.innerText()).toBe(String(1));
		expect(await questionNumberMax.innerText()).toBe(String(testQuiz.quizData.length));

		const nextQuestionButton = locators.CONTROLLER.getBtnNext(page);
		const previousQuestionButton = locators.CONTROLLER.getBtnPrevious(page);

		await waitForLocatorVisible(nextQuestionButton);
		await waitForLocatorVisible(previousQuestionButton);

		await expect(
			previousQuestionButton.locator("[data-icon='rotate-left']")
		).toBeVisible();
		await previousQuestionButton.click();

		const modalTitle = page.locator(globalLocators.SWAL.TITLE);
		await waitForLocatorVisible(modalTitle);

		const modalMessage = page.locator(globalLocators.SWAL.MESSAGE);
		await waitForLocatorVisible(modalMessage);

		expect(await modalTitle.innerText()).toBe("Warnung");
		expect(await modalMessage.innerText()).toBe(
			"Du bist bereits am Anfang. Möchtest du zur letzten Frage springen?"
		);

		const cancelButton = page.locator(globalLocators.SWAL.CANCEL);
		await waitForLocatorVisible(cancelButton);

		await cancelButton.click();
		expect(await questionNumberCurrent.innerText()).toBe(String(1));

		await previousQuestionButton.click();

		await waitForLocatorVisible(modalMessage);

		expect(await modalTitle.innerText()).toBe("Warnung");
		expect(await modalMessage.innerText()).toBe(
			"Du bist bereits am Anfang. Möchtest du zur letzten Frage springen?"
		);

		const okBtn = page.locator(globalLocators.SWAL.CONFIRM);
		await okBtn.click();

		expect(await questionNumberCurrent.innerText()).toBe(
			String(testQuiz.quizData.length)
		);

		await expect(
			previousQuestionButton.locator("[data-icon='rotate-left']")
		).not.toBeVisible();
	});
});
