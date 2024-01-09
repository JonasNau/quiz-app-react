import React from "react";

import styles from "./quizReadOnly.module.scss";
import { QuestionEntry } from "@/interfaces/joi/QuizSchemas";
import Answer from "../Answer/Answer";

export default function QuizReadOnly({
	questionEntry,
	showSolutions,
}: {
	questionEntry: QuestionEntry;
	showSolutions: boolean;
}) {
	return (
		<div className={styles.quizReadOnly}>
			<h2 className="text-center">Frage</h2>
			<div className="text-center question">{questionEntry.question}</div>
			<section className="answersList">
				{questionEntry.answers.map((anwser) => {
					if (showSolutions) {
						return (
							<Answer text={anwser.text} isCorrect={anwser.isCorrect} key={anwser.text} />
						);
					}
					return <Answer text={anwser.text} key={anwser.text} />;
				})}
			</section>
		</div>
	);
}
