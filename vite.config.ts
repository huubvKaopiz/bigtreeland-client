import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import path from "path";
import vitePluginImp from 'vite-plugin-imp'
import { getThemeVariables } from 'antd/dist/theme';

export default defineConfig({
	plugins: [
		react(),
		tsconfigPaths(),
		// vitePluginImp({
		// 	libList: [
		// 	  {
		// 		libName: 'antd',
		// 		style: (name) => `antd/es/${name}/style`,
		// 	  },
		// 	],
		//   }),
	],
	css: {
		preprocessorOptions: {
			less: {
				javascriptEnabled: true,
			},
			modifyVars: getThemeVariables({
				'primary-color': '#e67e22',
			}),
		},
	},
	resolve: {
		alias: [
			{ find: /^~antd/, replacement: path.resolve('./', 'node_modules/antd/') },
			// { find: /^~/, replacement: '' },
		],
	},
	build: {
		outDir: 'build'
	},
	base: '/'
});
