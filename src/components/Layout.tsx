import { ActionIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useRef } from "react";
import { MdMenu } from "react-icons/md";
import { LanguageSelector } from "./LanguageSelector";
import styles from "./Layout.module.css";
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
	const sidebarRef = useRef<HTMLDivElement>(null);
	const overlayRef = useRef<HTMLDivElement>(null);

	// Close sidebar when clicking outside or pressing escape
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				opened &&
				sidebarRef.current &&
				!sidebarRef.current.contains(event.target as Node)
			) {
				close();
			}
		};

		const handleEscapeKey = (event: KeyboardEvent) => {
			if (event.key === "Escape" && opened) {
				close();
			}
		};

		if (opened) {
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("keydown", handleEscapeKey);
			document.body.style.overflow = "hidden"; // Prevent background scrolling
		} else {
			document.body.style.overflow = "";
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscapeKey);
			document.body.style.overflow = "";
		};
	}, [opened, close]);

	return (
		<div
			className={`${styles.layout} ${showSidebar ? styles.layoutWithSidebar : ""}`}
		>
			{/* Header */}
			<header className={styles.header}>
				<div className={styles.headerLeft}>
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
				</div>
				<div className={styles.headerRight}>
					<LanguageSelector />
				</div>
			</header>

			{/* Desktop Sidebar */}
			{showSidebar && (
				<aside
					className={`${styles.sidebarDesktop} ${opened ? styles.show : ""}`}
				>
					<SidebarMenu
						onLeaveGame={onLeaveGame}
						roomCode={roomCode}
						qrCodeValue={qrCodeValue}
						onClose={close}
					/>
				</aside>
			)}

			{/* Mobile Sidebar Overlay */}
			{showSidebar && (
				<>
					<div
						ref={overlayRef}
						className={`${styles.sidebarOverlay} ${opened ? styles.open : ""}`}
						onClick={close}
						aria-hidden="true"
					/>
					<aside
						ref={sidebarRef}
						className={`${styles.sidebar} ${opened ? styles.open : ""}`}
						aria-hidden={!opened}
					>
						<SidebarMenu
							onLeaveGame={onLeaveGame}
							roomCode={roomCode}
							qrCodeValue={qrCodeValue}
							onClose={close}
						/>
					</aside>
				</>
			)}

			{/* Main Content */}
			<main className={styles.main}>
				<div className={styles.mainContent}>{children}</div>
			</main>
		</div>
	);
};

export default Layout;
