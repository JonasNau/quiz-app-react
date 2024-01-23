import React, { useCallback, useEffect, useState } from "react";
import { moveArrayItem } from "@/app/includes/ts/object-utils";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { QuizData, QuizPackage, QuizPackageList } from "@/interfaces/joi";
import withReactContent from "sweetalert2-react-content";

import styles from "./quizPackageListEditor.module.scss";
import { Button, ButtonGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faArrowDown,
	faArrowUp,
	faCrosshairs,
	faFileExport,
	faFileImport,
	faGripLinesVertical,
	faPencil,
	faPlus,
	faTrashCan,
	faX,
} from "@fortawesome/free-solid-svg-icons";
import DraggableListItem from "../DragAndDrop/Draggable/DraggableListItem";
import QuizPackageEditor, {
	OnQuizPackageUpdate,
} from "../QuizPackageEditor/QuizPackageEditor";
import Swal from "sweetalert2";
import JSONCodeEditor from "../JSONCodeEditor/JSONCodeEditor";
import { validateObjectWithJoiType } from "@/app/includes/ts/frontend/validation/SchemaValidation";
import { QuizDataSchema, QuizPackageSchema } from "@/schemas/joi/QuizSchemas";
import { showErrorMessageToUser } from "@/app/includes/ts/frontend/userFeedback/PopUp";

export type OnQuizDataListUpdate = (quizPackageList: QuizPackageList) => void;
export type OnQuizPackageSelect = (quizPackage: QuizPackage) => void;

