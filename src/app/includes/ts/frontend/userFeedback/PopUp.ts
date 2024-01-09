import Swal from "sweetalert2";

export async function showErrorMessageToUser({
	message,
	title = "Fehler",
}: {
	message: string;
	title?: string;
}) {
	return await Swal.fire({
		title: title,
		text: message,
		icon: "error",
	});
}

export async function showWarningMessageToUser({
	message,
	title = "Warnung",
}: {
	message: string;
	title?: string;
}) {
	return await Swal.fire({
		title: title,
		text: message,
		icon: "warning",
	});
}

export async function showWarningMessageAndAskUser({
	message,
	title = "Warnung",
}: {
	message: string;
	title?: string;
}) {
	return await Swal.fire({
		showCancelButton: true,
		cancelButtonText: "Abbrechen",
		confirmButtonText: "OK",
		title: title,
		text: message,
		icon: "warning",
	});
}

export async function showSuccessMessageToUser({
	message,
	title = "Erfolg",
}: {
	message: string;
	title?: string;
}) {
	return await Swal.fire({
		title: title,
		text: message,
		icon: "success",
	});
}

export async function showSuccessMessageAndAskUser({
	message,
	title = "Erfolg",
}: {
	message: string;
	title?: string;
}) {
	return await Swal.fire({
		showCancelButton: true,
		cancelButtonText: "Abbrechen",
		confirmButtonText: "OK",
		title: title,
		text: message,
		icon: "success",
	});
}

export async function showErrorMessageAndAskUser({
	message,
	title = "Fehler",
}: {
	message: string;
	title?: string;
}) {
	return await Swal.fire({
		showCancelButton: true,
		cancelButtonText: "Abbrechen",
		confirmButtonText: "OK",
		title: title,
		text: message,
		icon: "error",
	});
}
