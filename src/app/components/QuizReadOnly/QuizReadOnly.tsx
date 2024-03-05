import React from "react";

import styles from "./quizReadOnly.module.scss";
import { QuestionEntry } from "@/interfaces/joi/QuizSchemas";
import Answer from "../Answer/Answer";
import { Image } from "react-bootstrap";

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

			{questionEntry.image && (
				<div className="image-wrapper">
					<Image
						className={`image image-box-shadow`}
						src={questionEntry.image.base64}
						alt="Bild für die Fragestellung"
					/>
				</div>
			)}

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
