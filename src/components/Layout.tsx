import { AppShell, Container } from "@mantine/core";

interface LayoutProps {
	children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
	return (
		<AppShell bg="gray.3" h="100vh" padding="md">
			<AppShell.Main>
				<Container size="xl">{children}</Container>
			</AppShell.Main>
		</AppShell>
	);
};

export default Layout;
