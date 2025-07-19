import { Trans, useLingui } from "@lingui/react/macro";
import {
	Badge,
	Box,
	Button,
	Card,
	Center,
	Container,
	Grid,
	Group,
	Loader,
	Paper,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { useState } from "react";
import { MdCheck, MdLogout, MdSend, MdSkipNext, MdStop } from "react-icons/md";
import QRCode from "react-qr-code";
import { useGameRoom } from "@/hooks/useGameRoom";

interface GameProps {
	username: string;
	roomId: string;
}

const Game = ({ username, roomId }: GameProps) => {
	const { gameState, dispatch } = useGameRoom(username, roomId);
	const { t } = useLingui();

	// Local state for UI interactions
	const [clueInput, setClueInput] = useState("");
	const [guessInput, setGuessInput] = useState("");
	const [selectedInvalidClues, setSelectedInvalidClues] = useState<string[]>(
		[],
	);

	// Indicated that the game is loading
	if (gameState === null) {
		return (
			<Center h="60vh">
				<Stack align="center" gap="lg">
					<Text size="4rem">🎯</Text>
					<Loader size="lg" />
					<Text size="xl">
						<Trans>Connecting to game server...</Trans>
					</Text>
				</Stack>
			</Center>
		);
	}

	const currentUser = gameState.users.find((user) => user.id === username);
	const isHost = currentUser?.isHost || false;
	const isCurrentGuesser = gameState.currentGuesser === username;
	const isCurrentChecker = gameState.currentChecker === username;

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
			case "checking-answer":
				return renderCheckingAnswer();
			case "reviewing-clues":
				return renderReviewingClues();
			case "guessing":
				return renderGuessing();
			case "round-end":
				return renderRoundEnd();
			case "set-end":
				return renderSetEnd();
			default:
				return (
					<div>
						<Trans>Unknown game phase</Trans>
					</div>
				);
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
							<Trans>Cooperative word guessing game</Trans>
						</Text>
					</Stack>
				</Center>

				<Grid>
					<Grid.Col span={{ base: 12, md: 6 }}>
						<Center>
							<Stack align="center" gap="md">
								<Title order={2}>
									<Trans>Room Code</Trans>
								</Title>
								<Paper
									bg="dark"
									c="white"
									p="lg"
									radius="md"
									ff="monospace"
									fz="2rem"
								>
									{roomId}
								</Paper>
								<Text size="sm" c="dimmed">
									<Trans>Share this code with other players</Trans>
								</Text>
							</Stack>
						</Center>
					</Grid.Col>

					<Grid.Col span={{ base: 12, md: 6 }}>
						<Center>
							<Stack align="center" gap="md">
								<Title order={2}>
									<Trans>QR Code</Trans>
								</Title>
								<QRCode
									value={`${window.location.origin}/join/${roomId}`}
									size={150}
								/>
								<Text size="sm" c="dimmed">
									<Trans>Scan to join quickly</Trans>
								</Text>
							</Stack>
						</Center>
					</Grid.Col>
				</Grid>

				<Stack gap="md">
					<Title order={2}>
						<Trans>Players ({gameState.users.length})</Trans>
					</Title>
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
										<Trans>👑 Host</Trans>
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
							<Trans>Start Game</Trans>
						</Button>
					</Center>
				)}

				{gameState.users.length < 3 && (
					<Center>
						<Text c="dimmed">
							<Trans>Need at least 3 players to start the game</Trans>
						</Text>
					</Center>
				)}
			</Stack>
		</Container>
	);

	const renderWritingClues = () => (
		<Container size="lg">
			<Stack gap="xl">
				<Center>
					<Stack align="center" gap="md">
						<Title order={1}>
							✏️ <Trans>Writing Clues</Trans>
						</Title>
						<Text size="lg">
							<Trans>
								Score: {gameState.setScore}/{gameState.gamesAttempted} | Target:{" "}
								{gameState.setTarget}
							</Trans>
						</Text>
					</Stack>
				</Center>

				{isCurrentGuesser ? (
					<Paper bg="blue.1" p="xl" radius="md">
						<Stack align="center" gap="lg">
							<Title order={2}>
								<Trans>You are the guesser!</Trans>
							</Title>
							<Text size="lg">
								<Trans>Wait while others write clues for you...</Trans>
							</Text>
							<Text size="4rem">🤔</Text>
						</Stack>
					</Paper>
				) : (
					<Paper bg="green.1" p="xl" radius="md">
						<Stack gap="lg">
							<Stack align="center" gap="md">
								<Title order={2}>
									<Trans>The word is:</Trans>
								</Title>
								<Text size="3rem" fw={700}>
									{gameState.currentWord}
								</Text>
								<Text size="lg">
									<Trans>
										Write ONE word clue for{" "}
										{
											gameState.users.find(
												(u) => u.id === gameState.currentGuesser,
											)?.name
										}
									</Trans>
								</Text>
							</Stack>

							{!gameState.submittedClues[username] ? (
								<Center>
									<Text size="lg" c="dimmed">
										<Trans>Submit your clue using the form below</Trans>
									</Text>
								</Center>
							) : (
								<Center>
									<Text size="lg" c="green.7">
										<Trans>✓ Clue submitted! Waiting for others...</Trans>
									</Text>
								</Center>
							)}
						</Stack>
					</Paper>
				)}

				<Center>
					<Stack align="center" gap="xs">
						<Title order={3}>
							<Trans>Progress</Trans>
						</Title>
						<Text size="sm">
							<Trans>
								{Object.keys(gameState.submittedClues).length} of{" "}
								{gameState.users.length - 1} clues submitted
							</Trans>
						</Text>
					</Stack>
				</Center>
			</Stack>
		</Container>
	);

	const renderCheckingDuplicates = () => (
		<Container size="lg">
			<Stack gap="xl">
				<Center>
					<Title order={1}>
						🔍 <Trans>Checking Duplicates</Trans>
					</Title>
				</Center>

				{isCurrentChecker ? (
					<Paper bg="orange.1" p="xl" radius="md">
						<Stack gap="lg">
							<Stack align="center" gap="md">
								<Title order={2}>
									<Trans>You are checking for duplicates!</Trans>
								</Title>
								<Text size="lg">
									<Trans>Mark any clues that should be removed:</Trans>
								</Text>
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
						</Stack>
					</Paper>
				) : (
					<Paper bg="gray.1" p="xl" radius="md">
						<Stack align="center" gap="lg">
							<Title order={2}>
								<Trans>Duplicate Check in Progress</Trans>
							</Title>
							<Text size="lg">
								<Trans>
									{
										gameState.users.find(
											(u) => u.id === gameState.currentChecker,
										)?.name
									}{" "}
									is checking for duplicates...
								</Trans>
							</Text>
							<Text size="3rem">⏳</Text>
						</Stack>
					</Paper>
				)}
			</Stack>
		</Container>
	);

	const renderCheckingAnswer = () => (
		<Container size="lg">
			<Stack gap="xl">
				<Center>
					<Title order={1}>
						🤔 <Trans>Checking Answer</Trans>
					</Title>
				</Center>

				{isCurrentChecker ? (
					<Paper bg="orange.1" p="xl" radius="md">
						<Stack gap="lg">
							<Stack align="center" gap="md">
								<Title order={2}>
									<Trans>You are checking the answer!</Trans>
								</Title>
								<Text size="lg">
									<Trans>The word was:</Trans>{" "}
									<Text span fw={700}>
										{gameState.currentWord}
									</Text>
								</Text>
								<Text size="lg">
									<Trans>The guess was:</Trans>{" "}
									<Text span fw={700}>
										{gameState.lastGuess}
									</Text>
								</Text>
								<Text size="md" c="dimmed">
									<Trans>Should this answer be accepted as correct?</Trans>
								</Text>
							</Stack>

							<Group justify="center" gap="xl">
								<Button
									onClick={() =>
										dispatch({ type: "verify-answer", isCorrect: true })
									}
									color="green"
									size="xl"
									leftSection={<MdCheck size={20} />}
								>
									<Trans>Accept Answer</Trans>
								</Button>
								<Button
									onClick={() =>
										dispatch({ type: "verify-answer", isCorrect: false })
									}
									color="red"
									size="xl"
									leftSection={<MdStop size={20} />}
								>
									<Trans>Reject Answer</Trans>
								</Button>
							</Group>
						</Stack>
					</Paper>
				) : (
					<Paper bg="gray.1" p="xl" radius="md">
						<Stack align="center" gap="lg">
							<Title order={2}>
								<Trans>Answer Verification in Progress</Trans>
							</Title>
							<Text size="lg">
								<Trans>
									{
										gameState.users.find(
											(u) => u.id === gameState.currentChecker,
										)?.name
									}{" "}
									is checking if the answer should be accepted...
								</Trans>
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
					<Title order={1}>
						📋 <Trans>Clues Ready</Trans>
					</Title>
					<Text size="lg">
						<Trans>Preparing clues for the guesser...</Trans>
					</Text>
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
						<Title order={1}>
							🎯 <Trans>Guessing Time</Trans>
						</Title>
						<Text size="lg">
							<Trans>
								Score: {gameState.setScore}/{gameState.gamesAttempted} | Target:{" "}
								{gameState.setTarget}
							</Trans>
						</Text>
					</Stack>
				</Center>

				{isCurrentGuesser ? (
					<Paper bg="blue.1" p="xl" radius="md">
						<Stack gap="lg">
							<Stack align="center" gap="md">
								<Title order={2}>
									<Trans>Your turn to guess!</Trans>
								</Title>
								<Text size="lg">
									<Trans>Here are the clues:</Trans>
								</Text>
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
								<Text size="lg" c="dimmed">
									<Trans>Submit your guess using the form below</Trans>
								</Text>
							</Center>
						</Stack>
					</Paper>
				) : (
					<Paper bg="gray.1" p="xl" radius="md">
						<Stack align="center" gap="lg">
							<Title order={2}>
								<Trans>
									{
										gameState.users.find(
											(u) => u.id === gameState.currentGuesser,
										)?.name
									}{" "}
									is guessing...
								</Trans>
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
					<Title order={1}>
						📊 <Trans>Round Complete</Trans>
					</Title>
				</Center>

				<Paper
					bg={gameState.lastGuessCorrect ? "green.1" : "red.1"}
					p="xl"
					radius="md"
				>
					<Stack align="center" gap="lg">
						<Text size="4rem">{gameState.lastGuessCorrect ? "🎉" : "😔"}</Text>
						<Title order={2}>
							<Trans>
								{gameState.lastGuessCorrect ? "Correct!" : "Incorrect"}
							</Trans>
						</Title>
						<Text size="lg">
							<Trans>The word was:</Trans>{" "}
							<Text span fw={700}>
								{gameState.currentWord}
							</Text>
						</Text>
						<Text size="lg">
							<Trans>Guess:</Trans>{" "}
							<Text span fw={700}>
								{gameState.lastGuess}
							</Text>
						</Text>
						<Text size="xl">
							<Trans>
								Score: {gameState.setScore}/{gameState.gamesAttempted}
							</Trans>
						</Text>
					</Stack>
				</Paper>
			</Stack>
		</Container>
	);

	const renderSetEnd = () => (
		<Container size="lg">
			<Stack gap="xl">
				<Center>
					<Title order={1}>
						🏆 <Trans>Set Complete!</Trans>
					</Title>
				</Center>

				<Paper bg="violet.1" p="xl" radius="md">
					<Stack align="center" gap="lg">
						<Text size="4rem">🎊</Text>
						<Title order={2}>
							<Trans>Final Score</Trans>
						</Title>
						<Text size="3rem" fw={700}>
							{gameState.setScore} / {gameState.setTarget}
						</Text>

						<Text size="lg">
							<Trans>
								{gameState.setScore >= 13
									? "Excellent!"
									: gameState.setScore >= 11
										? "Very Good!"
										: gameState.setScore >= 8
											? "Good!"
											: "Keep trying!"}
							</Trans>
						</Text>
					</Stack>
				</Paper>

				{gameState.setHistory.length > 1 && (
					<Stack gap="md">
						<Title order={3} ta="center">
							<Trans>Previous Sets</Trans>
						</Title>
						<SimpleGrid cols={{ base: 2, md: 4 }} spacing="sm">
							{gameState.setHistory.slice(0, -1).map((set, index) => (
								<Card key={index} bg="gray.1" p="sm" radius="md">
									<Text ta="center">
										<Trans>
											Set {index + 1}: {set.score}/{set.target}
										</Trans>
									</Text>
								</Card>
							))}
						</SimpleGrid>
					</Stack>
				)}
			</Stack>
		</Container>
	);

	const renderBottomActions = () => {
		// Don't show bottom actions in lobby
		if (gameState.gamePhase === "lobby") {
			return null;
		}

		const actions = [];

		// Writing clues phase
		if (gameState.gamePhase === "writing-clues") {
			if (!isCurrentGuesser && !gameState.submittedClues[username]) {
				actions.push(
					<form key="clue-form" onSubmit={handleSubmitClue} style={{ flex: 1 }}>
						<Group style={{ width: "100%" }}>
							<TextInput
								value={clueInput}
								onChange={(e) => setClueInput(e.target.value)}
								placeholder={t`Enter one word clue`}
								size="lg"
								style={{ flex: 1 }}
								maxLength={30}
								required
							/>
							<Button
								type="submit"
								size="lg"
								color="blue"
								rightSection={<MdSend size={16} />}
							>
								<Trans>Submit</Trans>
							</Button>
						</Group>
					</form>,
				);
			}
			if (isHost) {
				actions.push(
					<Button
						key="skip-word"
						onClick={() => dispatch({ type: "pass-word" })}
						color="yellow"
						variant="light"
						leftSection={<MdSkipNext size={16} />}
					>
						<Trans>Skip</Trans>
					</Button>,
				);
			}
		}

		// Checking duplicates phase
		if (gameState.gamePhase === "checking-duplicates" && isCurrentChecker) {
			actions.push(
				<Button
					key="finish-checking"
					onClick={handleMarkInvalidClues}
					color="green"
					size="lg"
					style={{ flex: 1 }}
					rightSection={<MdCheck size={16} />}
				>
					<Trans>Finish Checking ({selectedInvalidClues.length} marked)</Trans>
				</Button>,
			);
		}

		// Guessing phase
		if (gameState.gamePhase === "guessing" && isCurrentGuesser) {
			actions.push(
				<form key="guess-form" onSubmit={handleSubmitGuess} style={{ flex: 1 }}>
					<Group style={{ width: "100%" }}>
						<TextInput
							value={guessInput}
							onChange={(e) => setGuessInput(e.target.value)}
							placeholder={t`What's your guess?`}
							size="lg"
							style={{ flex: 1 }}
							required
						/>
						<Button
							type="submit"
							size="lg"
							color="green"
							rightSection={<MdSend size={16} />}
						>
							<Trans>Guess!</Trans>
						</Button>
					</Group>
				</form>,
			);
			actions.push(
				<Button
					key="pass"
					onClick={() => dispatch({ type: "submit-guess", guess: "PASS" })}
					variant="light"
					color="gray"
				>
					<Trans>Pass</Trans>
				</Button>,
			);
		}

		// Round end phase
		if (gameState.gamePhase === "round-end" && isHost) {
			actions.push(
				<Button
					key="next-round"
					onClick={() => dispatch({ type: "next-round" })}
					size="lg"
					color="blue"
					style={{ flex: 1 }}
				>
					<Trans>Next Round</Trans>
				</Button>,
			);
		}

		// Set end phase
		if (gameState.gamePhase === "set-end" && isHost) {
			actions.push(
				<Button
					key="play-again"
					onClick={() => dispatch({ type: "start-set" })}
					size="lg"
					color="green"
					style={{ flex: 1 }}
				>
					<Trans>Play Again</Trans>
				</Button>,
			);
			actions.push(
				<Button
					key="end-session"
					onClick={() => dispatch({ type: "end-session" })}
					size="lg"
					color="red"
					leftSection={<MdLogout size={16} />}
				>
					<Trans>End</Trans>
				</Button>,
			);
		}

		// Host controls (available in most phases except lobby)
		if (isHost && !["lobby", "set-end"].includes(gameState.gamePhase)) {
			if (actions.length === 0) {
				// If no other actions, show host controls prominently
				actions.push(
					<Button
						key="end-set"
						onClick={() => dispatch({ type: "end-set" })}
						color="yellow"
						variant="light"
						leftSection={<MdStop size={16} />}
					>
						<Trans>End Set</Trans>
					</Button>,
				);
				actions.push(
					<Button
						key="end-session-main"
						onClick={() => dispatch({ type: "end-session" })}
						color="red"
						variant="light"
						leftSection={<MdLogout size={16} />}
					>
						<Trans>End Session</Trans>
					</Button>,
				);
			} else {
				// If there are other actions, show host controls as smaller buttons
				actions.push(
					<Button
						key="end-set-small"
						onClick={() => dispatch({ type: "end-set" })}
						size="sm"
						color="yellow"
						variant="light"
					>
						<MdStop size={16} />
					</Button>,
				);
				actions.push(
					<Button
						key="end-session-small"
						onClick={() => dispatch({ type: "end-session" })}
						size="sm"
						color="red"
						variant="light"
					>
						<MdLogout size={16} />
					</Button>,
				);
			}
		}

		if (actions.length === 0) {
			return null;
		}

		return (
			<Box
				style={{
					position: "fixed",
					bottom: "16px",
					left: "16px",
					right: "16px",
					zIndex: 1000,
				}}
			>
				<Group gap="sm" style={{ width: "100%" }}>
					{actions}
				</Group>
			</Box>
		);
	};

	return (
		<Box
			style={{
				flex: 1,
				display: "flex",
				flexDirection: "column",
				paddingBottom: "80px", // Space for fixed button area
			}}
		>
			<Box style={{ flex: 1 }}>{renderGameContent()}</Box>

			{/* Fixed bottom button area */}
			{renderBottomActions()}
		</Box>
	);
};

export default Game;
