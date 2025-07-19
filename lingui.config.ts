import type { LinguiConfig } from "@lingui/conf";

const config: LinguiConfig = {
	locales: ["en", "es", "fr", "de", "ja", "nl"],
	pseudoLocale: "pseudo",
	sourceLocale: "en",
	fallbackLocales: {
		default: "en",
	},
	catalogs: [
		{
			path: "src/locales/{locale}",
			include: ["src"],
		},
	],
};

export default config;
