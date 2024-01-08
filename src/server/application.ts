import express from "express";
import next from "next";
import http from "http";
import SocketIO, { Socket } from "socket.io";
import { ESocketEventNames } from "@/app/includes/ts/socketIO/socketNames";
import { QuestionEntry, QuizData } from "@/interfaces/joi";
import ServerLoggerProvider from "@/app/includes/ts/backend/logging/ServerLoggerProvider";
import {
	ApplicationMode,
	GLOBAL_APPLICATION_CONFIG,
} from "@/app/includes/config/applicationConfig";
import { validateObjectWithJoiType } from "@/app/includes/ts/backend/validation/SchemaValidation";
import { QuizDataSchema } from "@/schemas/joi/QuizSchemas";
import { error } from "console";

const port = 80;
const app = next({ dev: true });
const handle = app.getRequestHandler();

const ServerLogger = ServerLoggerProvider.getLogger();

const QuizData: QuestionEntry[] = [];
const currentQuestionNumber = 0;

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

		socket.on(ESocketEventNames.INIT_QUIZ, (quizData: unknown) => {
			const validatedQuizData = validateObjectWithJoiType<QuizData>(
				QuizDataSchema,
				quizData
			);

			if (!validatedQuizData) {
				socket.emit(ESocketEventNames.ERROR, "INVALID_DATA");
				return;
			}

			quizData = validatedQuizData;

			socket.emit(ESocketEventNames.SUCCESS, "UPDATED_DATA");
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
