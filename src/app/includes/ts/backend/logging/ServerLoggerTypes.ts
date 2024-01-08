import { AbstractConfigSetLevels } from "winston/lib/winston/config";

export const ServerLogLevelsInt = {
	emerg: 0,
	alert: 1,
	crit: 2,
	error: 3,
	warning: 4,
	notice: 5,
	info: 6,
	debug: 7,
} satisfies AbstractConfigSetLevels;

export const ServerLogLevelsString = {
	emerg: "emerg",
	alert: "alert",
	crit: "crit",
	error: "error",
	warning: "warning",
	notice: "notice",
	info: "info",
	debug: "debug",
} as const;

export const ServerLogLevelColors: Record<string, string> = {
	emerg: "red",
	alert: "red",
	crit: "red",
	error: "red",
	warning: "yellow",
	notice: "green",
	info: "blue",
	debug: "magenta",
};
