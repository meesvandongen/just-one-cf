// util for easy adding logs
const addLog = (message: string, logs: GameState["log"]): GameState["log"] => {
	return [{ dt: new Date().getTime(), message: message }, ...logs].slice(
		0,
		MAX_LOG_SIZE,
	);
};

// Default word list for the game
const DEFAULT_WORD_LIST = [
	"ocean",
	"bicycle",
	"elephant",
	"coffee",
	"mountain",
	"guitar",
	"rainbow",
	"butterfly",
	"chocolate",
	"airplane",
	"sunset",
	"garden",
	"library",
	"pizza",
	"camera",
	"adventure",
	"friendship",
	"thunder",
	"keyboard",
	"lighthouse",
	"telescope",
	"sandwich",
	"volcano",
	"treasure",
	"whisper",
	"dinosaur",
	"festival",
	"laboratory",
	"spaceship",
	"waterfall",
	"magician",
	"symphony",
	"photograph",
	"universe",
	"carnival",
	"paintbrush",
	"discovery",
	"moonlight",
	"poetry",
	"compass",
	"fireworks",
	"meadow",
	"architect",
	"harmony",
	"hurricane",
	"sculpture",
	"invention",
	"starlight",
	"expedition",
	"castle",
	"dragon",
	"wizard",
	"princess",
	"knight",
	"forest",
	"crystal",
	"journey",
	"secret",
	"mystery",
	"adventure",
	"treasure",
	"island",
	"pirate",
	"ship",
	"storm",
	"legend",
	"magic",
	"spell",
	"potion",
	"sword",
	"shield",
	"crown",
	"diamond",
	"ruby",
	"emerald",
	"pearl",
	"golden",
	"silver",
	"bronze",
	"tower",
	"bridge",
	"river",
	"valley",
	"desert",
	"jungle",
	"mountain",
	"village",
	"cottage",
	"mansion",
	"palace",
	"temple",
	"church",
	"school",
	"hospital",
	"market",
	"bakery",
	"restaurant",
	"theater",
	"museum",
	"park",
];

// If there is anything you want to track for a specific user, change this interface
export interface User {
	id: string;
	name: string;
	isHost: boolean;
	submittedClue?: string;
	markedInvalidClues?: string[];
}

// Do not change this! Every game has a list of users and log of actions
interface BaseGameState {
	users: User[];
	log: {
		dt: number;
		message: string;
	}[];
}

// Do not change!
export type Action = DefaultAction | GameAction;

// Do not change!
export type ServerAction = WithUser<DefaultAction> | WithUser<GameAction>;

// The maximum log size, change as needed
const MAX_LOG_SIZE = 10;

type WithUser<T> = T & { user: User };

export type DefaultAction = { type: "UserEntered" } | { type: "UserExit" };

export type GamePhase =
	| "lobby"
	| "writing-clues"
	| "checking-duplicates"
	| "reviewing-clues"
	| "guessing"
	| "round-end"
	| "set-end";

export interface GameSettings {
	setTarget: number;
	timersEnabled: boolean;
	clueWritingTime: number;
	duplicateCheckingTime: number;
	guessingTime: number;
}

export interface TimerState {
	remaining: number;
	phase: GamePhase;
	enabled: boolean;
}

export interface SetResult {
	score: number;
	target: number;
	completed: boolean;
}

export interface ClueWithSubmitter {
	clue: string;
	submitterId: string;
	submitterName: string;
}

// This interface holds all the information about your game
export interface GameState extends BaseGameState {
	// Core game state
	hostId: string | null;
	currentWord: string | null;
	gamePhase: GamePhase;

	// Player roles
	currentGuesser: string | null;
	currentChecker: string | null;

	// Round state
	submittedClues: { [userId: string]: string };
	validClues: ClueWithSubmitter[];
	lastGuess: string | null;
	lastGuessCorrect: boolean | null;

	// Set tracking
	setScore: number;
	gamesAttempted: number;
	setTarget: number;
	setHistory: SetResult[];

	// Game settings
	gameSettings: GameSettings;

	// Timer state
	currentTimer: TimerState | null;

	// Word list
	wordList: string[];
	usedWords: string[];
}

// Load word list
const loadWordList = (): string[] => {
	// In a Cloudflare Workers environment, we use the default word list
	// In a full Node.js environment, you could load from a file
	return DEFAULT_WORD_LIST;
};

