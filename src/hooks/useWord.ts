// React hook for resolving word indexes to words
import { useEffect, useState } from "react";
import { getWordByIndex } from "../utils/wordLoader";

interface UseWordResult {
	word: string | null;
	loading: boolean;
	error: string | null;
}

/**
 * Hook to resolve a word index and word list ID to an actual word
 * @param wordListId The ID of the word list
 * @param wordIndex The index of the word (null if no word selected)
 * @returns Object with word, loading state, and error
 */
export const useWord = (
	wordListId: string | null,
	wordIndex: number | null,
): UseWordResult => {
	const [word, setWord] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!wordListId || wordIndex === null) {
			setWord(null);
			setLoading(false);
			setError(null);
			return;
		}

		setLoading(true);
		setError(null);

		getWordByIndex(wordListId, wordIndex)
			.then((resolvedWord) => {
				setWord(resolvedWord);
				setLoading(false);
			})
			.catch((err) => {
				console.error(`Failed to resolve word for index ${wordIndex}:`, err);
				setError(err.message || "Failed to load word");
				setWord(null);
				setLoading(false);
			});
	}, [wordListId, wordIndex]);

	return { word, loading, error };
};