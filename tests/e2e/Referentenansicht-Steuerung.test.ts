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
import { QuizPackage } from "@/interfaces/joi";
import { ROOT_PATH as Beameransicht_ROOT_PATH } from "./Beameransicht.test";
import { beameransicht_locators } from "./helper-functions/locator-functions";

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

describe("Referentenansicht Steuerung", () => {
	test("link back to start page works", async ({ page }) => {
		const link = page.getByRole("link", { name: "Zur Übersicht" });
		await expect(link).toBeVisible();
		await link.click();
		await page.waitForURL("/");
	});
	test("question change", async ({ page, context }) => {
		await initQuizViaSocketIO(testQuiz);

		const beameransichtPage = await context.newPage();
		await beameransichtPage.goto(Beameransicht_ROOT_PATH);

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
