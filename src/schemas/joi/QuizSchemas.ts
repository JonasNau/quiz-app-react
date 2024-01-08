import Joi from "joi";

export const AnswerEntrySchema = Joi.object({
	text: Joi.string().required(),
	isCorrect: Joi.boolean().required(),
}).meta({ className: "AnswerEntry" });

export const QuestionEntrySchema = Joi.object({
	question: Joi.string().required(),
	answers: Joi.array().items(AnswerEntrySchema),
}).meta({ className: "QuestionEntry" });

export const QuizDataSchema = Joi.array()
	.items(QuestionEntrySchema)
	.meta({ className: "QuizData" });
