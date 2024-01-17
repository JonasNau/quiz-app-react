export function moveArrayItem<T>(array: T[], startIndex: number, endIndex: number): T[] {
	if (
		startIndex < 0 ||
		endIndex < 0 ||
		startIndex >= array.length ||
		endIndex >= array.length
	) {
		throw new Error("Invalid indices");
	}

	const result = [...array]; // Copy the original array
	const [item] = result.splice(startIndex, 1); // Remove the item from the start index
	result.splice(endIndex, 0, item); // Insert the item at the end index

	return result;
}
