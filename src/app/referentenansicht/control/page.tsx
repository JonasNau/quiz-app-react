"use client";

import React, {
	ChangeEvent,
	SyntheticEvent,
	useCallback,
	useEffect,
	useState,
} from "react";
import { Button, Col, Container, Form, FormCheck, Row } from "react-bootstrap";

import styles from "./page.module.scss";
import QuizReadOnly from "@/app/components/QuizReadOnly/QuizReadOnly";
import { QuizData } from "@/interfaces/joi/QuizSchemas";
import { Socket, io } from "socket.io-client";
import { ERoomNames, ESocketEventNames } from "@/app/includes/ts/socketIO/socketNames";
import {
	showErrorMessageAndAskUser,
	showErrorMessageToUser,
	showSuccessMessageAndAskUser,
	showWarningMessageAndAskUser,
	showWarningMessageToUser,
} from "@/app/includes/ts/frontend/userFeedback/PopUp";
import { DefaultErrorMessages } from "@/app/includes/ts/frontend/userFeedback/Messages";
import { useRouter } from "next/navigation";
import RootLink from "@/app/components/RootLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faArrowLeft,
	faArrowRight,
	faArrowsLeftRightToLine,
	faEye,
	faEyeSlash,
	faRotateBack,
	faRotateForward,
	faRotateLeft,
	faRotateRight,
} from "@fortawesome/free-solid-svg-icons";

