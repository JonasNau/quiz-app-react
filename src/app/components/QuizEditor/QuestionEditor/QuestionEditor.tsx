import { QuestionEntry } from "@/interfaces/joi";
import {
	faArrowDown,
	faArrowUp,
	faCheck,
	faPlus,
	faTrashCan,
	faX,
	faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactEventHandler, useEffect, useState } from "react";
import { Button, ButtonGroup, Form } from "react-bootstrap";
import styles from "./questionEditor.module.scss";
import { moveArrayItem } from "@/app/includes/ts/object-utils";

export type OnQuestionEntryUpdate = (questionEntry: QuestionEntry) => void;
export type OnEditorClose = () => void;

export default function QuestionEditor({
	questionEntryJSON,
	onQuestionEntryUpdate,
}: {
	questionEntryJSON: QuestionEntry;
	onQuestionEntryUpdate: OnQuestionEntryUpdate;
}) {
	const [questionEntry, setQuestionEntry] = useState<QuestionEntry>(questionEntryJSON);
	const getNumberAnswers = () => questionEntry.answers.length;

	const isFirstAnswer = (answerNumber: number) => answerNumber === 0;
	const isLastAnswer = (answerNumber: number) => answerNumber === getNumberAnswers() - 1;

	useEffect(() => {
		onQuestionEntryUpdate(questionEntry);
	}, [onQuestionEntryUpdate, questionEntry]);

	const handleAnswerIsCorrectToggle = (index: number) => {
		setQuestionEntry((prev) => {
			return {
				...prev,
				answers: prev.answers.map((answer, currentIndex) => {
					if (currentIndex === index) {
						return {
							...answer,
							isCorrect: !answer.isCorrect,
						};
					}
					return answer;
				}),
			};
		});
	};

	const addEmptyAnswerToBottom = () => {
		setQuestionEntry((prev) => {
			return { ...prev, answers: [...prev.answers, { isCorrect: false, text: "" }] };
		});
	};

	const deleteAnswerAtIndex = (index: number) => {
		setQuestionEntry((prev) => {
			return {
				...prev,
				answers: prev.answers.filter((item, i) => {
					if (i !== index) return item;
				}),
			} satisfies QuestionEntry;
		});
	};

	return (
		<div className={styles.questionEditor}>
			<div className="question">
				<Form.Control
					as="textarea"
					value={questionEntry.question}
					onChange={(event) => {
						const value = event.target.value;
						setQuestionEntry((prev) => {
							return { ...prev, question: value };
						});
					}}
				/>
			</div>
			<div className="answer-list">
				{questionEntry.answers.map((answer, index) => {
					return (
						<div
							key={index}
							className={"answer-entry"}
							data-is-correct={answer.isCorrect}
						>
							<Form.Control
								as="textarea"
								value={answer.text}
								rows={2}
								onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
									const value = event.target.value;

									setQuestionEntry((prev) => {
										return {
											...prev,
											answers: prev.answers.map((answer, i) => {
												if (i === index) {
													return { ...answer, text: value };
												}
												return answer;
											}),
										};
									});
								}}
							/>
							<ButtonGroup className="d-flex flex-row mt-2">
								{answer.isCorrect ? (
									<>
										<Button
											className="set-correct"
											data-is-correct={true}
											onClick={(event) => {
												handleAnswerIsCorrectToggle(index);
											}}
										>
											<FontAwesomeIcon icon={faCheck} />
										</Button>
									</>
								) : (
									<>
										<Button
											className="set-correct"
											data-is-correct={false}
											onClick={(event) => {
												handleAnswerIsCorrectToggle(index);
											}}
										>
											<FontAwesomeIcon icon={faX} />
										</Button>
									</>
								)}

								<Button
									variant="primary"
									disabled={isFirstAnswer(index)}
									onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
										if (isFirstAnswer(index)) return;
										setQuestionEntry((prev) => {
											return {
												...prev,
												answers: moveArrayItem(prev.answers, index, index - 1),
											};
										});
									}}
								>
									<FontAwesomeIcon icon={faArrowUp} />
								</Button>
								<Button
									variant="primary"
									disabled={isLastAnswer(index)}
									onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
										if (isLastAnswer(index)) return;
										setQuestionEntry((prev) => {
											return {
												...prev,
												answers: moveArrayItem(prev.answers, index, index + 1),
											};
										});
									}}
								>
									<FontAwesomeIcon icon={faArrowDown} />
								</Button>
								<Button variant="danger" onClick={(event) => deleteAnswerAtIndex(index)}>
									<FontAwesomeIcon icon={faTrashCan} />
								</Button>
							</ButtonGroup>
						</div>
					);
				})}
				<section className="d-flex flex-column align-items-center">
					<Button
						variant="success"
						className="add-answer"
						onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
							addEmptyAnswerToBottom();
						}}
					>
						Antwort hinzufügen
						<FontAwesomeIcon icon={faPlus} style={{ marginLeft: "0.25rem" }} />
					</Button>
				</section>
			</div>
		</div>
	);
}
