import Joi from "joi";

export const AnswerEntrySchema = Joi.object({
	text: Joi.string().required().allow(""),
	isCorrect: Joi.boolean().required(),
}).meta({ className: "AnswerEntry" });

export const QuestionEntryImageSchema = Joi.object({
	base64: Joi.string().required(),
}).meta({ className: "QuestionEntryImage" });

export const QuestionEntrySchema = Joi.object({
	question: Joi.string().required().allow(""),
	image: QuestionEntryImageSchema.optional(),
	answers: Joi.array().items(AnswerEntrySchema).required(),
}).meta({ className: "QuestionEntry" });

export const QuizDataSchema = Joi.array()
	.items(QuestionEntrySchema)
	.meta({ className: "QuizData" });

export const QuizPackageSchema = Joi.object({
	name: Joi.string().required().allow(""),
	description: Joi.string().required().allow(""),
	quizData: QuizDataSchema.required(),
}).meta({ className: "QuizPackage" });

export const QuizPackageListSchema = Joi.array()
	.items(QuizPackageSchema)
	.meta({ className: "QuizPackageList" });
