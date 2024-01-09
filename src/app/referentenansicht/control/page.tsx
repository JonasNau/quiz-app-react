"use client";
import React, {
	ChangeEvent,
	SyntheticEvent,
	useCallback,
	useEffect,
	useState,
} from "react";
import { Button, Col, Container, FormCheck, Row } from "react-bootstrap";

import styles from "./page.module.scss";
import QuizReadOnly from "@/app/components/QuizReadOnly/QuizReadOnly";
import { QuizData } from "@/interfaces/joi/QuizSchemas";
import { Socket, io } from "socket.io-client";
import { ERoomNames, ESocketEventNames } from "@/app/includes/ts/socketIO/socketNames";
import {
	showErrorMessageAndAskUser,
	showErrorMessageToUser,
	showSuccessMessageAndAskUser,
	showWarningMessageToUser,
} from "@/app/includes/ts/frontend/userFeedback/PopUp";
import { DefaultErrorMessages } from "@/app/includes/ts/frontend/userFeedback/Messages";
import { useRouter } from "next/navigation";
import RootLink from "@/app/components/RootLink";

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
			}
			showErrorMessageToUser({ message: DefaultErrorMessages.ERROR_RETRY_AGAIN_LATER });
		});

		socketIOClient.on(ESocketEventNames.SUCCESS, async (successMessage: string) => {});

		socketIOClient.on(ESocketEventNames.SEND_QUIZ_DATA, async (quizData: QuizData) => {
			setQuizData(quizData);
		});

		return () => {
			socketIOClient.close();
		};
	}, [router]);

	const handleShowSolutions = useCallback(
		(event: SyntheticEvent<HTMLButtonElement>) => {
			const newShowSolutions = !showSolutions;
			setShowSolutions(newShowSolutions);
		},
		[showSolutions]
	);

	const handleNextQuestion = async () => {
		if (currentQuestionNumber === getMaxQuestions()) {
			const userFeedback = await showWarningMessageToUser({
				message: "Es gibt keine weitere Frage. Möchtest du von vorne beginnen?",
			});

			if (userFeedback.isConfirmed) {
				return;
			}

			return;
		}
	};

	const handlePreviousQuestion = () => {};

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
		//TODO: send question numer to server
		// socketIOClient.emit()
	};

	return (
		<>
			<Container>
				<h1 className="text-center">Referentenansicht - Steuerung</h1>
				<Row>
					<Col className="col-4">
						<div className={styles.controller}>
							<h2 className="text-center">Controller</h2>
							<Container className="content">
								<div>
									Frage {currentQuestionNumber + 1} von {getMaxQuestions()}
								</div>
								<FormCheck
									type="checkbox"
									label="Lösung in der Vorschau anzeigen"
									checked={showSolutionsInPreview}
									onChange={(event: ChangeEvent<HTMLInputElement>) => {
										let isChecked = event.target.checked;
										setShowSolutionsInPreview(isChecked);
									}}
								/>
								<section className="d-flex justify-content-center">
									<Button className="btn-show-solution m-2" onClick={handleShowSolutions}>
										Lösung anzeigen / verstecken
									</Button>
								</section>
								<section className="btn-prev-next">
									<Button className="btn-previous m-2" variant="secondary">
										Vorherige Frage
									</Button>
									<Button
										className="btn-next m-2"
										variant="secondary"
										onClick={handleNextQuestion}
									>
										Nächste Frage
									</Button>
								</section>
							</Container>
						</div>
					</Col>
					<Col>
						<div className={styles.preview}>
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
						</div>
					</Col>
				</Row>
			</Container>
			<footer className={styles.footer}>
				<RootLink text="Zur Übersicht" />
			</footer>
		</>
	);
}
