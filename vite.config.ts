/// <reference types="vitest" />
import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react({
			plugins: [["@lingui/swc-plugin", {}]],
		}),
		cloudflare(),
	],
	resolve: {
		alias: {
			"@": path.resolve(import.meta.dirname, "./src"),
		},
	},
	server: {
		port: 3000,
	},
});
