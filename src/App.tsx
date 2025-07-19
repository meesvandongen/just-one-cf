import { useEffect, useState } from "react";
import { Route, Routes, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import Game from "@/components/Game";
import Layout from "@/components/Layout";

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
			<div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
				<div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
					<h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
						Just One
					</h1>

					<form onSubmit={handleFormSubmit} className="space-y-6">
						<div>
							<label
								htmlFor="username"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Your Name
							</label>
							<input
								type="text"
								id="username"
								name="username"
								required
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Enter your name"
							/>
						</div>

						<div>
							<label
								htmlFor="roomId"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Room Code
							</label>
							<input
								type="text"
								id="roomId"
								name="roomId"
								required
								defaultValue={setup.roomId || ""}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
								placeholder="Enter room code"
								maxLength={8}
								style={{ textTransform: "uppercase" }}
							/>
						</div>

						<button
							type="submit"
							className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
						>
							Join Game
						</button>
					</form>
				</div>
			</div>
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
