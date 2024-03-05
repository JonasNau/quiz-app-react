import type { Metadata } from "next";
import "./globals.scss";
import "@/app/includes/scss/modules/backgrounds.scss";
import "@/app/includes/scss/modules/borders.scss";
//Styles
import "bootstrap/dist/css/bootstrap.min.css";

export const metadata: Metadata = {
	title: "Quiz-Anwendung",
	description: "Eine lokale Quiz-Anwendung, zum vorführen von Quizzes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="de">
			<body className="background-rainbow-animated">{children}</body>
		</html>
	);
}
