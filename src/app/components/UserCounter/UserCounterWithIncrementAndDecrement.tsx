import React from "react";
import styles from "./userCounterWithIncrementAndDecrement.module.scss";

export default function UserCounterWithIncrementAndDecrement({
	username,
	count,
}: {
	username: string;
	count: number;
}) {
	return (
		<>
			<div>
				{username}: {count}
			</div>
		</>
	);
}
