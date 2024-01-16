import { QuestionEntry } from "@/interfaces/joi";
import {
	faArrowDown,
	faArrowUp,
	faCheck,
	faPlus,
	faTrashCan,
	faX,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Button, ButtonGroup, Form } from "react-bootstrap";
import styles from "./questionBuilder.module.scss";

export default function QuestionBuilder({
	questionEntry,
}: {
	questionEntry: QuestionEntry;
}) {
	const getNumberAnswers = () => questionEntry.answers.length;

	const isFirstAnswer = (answerNumber: number) => answerNumber === 0;
	const isLastAnswer = (answerNumber: number) => answerNumber === getNumberAnswers() - 1;
	return (
		<div className={styles.questionBuilder}>
			{questionEntry.answers.map((answer, index) => {
				return (
					<div key={index} className={"answer-entry"} data-is-correct={answer.isCorrect}>
						<Form.Control as="textarea" value={answer.text} rows={3} />
						<ButtonGroup className="d-flex flex-row mt-2">
							{answer.isCorrect ? (
								<>
									<Button className="set-correct" data-is-correct={true}>
										<FontAwesomeIcon icon={faCheck} />
									</Button>
								</>
							) : (
								<>
									<Button className="set-correct" data-is-correct={false}>
										<FontAwesomeIcon icon={faX} />
									</Button>
								</>
							)}

							<Button variant="primary" disabled={isFirstAnswer(index)}>
								<FontAwesomeIcon icon={faArrowUp} />
							</Button>
							<Button variant="primary" disabled={isLastAnswer(index)}>
								<FontAwesomeIcon icon={faArrowDown} />
							</Button>
							<Button variant="danger">
								<FontAwesomeIcon icon={faTrashCan} />
							</Button>
						</ButtonGroup>
					</div>
				);
			})}
			<section className="d-flex flex-column align-items-center">
				<Button variant="success" className="add-answer">
					Antwort hinzufügen
					<FontAwesomeIcon icon={faPlus} style={{ marginLeft: "0.25rem" }} />
				</Button>
			</section>
		</div>
	);
}
