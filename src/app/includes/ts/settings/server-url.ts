import { CLIENT_SETTINGS } from "./settings";

export function getServerURL(): URL {
	return new URL(
		`${CLIENT_SETTINGS.SERVER_URL.PROTOCOL}://${CLIENT_SETTINGS.SERVER_URL.HOST}:${CLIENT_SETTINGS.SERVER_URL.PORT}`
	);
}
