import { QuestionEntry, QuizData } from "@/interfaces/joi";
import React, { SyntheticEvent, useCallback, useEffect, useState } from "react";
import QuestionEditor from "./QuestionEditor/QuestionEditor";
import { Button, ButtonGroup, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faArrowDown,
	faArrowUp,
	faPencil,
	faPlus,
	faTrashCan,
	faX,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./quizEditor.module.scss";
import { moveArrayItem } from "@/app/includes/ts/object-utils";

export type OnQuizDataUpdate = (quizData: QuizData) => void;

export default function QuizEditor({
	quizJSON,
	onQuizDataUpdate,
}: {
	quizJSON: QuizData;
	onQuizDataUpdate: OnQuizDataUpdate;
}) {
	const [quizData, setQuizData] = useState<QuizData>(quizJSON);
	const [editorIsOpen, setEditorIsOpen] = useState<boolean>(false);
	const [selectedQuestionNumber, setSelectedQuestionNumber] = useState<number | null>(
		null
	);

	useEffect(() => {
		onQuizDataUpdate(quizData);
	}, [onQuizDataUpdate, quizData]);

	const getNumberQuestions = () => quizData.length;

	const isFirstQuestion = (questionNumber: number) => questionNumber === 0;
	const isLastQuestion = (questionNumber: number) =>
		questionNumber === getNumberQuestions() - 1;

	const editQuestion = (questionNumber: number) => {
		setSelectedQuestionNumber(questionNumber);
		setEditorIsOpen(true);
	};

	const moveQuestionOrder = (
		currentQuestionNumber: number,
		newQuestionNumber: number
	) => {};

	const onEditorClose = () => {
		setEditorIsOpen(false);
		setSelectedQuestionNumber(null);
	};

	const onQuestionEntryUpdate = useCallback(
		(questionEntry: QuestionEntry) => {
			if (selectedQuestionNumber === null) return;
			setQuizData((prev) => {
				return prev.map((item, index) => {
					if (index === selectedQuestionNumber) return questionEntry;
					return item;
				});
			});
		},
		[selectedQuestionNumber]
	);

	const addNewEmptyQuestionEntryToBottom = () => {
		setQuizData((prev) => {
			return [...prev, { question: "", answers: [] }] satisfies QuizData;
		});
	};

	const deleteQuestionEntryAtIndex = (index: number) => {
		setQuizData((prev) => {
			return prev.filter((item, i) => i !== index);
		});
	};

	const editorShouldBeOpenOnIndex = (index: number) =>
		selectedQuestionNumber !== null && editorIsOpen && selectedQuestionNumber === index;

	return (
		<div className={styles.quizEditor}>
			<h2>Übersicht</h2>
			<div className="overview">
				{quizData.map((questionEntry, index) => {
					return (
						<div key={index}>
							<div className="question-entry">
								<div className="wrapper  d-flex align-items-center justify-content-cente">
									<div className="index">{index + 1}</div>
									<div className="question">{questionEntry.question}</div>
									<ButtonGroup>
										{editorShouldBeOpenOnIndex(index) ? (
											<>
												<Button
													variant="primary"
													onClick={(event) => {
														setEditorIsOpen(false);
														setSelectedQuestionNumber(null);
													}}
												>
													<FontAwesomeIcon icon={faX} />
												</Button>
											</>
										) : (
											<>
												<Button
													variant="success"
													onClick={(
														event: React.MouseEvent<HTMLButtonElement, MouseEvent>
													) => {
														editQuestion(index);
													}}
												>
													<FontAwesomeIcon icon={faPencil} />
												</Button>
											</>
										)}

										<Button
											variant="primary"
											disabled={isFirstQuestion(index)}
											onClick={(event) => {
												if (isFirstQuestion(index)) return;
												setQuizData((prev) => {
													return moveArrayItem(prev, index, index - 1);
												});
											}}
										>
											<FontAwesomeIcon icon={faArrowUp} />
										</Button>
										<Button
											variant="primary"
											disabled={isLastQuestion(index)}
											onClick={(event) => {
												if (isLastQuestion(index)) return;
												setQuizData((prev) => {
													return moveArrayItem(prev, index, index + 1);
												});
											}}
										>
											<FontAwesomeIcon icon={faArrowDown} />
										</Button>
										<Button
											variant="danger"
											onClick={(event) => deleteQuestionEntryAtIndex(index)}
										>
											<FontAwesomeIcon icon={faTrashCan} />
										</Button>
									</ButtonGroup>
								</div>
							</div>
							{editorShouldBeOpenOnIndex(index) && (
								<>
									<h3 className="text-center">Bearbeiten</h3>
									<div className="question-editor-wrapper">
										<QuestionEditor
											onQuestionEntryUpdate={onQuestionEntryUpdate}
											questionEntryJSON={questionEntry}
										/>
									</div>
								</>
							)}
						</div>
					);
				})}
			</div>
			<hr />
			<section className="d-flex flex-column align-items-center">
				<Button
					variant="success"
					className="add-answer"
					onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
						addNewEmptyQuestionEntryToBottom();
					}}
				>
					Frage hinzufügen
					<FontAwesomeIcon icon={faPlus} style={{ marginLeft: "0.25rem" }} />
				</Button>
			</section>
		</div>
	);
}
