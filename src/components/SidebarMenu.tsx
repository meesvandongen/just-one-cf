import { Trans } from "@lingui/react/macro";
import {
	Button,
	Divider,
	Modal,
	Paper,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MdLogout, MdQrCode, MdCode } from "react-icons/md";
import QRCode from "react-qr-code";

interface SidebarMenuProps {
	onLeaveGame?: () => void;
	roomCode?: string;
	qrCodeValue?: string;
	onClose: () => void;
}

export const SidebarMenu = ({ onLeaveGame, roomCode, qrCodeValue, onClose }: SidebarMenuProps) => {
	const [qrModalOpened, { open: openQrModal, close: closeQrModal }] = useDisclosure(false);
	const [roomCodeModalOpened, { open: openRoomCodeModal, close: closeRoomCodeModal }] = useDisclosure(false);

	const handleLeaveGame = () => {
		onClose();
		onLeaveGame?.();
	};

	const handleShowQrCode = () => {
		onClose();
		openQrModal();
	};

	const handleShowRoomCode = () => {
		onClose();
		openRoomCodeModal();
	};

	return (
		<>
			<Stack gap="md">
				<Title order={3}>
					<Trans>Game Menu</Trans>
				</Title>

				<Divider />

				{roomCode && (
					<Button
						variant="light"
						leftSection={<MdCode size={16} />}
						onClick={handleShowRoomCode}
						fullWidth
						justify="flex-start"
					>
						<Trans>Show Room Code</Trans>
					</Button>
				)}

				{qrCodeValue && (
					<Button
						variant="light"
						leftSection={<MdQrCode size={16} />}
						onClick={handleShowQrCode}
						fullWidth
						justify="flex-start"
					>
						<Trans>Show QR Code</Trans>
					</Button>
				)}

				<Divider />

				{onLeaveGame && (
					<Button
						variant="light"
						color="red"
						leftSection={<MdLogout size={16} />}
						onClick={handleLeaveGame}
						fullWidth
						justify="flex-start"
					>
						<Trans>Leave Game</Trans>
					</Button>
				)}
			</Stack>

			{/* QR Code Modal */}
			<Modal
				opened={qrModalOpened}
				onClose={closeQrModal}
				title={<Trans>QR Code</Trans>}
				centered
			>
				<Stack align="center" gap="md">
					{qrCodeValue && (
						<QRCode
							value={qrCodeValue}
							size={200}
						/>
					)}
					<Text size="sm" c="dimmed" ta="center">
						<Trans>Scan to join quickly</Trans>
					</Text>
				</Stack>
			</Modal>

			{/* Room Code Modal */}
			<Modal
				opened={roomCodeModalOpened}
				onClose={closeRoomCodeModal}
				title={<Trans>Room Code</Trans>}
				centered
			>
				<Stack align="center" gap="md">
					{roomCode && (
						<Paper
							bg="dark"
							c="white"
							p="xl"
							radius="md"
							ff="monospace"
							fz="2rem"
							ta="center"
						>
							{roomCode}
						</Paper>
					)}
					<Text size="sm" c="dimmed" ta="center">
						<Trans>Share this code with other players</Trans>
					</Text>
				</Stack>
			</Modal>
		</>
	);
};