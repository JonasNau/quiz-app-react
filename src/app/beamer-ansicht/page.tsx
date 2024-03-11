"use client";
import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import QuizReadOnly from "../components/QuizReadOnly/QuizReadOnly";
import { QuizData, QuizPackage } from "@/interfaces/joi";
import { Socket, io } from "socket.io-client";

import styles from "./beamer-ansicht.module.scss";
import { ERoomNames, ESocketEventNames } from "../includes/ts/socketIO/socketNames";

export default function BeamerAnsicht() {
	const [showSolutions, setShowSolutions] = useState<boolean>(false);
	const [quizPackage, setQuizPackage] = useState<QuizPackage | null>(null);
	const [socketIOClient, setSocketIOClient] = useState<Socket | null>(null);
	const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(0);
	const [waitingMessage, setWatingMessage] = useState<string>(
		EWaitingMessage.WAITING_FOR_DATA
	);
	const [currentCounterValue, setCurrentCounterValue] = useState<number>(0);

	useEffect(() => {
		//Create Socket IO Client
		const socketIOClient = io({});
		setSocketIOClient(socketIOClient);
		socketIOClient.emit(ESocketEventNames.JOIN_ROOM, ERoomNames.BEAMER);

		//Fetch quizData
		socketIOClient.emit(ESocketEventNames.GET_QUIZ_DATA);
		socketIOClient.emit(ESocketEventNames.GET_QUESTION_NUMBER);
		socketIOClient.emit(ESocketEventNames.GET_COUNTER_VALUE);

		socketIOClient.on(ESocketEventNames.ERROR, async (errorName: string) => {
			if (errorName === "NO_QUIZ_DATA") {
				setQuizPackage(null);
				setWatingMessage(EWaitingMessage.NO_DATA);
			}
		});

		socketIOClient.on("connect", () => {
			socketIOClient.emit(ESocketEventNames.GET_QUIZ_DATA);
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

		socketIOClient.on(ESocketEventNames.SEND_SHOW_SOLUTIONS, (showSolutions: boolean) => {
			setShowSolutions(showSolutions);
		});

		socketIOClient.on(ESocketEventNames.SEND_COUNTER_VALUE, (number: number) => {
			setCurrentCounterValue(number);
		});
	}, []);

	const socketIOClientIsDefinedAndConnected = (
		socketIOClient: unknown
	): socketIOClient is Socket => {
		if (!socketIOClient) return false;
		if (socketIOClient instanceof Socket && socketIOClient.connected) return true;
		return false;
	};

	return (
		<>
			<Container className={styles.componentContainer}>
				<h1 className="text-center">Quiz</h1>

				{quizPackage && quizPackage.quizData.length ? (
					<div className={styles.quiz}>
						<QuizReadOnly
							questionEntry={quizPackage.quizData[currentQuestionNumber]}
							showSolutions={showSolutions}
							currentCounterValue={currentCounterValue}
						/>
					</div>
				) : (
					<>
						<div className={styles.waiting}>{waitingMessage}...</div>
					</>
				)}
			</Container>
		</>
	);
}

enum EWaitingMessage {
	WAITING_FOR_DATA = "Warte auf Daten.",
	NO_DATA = "Keine Daten vorhanden. Warte auf Daten.",
}
