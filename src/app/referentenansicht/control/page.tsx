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
import { QuizData, QuizPackage } from "@/interfaces/joi/QuizSchemas";
import { Socket, io } from "socket.io-client";
import { ERoomNames, ESocketEventNames } from "@/app/includes/ts/socketIO/socketNames";
import {
	askUserTextInput,
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
	faMinus,
	faPlus,
	faRefresh,
	faRotateBack,
	faRotateForward,
	faRotateLeft,
	faRotateRight,
	faX,
} from "@fortawesome/free-solid-svg-icons";
import UserCounterWithIncrementAndDecrement from "@/app/components/UserCounter/UserCounterWithIncrementAndDecrement";
import { UserWithCountList } from "@/interfaces/user-counter";
import { ScoreMode } from "@/interfaces/joi/scoreMode";

export default function ControlView() {
	const router = useRouter();
	const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(0);
	const [currentCounterValue, setCurrentCounterValue] = useState<number>(0);
	const [showSolutions, setShowSolutions] = useState<boolean>(false);
	const [showSolutionsInPreview, setShowSolutionsInPreview] = useState<boolean>(false);
	const [quizPackage, setQuizPackage] = useState<QuizPackage | null>(null);
	const [socketIOClient, setSocketIOClient] = useState<Socket | null>(null);
	const [userWithCountList, setUserWithCountList] = useState<UserWithCountList | null>(
		null
	);
	const [scoreMode, setScoreMode] = useState<ScoreMode | null>(null);

	const getMaxQuestions = () => (quizPackage ? quizPackage.quizData.length : 0);

	useEffect(() => {
		//Create Socket IO Client
		const socketIOClient = io({});
		setSocketIOClient(socketIOClient);
		socketIOClient.emit(ESocketEventNames.JOIN_ROOM, ERoomNames.REFERENT_CONTROL);
		socketIOClient.emit(ESocketEventNames.GET_QUESTION_NUMBER);
		socketIOClient.emit(ESocketEventNames.GET_COUNTER_VALUE);
		socketIOClient.emit(ESocketEventNames.GET_USER_WITH_COUNT_LIST);
		socketIOClient.emit(ESocketEventNames.GET_SCORE_MODE);

		//Fetch quizData
		socketIOClient.emit(ESocketEventNames.GET_QUIZ_DATA);

		socketIOClient.on(ESocketEventNames.ERROR, async (errorName: string) => {
			if (errorName === "NO_QUIZ_DATA") {
				setQuizPackage(null);
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

		socketIOClient.on(
			ESocketEventNames.SEND_QUIZ_DATA,
			async (quizPackage: QuizPackage) => {
				setQuizPackage(quizPackage);
			}
		);

		socketIOClient.on(ESocketEventNames.SEND_QUESTION_NUMBER, (number: number) => {
			setCurrentQuestionNumber(number);
		});

		socketIOClient.on(
			ESocketEventNames.SEND_USER_WITH_COUNT_LIST,
			(userWithCountList: UserWithCountList) => {
				setUserWithCountList(userWithCountList);
			}
		);

		socketIOClient.on(ESocketEventNames.SEND_COUNTER_VALUE, (number: number) => {
			setCurrentCounterValue(number);
		});

		socketIOClient.on(ESocketEventNames.SEND_SCORE_MODE, (scoreMode: ScoreMode) => {
			setScoreMode(scoreMode);
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

	const sendCurrentCounterValue = (number: number) => {
		if (!socketIOClientIsDefinedAndConnected(socketIOClient)) {
			showErrorMessageToUser({
				message: DefaultErrorMessages.SERVER_NOT_CONNECTED,
			});
			return;
		}

		socketIOClient.emit(ESocketEventNames.SEND_COUNTER_VALUE, number);
	};

	const sendUserWithCountList = (userWithCountList: UserWithCountList) => {
		if (!socketIOClientIsDefinedAndConnected(socketIOClient)) {
			showErrorMessageToUser({
				message: DefaultErrorMessages.SERVER_NOT_CONNECTED,
			});
			return;
		}

		socketIOClient.emit(ESocketEventNames.SEND_USER_WITH_COUNT_LIST, userWithCountList);
	};

	const sendScoreMode = (scoreMode: ScoreMode) => {
		if (!socketIOClientIsDefinedAndConnected(socketIOClient)) {
			showErrorMessageToUser({
				message: DefaultErrorMessages.SERVER_NOT_CONNECTED,
			});
			return;
		}

		socketIOClient.emit(ESocketEventNames.SEND_SCORE_MODE, scoreMode);
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

	const currentCounterIncrement = () => {
		const newValue = currentCounterValue + 1;
		setCurrentCounterValue(newValue);
		sendCurrentCounterValue(newValue);
	};

	const currentCounterDecrement = () => {
		const newValue = currentCounterValue - 1;
		setCurrentCounterValue(newValue);
		sendCurrentCounterValue(newValue);
	};

	const currentCounterReset = () => {
		const newValue = 0;
		setCurrentCounterValue(newValue);
		sendCurrentCounterValue(newValue);
	};

	return (
		<>
			<Container>
				<h1 className="text-center">Referentenansicht - Steuerung</h1>
				<Row>
					<Col className={`col-12 col-xl-4 ${styles.controller}`}>
						<h2 className="text-center">Controller</h2>
						<div className="text-center">
							<RootLink text="Zur Übersicht" />
						</div>
						<Container className="content">
							<Row>
								<Col className="col-12 col-md-6 col-xl-12 d-flex flex-column align-items-center justify-content-center">
									<div>
										Frage <b>{currentQuestionNumber + 1}</b> von{" "}
										<b>{getMaxQuestions()}</b>
									</div>
									<Form.Switch
										className="controllerSwitch"
										label="Lösung in der Vorschau anzeigen:"
										checked={showSolutionsInPreview}
										onChange={(event: ChangeEvent<HTMLInputElement>) => {
											let isChecked = event.target.checked;
											setShowSolutionsInPreview(isChecked);
										}}
									/>
									<Form.Switch
										className="controllerSwitch"
										label={`Punkte Modus (${
											scoreMode === ScoreMode.GLOBAL ? "global" : "Benutzer"
										}):`}
										checked={scoreMode === ScoreMode.USER}
										onChange={(event: ChangeEvent<HTMLInputElement>) => {
											let isChecked = event.target.checked;
											let newScoreMode = isChecked ? ScoreMode.USER : ScoreMode.GLOBAL;
											console.log(newScoreMode);
											setScoreMode(newScoreMode);
											sendScoreMode(newScoreMode);
										}}
										disabled={scoreMode === null}
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
									{scoreMode === ScoreMode.GLOBAL ? (
										<>
											{" "}
											<section className="btn-counter">
												<div className="text-center" style={{ fontWeight: "bold" }}>
													Punkte:
												</div>
												<div
													className="number"
													onDoubleClick={() => currentCounterReset()}
												>
													{currentCounterValue}
												</div>

												<Button
													onClick={() => currentCounterDecrement()}
													style={{ backgroundColor: "red" }}
												>
													{" "}
													<FontAwesomeIcon
														icon={faMinus}
														style={{ fontSize: 30, color: "black" }}
													/>
												</Button>
												<Button
													onClick={() => currentCounterIncrement()}
													style={{ backgroundColor: "green" }}
												>
													<FontAwesomeIcon
														icon={faPlus}
														style={{ fontSize: 30, color: "black" }}
													/>
												</Button>
											</section>
										</>
									) : (
										<>
											{" "}
											<section className="user-counters">
												<div className="text-center" style={{ fontWeight: "bold" }}>
													Benutzer-Punkte:
												</div>
												{userWithCountList && userWithCountList.length
													? userWithCountList.map((userdata, index) => {
															return (
																<div key={index} className="d-flex mb-1">
																	<Button
																		onClick={() => {
																			const newUserWithCountList =
																				userWithCountList.filter((current, i) => {
																					if (i === index) return false;
																					return true;
																				});

																			setUserWithCountList(newUserWithCountList);
																			sendUserWithCountList(newUserWithCountList);
																		}}
																		style={{
																			padding: 5,
																			height: "30px",
																			alignSelf: "center",
																			background: "none",
																			border: "none",
																		}}
																		className="d-flex align-items-center justify-content-center"
																	>
																		<FontAwesomeIcon
																			icon={faX}
																			style={{ fontSize: 10, color: "red" }}
																		></FontAwesomeIcon>
																	</Button>
																	<UserCounterWithIncrementAndDecrement
																		username={userdata.username}
																		count={userdata.count}
																		onUpdateCount={(count) => {
																			const newUserWithCountList = userWithCountList.map(
																				(current, i) => {
																					if (index === i)
																						return { ...current, count: count };
																					return current;
																				}
																			);

																			setUserWithCountList(newUserWithCountList);
																			sendUserWithCountList(newUserWithCountList);
																		}}
																		onUpdateUsernameEvent={async () => {
																			const result = await askUserTextInput({
																				message: "Wie soll der Name des Benutzers sein?",
																				title: "Name eingeben",
																				inputValue: userdata.username,
																			});

																			if (!result.isConfirmed) return;
																			const value = result.value;
																			if (
																				typeof value !== "string" ||
																				!value.trim().length
																			)
																				return;
																			if (!userWithCountList) {
																				await showErrorMessageToUser({
																					message:
																						"Die Benutzer konnten nicht erfolgreich mit dem Server synchronisiert werden. Versuche es bitte erneut.",
																				});
																				return;
																			}

																			let newUserWithCountList = userWithCountList.map(
																				(current, i) => {
																					if (index === i)
																						return { ...current, username: value };
																					return current;
																				}
																			);

																			setUserWithCountList(newUserWithCountList);
																			sendUserWithCountList(newUserWithCountList);
																		}}
																	/>
																</div>
															);
														})
													: null}
												<Button
													variant="success"
													style={{ marginRight: "1rem" }}
													onClick={async () => {
														const result = await askUserTextInput({
															message: "Wie soll der Name des Benutzers sein?",
															title: "Name eingeben",
														});

														if (!result.isConfirmed) return;
														const value = result.value;
														if (typeof value !== "string" || !value.trim().length) return;
														if (!userWithCountList) {
															await showErrorMessageToUser({
																message:
																	"Die Benutzer konnten nicht erfolgreich mit dem Server synchronisiert werden. Versuche es bitte erneut.",
															});
															return;
														}

														let newUserWithCountList = [
															...userWithCountList,
															{ count: 0, username: value },
														];

														setUserWithCountList(newUserWithCountList);
														sendUserWithCountList(newUserWithCountList);
													}}
												>
													Benutzer hinzufügen
													<FontAwesomeIcon
														icon={faPlus}
														style={{ marginLeft: "0.25rem" }}
													/>
												</Button>
											</section>
										</>
									)}
								</Col>
							</Row>
						</Container>
					</Col>
					<Col className={styles.preview}>
						<h2 className="text-center">Vorschau</h2>
						{quizPackage?.quizData && quizPackage.quizData.length ? (
							<QuizReadOnly
								questionEntry={quizPackage.quizData[currentQuestionNumber]}
								showSolutions={showSolutionsInPreview}
							/>
						) : (
							<>
								<p className="text-center">
									Bitte initialisiere das Quiz zuerst oder füge eine Frage hinzu.
								</p>
							</>
						)}
					</Col>
				</Row>
			</Container>
		</>
	);
}
