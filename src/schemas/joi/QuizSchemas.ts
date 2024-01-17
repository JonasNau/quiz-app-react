import Joi from "joi";

export const AnswerEntrySchema = Joi.object({
	text: Joi.string().required().allow(""),
	isCorrect: Joi.boolean().required(),
}).meta({ className: "AnswerEntry" });

export const QuestionEntrySchema = Joi.object({
	question: Joi.string().required().allow(""),
	answers: Joi.array().items(AnswerEntrySchema).required(),
}).meta({ className: "QuestionEntry" });

export const QuizDataSchema = Joi.array()
	.items(QuestionEntrySchema)
	.meta({ className: "QuizData" });
