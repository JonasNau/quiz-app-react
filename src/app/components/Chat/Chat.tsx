"use client";
import React, {
	ChangeEvent,
	SyntheticEvent,
	useCallback,
	useEffect,
	useState,
} from "react";
import { io, Socket } from "socket.io-client";

export default function Chat() {
	const [socketIOClient, setSocketIOClient] = useState<Socket | null>(null);
	const [textMessage, setTextMessage] = useState<string>("");
	const [chat, setChat] = useState<string[]>([]);

	useEffect(() => {
		const socketIOClient = io({});
		setSocketIOClient(socketIOClient);

		socketIOClient.on("receive-message", (message: string) => {
			console.log(message);
			setChat((prevState) => [...prevState, message]);
		});

		return () => {
			socketIOClient.close();
		};
	}, []);

	const sendChatMessage = useCallback(
		(message: string) => {
			if (!socketIOClient) {
				console.error("There is no socket io client initialized.");
				return;
			}
			socketIOClient.emit("new-message", message);
		},
		[socketIOClient]
	);

	const handleSubmit = (event: SyntheticEvent) => {
		sendChatMessage(textMessage);
		setTextMessage("");
	};

	return (
		<>
			<ul>
				{chat.map((chatItem) => {
					return <li key={chatItem}>{chatItem}</li>;
				})}
			</ul>

			<input
				type="text"
				value={textMessage}
				onChange={(event: ChangeEvent<HTMLInputElement>) =>
					setTextMessage(event.target.value)
				}
			/>

			<button onClick={handleSubmit}>Senden</button>
		</>
	);
}
