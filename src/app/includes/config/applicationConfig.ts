export enum ApplicationMode {
	PRODUCTION,
	DEV,
}

export const GLOBAL_APPLICATION_CONFIG = {
	MODE: ApplicationMode.PRODUCTION,
	PORT: 80,
};
