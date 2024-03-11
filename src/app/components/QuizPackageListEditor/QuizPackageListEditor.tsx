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
export type OnQuizPackageEdit = (quizPackageIndex: number) => void;

export default function QuizPackageListEditor({
	quizPackageList: quizPackageListJSON,
	onQuizPackageListUpdate,
	onQuizPackageSelect,
	onQuizPackageEdit,
}: {
	quizPackageList: QuizPackageList;
	onQuizPackageListUpdate: OnQuizDataListUpdate;
	onQuizPackageSelect: OnQuizPackageSelect;
	onQuizPackageEdit: OnQuizPackageEdit;
}) {
	const [quizPackageList, setQuizPackageList] =
		useState<QuizPackageList>(quizPackageListJSON);
	const [updateActive, setUpdateActive] = useState(false);

	useEffect(() => {
		setQuizPackageList(quizPackageListJSON);
	}, [quizPackageListJSON]);

	useEffect(() => {
		if (!updateActive) return;
		setUpdateActive(false);
		onQuizPackageListUpdate(quizPackageList);
	}, [onQuizPackageListUpdate, quizPackageList, updateActive]);

	const getNumberQuizPackages = () => quizPackageList.length;

	const isFirstQuizPackage = (number: number) => number === 0;
	const isLastQuizPackage = (number: number) => number === getNumberQuizPackages() - 1;

	const editQuiz = (index: number) => {
		onQuizPackageEdit(index);
	};

	const addNewEmptyQuizPackageToBottom = () => {
		setQuizPackageList((prev) => {
			return [
				...prev,
				{ name: "Quizname", description: "", quizData: [] },
			] satisfies QuizPackageList;
		});
		setUpdateActive(true);
	};

	const deleteQuizPackageAtIndex = (index: number) => {
		setQuizPackageList((prev) => {
			return prev.filter((item, i) => i !== index);
		});
		setUpdateActive(true);
	};

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
			grow: "fullscreen",
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
				setUpdateActive(true);
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
			grow: "fullscreen",
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
									setUpdateActive(true);
								}}
							>
								<div className="border-bottom-provider">
									<div className="quizPackageList-entry">
										<div
											className="content d-flex align-items-center justify-content-center"
											title={quizEntry.name}
										>
											<div className="quiz-name">{quizEntry.name}</div>
											<ButtonGroup>
												<Button
													variant="success"
													title="Quiz bearbeiten"
													onClick={(
														event: React.MouseEvent<HTMLButtonElement, MouseEvent>
													) => {
														editQuiz(index);
													}}
												>
													<FontAwesomeIcon icon={faPencil} />
												</Button>
												<Button
													variant="info"
													title="Quiz exportieren"
													onClick={(event) => {
														showQuizPackageJSONString(quizEntry);
													}}
												>
													<FontAwesomeIcon icon={faFileExport} />
												</Button>
												<Button
													variant="primary"
													title="Quiz verwenden und hochladen"
													onClick={(event) => {
														onQuizPackageSelect(quizEntry);
													}}
												>
													<FontAwesomeIcon icon={faCrosshairs} />
												</Button>

												<Button
													variant="primary"
													title="Quiz nach oben verschieben"
													disabled={isFirstQuizPackage(index)}
													onClick={(event) => {
														if (isFirstQuizPackage(index)) return;
														setQuizPackageList((prev) => {
															return moveArrayItem(prev, index, index - 1);
														});
														setUpdateActive(true);
													}}
												>
													<FontAwesomeIcon icon={faArrowUp} />
												</Button>
												<Button
													variant="primary"
													title="Quiz nach unten verschieben"
													disabled={isLastQuizPackage(index)}
													onClick={(event) => {
														if (isLastQuizPackage(index)) return;
														setQuizPackageList((prev) => {
															return moveArrayItem(prev, index, index + 1);
														});
														setUpdateActive(true);
													}}
												>
													<FontAwesomeIcon icon={faArrowDown} />
												</Button>
												<Button
													variant="danger"
													title="Quiz löschen"
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
						</div>
					);
				})}
			</DndProvider>
			{getNumberQuizPackages() > 0 && (
				<>
					<hr />
				</>
			)}
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
