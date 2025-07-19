import { beforeEach, describe, expect, it } from "vitest";
import {
	type GameAction,
	type GameState,
	gameUpdater,
	initialGame,
	type ServerAction,
	type User,
} from "../party/logic";

// Helper functions for testing with the new ClueWithSubmitter structure
const clueExists = (validClues: any[], clueText: string): boolean => {
	return validClues.some((clueWithSubmitter) => clueWithSubmitter.clue === clueText);
};

const clueDoesNotExist = (validClues: any[], clueText: string): boolean => {
	return !clueExists(validClues, clueText);
};

describe("Game Logic Tests", () => {
	let gameState: GameState;

	beforeEach(() => {
		gameState = initialGame();
	});

	describe("Initial Game State", () => {
		it("should create a fresh game with correct initial values", () => {
			expect(gameState.users).toEqual([]);
			expect(gameState.hostId).toBeNull();
			expect(gameState.gamePhase).toBe("lobby");
			expect(gameState.currentWord).toBeNull();
			expect(gameState.currentGuesser).toBeNull();
			expect(gameState.setScore).toBe(0);
			expect(gameState.gamesAttempted).toBe(0);
			expect(gameState.setTarget).toBe(20);
			expect(gameState.wordList.length).toBeGreaterThan(0);
			expect(gameState.usedWords).toEqual([]);
			expect(gameState.log).toHaveLength(1);
			expect(gameState.log[0].message).toBe("Game Created!");
		});
	});

	describe("User Management", () => {
		it("should add first user as host", () => {
			const user: User = { id: "user1", name: "Player1", isHost: false };
			const action: ServerAction = { type: "UserEntered", user };

			const newState = gameUpdater(action, gameState);

			expect(newState.users).toHaveLength(1);
			expect(newState.users[0].id).toBe("user1");
			expect(newState.users[0].isHost).toBe(true);
			expect(newState.hostId).toBe("user1");
			expect(newState.log[0].message).toBe("user1 joined the game");
		});

		it("should add second user as non-host", () => {
			// First user
			const user1: User = { id: "user1", name: "Player1", isHost: false };
			let state = gameUpdater({ type: "UserEntered", user: user1 }, gameState);

			// Second user
			const user2: User = { id: "user2", name: "Player2", isHost: false };
			state = gameUpdater({ type: "UserEntered", user: user2 }, state);

			expect(state.users).toHaveLength(2);
			expect(state.users[1].isHost).toBe(false);
			expect(state.hostId).toBe("user1");
		});

		it("should handle user exit and transfer host if needed", () => {
			// Add two users
			const user1: User = { id: "user1", name: "Player1", isHost: false };
			const user2: User = { id: "user2", name: "Player2", isHost: false };
			let state = gameUpdater({ type: "UserEntered", user: user1 }, gameState);
			state = gameUpdater({ type: "UserEntered", user: user2 }, state);

			// Host leaves
			state = gameUpdater({ type: "UserExit", user: user1 }, state);

			expect(state.users).toHaveLength(1);
			expect(state.users[0].id).toBe("user2");
			expect(state.users[0].isHost).toBe(true);
			expect(state.hostId).toBe("user2");
		});

		it("should handle join-session action with custom name", () => {
			const user: User = { id: "user1", name: "user1", isHost: false };
			const action: ServerAction = {
				type: "join-session",
				playerName: "CustomName",
				user,
			};

			const newState = gameUpdater(action, gameState);

			expect(newState.users).toHaveLength(1);
			expect(newState.users[0].name).toBe("CustomName");
			expect(newState.users[0].isHost).toBe(true);
		});
	});

	describe("Game Flow", () => {
		let stateWithUsers: GameState;

		beforeEach(() => {
			// Set up game with 3 users
			const user1: User = { id: "user1", name: "Player1", isHost: false };
			const user2: User = { id: "user2", name: "Player2", isHost: false };
			const user3: User = { id: "user3", name: "Player3", isHost: false };

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
		});

		it("should start set with host action when enough players", () => {
			const hostUser = stateWithUsers.users.find((u) => u.isHost)!;
			const action: ServerAction = { type: "start-set", user: hostUser };

			const newState = gameUpdater(action, stateWithUsers);

			expect(newState.gamePhase).toBe("writing-clues");
			expect(newState.currentWord).toBeTruthy();
			expect(newState.currentGuesser).toBe("user1");
			expect(newState.usedWords).toContain(newState.currentWord);
		});

		it("should not start set with insufficient players", () => {
			// Remove one user to have only 2 players
			const stateWithTwoUsers = {
				...stateWithUsers,
				users: stateWithUsers.users.slice(0, 2),
			};

			const hostUser = stateWithTwoUsers.users.find((u) => u.isHost)!;
			const action: ServerAction = { type: "start-set", user: hostUser };

			const newState = gameUpdater(action, stateWithTwoUsers);

			expect(newState.gamePhase).toBe("lobby");
			expect(newState.log[0].message).toBe("Need at least 3 players to start");
		});

		it("should not allow non-host to start set", () => {
			const nonHostUser = stateWithUsers.users.find((u) => !u.isHost)!;
			const action: ServerAction = { type: "start-set", user: nonHostUser };

			const newState = gameUpdater(action, stateWithUsers);

			expect(newState.gamePhase).toBe("lobby");
			expect(newState).toEqual(stateWithUsers);
		});
	});

	describe("Clue Submission", () => {
		let gameInProgress: GameState;

		beforeEach(() => {
			// Set up game in progress
			const user1: User = { id: "user1", name: "Player1", isHost: false };
			const user2: User = { id: "user2", name: "Player2", isHost: false };
			const user3: User = { id: "user3", name: "Player3", isHost: false };

			let state = gameUpdater({ type: "UserEntered", user: user1 }, gameState);
			state = gameUpdater({ type: "UserEntered", user: user2 }, state);
			state = gameUpdater({ type: "UserEntered", user: user3 }, state);

			const hostUser = state.users.find((u) => u.isHost)!;
			gameInProgress = gameUpdater(
				{ type: "start-set", user: hostUser },
				state,
			);
		});

		it("should accept clue from non-guesser", () => {
			const nonGuesser = gameInProgress.users.find(
				(u) => u.id !== gameInProgress.currentGuesser,
			)!;
			const action: ServerAction = {
				type: "submit-clue",
				clue: "blue",
				user: nonGuesser,
			};

			const newState = gameUpdater(action, gameInProgress);

			expect(newState.submittedClues[nonGuesser.id]).toBe("blue");
			expect(newState.gamePhase).toBe("writing-clues");
		});

		it("should not accept clue from guesser", () => {
			const guesser = gameInProgress.users.find(
				(u) => u.id === gameInProgress.currentGuesser,
			)!;
			const action: ServerAction = {
				type: "submit-clue",
				clue: "blue",
				user: guesser,
			};

			const newState = gameUpdater(action, gameInProgress);

			expect(newState.submittedClues[guesser.id]).toBeUndefined();
			expect(newState).toEqual(gameInProgress);
		});

		it("should move to duplicate checking when all non-guessers submit clues", () => {
			const nonGuessers = gameInProgress.users.filter(
				(u) => u.id !== gameInProgress.currentGuesser,
			);

			let state = gameInProgress;
			nonGuessers.forEach((user, index) => {
				const action: ServerAction = {
					type: "submit-clue",
					clue: `clue${index}`,
					user,
				};
				state = gameUpdater(action, state);
			});

			expect(state.gamePhase).toBe("checking-duplicates");
			expect(state.currentChecker).toBeTruthy();
			expect(state.validClues.length).toBeGreaterThan(0);
		});

		it("should automatically remove duplicate clues", () => {
			const nonGuessers = gameInProgress.users.filter(
				(u) => u.id !== gameInProgress.currentGuesser,
			);

			// Submit duplicate clues
			let state = gameInProgress;
			const action1: ServerAction = {
				type: "submit-clue",
				clue: "water",
				user: nonGuessers[0],
			};
			const action2: ServerAction = {
				type: "submit-clue",
				clue: "Water",
				user: nonGuessers[1],
			};

			state = gameUpdater(action1, state);
			state = gameUpdater(action2, state);

			expect(state.gamePhase).toBe("checking-duplicates");
			// When clues are duplicates, ALL instances should be removed
			expect(state.validClues).toHaveLength(0);
		});

		it("should handle mixed unique and duplicate clues correctly", () => {
			// Need 4 players to test this scenario properly
			const user4: User = { id: "user4", name: "Player4", isHost: false };
			let state = gameUpdater(
				{ type: "UserEntered", user: user4 },
				gameInProgress,
			);

			const nonGuessers = state.users.filter(
				(u) => u.id !== state.currentGuesser,
			);

			// Submit: unique clue, duplicate clue, duplicate clue, another unique clue
			const actions: ServerAction[] = [
				{
					type: "submit-clue",
					clue: "ocean", // unique
					user: nonGuessers[0],
				},
				{
					type: "submit-clue",
					clue: "water", // duplicate
					user: nonGuessers[1],
				},
				{
					type: "submit-clue",
					clue: "Water", // duplicate (case insensitive)
					user: nonGuessers[2],
				},
			];

			// If we have a 4th non-guesser, add another unique clue
			if (nonGuessers.length > 3) {
				actions.push({
					type: "submit-clue",
					clue: "blue", // unique
					user: nonGuessers[3],
				});
			}

			actions.forEach((action) => {
				state = gameUpdater(action, state);
			});

			expect(state.gamePhase).toBe("checking-duplicates");
			// Should only keep the unique clues
			const expectedUniqueClues = nonGuessers.length > 3 ? 2 : 1;
			expect(state.validClues).toHaveLength(expectedUniqueClues);
			expect(clueExists(state.validClues, "ocean")).toBe(true);
			if (nonGuessers.length > 3) {
				expect(clueExists(state.validClues, "blue")).toBe(true);
			}
			// Should NOT contain any "water" variants
			expect(clueDoesNotExist(state.validClues, "water")).toBe(true);
			expect(clueDoesNotExist(state.validClues, "Water")).toBe(true);
		});
	});

	describe("Duplicate Checking", () => {
		let stateWithClues: GameState;

		beforeEach(() => {
			// Set up game with submitted clues
			const user1: User = { id: "user1", name: "Player1", isHost: false };
			const user2: User = { id: "user2", name: "Player2", isHost: false };
			const user3: User = { id: "user3", name: "Player3", isHost: false };

			let state = gameUpdater({ type: "UserEntered", user: user1 }, gameState);
			state = gameUpdater({ type: "UserEntered", user: user2 }, state);
			state = gameUpdater({ type: "UserEntered", user: user3 }, state);

			const hostUser = state.users.find((u) => u.isHost)!;
			state = gameUpdater({ type: "start-set", user: hostUser }, state);

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

			stateWithClues = state;
		});

		it("should allow checker to mark invalid clues", () => {
			const checker = stateWithClues.users.find(
				(u) => u.id === stateWithClues.currentChecker,
			)!;
			const action: ServerAction = {
				type: "mark-invalid-clues",
				invalidClues: ["clue0"],
				user: checker,
			};

			const newState = gameUpdater(action, stateWithClues);

			expect(newState.gamePhase).toBe("guessing");
			expect(clueDoesNotExist(newState.validClues, "clue0")).toBe(true);
			expect(clueExists(newState.validClues, "clue1")).toBe(true);
		});

		it("should not allow non-checker to mark invalid clues", () => {
			const nonChecker = stateWithClues.users.find(
				(u) => u.id !== stateWithClues.currentChecker,
			)!;
			const action: ServerAction = {
				type: "mark-invalid-clues",
				invalidClues: ["clue0"],
				user: nonChecker,
			};

			const newState = gameUpdater(action, stateWithClues);

			expect(newState).toEqual(stateWithClues);
		});
	});

	describe("Guessing", () => {
		let stateReadyForGuessing: GameState;

		beforeEach(() => {
			// Set up game ready for guessing
			const user1: User = { id: "user1", name: "Player1", isHost: false };
			const user2: User = { id: "user2", name: "Player2", isHost: false };
			const user3: User = { id: "user3", name: "Player3", isHost: false };

			let state = gameUpdater({ type: "UserEntered", user: user1 }, gameState);
			state = gameUpdater({ type: "UserEntered", user: user2 }, state);
			state = gameUpdater({ type: "UserEntered", user: user3 }, state);

			const hostUser = state.users.find((u) => u.isHost)!;
			state = gameUpdater({ type: "start-set", user: hostUser }, state);

			// Submit clues
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

			// Mark no invalid clues
			const checker = state.users.find((u) => u.id === state.currentChecker)!;
			state = gameUpdater(
				{ type: "mark-invalid-clues", invalidClues: [], user: checker },
				state,
			);

			stateReadyForGuessing = state;
		});

		it("should handle correct guess", () => {
			const guesser = stateReadyForGuessing.users.find(
				(u) => u.id === stateReadyForGuessing.currentGuesser,
			)!;
			const action: ServerAction = {
				type: "submit-guess",
				guess: stateReadyForGuessing.currentWord!,
				user: guesser,
			};

			const newState = gameUpdater(action, stateReadyForGuessing);

			expect(newState.lastGuessCorrect).toBe(true);
			expect(newState.setScore).toBe(1);
			expect(newState.gamesAttempted).toBe(1);
			expect(newState.gamePhase).toBe("round-end");
		});

		it("should handle incorrect guess", () => {
			const guesser = stateReadyForGuessing.users.find(
				(u) => u.id === stateReadyForGuessing.currentGuesser,
			)!;
			const action: ServerAction = {
				type: "submit-guess",
				guess: "wrongguess",
				user: guesser,
			};

			const newState = gameUpdater(action, stateReadyForGuessing);

			expect(newState.lastGuessCorrect).toBe(false);
			expect(newState.setScore).toBe(0);
			expect(newState.gamesAttempted).toBe(1);
			expect(newState.gamePhase).toBe("round-end");
		});

		it("should not allow non-guesser to submit guess", () => {
			const nonGuesser = stateReadyForGuessing.users.find(
				(u) => u.id !== stateReadyForGuessing.currentGuesser,
			)!;
			const action: ServerAction = {
				type: "submit-guess",
				guess: stateReadyForGuessing.currentWord!,
				user: nonGuesser,
			};

			const newState = gameUpdater(action, stateReadyForGuessing);

			expect(newState).toEqual(stateReadyForGuessing);
		});

		it("should end set when target reached", () => {
			// Set up state with target close to completion
			const stateNearEnd = {
				...stateReadyForGuessing,
				setTarget: 1,
				gamesAttempted: 0,
			};

			const guesser = stateNearEnd.users.find(
				(u) => u.id === stateNearEnd.currentGuesser,
			)!;
			const action: ServerAction = {
				type: "submit-guess",
				guess: stateNearEnd.currentWord!,
				user: guesser,
			};

			const newState = gameUpdater(action, stateNearEnd);

			expect(newState.gamePhase).toBe("set-end");
			expect(newState.setHistory).toHaveLength(1);
			expect(newState.setHistory[0].completed).toBe(true);
		});
	});

	describe("Host Actions", () => {
		let stateWithHost: GameState;

		beforeEach(() => {
			const user1: User = { id: "user1", name: "Player1", isHost: false };
			const user2: User = { id: "user2", name: "Player2", isHost: false };

			stateWithHost = gameUpdater(
				{ type: "UserEntered", user: user1 },
				gameState,
			);
			stateWithHost = gameUpdater(
				{ type: "UserEntered", user: user2 },
				stateWithHost,
			);
		});

		it("should allow host to end session", () => {
			const host = stateWithHost.users.find((u) => u.isHost)!;
			const action: ServerAction = { type: "end-session", user: host };

			const newState = gameUpdater(action, stateWithHost);

			expect(newState.gamePhase).toBe("lobby");
			expect(newState.users).toEqual([]);
			expect(newState.hostId).toBeNull();
		});

		it("should not allow non-host to end session", () => {
			const nonHost = stateWithHost.users.find((u) => !u.isHost)!;
			const action: ServerAction = { type: "end-session", user: nonHost };

			const newState = gameUpdater(action, stateWithHost);

			expect(newState).toEqual(stateWithHost);
		});

		it("should allow host to remove player", () => {
			const host = stateWithHost.users.find((u) => u.isHost)!;
			const playerToRemove = stateWithHost.users.find((u) => !u.isHost)!;
			const action: ServerAction = {
				type: "remove-player",
				playerId: playerToRemove.id,
				user: host,
			};

			const newState = gameUpdater(action, stateWithHost);

			expect(newState.users).toHaveLength(1);
			expect(
				newState.users.find((u) => u.id === playerToRemove.id),
			).toBeUndefined();
		});

		it("should allow host to update settings", () => {
			const host = stateWithHost.users.find((u) => u.isHost)!;
			const action: ServerAction = {
				type: "update-settings",
				settings: { setTarget: 15, timersEnabled: true },
				user: host,
			};

			const newState = gameUpdater(action, stateWithHost);

			expect(newState.gameSettings.setTarget).toBe(15);
			expect(newState.gameSettings.timersEnabled).toBe(true);
		});
	});

	describe("Word Management", () => {
		it("should not reuse words until all are exhausted", () => {
			// Create a game with a small word list
			const customGameState = {
				...initialGame(),
				wordList: ["word1", "word2", "word3"],
			};

			// Set up users
			const user1: User = { id: "user1", name: "Player1", isHost: false };
			const user2: User = { id: "user2", name: "Player2", isHost: false };
			const user3: User = { id: "user3", name: "Player3", isHost: false };

			let state = gameUpdater(
				{ type: "UserEntered", user: user1 },
				customGameState,
			);
			state = gameUpdater({ type: "UserEntered", user: user2 }, state);
			state = gameUpdater({ type: "UserEntered", user: user3 }, state);

			// Start set
			const host = state.users.find((u) => u.isHost)!;
			state = gameUpdater({ type: "start-set", user: host }, state);

			const firstWord = state.currentWord;
			expect(state.usedWords).toContain(firstWord);

			// Pass word to get next word
			state = gameUpdater({ type: "pass-word", user: host }, state);

			const secondWord = state.currentWord;
			expect(secondWord).not.toBe(firstWord);
			expect(state.usedWords).toContain(secondWord);
		});
	});

	describe("Pass Word Functionality", () => {
		let gameInProgress: GameState;

		beforeEach(() => {
			const user1: User = { id: "user1", name: "Player1", isHost: false };
			const user2: User = { id: "user2", name: "Player2", isHost: false };
			const user3: User = { id: "user3", name: "Player3", isHost: false };

			let state = gameUpdater({ type: "UserEntered", user: user1 }, gameState);
			state = gameUpdater({ type: "UserEntered", user: user2 }, state);
			state = gameUpdater({ type: "UserEntered", user: user3 }, state);

			const hostUser = state.users.find((u) => u.isHost)!;
			gameInProgress = gameUpdater(
				{ type: "start-set", user: hostUser },
				state,
			);
		});

		it("should allow host to pass word", () => {
			const host = gameInProgress.users.find((u) => u.isHost)!;
			const originalWord = gameInProgress.currentWord;
			const action: ServerAction = { type: "pass-word", user: host };

			const newState = gameUpdater(action, gameInProgress);

			expect(newState.currentWord).not.toBe(originalWord);
			expect(newState.gamesAttempted).toBe(1);
			expect(newState.gamePhase).toBe("writing-clues");
		});

		it("should end set if passing word reaches target", () => {
			const stateNearEnd = {
				...gameInProgress,
				setTarget: 1,
				gamesAttempted: 0,
			};

			const host = stateNearEnd.users.find((u) => u.isHost)!;
			const action: ServerAction = { type: "pass-word", user: host };

			const newState = gameUpdater(action, stateNearEnd);

			expect(newState.gamePhase).toBe("set-end");
			expect(newState.setHistory).toHaveLength(1);
			expect(newState.setHistory[0].completed).toBe(true);
		});
	});

	describe("Next Round", () => {
		let roundEndState: GameState;

		beforeEach(() => {
			// Create a state at round end
			const user1: User = { id: "user1", name: "Player1", isHost: false };
			const user2: User = { id: "user2", name: "Player2", isHost: false };
			const user3: User = { id: "user3", name: "Player3", isHost: false };

			let state = gameUpdater({ type: "UserEntered", user: user1 }, gameState);
			state = gameUpdater({ type: "UserEntered", user: user2 }, state);
			state = gameUpdater({ type: "UserEntered", user: user3 }, state);

			const host = state.users.find((u) => u.isHost)!;
			state = gameUpdater({ type: "start-set", user: host }, state);

			roundEndState = {
				...state,
				gamePhase: "round-end",
				setScore: 1,
				gamesAttempted: 1,
			};
		});

		it("should start next round with rotated guesser", () => {
			const host = roundEndState.users.find((u) => u.isHost)!;
			const currentGuesser = roundEndState.currentGuesser;
			const action: ServerAction = { type: "next-round", user: host };

			const newState = gameUpdater(action, roundEndState);

			expect(newState.gamePhase).toBe("writing-clues");
			expect(newState.currentGuesser).not.toBe(currentGuesser);
			expect(newState.submittedClues).toEqual({});
			expect(newState.validClues).toEqual([]);
			expect(newState.lastGuess).toBeNull();
			expect(newState.lastGuessCorrect).toBeNull();
		});

		it("should not allow non-host to start next round", () => {
			const nonHost = roundEndState.users.find((u) => !u.isHost)!;
			const action: ServerAction = { type: "next-round", user: nonHost };

			const newState = gameUpdater(action, roundEndState);

			expect(newState).toEqual(roundEndState);
		});
	});
});
