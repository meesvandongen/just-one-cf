import { Trans, useLingui } from "@lingui/react/macro";

import {
	ActionIcon,
	Box,
	Button,
	Center,
	Group,
	PinInput,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";

import { useEffect, useState } from "react";
import { MdAdd, MdQrCodeScanner } from "react-icons/md";
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

import {
	clearSavedRoomCode,
	clearSavedUsername,
	getSavedRoomCode,
	getSavedUsername,
	isValidRoomCode,
	saveRoomCode,
	saveUsername,
} from "@/utils";

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
	const [roomCode, setRoomCode] = useState("");

	useEffect(() => {
		// Check if joining via QR code or direct link
		const joinCode = searchParams.get("join");
		if (joinCode && joinCode.length === 6 && /^\d{6}$/.test(joinCode)) {
			// Save room code and redirect to name selection
			saveRoomCode(joinCode);
			navigate("/select-name");
			return;
		}

		// Check if there's a saved room code but no username
		const savedRoom = getSavedRoomCode();
		const savedUsername = getSavedUsername();

		if (savedRoom && savedUsername) {
			// Both room and username available, go to game
			navigate(
				`/game/${savedRoom}?username=${encodeURIComponent(savedUsername)}`,
			);
			return;
		} else if (savedRoom) {
			// Room saved but no username, go to name selection
			navigate("/select-name");
			return;
		}

		// Handle legacy URL params for backward compatibility
		const username = searchParams.get("username");
		const roomId = searchParams.get("roomId");

		if (username && roomId) {
			const parsed = queryParamsValidator.safeParse({ username, roomId });
			if (parsed.success) {
				saveRoomCode(parsed.data.roomId);
				saveUsername(parsed.data.username);
				navigate(
					`/game/${parsed.data.roomId}?username=${encodeURIComponent(parsed.data.username)}`,
				);
			}
		}
	}, [searchParams, navigate]);

	const handleJoinRoom = () => {
		if (isValidRoomCode(roomCode)) {
			saveRoomCode(roomCode);
			navigate("/select-name");
		}
	};

	const handleQRScan = (scannedCode: string) => {
		if (isValidRoomCode(scannedCode)) {
			saveRoomCode(scannedCode);
			navigate("/select-name");
		}
	};

	const handleStartNewSession = () => {
		// Generate a random 6-digit room code for new sessions
		const newRoomCode = Math.floor(100000 + Math.random() * 900000).toString();
		saveRoomCode(newRoomCode);
		navigate("/select-name");
	};

	return (
		<Layout>
			<Box
				style={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					padding: "16px",
				}}
			>
				<Title order={1} ta="center" mb="xl" size="2rem" c="gray.8">
					<Trans>Just One</Trans>
				</Title>

				<Stack gap="xl" style={{ flex: 1 }}>
					{/* QR Scanner Section - Prominent at top */}
					<Stack gap="md">
						<Text size="lg" fw={600} ta="center">
							<Trans>Join an Existing Game</Trans>
						</Text>

						<Center>
							<Button
								onClick={() => setQrScannerOpen(true)}
								size="xl"
								variant="filled"
								color="blue"
								style={{
									height: "120px",
									width: "100%",
									maxWidth: "400px",
									fontSize: "18px",
								}}
								leftSection={<MdQrCodeScanner size="40" />}
							>
								<Stack gap="xs" align="center">
									<Text size="xl" fw={600}>
										<Trans>Scan QR Code</Trans>
									</Text>
									<Text size="sm" opacity={0.8}>
										<Trans>Camera</Trans>
									</Text>
								</Stack>
							</Button>
						</Center>
					</Stack>

					{/* PIN Input Section - Similarly sized below camera */}
					<Stack gap="md">
						<Text size="md" fw={500} ta="center" c="dimmed">
							<Trans>Or enter room code manually</Trans>
						</Text>

						<Center>
							<Stack
								gap="md"
								align="center"
								style={{ width: "100%", maxWidth: "400px" }}
							>
								<PinInput
									value={roomCode}
									onChange={setRoomCode}
									length={6}
									type="number"
									size="xl"
									style={{ justifyContent: "center" }}
									error={roomCode.length > 0 && !isValidRoomCode(roomCode)}
								/>
								<Button
									onClick={handleJoinRoom}
									size="lg"
									variant="outline"
									style={{ width: "100%", height: "56px" }}
									disabled={!isValidRoomCode(roomCode)}
								>
									<Trans>Join Room</Trans>
								</Button>
							</Stack>
						</Center>
					</Stack>

					{/* Spacer */}
					<Box style={{ flex: 1 }} />

					{/* Start New Session - At bottom */}
					<Stack gap="md">
						<Text size="md" fw={500} ta="center" c="dimmed">
							<Trans>Or start a new game</Trans>
						</Text>

						<Center>
							<Button
								onClick={handleStartNewSession}
								size="lg"
								variant="light"
								color="green"
								style={{ width: "100%", maxWidth: "400px", height: "56px" }}
								leftSection={<MdAdd size="20" />}
							>
								<Trans>Start New Session</Trans>
							</Button>
						</Center>
					</Stack>
				</Stack>
			</Box>

			<QRScanner
				isOpen={qrScannerOpen}
				onClose={() => setQrScannerOpen(false)}
				onScan={handleQRScan}
			/>
		</Layout>
	);
}

