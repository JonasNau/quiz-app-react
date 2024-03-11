export enum ESocketEventNames {
	NEW_CONNECTIION = "connection",
	INIT_QUIZ = "init_quiz",
	JOIN_ROOM = "join_room",
	LEAVE_ROOM = "leave_room",
	ERROR = "error",
	SUCCESS = "success",
	GET_QUIZ_DATA = "get_quiz_data",
	SEND_QUIZ_DATA = "send_quiz_data",
	SEND_COUNTER_VALUE = "send_counter_value",
	GET_COUNTER_VALUE = "get_counter_value",
	SEND_QUESTION_NUMBER = "send_question_number",
	GET_QUESTION_NUMBER = "get_question_number",
	SEND_SHOW_SOLUTIONS = "send_show_answers",
}

export enum ERoomNames {
	REFERENT = "referent",
	REFERENT_CONTROL = "referent_control",
	BEAMER = "beamer",
}
