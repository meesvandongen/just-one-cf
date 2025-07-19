import { AppShell, Box, Group } from "@mantine/core";
import { LanguageSelector } from "./LanguageSelector";

interface LayoutProps {
	children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
	return (
		<AppShell bg="gray.1" h="100vh" padding={0}>
			<AppShell.Header h={60} p="sm">
				<Group h="100%" px="md" justify="flex-end">
					<LanguageSelector />
				</Group>
			</AppShell.Header>
			<AppShell.Main>
				<Box
					h="calc(100vh - 60px)"
					style={{
						display: "flex",
						flexDirection: "column",
						overflow: "hidden",
					}}
				>
					{children}
				</Box>
			</AppShell.Main>
		</AppShell>
	);
};

export default Layout;
