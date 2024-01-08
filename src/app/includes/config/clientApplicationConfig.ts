import { levels as clientLogLevels } from "loglevel";

export const CLIENT_APPLICATION_CONFIG = {
	LOGGING: {
		LOG_LEVEL: clientLogLevels.DEBUG,
	},
} as const;
