"use client";
import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import QuizReadOnly from "../components/QuizReadOnly/QuizReadOnly";
import { QuizData } from "@/interfaces/joi";
import { Socket, io } from "socket.io-client";

import styles from "./beamer-ansicht.module.scss";
import { ERoomNames, ESocketEventNames } from "../includes/ts/socketIO/socketNames";

export default function BeamerAnsicht() {
	const [showSolutions, setShowSolutions] = useState<boolean>(false);
	const [quizData, setQuizData] = useState<QuizData | null>(null);
	const [socketIOClient, setSocketIOClient] = useState<Socket | null>(null);
	const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(0);
	const [waitingMessage, setWatingMessage] = useState<string>(
		EWaitingMessage.WAITING_FOR_DATA
	);

	useEffect(() => {
		//Create Socket IO Client
		const socketIOClient = io({});
		setSocketIOClient(socketIOClient);
		socketIOClient.emit(ESocketEventNames.JOIN_ROOM, ERoomNames.BEAMER);

		//Fetch quizData
		socketIOClient.emit(ESocketEventNames.GET_QUIZ_DATA);
		socketIOClient.emit(ESocketEventNames.GET_QUESTION_NUMBER);

		socketIOClient.on(ESocketEventNames.ERROR, async (errorName: string) => {
			if (errorName === "NO_QUIZ_DATA") {
				setQuizData(null);
				setWatingMessage(EWaitingMessage.NO_DATA);
			}
		});

		socketIOClient.on("connect", () => {
			socketIOClient.emit(ESocketEventNames.GET_QUIZ_DATA);
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
				{quizData ? (
					<div className={styles.quiz}>
						<QuizReadOnly
							questionEntry={quizData[currentQuestionNumber]}
							showSolutions={showSolutions}
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
