import React from "react";

import styles from "./answer.module.scss";

export default function Answer({
	text,
	isCorrect,
}: {
	text: string;
	isCorrect?: boolean;
}) {
	return (
		<div
			className={`${styles.answer} ${
				isCorrect !== undefined && (isCorrect ? styles.correct : styles.wrong)
			}`}
		>
			{text}
		</div>
	);
}