export default function ControlView() {
	const router = useRouter();
	const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(0);
	const [showSolutions, setShowSolutions] = useState<boolean>(false);
	const [showSolutionsInPreview, setShowSolutionsInPreview] = useState<boolean>(false);
	const [quizData, setQuizData] = useState<QuizData | null>(null);
	const [socketIOClient, setSocketIOClient] = useState<Socket | null>(null);

	const getMaxQuestions = () => (quizData ? quizData.length : 0);

	useEffect(() => {
		//Create Socket IO Client
		const socketIOClient = io({});
		setSocketIOClient(socketIOClient);
		socketIOClient.emit(ESocketEventNames.JOIN_ROOM, ERoomNames.REFERENT_CONTROL);
		socketIOClient.emit(ESocketEventNames.GET_QUESTION_NUMBER);

		//Fetch quizData
		socketIOClient.emit(ESocketEventNames.GET_QUIZ_DATA);

		socketIOClient.on(ESocketEventNames.ERROR, async (errorName: string) => {
			if (errorName === "NO_QUIZ_DATA") {
				setQuizData(null);
				const userResponse = await showErrorMessageAndAskUser({
					message:
						"Es gibt noch keine Quizdaten. Bitte initialisiere das Quiz zuerst. Möchtest du das Quiz jetzt initialisieren?",
				});

				if (userResponse.isConfirmed) {
					router.push("/referentenansicht/init");
				}
				return;
			} else if (errorName === "QUESTION_NUMBER_INVALID") {
				showErrorMessageToUser({ message: "Der Server lehnt die Fragenummer ab." });
				return;
			}
			showErrorMessageToUser({ message: DefaultErrorMessages.ERROR_RETRY_AGAIN_LATER });
		});

		socketIOClient.on(ESocketEventNames.SUCCESS, async (successMessage: string) => {});

		socketIOClient.on(ESocketEventNames.SEND_QUIZ_DATA, async (quizData: QuizData) => {
			setQuizData(quizData);
		});

		socketIOClient.on(ESocketEventNames.SEND_QUESTION_NUMBER, (number: number) => {
			setCurrentQuestionNumber(number);
		});

		socketIOClient.on(ESocketEventNames.SEND_SHOW_SOLUTIONS, (showSolutions: boolean) => {
			setShowSolutions(showSolutions);
		});

		return () => {
			socketIOClient.close();
		};
	}, [router]);

	const isLastQuestion = (questionNumber: number): boolean => {
		return questionNumber === getMaxQuestions() - 1;
	};

	const isFirstQuestion = (questionNumber: number): boolean => {
		return questionNumber === 0;
	};

	const handleNextQuestion = async () => {
		if (isLastQuestion(currentQuestionNumber)) {
			const userFeedback = await showWarningMessageAndAskUser({
				message: "Es gibt keine weitere Frage. Möchtest du von vorne beginnen?",
			});

			if (userFeedback.isConfirmed) {
				setCurrentQuestionNumber(0);
				sendQuestionNumber(0);
				return;
			}
			return;
		}
		const nextQuestionNumber = currentQuestionNumber + 1;
		sendShowSolutions(false);
		setCurrentQuestionNumber(nextQuestionNumber);
		sendQuestionNumber(nextQuestionNumber);
	};

	const handlePreviousQuestion = async () => {
		if (isFirstQuestion(currentQuestionNumber)) {
			const userFeedback = await showWarningMessageAndAskUser({
				message: "Du bist bereits am Anfang. Möchtest du zur letzten Frage springen?",
			});

			if (userFeedback.isConfirmed) {
				const nextQuestionNumber = getMaxQuestions() - 1;
				setCurrentQuestionNumber(nextQuestionNumber);
				sendQuestionNumber(nextQuestionNumber);
				return;
			}
			return;
		}
		const previousQuestionNumber = currentQuestionNumber - 1;
		setCurrentQuestionNumber(previousQuestionNumber);
		sendQuestionNumber(previousQuestionNumber);
	};

	const socketIOClientIsDefinedAndConnected = (
		socketIOClient: unknown
	): socketIOClient is Socket => {
		if (!socketIOClient) return false;
		if (socketIOClient instanceof Socket && socketIOClient.connected) return true;
		return false;
	};

	const sendQuestionNumber = (number: number) => {
		if (!socketIOClientIsDefinedAndConnected(socketIOClient)) {
			showErrorMessageToUser({
				message: DefaultErrorMessages.SERVER_NOT_CONNECTED,
			});
			return;
		}

		socketIOClient.emit(ESocketEventNames.SEND_QUESTION_NUMBER, number);
	};

	const sendShowSolutions = useCallback(
		(showSolutions: boolean) => {
			if (!socketIOClientIsDefinedAndConnected(socketIOClient)) {
				showErrorMessageToUser({
					message: DefaultErrorMessages.SERVER_NOT_CONNECTED,
				});
				return;
			}

			socketIOClient.emit(ESocketEventNames.SEND_SHOW_SOLUTIONS, showSolutions);
		},
		[socketIOClient]
	);

	const handleShowSolutions = useCallback(
		(event: SyntheticEvent<HTMLButtonElement>) => {
			const newShowSolutions = !showSolutions;
			setShowSolutions(newShowSolutions);
			sendShowSolutions(newShowSolutions);
		},
		[sendShowSolutions, showSolutions]
	);

	return (
		<>
			<Container>
				<h1 className="text-center">Referentenansicht - Steuerung</h1>
				<Row>
					<Col className={`col-12 col-xl-4 ${styles.controller}`}>
						<h2 className="text-center">Controller</h2>
						<Container className="content">
							<Row>
								<Col className="col-12 col-md-6 col-xl-12 d-flex flex-column align-items-center justify-content-center">
									<div>
										Frage <b>{currentQuestionNumber + 1}</b> von{" "}
										<b>{getMaxQuestions()}</b>
									</div>
									<Form.Switch
										className="showSolutionsPreview"
										label="Lösung in der Vorschau anzeigen:"
										checked={showSolutionsInPreview}
										onChange={(event: ChangeEvent<HTMLInputElement>) => {
											let isChecked = event.target.checked;
											setShowSolutionsInPreview(isChecked);
										}}
									/>
								</Col>
								<Col className="col-12 col-md-6 col-xl-12 d-flex flex-column align-items-center">
									<b>Lösung {showSolutions ? "verstecken" : "anzeigen"}:</b>
									<div>
										{showSolutions ? (
											<>
												<Button
													className="btn-show-solution m-2"
													onClick={handleShowSolutions}
													data-show-solutions={showSolutions}
												>
													<FontAwesomeIcon
														icon={faEye}
														style={{ fontSize: 30, color: "black" }}
													/>
												</Button>
											</>
										) : (
											<>
												<Button
													className="btn-show-solution m-2"
													onClick={handleShowSolutions}
													data-show-solutions={showSolutions}
												>
													<FontAwesomeIcon
														icon={faEyeSlash}
														style={{ fontSize: 30, color: "black" }}
													/>
												</Button>
											</>
										)}
									</div>

									<section className="btn-prev-next">
										<Button className="btn-previous m-2" onClick={handlePreviousQuestion}>
											{isFirstQuestion(currentQuestionNumber) ? (
												<>
													<FontAwesomeIcon
														icon={faRotateLeft}
														style={{ fontSize: 30, color: "black" }}
													/>
												</>
											) : (
												<>
													{" "}
													<FontAwesomeIcon
														icon={faArrowLeft}
														style={{ fontSize: 30, color: "black" }}
													/>
												</>
											)}
										</Button>
										<Button className="btn-next m-2" onClick={handleNextQuestion}>
											{isLastQuestion(currentQuestionNumber) ? (
												<>
													<FontAwesomeIcon
														icon={faRotateRight}
														style={{ fontSize: 30, color: "black" }}
													/>
												</>
											) : (
												<>
													{" "}
													<FontAwesomeIcon
														icon={faArrowRight}
														style={{ fontSize: 30, color: "black" }}
													/>
												</>
											)}
										</Button>
									</section>
								</Col>
							</Row>
						</Container>
					</Col>
					<Col className={styles.preview}>
						<h2 className="text-center">Vorschau</h2>
						{quizData ? (
							<QuizReadOnly
								questionEntry={quizData[currentQuestionNumber]}
								showSolutions={showSolutionsInPreview}
							/>
						) : (
							<>
								<p className="text-center">Bitte initialisiere das Quiz zuerst.</p>
							</>
						)}
					</Col>
				</Row>
			</Container>

			<footer className={styles.footer}>
				<RootLink text="Zur Übersicht" />
			</footer>
		</>
	);
}
