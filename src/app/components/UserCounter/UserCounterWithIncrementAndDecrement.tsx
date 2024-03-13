import React, { useCallback, useEffect, useState } from "react";
import styles from "./userCounterWithIncrementAndDecrement.module.scss";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

type OnUpdateCount = (count: number) => void;

export default function UserCounterWithIncrementAndDecrement({
	username,
	count: initialCount,
	onUpdateCount,
}: {
	username: string;
	count: number;
	onUpdateCount?: OnUpdateCount;
}) {
	const [count, setCount] = useState<number>(initialCount);

	useEffect(() => {
		setCount(initialCount);
	}, [initialCount]);

	const currentCounterIncrement = useCallback(() => {
		const newCount = count + 1;
		setCount(newCount);
		onUpdateCount ? onUpdateCount(newCount) : undefined;
	}, [count, onUpdateCount]);

	const currentCounterDecrement = useCallback(() => {
		const newCount = count - 1;
		setCount(newCount);
		onUpdateCount ? onUpdateCount(newCount) : undefined;
	}, [count, onUpdateCount]);

	const currentCounterReset = useCallback(() => {
		setCount(0);
		onUpdateCount ? onUpdateCount(0) : undefined;
	}, [onUpdateCount]);

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
