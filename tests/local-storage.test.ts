import { beforeEach, describe, expect, it } from "vitest";
import {
	clearSavedRoomCode,
	clearSavedUsername,
	getSavedRoomCode,
	getSavedUsername,
	saveRoomCode,
	saveUsername,
} from "../src/utils";

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};

	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value.toString();
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		},
	};
})();

Object.defineProperty(globalThis, "localStorage", {
	value: localStorageMock,
});

describe("Local Storage Utils", () => {
	beforeEach(() => {
		localStorageMock.clear();
	});

	describe("Room Code Management", () => {
		it("should save and retrieve valid room codes", () => {
			saveRoomCode("123456");
			expect(getSavedRoomCode()).toBe("123456");
		});

		it("should not save invalid room codes", () => {
			saveRoomCode("12345"); // Too short
			expect(getSavedRoomCode()).toBeNull();

			saveRoomCode("1234567"); // Too long
			expect(getSavedRoomCode()).toBeNull();

			saveRoomCode("12345a"); // Contains non-digit
			expect(getSavedRoomCode()).toBeNull();
		});

		it("should clear saved room codes", () => {
			saveRoomCode("123456");
			expect(getSavedRoomCode()).toBe("123456");

			clearSavedRoomCode();
			expect(getSavedRoomCode()).toBeNull();
		});

		it("should return null for invalid saved room codes", () => {
			// Manually set an invalid room code
			localStorageMock.setItem("just-one-room-code", "invalid");
			expect(getSavedRoomCode()).toBeNull();
		});
	});

	describe("Username Management", () => {
		it("should save and retrieve usernames", () => {
			saveUsername("TestPlayer");
			expect(getSavedUsername()).toBe("TestPlayer");
		});

		it("should trim whitespace when saving usernames", () => {
			saveUsername("  TestPlayer  ");
			expect(getSavedUsername()).toBe("TestPlayer");
		});

		it("should not save empty usernames", () => {
			saveUsername("");
			expect(getSavedUsername()).toBeNull();

			saveUsername("   ");
			expect(getSavedUsername()).toBeNull();
		});

		it("should clear saved usernames", () => {
			saveUsername("TestPlayer");
			expect(getSavedUsername()).toBe("TestPlayer");

			clearSavedUsername();
			expect(getSavedUsername()).toBeNull();
		});

		it("should handle missing usernames gracefully", () => {
			expect(getSavedUsername()).toBeNull();
		});
	});
});
