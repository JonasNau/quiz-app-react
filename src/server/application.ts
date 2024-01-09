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
import { QuizDataSchema } from "@/schemas/joi/QuizSchemas";
import { error } from "console";
import { QuestionEntry, QuizData } from "@/interfaces/joi/QuizSchemas";

const port = 80;
const app = next({ dev: true });
const handle = app.getRequestHandler();
const ServerLogger = ServerLoggerProvider.getLogger();

let quizData: QuizData | null = null;
let currentQuestionNumber = 0;
let showSolutions = false;

const getMaxQuestions = () => (quizData ? quizData.length : 0);

app.prepare().then(() => {
	const server = express();
	const httpServer = http.createServer(server);
	const io = new SocketIO.Server(httpServer, {});

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

		const sendUpdateQuestionNumber = (questionNumber: number) => {
			socket
				.in(ERoomNames.BEAMER)
				.emit(ESocketEventNames.SEND_QUESTION_NUMBER, questionNumber);

			socket
				.in(ERoomNames.REFERENT_CONTROL)
				.emit(ESocketEventNames.SEND_QUESTION_NUMBER, questionNumber);
		};

		const sendUpdateQuizData = (quizData: QuizData) => {
			socket
				.in(ERoomNames.BEAMER)
				.in(ERoomNames.REFERENT_CONTROL)
				.emit(ESocketEventNames.SEND_QUIZ_DATA, quizData);
		};

		socket.on(ESocketEventNames.INIT_QUIZ, (newQuizData: unknown) => {
			const validatedQuizData = validateObjectWithJoiType<QuizData>(
				QuizDataSchema,
				newQuizData
			);

			if (!validatedQuizData) {
				socket.emit(ESocketEventNames.ERROR, "INVALID_DATA");
				return;
			}

			quizData = validatedQuizData;
			currentQuestionNumber = 0;

			socket.emit(ESocketEventNames.SUCCESS, "UPDATED_DATA");
			sendUpdateQuizData(quizData);
		});

		socket.on(ESocketEventNames.GET_QUIZ_DATA, () => {
			if (!quizData) {
				socket.emit(ESocketEventNames.ERROR, "NO_QUIZ_DATA");
				return;
			}
			socket.emit(ESocketEventNames.SEND_QUIZ_DATA, quizData);
		});

		socket.on(ESocketEventNames.SEND_QUESTION_NUMBER, (number: number) => {
			if (!quizData) {
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

		socket.on(ESocketEventNames.SEND_SHOW_SOLUTIONS, (newShowSolutions: boolean) => {
			if (!quizData) {
				socket.emit(ESocketEventNames.ERROR, "NO_QUIZ_DATA");
				return;
			}

			showSolutions = newShowSolutions;
			sendUpdateShowSolutions(showSolutions);
		});

		socket.on(ESocketEventNames.GET_QUESTION_NUMBER, () => {
			socket.emit(ESocketEventNames.SEND_QUESTION_NUMBER, currentQuestionNumber);
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
