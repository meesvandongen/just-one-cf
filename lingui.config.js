/** @type {import('@lingui/conf').LinguiConfig} */
export default {
	locales: ["en", "es", "fr", "de", "ja", "nl"],
	pseudoLocale: "pseudo",
	sourceLocale: "en",
	fallbackLocales: {
		default: "en",
	},
	catalogs: [
		{
			path: "src/locales/{locale}/messages",
			include: ["src"],
		},
	],
	format: "po",
	compileNamespace: "es",
};
