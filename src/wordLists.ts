// Word list index for Just One game
// This file contains metadata for all available word lists

export interface WordListMetadata {
	id: string;
	name: string;
	description: string;
	version: string;
	filename: string;
	wordCount: number;
	language: string;
}

// Available word lists
export const WORD_LISTS: WordListMetadata[] = [
	{
		id: "default-en-v1",
		name: "Default English",
		description: "Standard English word list with common nouns",
		version: "1.0",
		filename: "wordlist-default-en-v1.txt",
		wordCount: 111,
		language: "en",
	},
	{
		id: "basic-en-v1",
		name: "Basic English",
		description: "Simple English words for beginners",
		version: "1.0",
		filename: "wordlist-basic-en-v1.txt",
		wordCount: 50,
		language: "en",
	},
];

// Get word list by ID
export const getWordList = (id: string): WordListMetadata | undefined => {
	return WORD_LISTS.find((list) => list.id === id);
};

// Get default word list
export const getDefaultWordList = (): WordListMetadata => {
	return WORD_LISTS[0]; // Default to first word list
};
