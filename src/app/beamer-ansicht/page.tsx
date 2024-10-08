"use client";
import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import QuizReadOnly from "../components/QuizReadOnly/QuizReadOnly";
import { QuizData, QuizPackage } from "@/interfaces/joi";
import { Socket, io } from "socket.io-client";

import styles from "./beamer-ansicht.module.scss";
import { ERoomNames, ESocketEventNames } from "../includes/ts/socketIO/socketNames";
import UserScoreList from "../components/UserScoreList/UserScoreList";
import { UserWithCountList } from "@/interfaces/user-counter";
import { ScoreMode } from "@/interfaces/scoreMode";
import { showErrorMessageToUser } from "../includes/ts/frontend/userFeedback/PopUp";
import { DefaultErrorMessages } from "../includes/ts/frontend/userFeedback/Messages";

export default function BeamerAnsicht() {
	const [showSolutions, setShowSolutions] = useState<boolean>(false);
	const [showScoreDisplay, setShowScoreDisplay] = useState<boolean>(false);
	const [quizPackage, setQuizPackage] = useState<QuizPackage | null>(null);
	const [socketIOClient, setSocketIOClient] = useState<Socket | null>(null);
	const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(0);
	const [currentCounterValue, setCurrentCounterValue] = useState<number>(0);

	const [waitingMessage, setWatingMessage] = useState<string>(
		EWaitingMessage.WAITING_FOR_DATA
	);

	const [userWithCountList, setUserWithCountList] = useState<UserWithCountList | null>(
		null
	);

	const [scoreMode, setScoreMode] = useState<ScoreMode | null>(null);

	useEffect(() => {
		//Create Socket IO Client
		const socketIOClient = io({});
		setSocketIOClient(socketIOClient);
		socketIOClient.emit(ESocketEventNames.JOIN_ROOM, ERoomNames.BEAMER);

		socketIOClient.on(ESocketEventNames.ERROR, async (errorName: string) => {});

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

		socketIOClient.on(ESocketEventNames.SEND_COUNTER_VALUE, (number: number) => {
			console.log(number);
			setCurrentCounterValue(number);
		});

		socketIOClient.on(ESocketEventNames.SEND_SHOW_SOLUTIONS, (showSolutions: boolean) => {
			setShowSolutions(showSolutions);
		});

		socketIOClient.on(
			ESocketEventNames.SEND_SHOW_SCORE_DISPLAY,
			(showScoreDisplay: boolean) => {
				setShowScoreDisplay(showScoreDisplay);
			}
		);

		socketIOClient.on(
			ESocketEventNames.SEND_USER_WITH_COUNT_LIST,
			(userWithCountList: UserWithCountList) => {
				setUserWithCountList(userWithCountList);
			}
		);

		socketIOClient.on(ESocketEventNames.SEND_SCORE_MODE, (scoreMode: ScoreMode) => {
			setScoreMode(scoreMode);
			console.log(scoreMode);
		});

		//Fetch quizData
		socketIOClient.emit(ESocketEventNames.GET_QUIZ_DATA);
		socketIOClient.emit(ESocketEventNames.GET_QUESTION_NUMBER);
		socketIOClient.emit(ESocketEventNames.GET_COUNTER_VALUE);
		socketIOClient.emit(ESocketEventNames.GET_USER_WITH_COUNT_LIST);
		socketIOClient.emit(ESocketEventNames.GET_SCORE_MODE);
		socketIOClient.emit(ESocketEventNames.GET_SHOW_SCORE_DISPLAY);
		socketIOClient.emit(ESocketEventNames.GET_COUNTER_VALUE);
		socketIOClient.emit(ESocketEventNames.GET_SHOW_SOLUTIONS);
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
				{showScoreDisplay ? (
					<>
						<h1 className="text-center">Ergebnisse</h1>
						{scoreMode !== null && scoreMode === ScoreMode.GLOBAL ? (
							<div className="score-display-global">
								{" "}
								<div
									className={`${styles.wrapper} text-center`}
									style={{ fontSize: "3rem" }}
								>
									Aktuelle Punktzahl:{" "}
									<span className="current">{currentCounterValue}</span>
								</div>
							</div>
						) : (
							<div className="score-display-user">
								{" "}
								<UserScoreList userWithCountList={userWithCountList} />
							</div>
						)}
					</>
				) : (
					<>
						<h1 className="text-center">Quiz</h1>

						<div className={styles.wrapper}>
							{quizPackage && quizPackage.quizData.length ? (
								<QuizReadOnly
									questionEntry={quizPackage.quizData[currentQuestionNumber]}
									showSolutions={showSolutions}
								/>
							) : (
								<>
									<div className={styles.waiting}>{waitingMessage}...</div>
								</>
							)}
						</div>
					</>
				)}
			</Container>
		</>
	);
}

enum EWaitingMessage {
	WAITING_FOR_DATA = "Warte auf Daten",
}
