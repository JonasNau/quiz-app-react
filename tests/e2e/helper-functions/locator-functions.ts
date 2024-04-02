import { Locator, Page } from "@playwright/test";

export async function waitForLocatorVisible(locator: Locator) {
	await locator.waitFor({ state: "visible" });
}

export const locators = {
	SWAL: {
		MODAL_CONTAINER: ".swal2-container",
		CODE_EDITOR:
			".swal2-container .swal2-html-container .code-editor [contenteditable=true]",
		CONFIRM: ".swal2-container button.swal2-confirm",
		TITLE: ".swal2-container .swal2-title",
		MESSAGE: ".swal2-container .swal2-html-container",
		CANCEL: ".swal2-container button.swal2-cancel",
	},
};

export const beameransicht_locators = {
	QUIZ_READ_ONLY: {
		getQuizReadOnly: (page: Page) => {
			return page.locator("[class*=quizReadOnly]");
		},
		getQuestion: (page: Page) => {
			return beameransicht_locators.QUIZ_READ_ONLY.getQuizReadOnly(page).locator(
				".question"
			);
		},
		getAnswerList: (page: Page) => {
			return beameransicht_locators.QUIZ_READ_ONLY.getQuizReadOnly(page).locator(
				".answerList"
			);
		},
		getImage: (page: Page) => {
			return beameransicht_locators.QUIZ_READ_ONLY.getQuizReadOnly(page).locator(
				".image-wrapper img"
			);
		},
		ANSWER: {
			CORRECT: '[class*="correct"]',
			WRONG: '[class*="wrong"]',
		},
	},
	WAITING: "[class*=beamer-ansicht_waiting]",
	SCORE_DISPLAY: {
		GLOBAL: {
			getScoreDisplay: (page: Page) => {
				return page.locator(".score-display-global");
			},
			getScore: (page: Page) =>
				beameransicht_locators.SCORE_DISPLAY.GLOBAL.getScoreDisplay(page).locator(
					".current"
				),
		},
		USER: {
			getScoreDisplay: (page: Page) => {
				return page.locator(".score-display-user");
			},
		},
	},
};

