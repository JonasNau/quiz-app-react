import express from "express";
import next from "next";
import http from "http";
import SocketIO, { Socket } from "socket.io";
import { ERoomNames, ESocketEventNames } from "@/app/includes/ts/socketIO/socketNames";
import ServerLoggerProvider from "@/app/includes/ts/backend/logging/ServerLoggerProvider";
import {
	ApplicationMode,
	GLOBAL_APPLICATION_CONFIG,
} from "@/app/includes/config/applicationConfig";
import { validateObjectWithJoiType } from "@/app/includes/ts/backend/validation/SchemaValidation";
import { QuizDataSchema, QuizPackageSchema } from "@/schemas/joi/QuizSchemas";
import { error } from "console";
import { QuestionEntry, QuizPackage } from "@/interfaces/joi/QuizSchemas";
import { UserWithCount, UserWithCountList } from "@/interfaces/user-counter";
import { ScoreMode } from "@/interfaces/scoreMode";

const port = GLOBAL_APPLICATION_CONFIG.PORT;
const isDev = GLOBAL_APPLICATION_CONFIG.MODE === ApplicationMode.DEV;
const app = next({ dev: isDev, port: port });
const handle = app.getRequestHandler();
const ServerLogger = ServerLoggerProvider.getLogger();

let quizPackage: QuizPackage | null = null;
let currentQuestionNumber = 0;
let showSolutions = false;
let showScoreDisplay = false;
let currentCounterValue = 0;
let userWithCountList: UserWithCountList = [];
let scoreMode: ScoreMode = ScoreMode.GLOBAL;

const getMaxQuestions = () => (quizPackage ? quizPackage.quizData.length : 0);

