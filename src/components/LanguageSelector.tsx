import { Trans } from "@lingui/react/macro";
import { Select } from "@mantine/core";
import { useLanguage } from "../contexts/LanguageContext";

export const LanguageSelector = () => {
	const { locale, setLocale, availableLocales } = useLanguage();

	const data = Object.entries(availableLocales).map(([value, label]) => ({
		value,
		label,
	}));

	return (
		<Select
			label={<Trans>Language</Trans>}
			value={locale}
			onChange={(value) => value && setLocale(value)}
			data={data}
			size="sm"
			w={120}
		/>
	);
};