export default function QuizPackageListEditor({
	quizPackageList: quizPackageListJSON,
	onQuizPackageListUpdate,
	onQuizPackageSelect,
}: {
	quizPackageList: QuizPackageList;
	onQuizPackageListUpdate: OnQuizDataListUpdate;
	onQuizPackageSelect: OnQuizPackageSelect;
}) {
	const [quizPackageList, setQuizPackageList] =
		useState<QuizPackageList>(quizPackageListJSON);

	useEffect(() => {
		setQuizPackageList(quizPackageListJSON);
	}, [quizPackageListJSON]);

	useEffect(() => {
		onQuizPackageListUpdate(quizPackageList);
	}, [onQuizPackageListUpdate, quizPackageList]);

	const getNumberQuizPackages = () => quizPackageList.length;

	const isFirstQuizPackage = (number: number) => number === 0;
	const isLastQuizPackage = (number: number) => number === getNumberQuizPackages() - 1;
	const [editorIsOpen, setEditorIsOpen] = useState<boolean>(false);
	const [selectedQuizPackageNumber, setSelectedQuizPackageNumber] = useState<
		number | null
	>(null);

	const editQuiz = (quizNumber: number) => {
		setSelectedQuizPackageNumber(quizNumber);
		setEditorIsOpen(true);
	};

	const addNewEmptyQuizPackageToBottom = () => {
		setQuizPackageList((prev) => {
			return [
				...prev,
				{ name: "Quizname", description: "Beschreibung", quizData: [] },
			] satisfies QuizPackageList;
		});
	};

	const editorShouldBeOpenOnIndex = (index: number) =>
		selectedQuizPackageNumber !== null &&
		editorIsOpen &&
		selectedQuizPackageNumber === index;

	const deleteQuizPackageAtIndex = (index: number) => {
		setQuizPackageList((prev) => {
			return prev.filter((item, i) => i !== index);
		});
	};

	const onQuizPackageUpdate = useCallback(
		(quizPackage: QuizPackage) => {
			if (selectedQuizPackageNumber === null) return;
			setQuizPackageList((prev) => {
				return prev.map((item, index) => {
					if (index === selectedQuizPackageNumber) return quizPackage;
					return item;
				});
			});
		},
		[selectedQuizPackageNumber]
	) satisfies OnQuizPackageUpdate;

	const importQuizViaJSON = useCallback(async () => {
		let importString = "";
		const setImportString = (string: string) => (importString = string);
		const result = await withReactContent(Swal).fire({
			title: <i>Gebe den JSON-Code des Quizzes hier ein:</i>,
			html: (
				<>
					<JSONCodeEditor code="" onCodeUpdate={setImportString} />
				</>
			),
			showConfirmButton: true,
			showCancelButton: true,
		});

		if (result.isConfirmed) {
			try {
				const quizPackageJSON = JSON.parse(importString);
				const quizPackage = validateObjectWithJoiType<QuizPackage>(
					QuizPackageSchema,
					quizPackageJSON
				);
				if (!quizPackage) {
					await showErrorMessageToUser({
						message: "Das Format der Quiz-Package-JSON ist nicht valide.",
					});
					return;
				}
				setQuizPackageList((prev) => {
					return [...prev, quizPackage] satisfies QuizPackageList;
				});
			} catch (error) {
				await showErrorMessageToUser({
					message: "Das Format der JSON ist nicht valide.",
				});
				return;
			}
		}
	}, []);

	const showQuizPackageJSONString = useCallback(async (quizPackage: QuizPackage) => {
		const result = await withReactContent(Swal).fire({
			title: <i>Hier ist der JSON-Code des Quizzes:</i>,
			html: (
				<>
					<JSONCodeEditor
						code={JSON.stringify(quizPackage, null, 2)}
						onCodeUpdate={() => {}}
					/>
				</>
			),
			showConfirmButton: true,
			showCancelButton: true,
		});
	}, []);

	return (
		<div className={styles.quizPackageListEditor}>
			<DndProvider backend={HTML5Backend}>
				{quizPackageList.map((quizEntry, index) => {
					return (
						<div key={index}>
							<DraggableListItem
								type="quizPackage-entry"
								index={index}
								id={index}
								moveListItem={(dragIndex: number, hoverIndex: number) => {
									setQuizPackageList((prev) => {
										return moveArrayItem(prev, dragIndex, hoverIndex);
									});
								}}
							>
								<div className="border-bottom-provider">
									<div className="quizPackageList-entry">
										<div className="content d-flex align-items-center justify-content-center">
											<div className="quiz-name">{quizEntry.name}</div>
											<ButtonGroup>
												{editorShouldBeOpenOnIndex(index) ? (
													<>
														<Button
															variant="primary"
															onClick={(event) => {
																setEditorIsOpen(false);
																setSelectedQuizPackageNumber(null);
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
																editQuiz(index);
															}}
														>
															<FontAwesomeIcon icon={faPencil} />
														</Button>
													</>
												)}
												<Button
													variant="info"
													onClick={(event) => {
														showQuizPackageJSONString(quizEntry);
													}}
												>
													<FontAwesomeIcon icon={faFileExport} />
												</Button>
												<Button
													variant="primary"
													onClick={(event) => {
														onQuizPackageSelect(quizEntry);
													}}
												>
													<FontAwesomeIcon icon={faCrosshairs} />
												</Button>

												<Button
													variant="primary"
													disabled={isFirstQuizPackage(index)}
													onClick={(event) => {
														if (isFirstQuizPackage(index)) return;
														setQuizPackageList((prev) => {
															return moveArrayItem(prev, index, index - 1);
														});
													}}
												>
													<FontAwesomeIcon icon={faArrowUp} />
												</Button>
												<Button
													variant="primary"
													disabled={isLastQuizPackage(index)}
													onClick={(event) => {
														if (isLastQuizPackage(index)) return;
														setQuizPackageList((prev) => {
															return moveArrayItem(prev, index, index + 1);
														});
													}}
												>
													<FontAwesomeIcon icon={faArrowDown} />
												</Button>
												<Button
													variant="danger"
													onClick={(event) => deleteQuizPackageAtIndex(index)}
												>
													<FontAwesomeIcon icon={faTrashCan} />
												</Button>
											</ButtonGroup>
										</div>
										<FontAwesomeIcon className="drag-icon" icon={faGripLinesVertical} />
									</div>
								</div>
							</DraggableListItem>
							{editorShouldBeOpenOnIndex(index) && (
								<>
									<h3 className="text-center">Bearbeiten</h3>
									<div className="question-editor-wrapper">
										<QuizPackageEditor
											onQuizPackageUpdate={onQuizPackageUpdate}
											quizJSON={quizEntry}
										/>
									</div>
								</>
							)}
						</div>
					);
				})}
			</DndProvider>
			<hr />
			<section className="d-flex flex-row justify-content-center align-items-center">
				<Button
					variant="success"
					className="add-quiz"
					style={{ marginRight: "1rem" }}
					onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
						addNewEmptyQuizPackageToBottom();
					}}
				>
					Quiz hinzufügen
					<FontAwesomeIcon icon={faPlus} style={{ marginLeft: "0.25rem" }} />
				</Button>
				<Button
					variant="success"
					className="add-quiz"
					onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
						importQuizViaJSON();
					}}
				>
					Quiz importieren
					<FontAwesomeIcon icon={faFileImport} style={{ marginLeft: "0.25rem" }} />
				</Button>
			</section>
		</div>
	);
}
