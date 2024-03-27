import { Locator } from "@playwright/test";

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
