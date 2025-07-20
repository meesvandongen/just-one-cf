// Client-side word loading utilities
// This module handles loading word lists from public files

import { getWordList, type WordListMetadata } from "../wordLists";

// Cache for loaded word lists to avoid repeated fetches
const wordListCache = new Map<string, string[]>();

/**
 * Load a word list from a public file
 * @param wordListId The ID of the word list to load
 * @returns Promise that resolves to an array of words
 */
export const loadWordList = async (wordListId: string): Promise<string[]> => {
	// Check cache first
	if (wordListCache.has(wordListId)) {
		return wordListCache.get(wordListId)!;
	}

	// Get metadata for the word list
	const metadata = getWordList(wordListId);
	if (!metadata) {
		throw new Error(`Word list with ID "${wordListId}" not found`);
	}

	try {
		// Fetch the word list file from public folder
		const response = await fetch(`/${metadata.filename}`);
		if (!response.ok) {
			throw new Error(
				`Failed to load word list: ${response.status} ${response.statusText}`,
			);
		}

		const text = await response.text();
		const words = text
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line.length > 0);

		// Validate word count matches metadata
		if (words.length !== metadata.wordCount) {
			console.warn(
				`Word count mismatch for ${wordListId}: expected ${metadata.wordCount}, got ${words.length}`,
			);
		}

		// Cache the result
		wordListCache.set(wordListId, words);
		return words;
	} catch (error) {
		console.error(`Error loading word list ${wordListId}:`, error);
		throw error;
	}
};

/**
 * Get a word by index from a loaded word list
 * @param wordListId The ID of the word list
 * @param index The index of the word to get
 * @returns Promise that resolves to the word at the given index
 */
export const getWordByIndex = async (
	wordListId: string,
	index: number,
): Promise<string> => {
	const words = await loadWordList(wordListId);
	
	if (index < 0 || index >= words.length) {
		throw new Error(
			`Index ${index} is out of range for word list ${wordListId} (length: ${words.length})`,
		);
	}
	
	return words[index];
};

/**
 * Preload a word list to improve performance
 * @param wordListId The ID of the word list to preload
 */
export const preloadWordList = async (wordListId: string): Promise<void> => {
	try {
		await loadWordList(wordListId);
	} catch (error) {
		console.warn(`Failed to preload word list ${wordListId}:`, error);
	}
};

/**
 * Clear the word list cache
 */
export const clearWordListCache = (): void => {
	wordListCache.clear();
};

/**
 * Get cache status for debugging
 */
export const getCacheStatus = (): { [key: string]: number } => {
	const status: { [key: string]: number } = {};
	for (const [id, words] of wordListCache.entries()) {
		status[id] = words.length;
	}
	return status;
};