#!/usr/bin/env node

import { readFileSync } from "fs";
import { join } from "path";

/**
 * Check for untranslated strings in locale files
 * Exits with code 1 if there are untranslated strings, 0 if all translations are complete
 */

// Hardcode the config values since importing TS from JS is complex
const sourceLocale = "en";
const locales = ["es", "fr", "de", "ja", "nl"]; // All locales except source

let hasUntranslatedStrings = false;

console.log("Checking for untranslated strings...\n");

for (const locale of locales) {
	const localeFile = join(process.cwd(), "src", "locales", `${locale}.po`);

	try {
		const content = readFileSync(localeFile, "utf-8");

		// Count fuzzy translations (marked with #, fuzzy)
		const fuzzyMatches = content.match(/#,\s*fuzzy/g);
		const fuzzyCount = fuzzyMatches ? fuzzyMatches.length : 0;

		// Count empty translations - look for msgstr "" that are not followed by another msgstr ""
		const emptyTranslations = content.match(/msgstr\s+""\s*$/gm);
		const emptyCount = emptyTranslations ? emptyTranslations.length : 0;

		const totalUntranslated = fuzzyCount + emptyCount;

		if (totalUntranslated > 0) {
			console.log(
				`❌ ${locale}: ${totalUntranslated} untranslated strings (${fuzzyCount} fuzzy, ${emptyCount} empty)`,
			);
			hasUntranslatedStrings = true;
		} else {
			console.log(`✅ ${locale}: All strings translated`);
		}
	} catch (error) {
		console.error(`❌ Error reading locale file for ${locale}:`, error.message);
		hasUntranslatedStrings = true;
	}
}

if (hasUntranslatedStrings) {
	console.log(
		'\n⚠️  There are untranslated strings. Please run "npm run extract" and update the translations.',
	);
	process.exit(1);
} else {
	console.log("\n✅ All translations are complete!");
	process.exit(0);
}
