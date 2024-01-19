"use client";
import { Container } from "react-bootstrap";
import "./page.scss";
import Link from "next/link";

export default function Home() {
	return (
		<>
			<Container
				style={{
					backgroundColor: "white",
					marginTop: "1rem",
					borderRadius: "20px",
					padding: "1rem",
				}}
			>
				<h1 className="text-center">Quiz-Anwendung</h1>
				<p>
					Dies ist eine Quiz-Anwendung bestehend aus zwei Teilen. Eine Referentenansicht
					und eine Beamer-Ansicht.
				</p>
				<h2>Referentenansicht</h2>
				<p>
					Die Referentansicht ist für den Vortragenden. Dieser muss eine JSON-Datei
					eingeben, um das Quiz zu initialisieren. Anschließend wird der Referent auf die
					Kontrollübersicht weitergeleitet.
				</p>
				<Link href="./referentenansicht/init">Quiz initialisieren</Link>
				<br />
				<Link href="./referentenansicht/control">Kontrollansicht</Link>
				<h2>Beameransicht</h2>
				<p>
					Die Beameransicht ist die Ansicht, für die Zuhörer des Referenten. Diese muss in
					einem speraten Browserfenster geöffnet werden.
				</p>
				<Link href="./beamer-ansicht">Beameransicht</Link>
			</Container>
		</>
	);
}