// This is how a fresh new game starts out, it's a function so you can make it dynamic!
export const initialGame = (): GameState => ({
	users: [],
	log: addLog("Game Created!", []),

	// Core game state
	hostId: null,
	currentWord: null,
	gamePhase: "lobby",

	// Player roles
	currentGuesser: null,
	currentChecker: null,

	// Round state
	submittedClues: {},
	validClues: [],
	lastGuess: null,
	lastGuessCorrect: null,

	// Set tracking
	setScore: 0,
	gamesAttempted: 0,
	setTarget: 20,
	setHistory: [],

	// Game settings
	gameSettings: {
		setTarget: 20,
		timersEnabled: false,
		clueWritingTime: 90,
		duplicateCheckingTime: 45,
		guessingTime: 90,
	},

	// Timer state
	currentTimer: null,

	// Word list
	wordList: loadWordList(),
	usedWords: [],
});

// Get a random word that hasn't been used
const getRandomWord = (wordList: string[], usedWords: string[]): string => {
	const availableWords = wordList.filter((word) => !usedWords.includes(word));
	if (availableWords.length === 0) {
		// If all words have been used, reset the used words list
		return wordList[Math.floor(Math.random() * wordList.length)];
	}
	return availableWords[Math.floor(Math.random() * availableWords.length)];
};

// Get the next player in rotation
const getNextPlayer = (
	users: User[],
	currentUserId: string | null,
): User | null => {
	if (users.length === 0) return null;

	if (!currentUserId) {
		return users[0];
	}

	const currentIndex = users.findIndex((user) => user.id === currentUserId);
	const nextIndex = (currentIndex + 1) % users.length;
	return users[nextIndex];
};

// Check if all non-guesser players have submitted clues
const allCluesSubmitted = (
	users: User[],
	currentGuesser: string | null,
	submittedClues: { [userId: string]: string },
): boolean => {
	const nonGuessers = users.filter((user) => user.id !== currentGuesser);
	return nonGuessers.every((user) => submittedClues[user.id]);
};

// Automatically remove duplicate clues
const removeDuplicateClues = (
	submittedClues: { [userId: string]: string },
	users: User[],
): ClueWithSubmitter[] => {
	const clueFrequency = new Map<string, Array<{ userId: string; clue: string }>>();

	// Count occurrences of each normalized clue and keep original versions with submitter info
	Object.entries(submittedClues).forEach(([userId, clue]) => {
		const normalizedClue = clue.toLowerCase().trim();
		if (!clueFrequency.has(normalizedClue)) {
			clueFrequency.set(normalizedClue, []);
		}
		clueFrequency.get(normalizedClue)!.push({ userId, clue });
	});

	// Return only clues that appear exactly once with submitter information
	const uniqueClues: ClueWithSubmitter[] = [];
	clueFrequency.forEach((submissions) => {
		if (submissions.length === 1) {
			const submission = submissions[0];
			const user = users.find((u) => u.id === submission.userId);
			uniqueClues.push({
				clue: submission.clue,
				submitterId: submission.userId,
				submitterName: user?.name || submission.userId,
			});
		}
	});

	return uniqueClues;
};

// Here are all the actions we can dispatch for a user
export type GameAction =
	// Player actions
	| { type: "join-session"; playerName: string }
	| { type: "submit-clue"; clue: string }
	| { type: "mark-invalid-clues"; invalidClues: string[] }
	| { type: "submit-guess"; guess: string }

	// Host-only actions
	| { type: "start-set" }
	| { type: "end-session" }
	| { type: "end-set" }
	| { type: "remove-player"; playerId: string }
	| { type: "next-round" }
	| { type: "pass-word" }
	| { type: "pause-game" }
	| { type: "resume-game" }
	| { type: "update-settings"; settings: Partial<GameSettings> }
	| { type: "update-timers"; timers: Partial<TimerState> }
	| { type: "extend-timer"; additionalTime: number }
	| { type: "timer-update"; timerState: TimerState };