//  Name Selection page component
function NameSelection() {
	const navigate = useNavigate();
	const { t } = useLingui();
	const [username, setUsername] = useState("");

	useEffect(() => {
		const savedRoom = getSavedRoomCode();
		if (!savedRoom) {
			// No room saved, redirect to home
			navigate("/");
			return;
		}

		// Load previously saved username if available
		const savedUsername = getSavedUsername();
		if (savedUsername) {
			setUsername(savedUsername);
		}
	}, [navigate]);

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const savedRoom = getSavedRoomCode();
		if (username.trim() && savedRoom) {
			saveUsername(username.trim());
			navigate(
				`/game/${savedRoom}?username=${encodeURIComponent(username.trim())}`,
			);
		}
	};

	const handleBack = () => {
		clearSavedRoomCode();
		navigate("/");
	};

	const savedRoom = getSavedRoomCode();

	if (!savedRoom) {
		return null; // Will redirect
	}

	return (
		<Layout>
			<Box
				style={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					padding: "16px",
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
					<Title order={1} ta="center" mb="md" size="2rem" c="gray.8">
						<Trans>Choose Your Name</Trans>
					</Title>

					<Text size="lg" ta="center" c="dimmed" mb="xl">
						<Trans>Room Code: {savedRoom}</Trans>
					</Text>

					<form onSubmit={handleSubmit}>
						<Stack gap="xl" align="center">
							<TextInput
								label={<Trans>Your Name</Trans>}
								placeholder={t`Enter your name`}
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
								size="xl"
								style={{ width: "100%", maxWidth: "400px" }}
								styles={{
									input: {
										height: "56px",
										fontSize: "18px",
										textAlign: "center",
									},
								}}
								autoFocus
							/>

							<Stack gap="md" style={{ width: "100%", maxWidth: "400px" }}>
								<Button
									type="submit"
									size="xl"
									variant="filled"
									style={{ height: "56px", fontSize: "18px" }}
									disabled={!username.trim()}
								>
									<Trans>Join Game</Trans>
								</Button>

								<Button
									onClick={handleBack}
									size="lg"
									variant="light"
									color="gray"
								>
									<Trans>Back to Home</Trans>
								</Button>
							</Stack>
						</Stack>
					</form>
				</Box>
			</Box>
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

	// If no username provided, redirect to name selection
	useEffect(() => {
		if (!username && roomId && isValidRoomCode(roomId)) {
			saveRoomCode(roomId);
			navigate("/select-name");
		}
	}, [username, roomId, navigate]);

	// Clean up local storage when successfully in game
	useEffect(() => {
		if (username && roomId && isValidRoomCode(roomId)) {
			// Keep the username saved for future games, but clear room code
			// since we're now actively in this game
			clearSavedRoomCode();
			if (username) {
				saveUsername(username);
			}
		}
	}, [username, roomId]);

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
			<Route path="/select-name" element={<NameSelection />} />
			<Route path="/:roomId?" element={<Home />} />
			<Route path="/game/:roomId" element={<GamePage />} />
		</Routes>
	);
}

export default App;
