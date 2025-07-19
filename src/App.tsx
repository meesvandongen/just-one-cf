import { Trans, useLingui } from "@lingui/react/macro";
import { Box, Button, Stack, TextInput, Title } from "@mantine/core";
import { useEffect } from "react";
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
import "@mantine/core/styles.css";

const queryParamsValidator = z.object({
	username: z.string().min(1),
	roomId: z.string().min(1),
});

function Home() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { t } = useLingui();

	useEffect(() => {
		// Check if joining via QR code or direct link
		const joinCode = searchParams.get("join");
		if (joinCode && joinCode.length === 8) {
			// Redirect to join page with pre-filled room code
			navigate(`/join/${joinCode.toUpperCase()}`);
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
		const formData = new FormData(event.currentTarget);
		const username = formData.get("username") as string;
		const roomId = formData.get("roomId") as string;

		if (username && roomId) {
			navigate(
				`/game/${roomId.toUpperCase()}?username=${encodeURIComponent(username)}`,
			);
		}
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
								name="username"
								required
								size="lg"
								styles={{
									input: {
										height: "48px",
										fontSize: "16px",
									},
								}}
							/>

							<TextInput
								label={<Trans>Room Code</Trans>}
								placeholder={t`Enter room code`}
								name="roomId"
								maxLength={8}
								tt="uppercase"
								required
								size="lg"
								styles={{
									input: {
										height: "48px",
										fontSize: "16px",
									},
								}}
							/>
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
							>
								Join Game
							</Button>
						</Box>
					</form>
				</Box>
			</Box>
		</Layout>
	);
}

// Join Game page component
function JoinGame() {
	const navigate = useNavigate();
	const { roomId: paramRoomId } = useParams<{ roomId?: string }>();
	const { t } = useLingui();

	const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const username = formData.get("username") as string;
		const roomId = formData.get("roomId") as string;

		if (username && roomId) {
			navigate(
				`/game/${roomId.toUpperCase()}?username=${encodeURIComponent(username)}`,
			);
		}
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
						<Trans>Join Game</Trans>
					</Title>

					<form
						onSubmit={handleFormSubmit}
						style={{ flex: 1, display: "flex", flexDirection: "column" }}
					>
						<Stack gap="lg" style={{ flex: 1, justifyContent: "center" }}>
							<TextInput
								label={<Trans>Your Name</Trans>}
								placeholder={t`Enter your name`}
								name="username"
								required
								size="lg"
								styles={{
									input: {
										height: "48px",
										fontSize: "16px",
									},
								}}
							/>

							<TextInput
								label={<Trans>Room Code</Trans>}
								placeholder={t`Enter room code`}
								name="roomId"
								defaultValue={paramRoomId || ""}
								maxLength={8}
								tt="uppercase"
								required
								size="lg"
								styles={{
									input: {
										height: "48px",
										fontSize: "16px",
									},
								}}
							/>
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
							>
								<Trans>Join Game</Trans>
							</Button>
						</Box>
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

	// If no username provided, redirect to join page
	useEffect(() => {
		if (!username && roomId) {
			navigate(`/join/${roomId}`);
		}
	}, [username, roomId, navigate]);

	if (!username || !roomId) {
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
			<Route path="/join/:roomId?" element={<JoinGame />} />
			<Route path="/game/:roomId" element={<GamePage />} />
		</Routes>
	);
}

export default App;