export const gameUpdater = (
	action: ServerAction,
	state: GameState,
): GameState => {
	// Helper function to check if user is host
	const isHost = (userId: string): boolean => {
		return state.hostId === userId;
	};

	switch (action.type) {
		case "UserEntered": {
			const newUser: User = {
				...action.user,
				name: action.user.id, // Default name to user id
				isHost: state.users.length === 0, // First user becomes host
			};

			const newState = {
				...state,
				users: [...state.users, newUser],
				log: addLog(`${action.user.id} joined the game`, state.log),
			};

			// Set host if this is the first user
			if (state.users.length === 0) {
				newState.hostId = action.user.id;
			}

			return newState;
		}

		case "UserExit": {
			const exitingUser = state.users.find(
				(user) => user.id === action.user.id,
			);
			if (!exitingUser) return state;

			const remainingUsers = state.users.filter(
				(user) => user.id !== action.user.id,
			);
			let newHostId = state.hostId;

			// Transfer host if the host is leaving
			if (state.hostId === action.user.id && remainingUsers.length > 0) {
				newHostId = remainingUsers[0].id;
				remainingUsers[0].isHost = true;
			}

			return {
				...state,
				users: remainingUsers,
				hostId: newHostId,
				log: addLog(`${action.user.id} left the game`, state.log),
			};
		}

		case "join-session": {
			// For this starter, we'll just treat this like UserEntered with a custom name
			const joiningUser: User = {
				id: action.user.id,
				name: action.playerName,
				isHost: state.users.length === 0,
			};

			return {
				...state,
				users: [...state.users, joiningUser],
				hostId: state.users.length === 0 ? action.user.id : state.hostId,
				log: addLog(`${action.playerName} joined the session`, state.log),
			};
		}

		case "start-set": {
			if (
				!isHost(action.user.id) ||
				(state.gamePhase !== "lobby" && state.gamePhase !== "set-end")
			) {
				return state;
			}

			if (state.users.length < 3) {
				return {
					...state,
					log: addLog("Need at least 3 players to start", state.log),
				};
			}

			const firstGuesser = state.users[0];
			const currentWord = getRandomWord(state.wordList, state.usedWords);

			return {
				...state,
				gamePhase: "writing-clues",
				currentGuesser: firstGuesser.id,
				currentWord,
				usedWords: [...state.usedWords, currentWord],
				submittedClues: {},
				validClues: [],
				setScore: 0,
				gamesAttempted: 0,
				log: addLog(`Set started! Word: ${currentWord}`, state.log),
			};
		}

		case "submit-clue": {
			if (
				state.gamePhase !== "writing-clues" ||
				action.user.id === state.currentGuesser
			) {
				return state;
			}

			const newSubmittedClues = {
				...state.submittedClues,
				[action.user.id]: action.clue,
			};

			// Check if all clues are submitted
			if (
				allCluesSubmitted(state.users, state.currentGuesser, newSubmittedClues)
			) {
				const automaticallyFilteredClues =
					removeDuplicateClues(newSubmittedClues, state.users);
				const nextChecker = getNextPlayer(state.users, state.currentGuesser);

				return {
					...state,
					submittedClues: newSubmittedClues,
					validClues: automaticallyFilteredClues,
					gamePhase: "checking-duplicates",
					currentChecker: nextChecker?.id || null,
					log: addLog(
						"All clues submitted, checking for duplicates",
						state.log,
					),
				};
			}

			return {
				...state,
				submittedClues: newSubmittedClues,
				log: addLog(`${action.user.id} submitted a clue`, state.log),
			};
		}

		case "mark-invalid-clues": {
			if (
				state.gamePhase !== "checking-duplicates" ||
				action.user.id !== state.currentChecker
			) {
				return state;
			}

			const finalValidClues = state.validClues.filter(
				(clueWithSubmitter) => !action.invalidClues.includes(clueWithSubmitter.clue),
			);

			return {
				...state,
				validClues: finalValidClues,
				gamePhase: "guessing",
				log: addLog("Duplicate check complete, time to guess!", state.log),
			};
		}

		case "submit-guess": {
			if (
				state.gamePhase !== "guessing" ||
				action.user.id !== state.currentGuesser
			) {
				return state;
			}

			const isCorrect =
				action.guess.toLowerCase().trim() ===
				state.currentWord?.toLowerCase().trim();
			const newScore = isCorrect ? state.setScore + 1 : state.setScore;
			const newGamesAttempted = state.gamesAttempted + 1;

			// Check if set is complete
			if (newGamesAttempted >= state.setTarget) {
				const setResult: SetResult = {
					score: newScore,
					target: state.setTarget,
					completed: true,
				};

				return {
					...state,
					setScore: newScore,
					gamesAttempted: newGamesAttempted,
					lastGuess: action.guess,
					lastGuessCorrect: isCorrect,
					gamePhase: "set-end",
					setHistory: [...state.setHistory, setResult],
					log: addLog(
						`Set complete! Final score: ${newScore}/${state.setTarget}`,
						state.log,
					),
				};
			}

			// Continue to next round
			const nextGuesser = getNextPlayer(state.users, state.currentGuesser);
			const nextWord = getRandomWord(state.wordList, state.usedWords);

			return {
				...state,
				setScore: newScore,
				gamesAttempted: newGamesAttempted,
				lastGuess: action.guess,
				lastGuessCorrect: isCorrect,
				gamePhase: "round-end",
				log: addLog(
					`${isCorrect ? "Correct!" : "Incorrect."} Score: ${newScore}/${newGamesAttempted}`,
					state.log,
				),
			};
		}

		case "next-round": {
			if (!isHost(action.user.id)) {
				return state;
			}

			const nextGuesserForRound = getNextPlayer(
				state.users,
				state.currentGuesser,
			);
			const nextWordForRound = getRandomWord(state.wordList, state.usedWords);

			return {
				...state,
				gamePhase: "writing-clues",
				currentGuesser: nextGuesserForRound?.id || null,
				currentWord: nextWordForRound,
				usedWords: [...state.usedWords, nextWordForRound],
				submittedClues: {},
				validClues: [],
				lastGuess: null,
				lastGuessCorrect: null,
				log: addLog(`Next round started! Word: ${nextWordForRound}`, state.log),
			};
		}

		case "end-session":
			if (!isHost(action.user.id)) {
				return state;
			}

			return {
				...state,
				gamePhase: "lobby",
				users: [],
				hostId: null,
				log: addLog("Session ended by host", state.log),
			};

		case "end-set": {
			if (!isHost(action.user.id)) {
				return state;
			}

			const endSetResult: SetResult = {
				score: state.setScore,
				target: state.setTarget,
				completed: false,
			};

			return {
				...state,
				gamePhase: "set-end",
				setHistory: [...state.setHistory, endSetResult],
				log: addLog(
					`Set ended early. Score: ${state.setScore}/${state.gamesAttempted}`,
					state.log,
				),
			};
		}

		case "pass-word": {
			if (!isHost(action.user.id)) {
				return state;
			}

			const nextRoundGuesser = getNextPlayer(state.users, state.currentGuesser);
			const nextRoundWord = getRandomWord(state.wordList, state.usedWords);
			const newAttempted = state.gamesAttempted + 1;

			// Check if set is complete after skipping
			if (newAttempted >= state.setTarget) {
				const skipSetResult: SetResult = {
					score: state.setScore,
					target: state.setTarget,
					completed: true,
				};

				return {
					...state,
					gamesAttempted: newAttempted,
					gamePhase: "set-end",
					setHistory: [...state.setHistory, skipSetResult],
					log: addLog(
						`Word skipped. Set complete! Final score: ${state.setScore}/${state.setTarget}`,
						state.log,
					),
				};
			}

			return {
				...state,
				gamePhase: "writing-clues",
				currentGuesser: nextRoundGuesser?.id || null,
				currentWord: nextRoundWord,
				usedWords: [...state.usedWords, nextRoundWord],
				submittedClues: {},
				validClues: [],
				gamesAttempted: newAttempted,
				log: addLog("Word skipped, moving to next round", state.log),
			};
		}

		case "remove-player": {
			if (!isHost(action.user.id)) {
				return state;
			}

			const filteredUsers = state.users.filter(
				(user) => user.id !== action.playerId,
			);
			const adjustedState = {
				...state,
				users: filteredUsers,
				log: addLog(
					`${action.playerId} was removed from the session`,
					state.log,
				),
			};

			// Adjust game state if removed player had an active role
			if (state.currentGuesser === action.playerId) {
				const newGuesser = getNextPlayer(filteredUsers, action.playerId);
				adjustedState.currentGuesser = newGuesser?.id || null;
			}

			if (state.currentChecker === action.playerId) {
				const newChecker = getNextPlayer(filteredUsers, action.playerId);
				adjustedState.currentChecker = newChecker?.id || null;
			}

			return adjustedState;
		}

		case "update-settings":
			if (!isHost(action.user.id)) {
				return state;
			}

			return {
				...state,
				gameSettings: {
					...state.gameSettings,
					...action.settings,
				},
				log: addLog("Game settings updated", state.log),
			};

		default:
			return state;
	}
};
