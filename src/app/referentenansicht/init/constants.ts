import { QuizPackage, QuizPackageList } from "@/interfaces/joi";

export const QuizPackageList_LocalStorage_Name = "quiz-json-list";
const templateQuizPackage = {
	name: "Name",
	description: "",
	quizData: [
		{
			question: "Frage?",
			answers: [
				{
					text: "Antwort 1",
					isCorrect: true,
				},
				{
					text: "Antwort 2",
					isCorrect: false,
				},
			],
		},
	],
} satisfies QuizPackage;

export const templateQuizPackageList = [templateQuizPackage] satisfies QuizPackageList;
