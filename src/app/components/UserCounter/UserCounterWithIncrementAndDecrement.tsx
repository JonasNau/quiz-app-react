import React, { useCallback, useEffect, useState } from "react";
import styles from "./userCounterWithIncrementAndDecrement.module.scss";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

type OnUpdateCount = (count: number) => void;
type OnUpdateUsernameEvent = () => void;

export default function UserCounterWithIncrementAndDecrement({
	username: initialUsername,
	count: initialCount,
	onUpdateCount,
	onUpdateUsernameEvent,
}: {
	username: string;
	count: number;
	onUpdateCount?: OnUpdateCount;
	onUpdateUsernameEvent?: OnUpdateUsernameEvent;
}) {
	const [count, setCount] = useState<number>(initialCount);
	const [username, setUsername] = useState<string>(initialUsername);

	useEffect(() => {
		setCount(initialCount);
	}, [initialCount]);

	useEffect(() => {
		setUsername(initialUsername);
	}, [initialUsername]);

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
				<span
					className="username"
					style={{ fontWeight: "bold" }}
					onDoubleClick={onUpdateUsernameEvent}
				>
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
