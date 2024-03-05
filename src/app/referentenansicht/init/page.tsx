"use client";
import React, {
	ChangeEvent,
	SyntheticEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { Alert, Button, ButtonToolbar, Container, Modal } from "react-bootstrap";
import CodeMirror, { ViewUpdate } from "@uiw/react-codemirror";
import styles from "./page.module.scss";

import { linter, lintGutter } from "@codemirror/lint";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { io, Socket } from "socket.io-client";
import { ERoomNames, ESocketEventNames } from "@/app/includes/ts/socketIO/socketNames";
import {
	showErrorMessageToUser,
	showSuccessMessageAndAskUser,
	showSuccessMessageToUser,
} from "@/app/includes/ts/frontend/userFeedback/PopUp";
import ClientLogger from "@/app/includes/ts/frontend/logging/ClientLoggerProvider";
import { DefaultErrorMessages } from "@/app/includes/ts/frontend/userFeedback/Messages";
import { useRouter } from "next/navigation";
import QuizPackageEditor from "@/app/components/QuizPackageEditor/QuizPackageEditor";
import QuizPackageListEditor from "@/app/components/QuizPackageListEditor/QuizPackageListEditor";
import { QuestionEntry, QuizPackage, QuizPackageList } from "@/interfaces/joi";
import { QuizPackageListSchema } from "@/schemas/joi/QuizSchemas";
import JSONCodeEditor from "@/app/components/JSONCodeEditor/JSONCodeEditor";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import QuestionEditor from "@/app/components/QuestionEditor/QuestionEditor";
import { createRoot } from "react-dom/client";

const QuizPackageList_LocalStorage_Name = "quiz-json-list";

const templateQuizPackage = {
	name: "Name",
	description: "",
	quizData: [
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
	],
} satisfies QuizPackage;

const templateQuizPackageList = [templateQuizPackage] satisfies QuizPackageList;

export default function InitQuiz() {
	const router = useRouter();
	const [quizPackageListString, setQuizPackageListString] = useState<string>("");
	const [quizPackageList, setQuizPackageList] = useState<QuizPackageList | null>();
	const [socketIOClient, setSocketIOClient] = useState<Socket | null>(null);
	const [loadedQuizJSON, setLoadedQuizJSON] = useState<boolean>(false);

	const [editQuizNumber, setEditQuizNumber] = useState<number | null>(null);
	const [editQuestionNumber, setEditQuestionNumber] = useState<number | null>(null);

	const updateQuizPackageListLocalStorage = useCallback(
		(quizPackageListLocalStorageString: string) => {
			localStorage.setItem(
				QuizPackageList_LocalStorage_Name,
				quizPackageListLocalStorageString
			);
		},
		[]
	);

	useEffect(() => {
		//Read quiz-json from local storage
		let quizJSONListString = localStorage.getItem(QuizPackageList_LocalStorage_Name);
		if (
			quizJSONListString === null ||
			(typeof quizJSONListString === "string" && quizJSONListString.length == 0)
		) {
			quizJSONListString = JSON.stringify(templateQuizPackageList);
		}
		setQuizPackageListString(quizJSONListString);
		updateQuizPackageListLocalStorage(quizJSONListString);

		setLoadedQuizJSON(true);

		const quizJSONList = getQuizPackageListFromString(quizJSONListString);
		if (quizJSONList) {
			setQuizPackageList(quizJSONList);
		} else {
			setQuizPackageList(null);
		}

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
	}, [router, updateQuizPackageListLocalStorage]);

	const getQuizPackageListFromString = (string: string): QuizPackageList | null => {
		try {
			const quzJSONListObject = JSON.parse(string);
			const validationResult = QuizPackageListSchema.validate(quzJSONListObject);
			if (!validationResult.error) return validationResult.value;
		} catch {}
		return null;
	};

	const handleDelete = (event: SyntheticEvent<HTMLButtonElement>) => {
		setQuizPackageList([]);
		setQuizPackageListString("[]");
		updateQuizPackageListLocalStorage("[]");
	};

	const sendQuizPackageToServer = (quizPackage: QuizPackage) => {
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

		socketIOClient.emit(ESocketEventNames.INIT_QUIZ, quizPackage);
	};

	const handleAutoFormatCode = useCallback(async () => {
		try {
			const formatted = JSON.stringify(JSON.parse(quizPackageListString), null, 2);
			setQuizPackageListString(formatted);
			updateQuizPackageListLocalStorage(formatted);
		} catch (error) {
			showErrorMessageToUser({
				message: "Die JSON-Datei kann nicht formatiert werden, da sie nicht valide ist.",
			});
		}
	}, [quizPackageListString, updateQuizPackageListLocalStorage]);

	const handleFormatCodeMinify = useCallback(async () => {
		try {
			const formatted = JSON.stringify(JSON.parse(quizPackageListString));
			setQuizPackageListString(formatted);
			updateQuizPackageListLocalStorage(formatted);
		} catch (error) {
			showErrorMessageToUser({
				message: "Die JSON-Datei kann nicht formatiert werden, da sie nicht valide ist.",
			});
		}
	}, [quizPackageListString, updateQuizPackageListLocalStorage]);

	const handleTemplate = useCallback(
		(event: SyntheticEvent<HTMLButtonElement>) => {
			const newData = JSON.stringify(templateQuizPackageList);
			setQuizPackageList(templateQuizPackageList);
			setQuizPackageListString(newData);
			updateQuizPackageListLocalStorage(newData);
		},
		[updateQuizPackageListLocalStorage]
	);

	const onQuizPackageListUpdate = useCallback(
		(quizPackageList: QuizPackageList) => {
			setQuizPackageList(quizPackageList);
			setQuizPackageListString(JSON.stringify(quizPackageList));
			updateQuizPackageListLocalStorage(JSON.stringify(quizPackageList));
		},
		[setQuizPackageListString, updateQuizPackageListLocalStorage]
	);

	const onQuizPackageListJSONCodeChange = useCallback(
		(code: string) => {
			if (!loadedQuizJSON) return;
			setQuizPackageListString(code);
			updateQuizPackageListLocalStorage(code);

			const quizJSON = getQuizPackageListFromString(code);
			if (quizJSON) {
				setQuizPackageList(quizJSON);
			} else {
				setQuizPackageList(null);
			}
		},
		[loadedQuizJSON, updateQuizPackageListLocalStorage]
	);

	const openQuizEditor = useCallback(
		(editQuizNumber: number) => {
			if (!quizPackageList) {
				return;
			}

			let newQuizPackage: QuizPackage = quizPackageList[editQuizNumber];

			withReactContent(Swal).fire({
				title: "Quiz bearbeiten",
				html: (
					<>
						<QuizPackageEditor
							quizJSON={newQuizPackage}
							onQuestionEdit={(questionIndex: number) => {
								setEditQuestionNumber(questionIndex);
							}}
							onQuizPackageUpdate={(updateedQuizPackage: QuizPackage) => {
								setQuizPackageList((prev) => {
									if (!prev) return prev;
									return prev.map((quizPackage: QuizPackage, index: number) => {
										if (editQuizNumber === index) return updateedQuizPackage;
										return quizPackage;
									});
								});
							}}
						/>
						.
					</>
				),
				showCloseButton: true,
				didClose() {
					setEditQuizNumber(null);
				},
				didDestroy() {},
				grow: "fullscreen",
			});
		},
		[quizPackageList]
	);
	const openQuestionEditor = useCallback(
		(editQuizNumber: number, editQuestionNumber: number) => {
			if (!quizPackageList) {
				return;
			}

			withReactContent(Swal).fire({
				title: "Frage bearbeiten",
				showCloseButton: true,
				html: (
					<>
						<QuestionEditor
							questionEntryJSON={
								quizPackageList[editQuizNumber].quizData[editQuestionNumber]
							}
							onQuestionEntryUpdate={(updatedQuestionEntry: QuestionEntry) => {
								if (!quizPackageList) return;
								setQuizPackageList((prev) => {
									if (!prev) return prev;
									return prev.map(
										(quizPackage: QuizPackage, quizPackageIndex: number) => {
											if (editQuizNumber === quizPackageIndex)
												return {
													...prev[editQuizNumber],
													quizData: prev[editQuizNumber].quizData.map(
														(
															questionEntry: QuestionEntry,
															questionEntryIndex: number
														) => {
															if (questionEntryIndex === editQuestionNumber)
																return updatedQuestionEntry;
															return questionEntry;
														}
													),
												};
											return quizPackage;
										}
									);
								});
							}}
						/>
					</>
				),
				didClose() {
					setEditQuestionNumber(null);
				},
				didDestroy() {},
				grow: "fullscreen",
			});
		},
		[quizPackageList]
	);

	useEffect(() => {
		if (editQuizNumber === null && editQuestionNumber === null) return;

		if (editQuizNumber !== null && editQuestionNumber === null) {
			openQuizEditor(editQuizNumber);
			return;
		}

		if (editQuizNumber !== null && editQuestionNumber !== null) {
			openQuestionEditor(editQuizNumber, editQuestionNumber);
			return;
		}
		/*
		Do not include the openQuizEditor and openQuestionEditor in the dependencies
		because the methods depend on the attribute quizPackageList and this is changed
		on every input of the user and this would result in an infinite loop
		 */
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editQuizNumber, editQuestionNumber]);

	useEffect(() => {
		console.log({ quizPackageListString });
	}, [quizPackageListString]);

	return (
		<div className={styles.initView}>
			<Container>
				<h1 className="text-center">Referentenansicht - Quiz-Initialisieren</h1>
				<h2>Quiz Übersicht</h2>
				{quizPackageList ? (
					<>
						<QuizPackageListEditor
							onQuizPackageListUpdate={onQuizPackageListUpdate}
							quizPackageList={quizPackageList}
							onQuizPackageSelect={sendQuizPackageToServer}
							onQuizPackageEdit={(quizPackageIndex: number) => {
								setEditQuizNumber(quizPackageIndex);
							}}
						/>
					</>
				) : (
					<>
						<Alert variant="warning">Die Quiz-JSON ist nicht valide.</Alert>
					</>
				)}
				<h2>Quiz-JSON bearbeiten (erweitert)</h2>
				<div className="code-section">
					<ButtonToolbar className="code-editor-toolbar d-flex flex-row justify-content-center">
						<Button variant="danger" className="me-2" onClick={handleDelete}>
							Löschen
						</Button>
						<Button variant="secondary" className="me-2" onClick={handleTemplate}>
							Von Vorlage laden
						</Button>
						<Button variant="secondary" className="me-2" onClick={handleAutoFormatCode}>
							Formatieren
						</Button>
						<Button variant="secondary" className="me-2" onClick={handleFormatCodeMinify}>
							Verkleinern
						</Button>
					</ButtonToolbar>
					<JSONCodeEditor
						code={quizPackageListString}
						onCodeUpdate={onQuizPackageListJSONCodeChange}
					/>
				</div>
			</Container>
		</div>
	);
}
