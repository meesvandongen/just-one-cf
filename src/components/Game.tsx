import {
	Badge,
	Button,
	Card,
	Center,
	Container,
	Grid,
	Group,
	Loader,
	Paper,
	ScrollArea,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { useState } from "react";
import QRCode from "react-qr-code";
import { useGameRoom } from "@/hooks/useGameRoom";

interface GameProps {
	username: string;
	roomId: string;
}

const Game = ({ username, roomId }: GameProps) => {
	const { gameState, dispatch } = useGameRoom(username, roomId);

	// Local state for UI interactions
	const [clueInput, setClueInput] = useState("");
	const [guessInput, setGuessInput] = useState("");
	const [selectedInvalidClues, setSelectedInvalidClues] = useState<string[]>(
		[],
	);
	const [gameCodeInput, setGameCodeInput] = useState("");
	const [playerNameInput, setPlayerNameInput] = useState("");
	const [showJoinForm, setShowJoinForm] = useState(false);

	// Indicated that the game is loading
	if (gameState === null) {
		return (
			<Center h="60vh">
				<Stack align="center" gap="lg">
					<Text size="4rem">🎯</Text>
					<Loader size="lg" />
					<Text size="xl">Connecting to game server...</Text>
				</Stack>
			</Center>
		);
	}

	const currentUser = gameState.users.find((user) => user.id === username);
	const isHost = currentUser?.isHost || false;
	const isCurrentGuesser = gameState.currentGuesser === username;
	const isCurrentChecker = gameState.currentChecker === username;

	// Handle joining a session
	const handleJoinSession = (e: React.FormEvent) => {
		e.preventDefault();
		if (gameCodeInput.length === 8 && playerNameInput.trim()) {
			dispatch({
				type: "join-session",
				gameCode: gameCodeInput.toUpperCase(),
				playerName: playerNameInput.trim(),
			});
			setShowJoinForm(false);
		}
	};

	// Handle clue submission
	const handleSubmitClue = (e: React.FormEvent) => {
		e.preventDefault();
		if (
			clueInput.trim() &&
			gameState.gamePhase === "writing-clues" &&
			!isCurrentGuesser
		) {
			dispatch({
				type: "submit-clue",
				clue: clueInput.trim(),
			});
			setClueInput("");
		}
	};

	// Handle guess submission
	const handleSubmitGuess = (e: React.FormEvent) => {
		e.preventDefault();
		if (
			guessInput.trim() &&
			gameState.gamePhase === "guessing" &&
			isCurrentGuesser
		) {
			dispatch({
				type: "submit-guess",
				guess: guessInput.trim(),
			});
			setGuessInput("");
		}
	};

	// Handle duplicate checking
	const handleMarkInvalidClues = () => {
		if (gameState.gamePhase === "checking-duplicates" && isCurrentChecker) {
			dispatch({
				type: "mark-invalid-clues",
				invalidClues: selectedInvalidClues,
			});
			setSelectedInvalidClues([]);
		}
	};

	// Toggle clue selection for duplicate checking
	const toggleClueSelection = (clue: string) => {
		setSelectedInvalidClues((prev) =>
			prev.includes(clue) ? prev.filter((c) => c !== clue) : [...prev, clue],
		);
	};

	// Render different phases
	const renderGameContent = () => {
		switch (gameState.gamePhase) {
			case "lobby":
				return renderLobby();
			case "writing-clues":
				return renderWritingClues();
			case "checking-duplicates":
				return renderCheckingDuplicates();
			case "reviewing-clues":
				return renderReviewingClues();
			case "guessing":
				return renderGuessing();
			case "round-end":
				return renderRoundEnd();
			case "set-end":
				return renderSetEnd();
			default:
				return <div>Unknown game phase</div>;
		}
	};

	const renderLobby = () => (
		<Container size="lg">
			<Stack gap="xl">
				<Center>
					<Stack align="center" gap="lg">
						<Title order={1} size="3rem">
							🎯 Just One
						</Title>
						<Text size="lg" c="dimmed">
							Cooperative word guessing game
						</Text>

						{!currentUser && (
							<Button
								onClick={() => setShowJoinForm(true)}
								size="lg"
								variant="filled"
							>
								Join Game
							</Button>
						)}

						{showJoinForm && (
							<Paper shadow="sm" p="lg" radius="md" w={400}>
								<form onSubmit={handleJoinSession}>
									<Stack gap="md">
										<Title order={3}>Join Game</Title>
										<TextInput
											placeholder="Enter your name"
											value={playerNameInput}
											onChange={(e) => setPlayerNameInput(e.target.value)}
											required
										/>
										<TextInput
											placeholder="Game Code (8 letters)"
											value={gameCodeInput}
											onChange={(e) =>
												setGameCodeInput(e.target.value.toUpperCase())
											}
											maxLength={8}
											tt="uppercase"
											required
										/>
										<Group>
											<Button type="submit" color="green">
												Join
											</Button>
											<Button
												type="button"
												variant="light"
												onClick={() => setShowJoinForm(false)}
											>
												Cancel
											</Button>
										</Group>
									</Stack>
								</form>
							</Paper>
						)}
					</Stack>
				</Center>

				{currentUser && (
					<>
						<Grid>
							<Grid.Col span={{ base: 12, md: 6 }}>
								<Center>
									<Stack align="center" gap="md">
										<Title order={2}>Game Code</Title>
										<Paper
											bg="dark"
											c="white"
											p="lg"
											radius="md"
											ff="monospace"
											fz="2rem"
										>
											{gameState.gameCode}
										</Paper>
										<Text size="sm" c="dimmed">
											Share this code with other players
										</Text>
									</Stack>
								</Center>
							</Grid.Col>

							<Grid.Col span={{ base: 12, md: 6 }}>
								<Center>
									<Stack align="center" gap="md">
										<Title order={2}>QR Code</Title>
										<QRCode
											value={`${window.location.origin}?join=${gameState.gameCode}`}
											size={150}
										/>
										<Text size="sm" c="dimmed">
											Scan to join quickly
										</Text>
									</Stack>
								</Center>
							</Grid.Col>
						</Grid>

						<Stack gap="md">
							<Title order={2}>Players ({gameState.users.length})</Title>
							<SimpleGrid cols={{ base: 2, md: 3, lg: 4 }} spacing="sm">
								{gameState.users.map((user) => (
									<Card
										key={user.id}
										padding="md"
										radius="md"
										withBorder
										bg={user.isHost ? "yellow.1" : "gray.1"}
									>
										<Text fw={600}>{user.name}</Text>
										{user.isHost && (
											<Badge color="yellow" size="sm" mt="xs">
												👑 Host
											</Badge>
										)}
									</Card>
								))}
							</SimpleGrid>
						</Stack>

						{isHost && gameState.users.length >= 3 && (
							<Center>
								<Button
									onClick={() => dispatch({ type: "start-set" })}
									size="xl"
									color="green"
								>
									Start Game
								</Button>
							</Center>
						)}

						{gameState.users.length < 3 && (
							<Center>
								<Text c="dimmed">
									Need at least 3 players to start the game
								</Text>
							</Center>
						)}
					</>
				)}
			</Stack>
		</Container>
	);

	const renderWritingClues = () => (
		<Container size="lg">
			<Stack gap="xl">
				<Center>
					<Stack align="center" gap="md">
						<Title order={1}>✏️ Writing Clues</Title>
						<Text size="lg">
							Score: {gameState.setScore}/{gameState.gamesAttempted} | Target:{" "}
							{gameState.setTarget}
						</Text>
					</Stack>
				</Center>

				{isCurrentGuesser ? (
					<Paper bg="blue.1" p="xl" radius="md">
						<Stack align="center" gap="lg">
							<Title order={2}>You are the guesser!</Title>
							<Text size="lg">Wait while others write clues for you...</Text>
							<Text size="4rem">🤔</Text>
						</Stack>
					</Paper>
				) : (
					<Paper bg="green.1" p="xl" radius="md">
						<Stack gap="lg">
							<Stack align="center" gap="md">
								<Title order={2}>The word is:</Title>
								<Text size="3rem" fw={700}>
									{gameState.currentWord}
								</Text>
								<Text size="lg">
									Write ONE word clue for{" "}
									{
										gameState.users.find(
											(u) => u.id === gameState.currentGuesser,
										)?.name
									}
								</Text>
							</Stack>

							{!gameState.submittedClues[username] ? (
								<Center>
									<form onSubmit={handleSubmitClue}>
										<Group>
											<TextInput
												value={clueInput}
												onChange={(e) => setClueInput(e.target.value)}
												placeholder="Enter one word clue"
												size="lg"
												w={250}
												maxLength={30}
												required
											/>
											<Button type="submit" size="lg" color="blue">
												Submit Clue
											</Button>
										</Group>
									</form>
								</Center>
							) : (
								<Center>
									<Text size="lg" c="green.7">
										✓ Clue submitted! Waiting for others...
									</Text>
								</Center>
							)}
						</Stack>
					</Paper>
				)}

				<Center>
					<Stack align="center" gap="xs">
						<Title order={3}>Progress</Title>
						<Text size="sm">
							{Object.keys(gameState.submittedClues).length} of{" "}
							{gameState.users.length - 1} clues submitted
						</Text>
					</Stack>
				</Center>

				{isHost && (
					<Center>
						<Button
							onClick={() => dispatch({ type: "pass-word" })}
							color="yellow"
							variant="light"
						>
							Skip Word
						</Button>
					</Center>
				)}
			</Stack>
		</Container>
	);

	const renderCheckingDuplicates = () => (
		<Container size="lg">
			<Stack gap="xl">
				<Center>
					<Title order={1}>🔍 Checking Duplicates</Title>
				</Center>

				{isCurrentChecker ? (
					<Paper bg="orange.1" p="xl" radius="md">
						<Stack gap="lg">
							<Stack align="center" gap="md">
								<Title order={2}>You are checking for duplicates!</Title>
								<Text size="lg">Mark any clues that should be removed:</Text>
							</Stack>

							<SimpleGrid cols={{ base: 2, md: 3 }} spacing="sm">
								{gameState.validClues.map((clue, index) => (
									<Button
										key={index}
										onClick={() => toggleClueSelection(clue)}
										variant={
											selectedInvalidClues.includes(clue) ? "filled" : "outline"
										}
										color={selectedInvalidClues.includes(clue) ? "red" : "gray"}
										size="lg"
										h="auto"
										p="1rem"
									>
										{clue}
									</Button>
								))}
							</SimpleGrid>

							<Center>
								<Button
									onClick={handleMarkInvalidClues}
									color="green"
									size="lg"
								>
									Finish Checking ({selectedInvalidClues.length} marked invalid)
								</Button>
							</Center>
						</Stack>
					</Paper>
				) : (
					<Paper bg="gray.1" p="xl" radius="md">
						<Stack align="center" gap="lg">
							<Title order={2}>Duplicate Check in Progress</Title>
							<Text size="lg">
								{
									gameState.users.find((u) => u.id === gameState.currentChecker)
										?.name
								}{" "}
								is checking for duplicates...
							</Text>
							<Text size="3rem">⏳</Text>
						</Stack>
					</Paper>
				)}
			</Stack>
		</Container>
	);

	const renderReviewingClues = () => (
		<Container size="lg">
			<Center h="60vh">
				<Stack align="center" gap="lg">
					<Title order={1}>📋 Clues Ready</Title>
					<Text size="lg">Preparing clues for the guesser...</Text>
					<Text size="3rem">✨</Text>
				</Stack>
			</Center>
		</Container>
	);

	const renderGuessing = () => (
		<Container size="lg">
			<Stack gap="xl">
				<Center>
					<Stack align="center" gap="md">
						<Title order={1}>🎯 Guessing Time</Title>
						<Text size="lg">
							Score: {gameState.setScore}/{gameState.gamesAttempted} | Target:{" "}
							{gameState.setTarget}
						</Text>
					</Stack>
				</Center>

				{isCurrentGuesser ? (
					<Paper bg="blue.1" p="xl" radius="md">
						<Stack gap="lg">
							<Stack align="center" gap="md">
								<Title order={2}>Your turn to guess!</Title>
								<Text size="lg">Here are the clues:</Text>
							</Stack>

							<SimpleGrid cols={{ base: 2, md: 3 }} spacing="md">
								{gameState.validClues.map((clue, index) => (
									<Card
										key={index}
										bg="white"
										withBorder
										shadow="sm"
										p="lg"
										radius="md"
									>
										<Text size="lg" fw={600} ta="center">
											{clue}
										</Text>
									</Card>
								))}
							</SimpleGrid>

							<Center>
								<form onSubmit={handleSubmitGuess}>
									<Group>
										<TextInput
											value={guessInput}
											onChange={(e) => setGuessInput(e.target.value)}
											placeholder="What's your guess?"
											size="lg"
											w={250}
											required
										/>
										<Button type="submit" size="lg" color="green">
											Guess!
										</Button>
									</Group>
								</form>
							</Center>

							<Center>
								<Button
									onClick={() =>
										dispatch({ type: "submit-guess", guess: "PASS" })
									}
									variant="light"
									color="gray"
								>
									Pass
								</Button>
							</Center>
						</Stack>
					</Paper>
				) : (
					<Paper bg="gray.1" p="xl" radius="md">
						<Stack align="center" gap="lg">
							<Title order={2}>
								{
									gameState.users.find((u) => u.id === gameState.currentGuesser)
										?.name
								}{" "}
								is guessing...
							</Title>
							<Text size="3rem">🤔</Text>
						</Stack>
					</Paper>
				)}
			</Stack>
		</Container>
	);

	const renderRoundEnd = () => (
		<Container size="lg">
			<Stack gap="xl">
				<Center>
					<Title order={1}>📊 Round Complete</Title>
				</Center>

				<Paper
					bg={gameState.lastGuessCorrect ? "green.1" : "red.1"}
					p="xl"
					radius="md"
				>
					<Stack align="center" gap="lg">
						<Text size="4rem">{gameState.lastGuessCorrect ? "🎉" : "😔"}</Text>
						<Title order={2}>
							{gameState.lastGuessCorrect ? "Correct!" : "Incorrect"}
						</Title>
						<Text size="lg">
							The word was:{" "}
							<Text span fw={700}>
								{gameState.currentWord}
							</Text>
						</Text>
						<Text size="lg">
							Guess:{" "}
							<Text span fw={700}>
								{gameState.lastGuess}
							</Text>
						</Text>
						<Text size="xl">
							Score: {gameState.setScore}/{gameState.gamesAttempted}
						</Text>
					</Stack>
				</Paper>

				{isHost && (
					<Center>
						<Button
							onClick={() => dispatch({ type: "next-round" })}
							size="lg"
							color="blue"
						>
							Next Round
						</Button>
					</Center>
				)}
			</Stack>
		</Container>
	);

	const renderSetEnd = () => (
		<Container size="lg">
			<Stack gap="xl">
				<Center>
					<Title order={1}>🏆 Set Complete!</Title>
				</Center>

				<Paper bg="violet.1" p="xl" radius="md">
					<Stack align="center" gap="lg">
						<Text size="4rem">🎊</Text>
						<Title order={2}>Final Score</Title>
						<Text size="3rem" fw={700}>
							{gameState.setScore} / {gameState.setTarget}
						</Text>

						<Text size="lg">
							{gameState.setScore >= 13
								? "Excellent!"
								: gameState.setScore >= 11
									? "Very Good!"
									: gameState.setScore >= 8
										? "Good!"
										: "Keep trying!"}
						</Text>
					</Stack>
				</Paper>

				{gameState.setHistory.length > 1 && (
					<Stack gap="md">
						<Title order={3} ta="center">
							Previous Sets
						</Title>
						<SimpleGrid cols={{ base: 2, md: 4 }} spacing="sm">
							{gameState.setHistory.slice(0, -1).map((set, index) => (
								<Card key={index} bg="gray.1" p="sm" radius="md">
									<Text ta="center">
										Set {index + 1}: {set.score}/{set.target}
									</Text>
								</Card>
							))}
						</SimpleGrid>
					</Stack>
				)}

				{isHost && (
					<Center>
						<Group>
							<Button
								onClick={() => dispatch({ type: "start-set" })}
								size="lg"
								color="green"
							>
								Play Another Set
							</Button>
							<Button
								onClick={() => dispatch({ type: "end-session" })}
								size="lg"
								color="red"
							>
								End Session
							</Button>
						</Group>
					</Center>
				)}
			</Stack>
		</Container>
	);

	return (
		<>
			{renderGameContent()}

			{/* Game Log */}
			{gameState.log.length > 0 && (
				<Paper
					shadow="lg"
					p="md"
					radius="md"
					pos="fixed"
					bottom={16}
					right={16}
					w={320}
					mah={240}
				>
					<ScrollArea h={180}>
						<Stack gap="xs">
							<Text fw={600} size="sm">
								Game Log
							</Text>
							{gameState.log.map((logEntry) => (
								<Text key={logEntry.dt} size="xs" c="dimmed">
									{logEntry.message}
								</Text>
							))}
						</Stack>
					</ScrollArea>
				</Paper>
			)}

			{/* Host Controls */}
			{isHost && gameState.gamePhase !== "lobby" && (
				<Paper shadow="lg" p="md" radius="md" pos="fixed" bottom={16} left={16}>
					<Stack gap="xs">
						<Text fw={600} size="sm">
							Host Controls
						</Text>
						<Button
							onClick={() => dispatch({ type: "end-set" })}
							size="xs"
							color="yellow"
							variant="light"
							fullWidth
						>
							End Set
						</Button>
						<Button
							onClick={() => dispatch({ type: "end-session" })}
							size="xs"
							color="red"
							variant="light"
							fullWidth
						>
							End Session
						</Button>
					</Stack>
				</Paper>
			)}
		</>
	);
};

export default Game;
