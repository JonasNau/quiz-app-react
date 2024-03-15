import React, { useEffect, useRef, useState } from "react";
import styles from "./quizReadOnly.module.scss";
import { QuestionEntry } from "@/interfaces/joi/QuizSchemas";
import Answer from "../Answer/Answer";
import { Image } from "react-bootstrap";
import { Resizable } from "re-resizable";

export default function QuizReadOnly({
	questionEntry,
	showSolutions,
}: {
	questionEntry: QuestionEntry;
	showSolutions: boolean;
}) {
	const [resizableWidth, setResizableWidth] = useState("100%");

	const handleResetSize = () => {
		setResizableWidth("100%");
	};

	return (
		<div className={styles.quizReadOnly}>
			<h2 className="text-center">Frage</h2>
			<div className="text-center question">{questionEntry.question}</div>

			{questionEntry.image && (
				<div className="image-wrapper" onDoubleClick={() => handleResetSize()}>
					<Resizable
						size={{ width: resizableWidth, height: "auto" }}
						onResizeStop={(e, direction, ref, d) => {
							setResizableWidth(ref.style.width);
						}}
						maxWidth={"100%"}
						resizeRatio={1}
						lockAspectRatio={true}
					>
						<Image
							className={`image image-box-shadow`}
							src={questionEntry.image.base64}
							alt="Bild für die Fragestellung"
						/>
					</Resizable>
				</div>
			)}

			<section className="answersList">
				{questionEntry.answers.map((answer) => {
					if (showSolutions) {
						return (
							<Answer text={answer.text} isCorrect={answer.isCorrect} key={answer.text} />
						);
					}
					return <Answer text={answer.text} key={answer.text} />;
				})}
			</section>
		</div>
	);
}
