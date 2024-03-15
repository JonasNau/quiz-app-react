import React, { useEffect, useState } from "react";
import styles from "./userEditor.module.scss";
import { UserWithCountList } from "@/interfaces/user-counter";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import {
	askUserTextInput,
	showErrorMessageToUser,
} from "@/app/includes/ts/frontend/userFeedback/PopUp";

export type OnUserWithCountListUpdate = (userWithCountList: UserWithCountList) => void;
export type OnUsernameModalOpen = () => void;
export type OnUsernameModalClose = () => void;

export default function UserEditor({
	userWithCountList: initialUserWithCountList,
	onUpdateUserWithCountList,
	onUsernameModalOpen,
	onUsernameModalClose,
}: {
	userWithCountList: UserWithCountList;
	onUpdateUserWithCountList?: OnUserWithCountListUpdate;
	onUsernameModalOpen?: OnUsernameModalOpen;
	onUsernameModalClose?: OnUsernameModalClose;
}) {
	const [userWithCountList, setUserWithCountList] = useState<UserWithCountList>(
		initialUserWithCountList
	);

	useEffect(() => {
		setUserWithCountList(initialUserWithCountList);
	}, [initialUserWithCountList]);

	return (
		<div
			className={`${styles.userEditor} d-flex align-items-center justify-content-center`}
		>
			<div className="wrapper">
				{userWithCountList && userWithCountList.length
					? userWithCountList.map((userdata, index) => {
							return (
								<div key={index} className="d-flex mb-1">
									<Button
										onClick={() => {
											console.log(userWithCountList);
											const newUserWithCountList = userWithCountList.filter(
												(current, i) => {
													if (i === index) return false;
													return true;
												}
											);

											setUserWithCountList(newUserWithCountList);
											onUpdateUserWithCountList &&
												onUpdateUserWithCountList(newUserWithCountList);
										}}
										style={{
											padding: 5,
											height: "30px",
											alignSelf: "center",
											background: "none",
											border: "none",
										}}
										className="d-flex align-items-center justify-content-center me-2"
									>
										<FontAwesomeIcon
											icon={faTrashCan}
											style={{ fontSize: 20, color: "red" }}
										></FontAwesomeIcon>
									</Button>
									<Button
										variant="success"
										className="me-2"
										onClick={async () => {
											onUsernameModalOpen && onUsernameModalOpen();
											const result = await askUserTextInput({
												message: "Wie soll der Name des Benutzers sein?",
												title: "Name eingeben",
												inputValue: userdata.username,
											});
											onUsernameModalClose && onUsernameModalClose();
											if (!result.isConfirmed) return;
											const value = result.value;
											if (typeof value !== "string" || !value.trim().length) return;
											if (!userWithCountList) {
												await showErrorMessageToUser({
													message:
														"Die Benutzer konnten nicht erfolgreich mit dem Server synchronisiert werden. Versuche es bitte erneut.",
												});
												return;
											}

											let newUserWithCountList = userWithCountList.map((current, i) => {
												if (index === i) return { ...current, username: value };
												return current;
											});

											onUpdateUserWithCountList &&
												onUpdateUserWithCountList(newUserWithCountList);
											setUserWithCountList(newUserWithCountList);
										}}
									>
										<FontAwesomeIcon icon={faPencil} />
									</Button>
									<span style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
										{userdata.username}
									</span>
								</div>
							);
						})
					: null}
				<Button
					variant="success"
					className="mt-2"
					onClick={async () => {
						onUsernameModalOpen && onUsernameModalOpen();
						const result = await askUserTextInput({
							message: "Wie soll der Name des Benutzers sein?",
							title: "Name eingeben",
						});
						onUsernameModalClose && onUsernameModalClose();

						if (!result.isConfirmed) return;
						const value = result.value;
						if (typeof value !== "string" || !value.trim().length) return;
						if (!userWithCountList) {
							await showErrorMessageToUser({
								message:
									"Die Benutzer konnten nicht erfolgreich mit dem Server synchronisiert werden. Versuche es bitte erneut.",
							});
							return;
						}

						let newUserWithCountList = [
							...userWithCountList,
							{ count: 0, username: value },
						];

						onUpdateUserWithCountList && onUpdateUserWithCountList(newUserWithCountList);
						setUserWithCountList(newUserWithCountList);
					}}
				>
					Benutzer hinzufügen
					<FontAwesomeIcon icon={faPlus} style={{ marginLeft: "0.25rem" }} />
				</Button>
			</div>
		</div>
	);
}
