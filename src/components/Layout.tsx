import { AppShell, Box } from "@mantine/core";

interface LayoutProps {
	children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
	return (
		<AppShell bg="gray.1" h="100vh" padding={0}>
			<AppShell.Main>
				<Box
					h="100vh"
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
