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
			value={locale}
			onChange={(value) => value && setLocale(value)}
			data={data}
			size="sm"
			w={120}
		/>
	);
};