app.prepare().then(() => {
	const server = express();
	const httpServer = http.createServer(server);
	const io = new SocketIO.Server(httpServer, { maxHttpBufferSize: Infinity });

	io.on(ESocketEventNames.NEW_CONNECTIION, (socket: Socket) => {
		if (GLOBAL_APPLICATION_CONFIG.MODE === ApplicationMode.DEV) {
			ServerLogger.debug("A new client connected.", { socketID: socket.id });
		}
		socket.on("disconnect", (reason: string) => {
			if (GLOBAL_APPLICATION_CONFIG.MODE === ApplicationMode.DEV) {
				ServerLogger.debug("A client disconnected", {
					socketID: socket.id,
					reason: reason,
				});
			}
		});

		socket.on(ESocketEventNames.JOIN_ROOM, (roomName: string) => {
			socket.join(roomName);
		});

		socket.on(ESocketEventNames.LEAVE_ROOM, (roomName: string) => {
			socket.leave(roomName);
		});

		const sendUpdateShowSolutions = (showSolutions: boolean) => {
			socket
				.in(ERoomNames.BEAMER)
				.emit(ESocketEventNames.SEND_SHOW_SOLUTIONS, showSolutions);

			socket
				.in(ERoomNames.REFERENT_CONTROL)
				.emit(ESocketEventNames.SEND_SHOW_SOLUTIONS, showSolutions);
		};

		const sendUpdateShowScoreDisplay = (showScoreDisplay: boolean) => {
			socket
				.in(ERoomNames.BEAMER)
				.emit(ESocketEventNames.SEND_SHOW_SCORE_DISPLAY, showScoreDisplay);

			socket
				.in(ERoomNames.REFERENT_CONTROL)
				.emit(ESocketEventNames.SEND_SHOW_SCORE_DISPLAY, showScoreDisplay);
		};

		const sendUpdateCurrentCounterValue = (number: number) => {
			socket.in(ERoomNames.BEAMER).emit(ESocketEventNames.SEND_COUNTER_VALUE, number);

			socket
				.in(ERoomNames.REFERENT_CONTROL)
				.emit(ESocketEventNames.SEND_COUNTER_VALUE, number);
		};

		const sendUpdateQuestionNumber = (questionNumber: number) => {
			socket
				.in(ERoomNames.BEAMER)
				.emit(ESocketEventNames.SEND_QUESTION_NUMBER, questionNumber);

			socket
				.in(ERoomNames.REFERENT_CONTROL)
				.emit(ESocketEventNames.SEND_QUESTION_NUMBER, questionNumber);
		};

		const sendUpdateUserWithCountList = (userWithCountList: UserWithCountList) => {
			socket
				.in(ERoomNames.BEAMER)
				.emit(ESocketEventNames.SEND_USER_WITH_COUNT_LIST, userWithCountList);

			socket
				.in(ERoomNames.REFERENT_CONTROL)
				.emit(ESocketEventNames.SEND_USER_WITH_COUNT_LIST, userWithCountList);
		};

		const sendUpdateScoreMode = (scoreMode: ScoreMode) => {
			socket.in(ERoomNames.BEAMER).emit(ESocketEventNames.SEND_SCORE_MODE, scoreMode);

			socket
				.in(ERoomNames.REFERENT_CONTROL)
				.emit(ESocketEventNames.SEND_SCORE_MODE, scoreMode);
		};

		const sendUpdateQuizData = (quizData: QuizPackage) => {
			socket
				.in(ERoomNames.BEAMER)
				.in(ERoomNames.REFERENT_CONTROL)
				.emit(ESocketEventNames.SEND_SCORE_MODE, quizData);
		};

		socket.on(ESocketEventNames.INIT_QUIZ, (newQuizPackage: unknown) => {
			const validatedQuizData = validateObjectWithJoiType<QuizPackage>(
				QuizPackageSchema,
				newQuizPackage
			);

			if (!validatedQuizData) {
				socket.emit(ESocketEventNames.ERROR, "INVALID_DATA");
				return;
			}

			quizPackage = validatedQuizData;
			currentQuestionNumber = 0;

			socket.emit(ESocketEventNames.SUCCESS, "UPDATED_DATA");
			sendUpdateQuizData(quizPackage);
		});

		socket.on(ESocketEventNames.GET_QUIZ_DATA, () => {
			if (!quizPackage) {
				socket.emit(ESocketEventNames.ERROR, "NO_QUIZ_DATA");
				return;
			}
			socket.emit(ESocketEventNames.SEND_QUIZ_DATA, quizPackage);
		});

		socket.on(ESocketEventNames.SEND_QUESTION_NUMBER, (number: number) => {
			if (!quizPackage) {
				socket.emit(ESocketEventNames.ERROR, "NO_QUIZ_DATA");
				return;
			}

			const maxQuestions = getMaxQuestions();
			if (typeof number !== "number" || number > maxQuestions || number < 0) {
				socket.emit(ESocketEventNames.ERROR, "QUESTION_NUMBER_INVALID");
				return;
			}

			currentQuestionNumber = number;
			sendUpdateQuestionNumber(currentQuestionNumber);
		});

		socket.on(ESocketEventNames.SEND_COUNTER_VALUE, (number: number) => {
			currentCounterValue = number;
			sendUpdateCurrentCounterValue(currentCounterValue);
		});

		socket.on(ESocketEventNames.SEND_SCORE_MODE, (newScoreMode: ScoreMode) => {
			scoreMode = newScoreMode;
			sendUpdateScoreMode(scoreMode);
		});

		socket.on(
			ESocketEventNames.SEND_USER_WITH_COUNT_LIST,
			(updatedUserWithCountList: UserWithCountList) => {
				userWithCountList = updatedUserWithCountList;
				sendUpdateUserWithCountList(userWithCountList);
			}
		);

		socket.on(ESocketEventNames.SEND_SHOW_SOLUTIONS, (newShowSolutions: boolean) => {
			if (!quizPackage) {
				socket.emit(ESocketEventNames.ERROR, "NO_QUIZ_DATA");
				return;
			}

			showSolutions = newShowSolutions;
			sendUpdateShowSolutions(showSolutions);
		});

		socket.on(
			ESocketEventNames.SEND_SHOW_SCORE_DISPLAY,
			(newShowScoreDisplay: boolean) => {
				showScoreDisplay = newShowScoreDisplay;
				sendUpdateShowScoreDisplay(showScoreDisplay);
			}
		);

		socket.on(ESocketEventNames.GET_QUESTION_NUMBER, () => {
			socket.emit(ESocketEventNames.SEND_QUESTION_NUMBER, currentQuestionNumber);
		});

		socket.on(ESocketEventNames.GET_COUNTER_VALUE, () => {
			socket.emit(ESocketEventNames.SEND_COUNTER_VALUE, currentCounterValue);
		});
		socket.on(ESocketEventNames.GET_USER_WITH_COUNT_LIST, () => {
			socket.emit(ESocketEventNames.SEND_USER_WITH_COUNT_LIST, userWithCountList);
		});

		socket.on(ESocketEventNames.GET_SCORE_MODE, () => {
			socket.emit(ESocketEventNames.SEND_SCORE_MODE, scoreMode);
		});

		socket.on(ESocketEventNames.GET_SHOW_SOLUTIONS, () => {
			socket.emit(ESocketEventNames.SEND_SHOW_SOLUTIONS, showSolutions);
		});

		socket.on(ESocketEventNames.GET_SHOW_SCORE_DISPLAY, () => {
			socket.emit(ESocketEventNames.SEND_SHOW_SCORE_DISPLAY, showScoreDisplay);
		});
	});

	// Alle anderen Anfragen an Next.js weiterleiten
	server.all("*", (req, res) => {
		return handle(req, res);
	});

	httpServer.listen(port, () => {
		console.log(`Ready on http://localhost:${port}`);
	});
});
