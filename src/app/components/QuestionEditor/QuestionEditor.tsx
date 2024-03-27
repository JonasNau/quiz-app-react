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
import { Button, ButtonGroup, Form, Image } from "react-bootstrap";
import styles from "./questionEditor.module.scss";
import { moveArrayItem } from "@/app/includes/ts/object-utils";
import { autoResizeTextarea } from "@/app/includes/ts/frontend/inputs/element-helper-functions";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableListItem from "../DragAndDrop/Draggable/DraggableListItem";
import {
	fileToBase64Data,
	getReadableByteSizeString,
} from "@/app/includes/ts/file-converter-functions";
import { showErrorMessageToUser } from "@/app/includes/ts/frontend/userFeedback/PopUp";
import { DefaultAnswerToAdd } from "./constants";

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
	const [fileSizeInByte, setFileSizeInByte] = useState<number>(0);
	const [fileSizeReadable, setFileSizeReadable] = useState<string>("");
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

	useEffect(() => {
		if (!questionEntry.image) {
			setFileSizeInByte(0);
			return;
		}
		const fileSize = new TextEncoder().encode(questionEntry.image.base64).length;
		setFileSizeInByte(fileSize);
		setFileSizeReadable(getReadableByteSizeString(fileSize));
	}, [questionEntry.image]);

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
			return { ...prev, answers: [...prev.answers, DefaultAnswerToAdd] };
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

	const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files) return;
		const file = files[0];

		try {
			const base64ImageData = await fileToBase64Data(file);
			if (base64ImageData === null) {
				throw new Error("Reading file returned null");
			}

			if (typeof base64ImageData === "string") {
				setQuestionEntry((prev) => {
					return { ...prev, image: { base64: base64ImageData } };
				});
			} else {
				const decoder = new TextDecoder();
				const str = decoder.decode(base64ImageData);
				setQuestionEntry((prev) => {
					return { ...prev, image: { base64: str } };
				});
			}
		} catch (error) {
			showErrorMessageToUser({
				message: "Der Dateiupload ist fehlgeschlagen. Versuche es erneut.",
			});
		}
	};

	return (
		<div className={styles.questionEditor}>
			<div className="question">
				<h3 style={{ textAlign: "start" }}>Fragetext</h3>

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
				<h3 style={{ textAlign: "start" }} className="mt-2">
					Bild
				</h3>
				{questionEntry.image ? (
					<>
						<div>Gespeicherte Größe: {fileSizeReadable}</div>
						<Button
							variant="danger"
							className="img-delete mb-2"
							onClick={(event) =>
								setQuestionEntry((prev) => {
									return { ...prev, image: undefined };
								})
							}
						>
							Bild entfernen <FontAwesomeIcon icon={faTrashCan} />
						</Button>
						<div className="image-wrapper">
							<Image
								className={`image image-box-shadow `}
								src={questionEntry.image.base64}
								alt="Bild für die Fragestellung"
							/>
						</div>
					</>
				) : (
					<>
						<Form.Group controlId="formFile" className="mb-3">
							<Form.Control type="file" onChange={onFileChange} />
						</Form.Group>
					</>
				)}
			</div>
			<h3 style={{ textAlign: "start" }} className="mt-2">
				Antwortmöglichkeiten
			</h3>
			<div className="answer-list">
				<DndProvider backend={HTML5Backend}>
					{questionEntry.answers.map((answer, index) => {
						return (
							<div key={index}>
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
									<div
										className={"answer-entry"}
										data-is-correct={answer.isCorrect}
										data-answer-text={answer.text}
									>
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
															title="Antwortmöglichkeit Korrektheit umschalten"
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
															title="Antwortmöglichkeit Korrektheit umschalten"
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
													title="Antwort nach oben schieben"
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
													title="Antwort nach unten schieben"
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
													title="Antwort löschen"
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
			</div>
		</div>
	);
}
