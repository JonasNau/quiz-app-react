import Joi from "joi";
import {
	GLOBAL_APPLICATION_CONFIG,
	ApplicationMode,
} from "../../../config/applicationConfig";
import ClientLogger from "../logging/ClientLoggerProvider";

export function validateObjectWithJoiType<T>(
	joiSchema: Joi.AnySchema<unknown>,
	objectToValidate: unknown
): T | null {
	const joiValidationResult = joiSchema.validate(objectToValidate);

	if (joiValidationResult.error) {
		if (GLOBAL_APPLICATION_CONFIG.MODE == ApplicationMode.DEV) {
			//Log the errors in the console
			ClientLogger.error(
				"There was an error in validating the object to validate. It does not match the specified type",
				{
					joiSchema,
					joiValidationResult,
					objectToValidate,
				}
			);
		}
		return null;
	}
	if (joiValidationResult.warning) {
		if (GLOBAL_APPLICATION_CONFIG.MODE == ApplicationMode.DEV) {
			//Log the errors in the console
			ClientLogger.error(
				"There was a warning in validation the object to validate. It does not match the specified type",
				{
					joiSchema,
					joiValidationResult,
					objectToValidate,
				}
			);
		}
		return null;
	}

	return joiValidationResult.value as T;
}
