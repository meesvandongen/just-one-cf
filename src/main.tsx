import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { MantineProvider } from "@mantine/core";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { LanguageProvider } from "./contexts/LanguageContext";
import { defaultLocale, dynamicActivate } from "./i18n";

// Initialize i18n with default locale
dynamicActivate(defaultLocale);

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<I18nProvider i18n={i18n}>
			<LanguageProvider>
				<MantineProvider>
					<BrowserRouter>
						<App />
					</BrowserRouter>
				</MantineProvider>
			</LanguageProvider>
		</I18nProvider>
	</React.StrictMode>,
);
