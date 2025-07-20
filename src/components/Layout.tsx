import { ActionIcon, AppShell, Box, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MdMenu } from "react-icons/md";
import { LanguageSelector } from "./LanguageSelector";
import { SidebarMenu } from "./SidebarMenu";

interface LayoutProps {
	children: React.ReactNode;
	showSidebar?: boolean;
	onLeaveGame?: () => void;
	roomCode?: string;
	qrCodeValue?: string;
}

const Layout = ({
	children,
	showSidebar = false,
	onLeaveGame,
	roomCode,
	qrCodeValue,
}: LayoutProps) => {
	const [opened, { toggle, close }] = useDisclosure(false);

	return (
		<AppShell
			bg="gray.1"
			h="100vh"
			padding={0}
			navbar={
				showSidebar
					? {
							width: 300,
							breakpoint: "sm",
							collapsed: { mobile: !opened, desktop: !opened },
						}
					: undefined
			}
		>
			<AppShell.Header h={60} p="sm">
				<Group h="100%" px="md" justify="space-between">
					{showSidebar && (
						<ActionIcon
							onClick={toggle}
							variant="subtle"
							size="lg"
							aria-label="Open menu"
						>
							<MdMenu size={20} />
						</ActionIcon>
					)}
					<Box style={{ marginLeft: showSidebar ? undefined : "auto" }}>
						<LanguageSelector />
					</Box>
				</Group>
			</AppShell.Header>

			{showSidebar && opened && (
				<AppShell.Navbar p="md">
					<SidebarMenu
						onLeaveGame={onLeaveGame}
						roomCode={roomCode}
						qrCodeValue={qrCodeValue}
						onClose={close}
					/>
				</AppShell.Navbar>
			)}

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
