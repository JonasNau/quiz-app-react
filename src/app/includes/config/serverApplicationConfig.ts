import { ServerLogLevelsString } from "../ts/backend/logging/ServerLoggerTypes";

export const SERVER_APPLICATION_CONFIG = {
	LOGGING: {
		LOG_DIR: "logs",
		LOG_LEVEL: ServerLogLevelsString.debug,
	},
} as const;