export const referentenansicht_control_locators = {
	CONTROLLER: {
		getController: (page: Page) => {
			return page.locator("[class*=controller]");
		},
		getQuestionNumberCurrent: (page: Page) => {
			return referentenansicht_control_locators.CONTROLLER.getController(page).locator(
				".question-number-display .current"
			);
		},
		getQuestionNumberMax: (page: Page) => {
			return referentenansicht_control_locators.CONTROLLER.getController(page).locator(
				".question-number-display .max"
			);
		},
		getShowSolutionsPreviewSwitch: (page: Page) => {
			return referentenansicht_control_locators.CONTROLLER.getController(page).locator(
				".show-solutions-preview input[type=checkbox]"
			);
		},
		getScoreModeSwitch: (page: Page) => {
			return referentenansicht_control_locators.CONTROLLER.getController(page).locator(
				".score-mode input[type=checkbox]"
			);
		},
		getBtnShowSolution: (page: Page) => {
			return referentenansicht_control_locators.CONTROLLER.getController(page).locator(
				"button.btn-show-solution"
			);
		},
		getShowSolutionLabel: (page: Page) => {
			return referentenansicht_control_locators.CONTROLLER.getController(page).locator(
				".show-solution-label"
			);
		},
		getShowScoreDisplayLabel: (page: Page) => {
			return referentenansicht_control_locators.CONTROLLER.getController(page).locator(
				".show-score-display-label"
			);
		},
		getBtnShowScoreDisplay: (page: Page) => {
			return referentenansicht_control_locators.CONTROLLER.getController(page).locator(
				"button.btn-show-score-display"
			);
		},
		getBtnPrevious: (page: Page) => {
			return referentenansicht_control_locators.CONTROLLER.getController(page).locator(
				"button.btn-previous"
			);
		},
		getBtnNext: (page: Page) => {
			return referentenansicht_control_locators.CONTROLLER.getController(page).locator(
				"button.btn-next"
			);
		},
		SCORE_CONTROLLER: {
			getScoreController: (page: Page) => {
				return referentenansicht_control_locators.CONTROLLER.getController(page).locator(
					".score-controller"
				);
			},
			GLOBAL: {
				getGlobalCounterController: (page: Page) => {
					return referentenansicht_control_locators.CONTROLLER.SCORE_CONTROLLER.getScoreController(
						page
					).locator(".global-counter");
				},
				getCurrentScore: (page: Page) => {
					return referentenansicht_control_locators.CONTROLLER.SCORE_CONTROLLER.GLOBAL.getGlobalCounterController(
						page
					).locator(".number");
				},
				getBtnIncrement: (page: Page) => {
					return referentenansicht_control_locators.CONTROLLER.SCORE_CONTROLLER.GLOBAL.getGlobalCounterController(
						page
					).locator("button.btn-increment");
				},
				getBtnDecrement: (page: Page) => {
					return referentenansicht_control_locators.CONTROLLER.SCORE_CONTROLLER.GLOBAL.getGlobalCounterController(
						page
					).locator("button.btn-decrement");
				},
			},
			USER: {
				getUserCounterController: (page: Page) => {
					return referentenansicht_control_locators.CONTROLLER.SCORE_CONTROLLER.getScoreController(
						page
					).locator(".user-counters");
				},
				getEditUsersBtn: (page: Page) => {
					return referentenansicht_control_locators.CONTROLLER.SCORE_CONTROLLER.USER.getUserCounterController(
						page
					).locator("button.edit-users");
				},
				USER_EDITOR: {
					getUserEditor: (page: Page) => {
						return page
							.locator(locators.SWAL.MODAL_CONTAINER)
							.locator('[class*="userEditor"]');
					},
					getAddUserBtn: (page: Page) => {
						return referentenansicht_control_locators.CONTROLLER.SCORE_CONTROLLER.USER.USER_EDITOR.getUserEditor(
							page
						).locator("button.add-user");
					},
					getUserList: (page: Page) => {
						return referentenansicht_control_locators.CONTROLLER.SCORE_CONTROLLER.USER.USER_EDITOR.getUserEditor(
							page
						).locator(".user-list");
					},
					getUserEntry: (page: Page, username: string) => {
						return referentenansicht_control_locators.CONTROLLER.SCORE_CONTROLLER.USER.USER_EDITOR.getUserList(
							page
						).locator(`[data-username="${username}"]`);
					},
					getDeleteUserBtn: (page: Page, username: string) => {
						return referentenansicht_control_locators.CONTROLLER.SCORE_CONTROLLER.USER.USER_EDITOR.getUserEntry(
							page,
							username
						).locator("button.delete-user");
					},
					getEditUserBtn: (page: Page, username: string) => {
						return referentenansicht_control_locators.CONTROLLER.SCORE_CONTROLLER.USER.USER_EDITOR.getUserEntry(
							page,
							username
						).locator("button.edit-user");
					},
					getUsername: (page: Page, username: string) => {
						return referentenansicht_control_locators.CONTROLLER.SCORE_CONTROLLER.USER.USER_EDITOR.getUserEntry(
							page,
							username
						).locator(".username");
					},
				},
				getEnterNameInput: (page: Page) => {
					return page
						.locator(locators.SWAL.MODAL_CONTAINER)
						.locator("input.swal2-input[type=text]");
				},
				USER_ENTRY: {
					getUserEntry: (page: Page, username: string) =>
						referentenansicht_control_locators.CONTROLLER.SCORE_CONTROLLER.USER.getUserCounterController(
							page
						).locator(`[data-username="${username}"]`),
					getDecrementBtn: (page: Page, username: string) =>
						referentenansicht_control_locators.CONTROLLER.SCORE_CONTROLLER.USER.USER_ENTRY.getUserEntry(
							page,
							username
						).locator("button.btn-decrement"),
					getIncrementBtn: (page: Page, username: string) =>
						referentenansicht_control_locators.CONTROLLER.SCORE_CONTROLLER.USER.USER_ENTRY.getUserEntry(
							page,
							username
						).locator("button.btn-increment"),
					getUsername: (page: Page, username: string) =>
						referentenansicht_control_locators.CONTROLLER.SCORE_CONTROLLER.USER.USER_ENTRY.getUserEntry(
							page,
							username
						).locator(".username"),
					getCount: (page: Page, username: string) =>
						referentenansicht_control_locators.CONTROLLER.SCORE_CONTROLLER.USER.USER_ENTRY.getUserEntry(
							page,
							username
						).locator(".count"),
				},
			},
		},
	},
	PREVIEW: {
		getPreview: (page: Page) => {
			return page.locator("[class*=preview]");
		},
		getInitQuizMessage: (page: Page) => {
			return referentenansicht_control_locators.PREVIEW.getPreview(page).locator(
				".init-quiz-message"
			);
		},
		QUIZ_READ_ONLY: beameransicht_locators.QUIZ_READ_ONLY,
	},
};

export const PATHS = {
	REFERENTENANSICHT: {
		CONTROL: "/referentenansicht/control",
		INIT: "/referentenansicht/init",
	},
	BEAMERANSICHT: "/beamer-ansicht",
};
