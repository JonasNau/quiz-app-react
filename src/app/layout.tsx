import type { Metadata } from "next";
import "./globals.scss";

//Styles
import "bootstrap/dist/css/bootstrap.min.css";

export const metadata: Metadata = {
	title: "Quiz-Anwendung",
	description: "Eine lokale Quiz-Anwendung, zum vorführen von Quizzes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="de">
			<body>{children}</body>
		</html>
	);
}
