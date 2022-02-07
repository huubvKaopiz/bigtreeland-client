import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
	plugins: [
		react(),
		tsconfigPaths(),
	],
	css: {
		preprocessorOptions: {
			less: {
				javascriptEnabled: true,
			},
		},
	},
	resolve: {
		alias: [{ find: /^~antd/, replacement: path.resolve('./', 'node_modules/antd/') },],
	},
	build: {
		outDir: 'build'
	},
	base: '/'
});
