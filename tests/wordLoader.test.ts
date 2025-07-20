import { describe, it, expect, beforeEach, vi } from "vitest";
import {
	loadWordList,
	getWordByIndex,
	clearWordListCache,
	getCacheStatus,
} from "../src/utils/wordLoader";

// Mock fetch
global.fetch = vi.fn();

describe("Word Loader", () => {
	beforeEach(() => {
		clearWordListCache();
		vi.resetAllMocks();
	});

	describe("loadWordList", () => {
		it("should load and cache word list successfully", async () => {
			const mockResponse = "word1\nword2\nword3\n";
			(fetch as any).mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(mockResponse),
			});

			const words = await loadWordList("default-en-v1");

			expect(words).toEqual(["word1", "word2", "word3"]);
			expect(fetch).toHaveBeenCalledWith("/wordlist-default-en-v1.txt");

			// Check caching
			const cacheStatus = getCacheStatus();
			expect(cacheStatus["default-en-v1"]).toBe(3);
		});

		it("should return cached result on second call", async () => {
			const mockResponse = "word1\nword2\nword3\n";
			(fetch as any).mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(mockResponse),
			});

			// First call
			await loadWordList("default-en-v1");

			// Second call should use cache
			const words = await loadWordList("default-en-v1");

			expect(words).toEqual(["word1", "word2", "word3"]);
			expect(fetch).toHaveBeenCalledTimes(1); // Only called once
		});

		it("should handle fetch errors", async () => {
			(fetch as any).mockRejectedValueOnce(new Error("Network error"));

			await expect(loadWordList("default-en-v1")).rejects.toThrow(
				"Network error",
			);
		});

		it("should handle HTTP errors", async () => {
			(fetch as any).mockResolvedValueOnce({
				ok: false,
				status: 404,
				statusText: "Not Found",
			});

			await expect(loadWordList("default-en-v1")).rejects.toThrow(
				"Failed to load word list: 404 Not Found",
			);
		});

		it("should handle invalid word list ID", async () => {
			await expect(loadWordList("invalid-id")).rejects.toThrow(
				'Word list with ID "invalid-id" not found',
			);
		});

		it("should filter empty lines and trim whitespace", async () => {
			const mockResponse = " word1 \n\nword2\n  \nword3  \n\n";
			(fetch as any).mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(mockResponse),
			});

			const words = await loadWordList("default-en-v1");

			expect(words).toEqual(["word1", "word2", "word3"]);
		});
	});

	describe("getWordByIndex", () => {
		beforeEach(() => {
			const mockResponse = "word1\nword2\nword3\n";
			(fetch as any).mockResolvedValue({
				ok: true,
				text: () => Promise.resolve(mockResponse),
			});
		});

		it("should return correct word by index", async () => {
			const word = await getWordByIndex("default-en-v1", 1);
			expect(word).toBe("word2");
		});

		it("should handle index 0", async () => {
			const word = await getWordByIndex("default-en-v1", 0);
			expect(word).toBe("word1");
		});

		it("should throw error for negative index", async () => {
			await expect(getWordByIndex("default-en-v1", -1)).rejects.toThrow(
				"Index -1 is out of range",
			);
		});

		it("should throw error for index too large", async () => {
			await expect(getWordByIndex("default-en-v1", 10)).rejects.toThrow(
				"Index 10 is out of range",
			);
		});
	});

	describe("cache management", () => {
		it("should clear cache correctly", async () => {
			const mockResponse = "word1\nword2\nword3\n";
			(fetch as any).mockResolvedValue({
				ok: true,
				text: () => Promise.resolve(mockResponse),
			});

			await loadWordList("default-en-v1");
			expect(getCacheStatus()["default-en-v1"]).toBe(3);

			clearWordListCache();
			expect(getCacheStatus()).toEqual({});
		});
	});
});