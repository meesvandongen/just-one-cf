import { beforeEach, describe, expect, it } from "vitest";
import {
	type GameState,
	gameUpdater,
	initialGame,
	type ServerAction,
	type User,
} from "../game/logic";

describe("Game Logic Edge Cases", () => {
	let gameState: GameState;

	beforeEach(() => {
		gameState = initialGame();
	});

	describe("Edge Cases and Error Handling", () => {
		it("should handle UserExit for non-existent user gracefully", () => {
			const nonExistentUser: User = {
				id: "ghost",
				name: "Ghost",
				isHost: false,
			};
			const action: ServerAction = { type: "UserExit", user: nonExistentUser };

			const newState = gameUpdater(action, gameState);

			expect(newState).toEqual(gameState);
		});

		it("should handle empty user list when starting set", () => {
			const ghostUser: User = { id: "ghost", name: "Ghost", isHost: true };
			const action: ServerAction = { type: "start-set", user: ghostUser };

			const newState = gameUpdater(action, gameState);

			expect(newState.gamePhase).toBe("lobby");
		});

		it("should handle actions when no users are present", () => {
			const ghostUser: User = { id: "ghost", name: "Ghost", isHost: false };
			const actions: ServerAction[] = [
				{ type: "submit-clue", clue: "test", user: ghostUser },
				{ type: "submit-guess", guess: "test", user: ghostUser },
				{ type: "next-round", user: ghostUser },
			];

			actions.forEach((action) => {
				const newState = gameUpdater(action, gameState);
				expect(newState).toEqual(gameState);
			});
		});

		it("should handle removing non-existent player", () => {
			const user1: User = { id: "user1", name: "Player1", isHost: false };
			let state = gameUpdater({ type: "UserEntered", user: user1 }, gameState);

			const host = state.users.find((u) => u.isHost)!;
			const action: ServerAction = {
				type: "remove-player",
				playerId: "nonexistent",
				user: host,
			};

			const newState = gameUpdater(action, state);

			expect(newState.users).toHaveLength(1);
			expect(newState.users[0].id).toBe("user1");
		});

		it("should handle case sensitivity in guess correctly", () => {
			// Set up game ready for guessing
			const user1: User = { id: "user1", name: "Player1", isHost: false };
			const user2: User = { id: "user2", name: "Player2", isHost: false };
			const user3: User = { id: "user3", name: "Player3", isHost: false };

			let state = gameUpdater({ type: "UserEntered", user: user1 }, gameState);
			state = gameUpdater({ type: "UserEntered", user: user2 }, state);
			state = gameUpdater({ type: "UserEntered", user: user3 }, state);

			const host = state.users.find((u) => u.isHost)!;
			state = gameUpdater({ type: "start-set", user: host }, state);

			// Get to guessing phase
			const nonGuessers = state.users.filter(
				(u) => u.id !== state.currentGuesser,
			);
			nonGuessers.forEach((user, index) => {
				const action: ServerAction = {
					type: "submit-clue",
					clue: `clue${index}`,
					user,
				};
				state = gameUpdater(action, state);
			});

			const checker = state.users.find((u) => u.id === state.currentChecker)!;
			state = gameUpdater(
				{ type: "mark-invalid-clues", invalidClues: [], user: checker },
				state,
			);

			// Test case insensitive guess
			const guesser = state.users.find((u) => u.id === state.currentGuesser)!;
			const correctWord = state.currentWord!;
			const uppercaseGuess = correctWord.toUpperCase();

			const action: ServerAction = {
				type: "submit-guess",
				guess: uppercaseGuess,
				user: guesser,
			};

			const newState = gameUpdater(action, state);

			expect(newState.lastGuessCorrect).toBe(true);
			expect(newState.setScore).toBe(1);
		});

		it("should handle whitespace in guesses correctly", () => {
			// Set up game ready for guessing
			const user1: User = { id: "user1", name: "Player1", isHost: false };
			const user2: User = { id: "user2", name: "Player2", isHost: false };
			const user3: User = { id: "user3", name: "Player3", isHost: false };

			let state = gameUpdater({ type: "UserEntered", user: user1 }, gameState);
			state = gameUpdater({ type: "UserEntered", user: user2 }, state);
			state = gameUpdater({ type: "UserEntered", user: user3 }, state);

			const host = state.users.find((u) => u.isHost)!;
			state = gameUpdater({ type: "start-set", user: host }, state);

			// Get to guessing phase
			const nonGuessers = state.users.filter(
				(u) => u.id !== state.currentGuesser,
			);
			nonGuessers.forEach((user, index) => {
				const action: ServerAction = {
					type: "submit-clue",
					clue: `clue${index}`,
					user,
				};
				state = gameUpdater(action, state);
			});

			const checker = state.users.find((u) => u.id === state.currentChecker)!;
			state = gameUpdater(
				{ type: "mark-invalid-clues", invalidClues: [], user: checker },
				state,
			);

			// Test guess with leading/trailing whitespace
			const guesser = state.users.find((u) => u.id === state.currentGuesser)!;
			const correctWord = state.currentWord!;
			const guessWithWhitespace = `  ${correctWord}  `;

			const action: ServerAction = {
				type: "submit-guess",
				guess: guessWithWhitespace,
				user: guesser,
			};

			const newState = gameUpdater(action, state);

			expect(newState.lastGuessCorrect).toBe(true);
			expect(newState.setScore).toBe(1);
		});
	});

	describe("Player Rotation Logic", () => {
		let stateWithUsers: GameState;

		beforeEach(() => {
			const user1: User = { id: "user1", name: "Player1", isHost: false };
			const user2: User = { id: "user2", name: "Player2", isHost: false };
			const user3: User = { id: "user3", name: "Player3", isHost: false };
			const user4: User = { id: "user4", name: "Player4", isHost: false };

			stateWithUsers = gameUpdater(
				{ type: "UserEntered", user: user1 },
				gameState,
			);
			stateWithUsers = gameUpdater(
				{ type: "UserEntered", user: user2 },
				stateWithUsers,
			);
			stateWithUsers = gameUpdater(
				{ type: "UserEntered", user: user3 },
				stateWithUsers,
			);
			stateWithUsers = gameUpdater(
				{ type: "UserEntered", user: user4 },
				stateWithUsers,
			);
		});

		it("should rotate guesser correctly through multiple rounds", () => {
			const host = stateWithUsers.users.find((u) => u.isHost)!;
			let state = gameUpdater(
				{ type: "start-set", user: host },
				stateWithUsers,
			);

			const originalGuesser = state.currentGuesser;
			expect(originalGuesser).toBe("user1");

			// Simulate round end and next round
			state = { ...state, gamePhase: "round-end" };
			state = gameUpdater({ type: "next-round", user: host }, state);

			expect(state.currentGuesser).toBe("user2");

			// Another round
			state = { ...state, gamePhase: "round-end" };
			state = gameUpdater({ type: "next-round", user: host }, state);

			expect(state.currentGuesser).toBe("user3");

			// Another round
			state = { ...state, gamePhase: "round-end" };
			state = gameUpdater({ type: "next-round", user: host }, state);

			expect(state.currentGuesser).toBe("user4");

			// Should wrap around
			state = { ...state, gamePhase: "round-end" };
			state = gameUpdater({ type: "next-round", user: host }, state);

			expect(state.currentGuesser).toBe("user1");
		});

		it("should handle checker assignment correctly", () => {
			const host = stateWithUsers.users.find((u) => u.isHost)!;
			let state = gameUpdater(
				{ type: "start-set", user: host },
				stateWithUsers,
			);

			// Current guesser should be user1
			expect(state.currentGuesser).toBe("user1");

			// Submit clues to get to checking phase
			const nonGuessers = state.users.filter(
				(u) => u.id !== state.currentGuesser,
			);
			nonGuessers.forEach((user, index) => {
				const action: ServerAction = {
					type: "submit-clue",
					clue: `clue${index}`,
					user,
				};
				state = gameUpdater(action, state);
			});

			// Checker should be the next player after guesser (user2)
			expect(state.currentChecker).toBe("user2");
		});

		it("should handle player removal and adjust roles accordingly", () => {
			const host = stateWithUsers.users.find((u) => u.isHost)!;
			let state = gameUpdater(
				{ type: "start-set", user: host },
				stateWithUsers,
			);

			// Current guesser is user1
			expect(state.currentGuesser).toBe("user1");

			// Remove the current guesser
			state = gameUpdater(
				{
					type: "remove-player",
					playerId: "user1",
					user: host,
				},
				state,
			);

			// New guesser should be user2 (next in line)
			expect(state.currentGuesser).toBe("user2");
			expect(state.users).toHaveLength(3);
			expect(state.users.find((u) => u.id === "user1")).toBeUndefined();
		});
	});

	describe("Set Completion Logic", () => {
		let gameInProgress: GameState;

		beforeEach(() => {
			const user1: User = { id: "user1", name: "Player1", isHost: false };
			const user2: User = { id: "user2", name: "Player2", isHost: false };
			const user3: User = { id: "user3", name: "Player3", isHost: false };

			let state = gameUpdater({ type: "UserEntered", user: user1 }, gameState);
			state = gameUpdater({ type: "UserEntered", user: user2 }, state);
			state = gameUpdater({ type: "UserEntered", user: user3 }, state);

			const host = state.users.find((u) => u.isHost)!;
			gameInProgress = gameUpdater({ type: "start-set", user: host }, state);
		});

		it("should track set history correctly", () => {
			expect(gameInProgress.setHistory).toHaveLength(0);

			// Complete a set by reaching target
			const stateNearEnd = {
				...gameInProgress,
				setTarget: 1,
				gamesAttempted: 0,
			};

			// Get to guessing phase
			let state = stateNearEnd;
			const nonGuessers = state.users.filter(
				(u) => u.id !== state.currentGuesser,
			);
			nonGuessers.forEach((user, index) => {
				const action: ServerAction = {
					type: "submit-clue",
					clue: `clue${index}`,
					user,
				};
				state = gameUpdater(action, state);
			});

			const checker = state.users.find((u) => u.id === state.currentChecker)!;
			state = gameUpdater(
				{ type: "mark-invalid-clues", invalidClues: [], user: checker },
				state,
			);

			// Make correct guess to complete set
			const guesser = state.users.find((u) => u.id === state.currentGuesser)!;
			state = gameUpdater(
				{
					type: "submit-guess",
					guess: state.currentWord!,
					user: guesser,
				},
				state,
			);

			expect(state.gamePhase).toBe("set-end");
			expect(state.setHistory).toHaveLength(1);
			expect(state.setHistory[0]).toEqual({
				score: 1,
				target: 1,
				completed: true,
			});
		});

		it("should handle early set termination", () => {
			const host = gameInProgress.users.find((u) => u.isHost)!;

			// Manually end the set
			const newState = gameUpdater(
				{ type: "end-set", user: host },
				gameInProgress,
			);

			expect(newState.gamePhase).toBe("set-end");
			expect(newState.setHistory).toHaveLength(1);
			expect(newState.setHistory[0]).toEqual({
				score: 0,
				target: 20,
				completed: false,
			});
		});
	});

	describe("Word List Management", () => {
		it("should handle exhausted word list correctly", () => {
			// Create game with minimal word list
			const customGameState = {
				...initialGame(),
				wordList: ["word1", "word2"],
				usedWords: ["word1", "word2"], // All words used
			};

			const user1: User = { id: "user1", name: "Player1", isHost: false };
			const user2: User = { id: "user2", name: "Player2", isHost: false };
			const user3: User = { id: "user3", name: "Player3", isHost: false };

			let state = gameUpdater(
				{ type: "UserEntered", user: user1 },
				customGameState,
			);
			state = gameUpdater({ type: "UserEntered", user: user2 }, state);
			state = gameUpdater({ type: "UserEntered", user: user3 }, state);

			const host = state.users.find((u) => u.isHost)!;
			state = gameUpdater({ type: "start-set", user: host }, state);

			// Should still assign a word even when all are used
			expect(state.currentWord).toBeTruthy();
			expect(["word1", "word2"]).toContain(state.currentWord);
		});
	});

	describe("Game State Immutability", () => {
		it("should not mutate original state", () => {
			const originalState = { ...gameState };
			const user: User = { id: "user1", name: "Player1", isHost: false };

			gameUpdater({ type: "UserEntered", user }, gameState);

			expect(gameState).toEqual(originalState);
		});

		it("should create new state objects", () => {
			const user: User = { id: "user1", name: "Player1", isHost: false };
			const newState = gameUpdater({ type: "UserEntered", user }, gameState);

			expect(newState).not.toBe(gameState);
			expect(newState.users).not.toBe(gameState.users);
			expect(newState.log).not.toBe(gameState.log);
		});
	});

	describe("Log Management", () => {
		it("should limit log size to MAX_LOG_SIZE", () => {
			let state = gameState;

			// Add many users to generate many log entries
			for (let i = 0; i < 15; i++) {
				const user: User = {
					id: `user${i}`,
					name: `Player${i}`,
					isHost: false,
				};
				state = gameUpdater({ type: "UserEntered", user }, state);
			}

			// Log should be limited to 10 entries (MAX_LOG_SIZE)
			expect(state.log.length).toBeLessThanOrEqual(10);

			// Most recent entries should be at the beginning
			expect(state.log[0].message).toContain("user14");
		});

		it("should maintain log chronological order", () => {
			const user1: User = { id: "user1", name: "Player1", isHost: false };
			const user2: User = { id: "user2", name: "Player2", isHost: false };

			let state = gameUpdater({ type: "UserEntered", user: user1 }, gameState);
			const firstLogTime = state.log[0].dt;

			// Wait a bit to ensure different timestamp
			state = gameUpdater({ type: "UserEntered", user: user2 }, state);
			const secondLogTime = state.log[0].dt;

			// More recent log should have higher timestamp and be first
			expect(secondLogTime).toBeGreaterThanOrEqual(firstLogTime);
			expect(state.log[0].message).toBe("user2 joined the game");
			expect(state.log[1].message).toBe("user1 joined the game");
		});
	});
});
