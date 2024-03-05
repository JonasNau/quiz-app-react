export function fileToBase64Data(file: File): Promise<string | ArrayBuffer | null> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = reject;
	});
}

export function getReadableByteSizeString(byteSize: number) {
	var i = -1;
	var byteUnits = [" kB", " MB", " GB", " TB", "PB", "EB", "ZB", "YB"];
	do {
		byteSize /= 1024;
		i++;
	} while (byteSize > 1024);

	return Math.max(byteSize, 0.1).toFixed(1) + byteUnits[i];
}
