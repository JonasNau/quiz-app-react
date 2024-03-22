import { QuizPackage } from "@/interfaces/joi";

export const AddQuizPackageDefault = {
	name: "Quizname",
	description: "",
	quizData: [],
} satisfies QuizPackage;
