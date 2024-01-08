"use client";
import React, {
	ChangeEvent,
	SyntheticEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { Button, ButtonToolbar, Container } from "react-bootstrap";
import CodeMirror, { ViewUpdate } from "@uiw/react-codemirror";
import styles from "./page.module.scss";

import { linter, lintGutter } from "@codemirror/lint";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { io, Socket } from "socket.io-client";
import { ERoomNames, ESocketEventNames } from "@/app/includes/ts/socketIO/socketNames";
import { QuizDataSchema } from "@/schemas/joi/QuizSchemas";
import {
	showErrorMessageToUser,
	showSuccessMessageAndAskUser,
	showSuccessMessageToUser,
} from "@/app/includes/ts/frontend/userFeedback/PopUp";
import ClientLogger from "@/app/includes/ts/frontend/logging/ClientLoggerProvider";
import { DefaultErrorMessages } from "@/app/includes/ts/frontend/userFeedback/Messages";
import { useRouter } from "next/navigation";

const QUIZJSONLocalStorageName = "quiz-json";

const templateQuizData = [
	{
		question: "Frage?",
		answers: [
			{
				text: "Antwort 1",
				isCorrect: true,
			},
			{
				text: "Antwort 2",
				isCorrect: false,
			},
		],
	},
];

export default function InitQuiz() {
	const router = useRouter();
	const [quizJSONString, setQuizJSONString] = useState<string>("");
	const [socketIOClient, setSocketIOClient] = useState<Socket | null>(null);
	const codeMirrorRef = useRef();

	useEffect(() => {
		//Read quiz-json from local storage
		const quizJSONString = localStorage.getItem(QUIZJSONLocalStorageName) ?? "";
		setQuizJSONString(quizJSONString);
		updateQuizJSONLocalStorage(quizJSONString);

		//Create Socket IO Client
		const socketIOClient = io({});
		setSocketIOClient(socketIOClient);
		socketIOClient.emit(ESocketEventNames.JOIN_ROOM, ERoomNames.REFERENT);

		socketIOClient.on(ESocketEventNames.ERROR, (errorName: string) => {
			if (errorName === "INVALID_DATA") {
				showErrorMessageToUser({ message: "Der Server lehnt die Quiz-JSON ab." });
				return;
			}
			showErrorMessageToUser({ message: DefaultErrorMessages.ERROR_RETRY_AGAIN_LATER });
		});

		socketIOClient.on(ESocketEventNames.SUCCESS, async (successMessage: string) => {
			if (successMessage === "UPDATED_DATA") {
				const userResponse = await showSuccessMessageAndAskUser({
					message:
						"Die Quiz-JSON wurde erfolgreich hochgeladen. Möchtest du auf die Kontrollansicht weitergeleitet werden?",
				});

				if (userResponse.isConfirmed) {
					router.push("/referentenansicht/control");
				}
			}
		});

		return () => {
			socketIOClient.close();
		};
	}, []);

	const updateQuizJSONLocalStorage = (quizJSONString: string) => {
		localStorage.setItem(QUIZJSONLocalStorageName, quizJSONString);
	};

	const handleCodeUpdate = (value: string, viewUpdate: ViewUpdate) => {
		setQuizJSONString(value);
		updateQuizJSONLocalStorage(value);
	};

	const handleDelete = (event: SyntheticEvent<HTMLButtonElement>) => {
		setQuizJSONString("");
		updateQuizJSONLocalStorage("");
	};

	const handleInitQuiz = (event: SyntheticEvent) => {
		let quizJSON = null;
		try {
			quizJSON = JSON.parse(quizJSONString);
		} catch (error) {
			showErrorMessageToUser({ message: (error as Error).message });
			return;
		}

		const validationResult = QuizDataSchema.validate(quizJSON);

		if (validationResult.error) {
			ClientLogger.error("The quiz-json is not in a valid format.", validationResult);
			showErrorMessageToUser({ message: validationResult.error.message });
			return;
		}

		if (!socketIOClient) {
			showErrorMessageToUser({
				message: DefaultErrorMessages.CONNECTION_NOT_INITIALIZED,
			});
			return;
		}

		if (!socketIOClient.connected) {
			showErrorMessageToUser({
				message: DefaultErrorMessages.SERVER_NOT_CONNECTED,
			});
			return;
		}

		socketIOClient.emit(ESocketEventNames.INIT_QUIZ, quizJSON);
	};

	const handleAutoFormatCode = useCallback(async () => {
		try {
			const formatted = JSON.stringify(JSON.parse(quizJSONString), null, 2);
			setQuizJSONString(formatted);
		} catch (error) {
			showErrorMessageToUser({
				message: "Die JSON-Datei kann nicht formatiert werden, da sie nicht valide ist.",
			});
		}
	}, [quizJSONString]);

	const handleTemplate = useCallback((event: SyntheticEvent<HTMLButtonElement>) => {
		const newData = JSON.stringify(templateQuizData);
		setQuizJSONString(newData);
		updateQuizJSONLocalStorage(newData);
	}, []);

	return (
		<>
			<Container>
				<h1 className="text-center">Referentenansicht - Quiz-Initialisieren</h1>
				<ButtonToolbar>
					<Button variant="primary" className="me-2" onClick={handleInitQuiz}>
						Quiz initialisieren
					</Button>
					<Button variant="danger" className="me-2" onClick={handleDelete}>
						Löschen
					</Button>
					<Button variant="secondary" className="me-2" onClick={handleTemplate}>
						Von Vorlage laden
					</Button>
					<Button variant="secondary" className="me-2" onClick={handleAutoFormatCode}>
						Formatieren
					</Button>
				</ButtonToolbar>
				<h2>Quiz-JSON bearbeiten</h2>
				<CodeMirror
					theme={oneDark}
					value={quizJSONString}
					onChange={handleCodeUpdate}
					extensions={[json(), linter(jsonParseLinter()), lintGutter()]}
				/>
			</Container>
		</>
	);
}
