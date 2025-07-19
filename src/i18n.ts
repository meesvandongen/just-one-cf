import { i18n } from "@lingui/core";

export const locales = {
	en: "English",
	es: "Español",
	fr: "Français",
	de: "Deutsch",
	ja: "日本語",
	nl: "Nederlands",
};
export const defaultLocale = "en";

/**
 * We do a dynamic import of just the catalog that we need
 * @param locale any locale string
 */
export async function loadCatalog(locale: string) {
	const { messages } = await import(`./locales/${locale}.po`);
	i18n.loadAndActivate({ locale, messages });
}
