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
import { getReadableByteSizeString } from "@/app/includes/ts/file-converter-functions";
import { QuizPackageList_LocalStorage_Name, templateQuizPackageList } from "./constants";

export default function InitQuiz() {
	const router = useRouter();
	const [quizPackageListString, setQuizPackageListString] = useState<string>("");
	const [quizPackageList, setQuizPackageList] = useState<QuizPackageList | null>();
	const [socketIOClient, setSocketIOClient] = useState<Socket | null>(null);

	const [editQuizNumber, setEditQuizNumber] = useState<number | null>(null);
	const [editQuestionNumber, setEditQuestionNumber] = useState<number | null>(null);
	const [fileSizeInByte, setFileSizeInByte] = useState<number>(0);
	const [fileSizeReadable, setFileSizeReadable] = useState<string>("");

	const updateQuizPackageListLocalStorage = useCallback(
		(quizPackageListLocalStorageString: string) => {
			try {
				localStorage.setItem(
					QuizPackageList_LocalStorage_Name,
					quizPackageListLocalStorageString
				);
			} catch (error) {
				showErrorMessageToUser({
					message:
						"Die Quizdaten konnten nicht im Browser abgespeichert werden. Es könnte sein, dass die maximale Größe überschritten wurde.",
				});
			}
		},
		[]
	);

	const updateQuizPackageList = useCallback(
		(quizPackageList: QuizPackageList) => {
			setQuizPackageList(quizPackageList);
			const quizPackageListString = JSON.stringify(quizPackageList);
			setQuizPackageListString(quizPackageListString);
			updateQuizPackageListLocalStorage(quizPackageListString);
		},
		[updateQuizPackageListLocalStorage]
	);

	const updateQuizPackageListString = useCallback(
		(quizPackageListString: string) => {
			const quizPackageList = getQuizPackageListFromString(quizPackageListString);
			setQuizPackageList(quizPackageList);
			setQuizPackageListString(quizPackageListString);
			updateQuizPackageListLocalStorage(quizPackageListString);
		},
		[updateQuizPackageListLocalStorage]
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

		updateQuizPackageListString(quizJSONListString);

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
	}, [router, updateQuizPackageListLocalStorage, updateQuizPackageListString]);

	useEffect(() => {
		const fileSize = new TextEncoder().encode(quizPackageListString).length;
		setFileSizeInByte(fileSize);
		setFileSizeReadable(getReadableByteSizeString(fileSize));
	}, [quizPackageListString]);

	const getQuizPackageListFromString = (string: string): QuizPackageList | null => {
		try {
			const quzJSONListObject = JSON.parse(string);
			const validationResult = QuizPackageListSchema.validate(quzJSONListObject);
			if (!validationResult.error) return validationResult.value;
		} catch {}
		return null;
	};

	const handleDelete = (event: SyntheticEvent<HTMLButtonElement>) => {
		updateQuizPackageList([]);
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
			updateQuizPackageListString(formatted);
		} catch (error) {
			showErrorMessageToUser({
				message: "Die JSON-Datei kann nicht formatiert werden, da sie nicht valide ist.",
			});
		}
	}, [quizPackageListString, updateQuizPackageListString]);

	const handleFormatCodeMinify = useCallback(async () => {
		try {
			const formatted = JSON.stringify(JSON.parse(quizPackageListString));
			updateQuizPackageListString(formatted);
		} catch (error) {
			showErrorMessageToUser({
				message: "Die JSON-Datei kann nicht formatiert werden, da sie nicht valide ist.",
			});
		}
	}, [quizPackageListString, updateQuizPackageListString]);

	const handleTemplate = useCallback(
		(event: SyntheticEvent<HTMLButtonElement>) => {
			const newData = JSON.stringify(templateQuizPackageList);
			updateQuizPackageList(templateQuizPackageList);
		},
		[updateQuizPackageList]
	);

	const onQuizPackageListUpdate = useCallback(
		(quizPackageList: QuizPackageList) => {
			updateQuizPackageList(quizPackageList);
		},
		[updateQuizPackageList]
	);

	const onQuizPackageListJSONCodeChange = useCallback(
		(code: string) => {
			updateQuizPackageListString(code);
		},
		[updateQuizPackageListString]
	);

	const openQuizEditor = useCallback(
		(editQuizNumber: number) => {
			setTimeout(() => {
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
									updateQuizPackageList(
										quizPackageList.map((quizPackage: QuizPackage, index: number) => {
											if (editQuizNumber === index) return updateedQuizPackage;
											return quizPackage;
										})
									);
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
			}, 0);
		},
		[quizPackageList, updateQuizPackageList]
	);
	const openQuestionEditor = useCallback(
		(editQuizNumber: number, editQuestionNumber: number) => {
			setTimeout(() => {
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
									setQuizPackageList(
										quizPackageList.map(
											(quizPackage: QuizPackage, quizPackageIndex: number) => {
												if (editQuizNumber === quizPackageIndex)
													return {
														...quizPackageList[editQuizNumber],
														quizData: quizPackageList[editQuizNumber].quizData.map(
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
										)
									);
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
			}, 0);
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
						<Alert variant="warning" id="visual-quiz-editor-alert">
							Die Quiz-JSON ist nicht valide.
						</Alert>
					</>
				)}
				<h2>Quiz-JSON bearbeiten (erweitert)</h2>
				<div className="code-section">
					<div className="text-center mb-2">Gespeicherte Größe: {fileSizeReadable}</div>
					<ButtonToolbar className="code-editor-toolbar d-flex flex-row justify-content-center">
						<Button variant="danger" className="me-2 delete" onClick={handleDelete}>
							Löschen
						</Button>
						<Button variant="secondary" className="me-2 preset" onClick={handleTemplate}>
							Von Vorlage laden
						</Button>
						<Button
							variant="secondary"
							className="me-2 format"
							onClick={handleAutoFormatCode}
						>
							Formatieren
						</Button>
						<Button
							variant="secondary"
							className="me-2 minify"
							onClick={handleFormatCodeMinify}
						>
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
