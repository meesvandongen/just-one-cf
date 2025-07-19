import { Button, Center, Paper, Stack, TextInput, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import Game from "@/components/Game";
import Layout from "@/components/Layout";
import "@mantine/core/styles.css";

const queryParamsValidator = z.object({
	username: z.string().min(1),
	roomId: z.string().min(1),
});

interface GameSetup {
	username: string | null;
	roomId: string | null;
	showGame: boolean;
}

function Home() {
	const [setup, setSetup] = useState<GameSetup>({
		username: null,
		roomId: null,
		showGame: false,
	});

	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	useEffect(() => {
		// Check if joining via QR code or direct link
		const joinCode = searchParams.get("join");
		if (joinCode && joinCode.length === 8) {
			// Pre-fill the room ID with the join code
			setSetup((prev) => ({
				...prev,
				roomId: joinCode.toUpperCase(),
			}));
		}

		const username = searchParams.get("username");
		const roomId = searchParams.get("roomId");

		if (username && roomId) {
			const parsed = queryParamsValidator.safeParse({ username, roomId });
			if (parsed.success) {
				setSetup(() => ({
					username: parsed.data.username,
					roomId: parsed.data.roomId,
					showGame: true,
				}));
			}
		}
	}, [searchParams, setSetup]);

	const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const username = formData.get("username") as string;
		const roomId = formData.get("roomId") as string;

		if (username && roomId) {
			navigate(
				`/?username=${encodeURIComponent(username)}&roomId=${encodeURIComponent(roomId.toUpperCase())}`,
			);
		}
	};

	const handleNewGame = () => {
		setSetup({
			username: null,
			roomId: null,
			showGame: false,
		});
		navigate("/");
	};

	if (setup.showGame && setup.username && setup.roomId) {
		return (
			<Layout>
				<Game username={setup.username} roomId={setup.roomId} />
			</Layout>
		);
	}

	return (
		<Layout>
			<Center h="60vh">
				<Paper shadow="lg" p="xl" radius="md" w={400}>
					<Stack gap="xl">
						<Title order={1} ta="center" c="gray.8">
							Just One
						</Title>

						<form onSubmit={handleFormSubmit}>
							<Stack gap="md">
								<TextInput
									label="Your Name"
									placeholder="Enter your name"
									name="username"
									required
									size="md"
								/>

								<TextInput
									label="Room Code"
									placeholder="Enter room code"
									name="roomId"
									defaultValue={setup.roomId || ""}
									maxLength={8}
									tt="uppercase"
									required
									size="md"
								/>

								<Button type="submit" size="md" fullWidth variant="filled">
									Join Game
								</Button>
							</Stack>
						</form>
					</Stack>
				</Paper>
			</Center>
		</Layout>
	);
}

function App() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
		</Routes>
	);
}

export default App;
