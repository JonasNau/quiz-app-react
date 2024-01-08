import { convertFromDirectory } from "joi-to-typescript";
import fs from "fs-extra";

const schemaDirectory = "./src/schemas/joi";
const typeOutputDirectory = "./src/interfaces/joi";

// Function to clear a directory
const clearDirectory = (directoryPath: string) => {
	if (fs.existsSync(directoryPath)) {
		fs.removeSync(directoryPath); // Use fs.removeSync to remove a directory
	}
};

// Clear the interface directory before conversion
clearDirectory(typeOutputDirectory);

// Convert from directory with clean interface folder
convertFromDirectory({
	schemaDirectory,
	typeOutputDirectory,
	debug: true,
	indexAllToRoot: true,
	defaultInterfaceSuffix: "Interface",
});
