// loggers.ts
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import { ServerLogLevelsInt } from "./ServerLoggerTypes";
import { SERVER_APPLICATION_CONFIG } from "@/app/includes/config/serverApplicationConfig";

type LoggerEntry = ServerLoggerOptions & {
	logger: winston.Logger;
};

export type ServerLoggerOptions = {
	filename: string;
	writeToConsole: boolean;
	writeToFile: boolean;
};

winston.config.allColors;

class ServerLoggerProvider {
	private static loggers: LoggerEntry[] = [];

	static getLogger({
		filename = "application",
		writeToConsole = true,
		writeToFile = true,
	}: Partial<ServerLoggerOptions> = {}): winston.Logger {
		const loggerEnty = ServerLoggerProvider.getLoggerByOptions({
			filename,
			writeToConsole,
			writeToFile,
		});
		if (loggerEnty) {
			return loggerEnty.logger;
		}

		const transports: winston.transport[] = [];

		if (writeToConsole) {
			transports.push(new winston.transports.Console());
		}

		if (writeToFile) {
			transports.push(
				new DailyRotateFile({
					filename: path.join(
						SERVER_APPLICATION_CONFIG.LOGGING.LOG_DIR,
						filename + "-%DATE%.log"
					),
					datePattern: "DD-MM-YYYY",
					zippedArchive: true,
					maxSize: "20m",
					maxFiles: "14d",
				})
			);
		}

		const newlogger = winston.createLogger({
			level: SERVER_APPLICATION_CONFIG.LOGGING.LOG_LEVEL,
			levels: ServerLogLevelsInt,
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.errors({ stack: true }),
				winston.format.splat(),
				winston.format.json(),
				winston.format.printf(
					({
						timestamp,
						level,
						message,
						stack,
						...metadata
					}: {
						level: string;
						message: unknown;
						[key: string | symbol]: unknown;
					}) => {
						let hasMetadata = false;
						let metaString = "";
						if (Object.keys(metadata).length > 0) {
							hasMetadata = true;
							metaString = JSON.stringify(metadata, null, 2); // Indentation: 2 spaces
						}
						return `${timestamp} [${level.toUpperCase()}] ${
							stack ? `\nErrorStack:\n ${stack}` : ""
						}${message}${hasMetadata ? `\nMetadata:\n ${metaString}` : ""}`;
					}
				)
				// winston.format.colorize({ all: true, colors: ServerLogLevelColors })
			),

			transports,
		});
		ServerLoggerProvider.setLoggerWithOptionsAndInstance({
			filename,
			writeToConsole,
			writeToFile,
			logger: newlogger,
		});
		return newlogger;
	}

	private static getLoggerByOptions(options: ServerLoggerOptions) {
		return ServerLoggerProvider.loggers.find((currentLogger) => {
			return (
				currentLogger.filename == options.filename &&
				currentLogger.writeToConsole == options.writeToConsole &&
				currentLogger.writeToFile == options.writeToFile
			);
		});
	}

	private static setLoggerWithOptionsAndInstance(logger: LoggerEntry) {
		ServerLoggerProvider.loggers.push(logger);
	}
}

export default ServerLoggerProvider;
