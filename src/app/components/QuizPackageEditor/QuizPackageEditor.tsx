import { QuestionEntry, QuizPackage } from "@/interfaces/joi";
import React, { SyntheticEvent, useCallback, useEffect, useState } from "react";
import QuestionEditor from "../QuestionEditor/QuestionEditor";
import { Button, ButtonGroup, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faArrowDown,
	faArrowUp,
	faGripLinesVertical,
	faPencil,
	faPlus,
	faTrashCan,
	faX,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./quizPackageEditor.module.scss";
import { moveArrayItem } from "@/app/includes/ts/object-utils";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableListItem from "../DragAndDrop/Draggable/DraggableListItem";
import { autoResizeTextarea } from "@/app/includes/ts/frontend/inputs/element-helper-functions";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

export type OnQuizPackageUpdate = (quizPackage: QuizPackage) => void;
export type OnQuestionEdit = (questionIndex: number) => void;

export default function QuizPackageEditor({
	quizJSON: quizPackageJSON,
	onQuizPackageUpdate,
	onQuestionEdit,
}: {
	quizJSON: QuizPackage;
	onQuizPackageUpdate: OnQuizPackageUpdate;
	onQuestionEdit: OnQuestionEdit;
}) {
	const [quizPackage, setQuizPackage] = useState<QuizPackage>(quizPackageJSON);

	useEffect(() => {
		//Replace the quizJSON on rerender if the quizJSON object changed
		setQuizPackage(quizPackageJSON);
	}, [quizPackageJSON]);

	useEffect(() => {
		onQuizPackageUpdate(quizPackage);
	}, [onQuizPackageUpdate, quizPackage]);

	const getNumberQuestions = () => quizPackage.quizData.length;

	const isFirstQuestion = (questionNumber: number) => questionNumber === 0;
	const isLastQuestion = (questionNumber: number) =>
		questionNumber === getNumberQuestions() - 1;

	const editQuestion = (index: number) => {
		onQuestionEdit(index);
	};

	const addNewEmptyQuestionEntryToBottom = () => {
		setQuizPackage((prev) => {
			return {
				...prev,
				quizData: [...prev.quizData, { question: "Frage?", answers: [] }],
			};
		});
	};

	const deleteQuestionEntryAtIndex = (index: number) => {
		setQuizPackage((prev) => {
			return { ...prev, quizData: prev.quizData.filter((item, i) => i !== index) };
		});
	};

	return (
		<div className={styles.quizPackageEditor}>
			<h3 style={{ textAlign: "start" }}>Name des Quiz</h3>
			<Form.Control
				as="textarea"
				value={quizPackage.name}
				className="name"
				placeholder="Quizname..."
				onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
					const value = event.target.value;
					autoResizeTextarea(event.target);
					setQuizPackage((prev) => {
						return { ...prev, name: value };
					});
				}}
			/>
			<h3 style={{ textAlign: "start" }} className="mt-2">
				Beschreibung des Quiz
			</h3>
			<Form.Control
				as="textarea"
				value={quizPackage.description}
				className="description"
				placeholder="Beschreibung..."
				onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
					const value = event.target.value;
					autoResizeTextarea(event.target);
					setQuizPackage((prev) => {
						return { ...prev, description: value };
					});
				}}
			/>
			<h2 className="mt-2">Fragen, die im Quiz enthalten sind</h2>
			<div className="overview">
				<DndProvider backend={HTML5Backend}>
					{quizPackage.quizData.map((questionEntry, index) => {
						return (
							<div key={index}>
								<DraggableListItem
									type="question-entry"
									index={index}
									id={index}
									moveListItem={(dragIndex: number, hoverIndex: number) => {
										setQuizPackage((prev) => {
											return {
												...prev,
												quizData: moveArrayItem(prev.quizData, dragIndex, hoverIndex),
											};
										});
									}}
								>
									<div className="border-bottom-provider">
										<div className="question-entry">
											<div
												className="content d-flex align-items-center justify-content-center"
												title={`${questionEntry.question}`}
											>
												<div className="index">{index + 1}</div>
												<div className="question">{questionEntry.question}</div>
												<ButtonGroup>
													<Button
														variant="success"
														title="Frage Bearbeiten"
														onClick={(
															event: React.MouseEvent<HTMLButtonElement, MouseEvent>
														) => {
															editQuestion(index);
														}}
													>
														<FontAwesomeIcon icon={faPencil} />
													</Button>

													<Button
														variant="primary"
														title="Nach vorne schieben"
														disabled={isFirstQuestion(index)}
														onClick={(event) => {
															if (isFirstQuestion(index)) return;
															setQuizPackage((prev) => {
																return {
																	...prev,
																	quizData: moveArrayItem(
																		prev.quizData,
																		index,
																		index - 1
																	),
																};
															});
														}}
													>
														<FontAwesomeIcon icon={faArrowUp} />
													</Button>
													<Button
														variant="primary"
														title="Nach hinten schieben"
														disabled={isLastQuestion(index)}
														onClick={(event) => {
															if (isLastQuestion(index)) return;
															setQuizPackage((prev) => {
																return {
																	...prev,
																	quizData: moveArrayItem(
																		prev.quizData,
																		index,
																		index + 1
																	),
																};
															});
														}}
													>
														<FontAwesomeIcon icon={faArrowDown} />
													</Button>
													<Button
														variant="danger"
														title="Frage Löschen"
														onClick={(event) => deleteQuestionEntryAtIndex(index)}
													>
														<FontAwesomeIcon icon={faTrashCan} />
													</Button>
												</ButtonGroup>
											</div>
											<FontAwesomeIcon className="drag-icon" icon={faGripLinesVertical} />
										</div>
									</div>
								</DraggableListItem>
							</div>
						);
					})}
				</DndProvider>
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
