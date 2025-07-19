import React, {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { defaultLocale, loadCatalog, locales } from "../i18n";

interface LanguageContextType {
	locale: string;
	setLocale: (locale: string) => void;
	availableLocales: typeof locales;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
	undefined,
);

interface LanguageProviderProps {
	children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
	children,
}) => {
	const [locale, setLocale] = useState(() => {
		// Try to get the locale from localStorage first
		const savedLocale = localStorage.getItem("just-one-locale");
		if (savedLocale && Object.keys(locales).includes(savedLocale)) {
			return savedLocale;
		}

		// Fallback to browser language or default
		const browserLang = navigator.language.split("-")[0];
		return Object.keys(locales).includes(browserLang)
			? browserLang
			: defaultLocale;
	});

	useEffect(() => {
		loadCatalog(locale);
		localStorage.setItem("just-one-locale", locale);
	}, [locale]);

	const handleSetLocale = (newLocale: string) => {
		if (Object.keys(locales).includes(newLocale)) {
			setLocale(newLocale);
		}
	};

	return (
		<LanguageContext.Provider
			value={{
				locale,
				setLocale: handleSetLocale,
				availableLocales: locales,
			}}
		>
			{children}
		</LanguageContext.Provider>
	);
};

export const useLanguage = () => {
	const context = useContext(LanguageContext);
	if (context === undefined) {
		throw new Error("useLanguage must be used within a LanguageProvider");
	}
	return context;
};
