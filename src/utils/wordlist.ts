/**
 * Utility functions for loading and managing word lists on the client side
 */

// Default word lists that can be selected
export interface WordListOption {
	id: string;
	name: string;
	description: string;
	loadWords: () => Promise<string[]>;
}

// Load words from the included wordlist.txt file
const loadDefaultWordList = async (): Promise<string[]> => {
	try {
		const response = await fetch("/wordlist.txt");
		const text = await response.text();
		return text
			.trim()
			.split("\n")
			.filter((word) => word.trim().length > 0);
	} catch (error) {
		console.error("Failed to load default word list:", error);
		// Fallback to a basic word list if file loading fails
		return [
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
		];
	}
};

// Available word list options
export const WORD_LIST_OPTIONS: WordListOption[] = [
	{
		id: "default",
		name: "Default Word List",
		description: "Complete word list with 400k+ words",
		loadWords: loadDefaultWordList,
	},
	// Future: could add more word list options here
	// {
	//   id: 'basic',
	//   name: 'Basic Words',
	//   description: 'Simple, common words for beginners',
	//   loadWords: loadBasicWordList,
	// },
];

// Get a random selection of words from a word list
export const selectRandomWords = (words: string[], count: number): string[] => {
	if (words.length <= count) {
		return [...words];
	}

	const shuffled = [...words].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, count);
};

// Estimate how many words are needed for a game set
export const estimateWordsNeeded = (setTarget: number): number => {
	// Rough estimate: setTarget + some buffer for rounds that might fail
	// Each round uses 1 word, but some rounds might fail and need another word
	return Math.max(setTarget * 2, 50);
};
