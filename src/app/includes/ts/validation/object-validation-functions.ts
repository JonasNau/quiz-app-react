export function isObjectOfType<T>(
	object: unknown,
	validationFunction: () => boolean
): object is T {
	return validationFunction() as boolean;
}
