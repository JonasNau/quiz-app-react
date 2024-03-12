import React, { useCallback, useState } from "react";
import styles from "./userCounterWithIncrementAndDecrement.module.scss";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

export default function UserCounterWithIncrementAndDecrement({
	username,
	count: initialCount,
}: {
	username: string;
	count: number;
}) {
	const [count, setCount] = useState<number>(initialCount);

	const currentCounterIncrement = useCallback(() => {
		setCount((prev) => prev + 1);
	}, []);

	const currentCounterDecrement = useCallback(() => {
		setCount((prev) => prev - 1);
	}, []);

	const currentCounterReset = useCallback(() => {
		setCount(0);
	}, []);

	return (
		<>
			<div>
				<Button
					onClick={() => currentCounterDecrement()}
					style={{ backgroundColor: "red" }}
					className="m-1"
				>
					{" "}
					<FontAwesomeIcon icon={faMinus} style={{ fontSize: 15, color: "black" }} />
				</Button>
				<Button
					onClick={() => currentCounterIncrement()}
					style={{ backgroundColor: "green" }}
					className="m-1"
				>
					<FontAwesomeIcon icon={faPlus} style={{ fontSize: 15, color: "black" }} />
				</Button>
				<span className="username" style={{ fontWeight: "bold" }}>
					{username}
				</span>
				:{" "}
				<span className="count" onDoubleClick={() => currentCounterReset()}>
					{count}
				</span>
			</div>
		</>
	);
}
