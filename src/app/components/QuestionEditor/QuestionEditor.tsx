import { QuestionEntry } from "@/interfaces/joi";
import {
	faArrowDown,
	faArrowUp,
	faCheck,
	faGripLines,
	faGripLinesVertical,
	faPlus,
	faTrashCan,
	faX,
	faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { Button, ButtonGroup, Form } from "react-bootstrap";
import styles from "./questionEditor.module.scss";
import { moveArrayItem } from "@/app/includes/ts/object-utils";
import { autoResizeTextarea } from "@/app/includes/ts/frontend/inputs/element-helper-functions";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableListItem from "../DragAndDrop/Draggable/DraggableListItem";

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

	const textareaRefs = useRef<Array<React.RefObject<HTMLTextAreaElement>>>(
		questionEntry.answers.map(() => React.createRef())
	);

	useEffect(() => {
		onQuestionEntryUpdate(questionEntry);
	}, [onQuestionEntryUpdate, questionEntry]);

	useEffect(() => {
		textareaRefs.current.forEach((ref) => {
			if (ref.current) {
				autoResizeTextarea(ref.current);
			}
		});
	}, []);

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
					placeholder="Frage..."
					onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
						const value = event.target.value;
						autoResizeTextarea(event.target);
						setQuestionEntry((prev) => {
							return { ...prev, question: value };
						});
					}}
				/>
			</div>
			<div className="answer-list">
				<DndProvider backend={HTML5Backend}>
					{questionEntry.answers.map((answer, index) => {
						return (
							<div key={index}>
								<hr />
								<DraggableListItem
									type="answer-entry"
									index={index}
									id={index}
									moveListItem={(dragIndex: number, hoverIndex: number) => {
										setQuestionEntry((prev) => {
											return {
												...prev,
												answers: moveArrayItem(prev.answers, dragIndex, hoverIndex),
											};
										});
									}}
								>
									<div className={"answer-entry"} data-is-correct={answer.isCorrect}>
										<div className="content">
											<Form.Control
												as="textarea"
												className="answer-input"
												value={answer.text}
												rows={2}
												placeholder="Antwortmöglichkeit..."
												ref={textareaRefs.current[index]}
												onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
													const value = event.target.value;
													autoResizeTextarea(event.target);
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
													onClick={(
														event: React.MouseEvent<HTMLButtonElement, MouseEvent>
													) => {
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
													onClick={(
														event: React.MouseEvent<HTMLButtonElement, MouseEvent>
													) => {
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
												<Button
													variant="danger"
													onClick={(event) => deleteAnswerAtIndex(index)}
												>
													<FontAwesomeIcon icon={faTrashCan} />
												</Button>
											</ButtonGroup>
										</div>
										<FontAwesomeIcon className="drag-icon" icon={faGripLinesVertical} />
									</div>
								</DraggableListItem>
							</div>
						);
					})}
				</DndProvider>
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
				<hr />
			</div>
		</div>
	);
}
