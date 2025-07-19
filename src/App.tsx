import { Trans, useLingui } from "@lingui/react/macro";
import {
	ActionIcon,
	Box,
	Button,
	Group,
	PinInput,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { MdQrCodeScanner } from "react-icons/md";
import {
	Route,
	Routes,
	useNavigate,
	useParams,
	useSearchParams,
} from "react-router-dom";
import { z } from "zod";
import Game from "@/components/Game";
import Layout from "@/components/Layout";
import QRScanner from "@/components/QRScanner";
import { isValidRoomCode } from "@/utils";
import "@mantine/core/styles.css";

const queryParamsValidator = z.object({
	username: z.string().min(1),
	roomId: z.string().regex(/^\d{6}$/, "Room code must be 6 digits"),
});

function Home() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { roomId: paramRoomId } = useParams<{ roomId?: string }>();
	const { t } = useLingui();
	const [qrScannerOpen, setQrScannerOpen] = useState(false);
	const [username, setUsername] = useState("");
	const [roomCode, setRoomCode] = useState(paramRoomId || "");

	useEffect(() => {
		// Check if joining via QR code or direct link
		const joinCode = searchParams.get("join");
		if (joinCode && joinCode.length === 6 && /^\d{6}$/.test(joinCode)) {
			setRoomCode(joinCode);
			return;
		}

		const username = searchParams.get("username");
		const roomId = searchParams.get("roomId");

		if (username && roomId) {
			const parsed = queryParamsValidator.safeParse({ username, roomId });
			if (parsed.success) {
				navigate(
					`/game/${parsed.data.roomId}?username=${encodeURIComponent(parsed.data.username)}`,
				);
			}
		}
	}, [searchParams, navigate]);

	const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (username && roomCode && isValidRoomCode(roomCode)) {
			navigate(`/game/${roomCode}?username=${encodeURIComponent(username)}`);
		}
	};

	const handleQRScan = (scannedCode: string) => {
		setRoomCode(scannedCode);
	};

	return (
		<Layout>
			<Box
				style={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					padding: "16px",
					paddingBottom: "80px", // Space for fixed button
				}}
			>
				<Box
					style={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
					}}
				>
					<Title order={1} ta="center" mb="xl" size="2rem" c="gray.8">
						<Trans>Just One</Trans>
					</Title>

					<form
						onSubmit={handleFormSubmit}
						style={{ flex: 1, display: "flex", flexDirection: "column" }}
					>
						<Stack gap="lg" style={{ flex: 1, justifyContent: "center" }}>
							<TextInput
								label={<Trans>Your Name</Trans>}
								placeholder={t`Enter your name`}
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
								size="lg"
								styles={{
									input: {
										height: "48px",
										fontSize: "16px",
									},
								}}
							/>

							<Stack gap="xs">
								<Group justify="space-between" align="end">
									<Text fw={500} size="sm">
										<Trans>Room Code</Trans>
									</Text>
									<ActionIcon
										size="lg"
										variant="light"
										onClick={() => setQrScannerOpen(true)}
										title={t`Scan QR Code`}
										style={{
											height: "40px",
											width: "40px",
										}}
									>
										<MdQrCodeScanner size="20" />
									</ActionIcon>
								</Group>
								<PinInput
									value={roomCode}
									onChange={setRoomCode}
									length={6}
									type="number"
									size="lg"
									style={{ justifyContent: "center" }}
									error={roomCode.length > 0 && !isValidRoomCode(roomCode)}
								/>
								<Text size="xs" c="dimmed" ta="center">
									<Trans>Enter 6-digit room code or scan QR</Trans>
								</Text>
							</Stack>
						</Stack>

						<Box
							style={{
								position: "fixed",
								bottom: "16px",
								left: "16px",
								right: "16px",
								zIndex: 1000,
							}}
						>
							<Button
								type="submit"
								size="lg"
								fullWidth
								variant="filled"
								style={{ height: "56px", fontSize: "18px" }}
								disabled={!username || !isValidRoomCode(roomCode)}
							>
								<Trans>Join Game</Trans>
							</Button>
						</Box>
					</form>
				</Box>
			</Box>
			<QRScanner
				isOpen={qrScannerOpen}
				onClose={() => setQrScannerOpen(false)}
				onScan={handleQRScan}
			/>
		</Layout>
	);
}

// Game page component
function GamePage() {
	const { roomId } = useParams<{ roomId: string }>();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const username = searchParams.get("username");

	// Validate room code format
	useEffect(() => {
		if (roomId && !isValidRoomCode(roomId)) {
			navigate("/");
			return;
		}
	}, [roomId, navigate]);

	// If no username provided, redirect to home page with room code
	useEffect(() => {
		if (!username && roomId && isValidRoomCode(roomId)) {
			navigate(`/?join=${roomId}`);
		}
	}, [username, roomId, navigate]);

	if (!username || !roomId || !isValidRoomCode(roomId)) {
		return null; // Will redirect
	}

	return (
		<Layout>
			<Game username={username} roomId={roomId} />
		</Layout>
	);
}

function App() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/:roomId?" element={<Home />} />
			<Route path="/game/:roomId" element={<GamePage />} />
		</Routes>
	);
}

export default App;
