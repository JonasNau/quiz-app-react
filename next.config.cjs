import { join } from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
	sassOptions: {
		includePaths: [join(__dirname, "styles")],
	},
};

export default nextConfig;
