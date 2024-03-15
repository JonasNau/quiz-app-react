import React, { useCallback, useEffect, useState } from "react";
import styles from "./userScoreList.module.scss";
import { UserWithCount, UserWithCountList } from "@/interfaces/user-counter";

type ScoreEntry = { rank: number } & UserWithCount;
type ScoreList = ScoreEntry[];

export default function UserScoreList({
	userWithCountList,
}: {
	userWithCountList: UserWithCountList | null;
}) {
	const [scoreList, setScoreList] = useState<ScoreList | null>(null);

	const sortScoreList = useCallback((scoreList: UserWithCountList) => {
		const sortedScoreList = scoreList.sort((a, b) => {
			return b.count - a.count;
		});
		return sortedScoreList;
	}, []);

	const getScoreList = useCallback((sortedUserWithCountList: UserWithCountList) => {
		if (!sortedUserWithCountList.length) return [];
		let rank = 1;
		let lastCount = sortedUserWithCountList[0].count;
		const scoreList: ScoreList = sortedUserWithCountList.map((user) => {
			if (lastCount > user.count) rank++;
			const newUser = { ...user, rank };

			lastCount = user.count;
			return newUser;
		});
		return scoreList;
	}, []);

	useEffect(() => {
		if (userWithCountList === null) {
			setScoreList(null);
			return;
		}
		const sortedUserWithCountList = sortScoreList(userWithCountList);
		const scoreList = getScoreList(sortedUserWithCountList);
		setScoreList(scoreList);
	}, [getScoreList, sortScoreList, userWithCountList]);

	return (
		<div className={`${styles.userScoreList}`}>
			{scoreList ? (
				<>
					<table className="user-score-table">
						<thead>
							<tr>
								<th>Platzierung</th>
								<th>Benutzername</th>
								<th>Punkte</th>
							</tr>
						</thead>
						<tbody>
							{scoreList.map((user, index) => {
								return (
									<tr className="user-score-entry" key={index}>
										<td className="index">{user.rank}.</td>
										<td className="username">{user.username}</td>
										<td className="count">{user.count}</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</>
			) : (
				<>Keine Ergebnisliste verfügbar.</>
			)}
		</div>
	);
}
