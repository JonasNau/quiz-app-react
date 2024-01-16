import { QuizData } from "@/interfaces/joi";
import React from "react";
import QuestionBuilder from "./QuestionBuilder/QuestionBuilder";
import { Button, ButtonGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faArrowDown,
	faArrowUp,
	faPlus,
	faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./quizBuilder.module.scss";

export default function QuizBuilder({ quizJSON }: { quizJSON: QuizData }) {
	const getNumberQuestions = () => quizJSON.length;

	const isFirstQuestion = (questionNumber: number) => questionNumber === 0;
	const isLastQuestion = (questionNumber: number) =>
		questionNumber === getNumberQuestions() - 1;

	return (
		<div className={styles.quizBuilder}>
			{quizJSON.map((questionEntry, index) => {
				return (
					<div key={index} className="question-entry">
						<QuestionBuilder questionEntry={questionEntry} />
						<ButtonGroup>
							<Button variant="primary" disabled={isFirstQuestion(index)}>
								<FontAwesomeIcon icon={faArrowUp} />
							</Button>
							<Button variant="primary" disabled={isLastQuestion(index)}>
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
				<Button variant="success" className="add-question">
					Frage hinzufügen
					<FontAwesomeIcon icon={faPlus} style={{ marginLeft: "0.25rem" }} />
				</Button>
			</section>
		</div>
	);
}
