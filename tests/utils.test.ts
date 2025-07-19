import { describe, expect, it } from "vitest";
import { formatRoomCode, isValidRoomCode } from "../src/utils";

describe("Room Code Utilities", () => {
	describe("isValidRoomCode", () => {
		it("should accept valid 6-digit numeric codes", () => {
			expect(isValidRoomCode("123456")).toBe(true);
			expect(isValidRoomCode("000000")).toBe(true);
			expect(isValidRoomCode("999999")).toBe(true);
		});

		it("should reject codes that are not 6 digits", () => {
			expect(isValidRoomCode("12345")).toBe(false);
			expect(isValidRoomCode("1234567")).toBe(false);
			expect(isValidRoomCode("")).toBe(false);
		});

		it("should reject codes with non-numeric characters", () => {
			expect(isValidRoomCode("12345A")).toBe(false);
			expect(isValidRoomCode("ABCDEF")).toBe(false);
			expect(isValidRoomCode("12-345")).toBe(false);
			expect(isValidRoomCode("123 456")).toBe(false);
		});
	});

	describe("formatRoomCode", () => {
		it("should remove non-digit characters", () => {
			expect(formatRoomCode("12AB34")).toBe("1234");
			expect(formatRoomCode("1-2-3-4-5-6")).toBe("123456");
			expect(formatRoomCode("abc123def456xyz")).toBe("123456");
		});

		it("should limit to 6 digits", () => {
			expect(formatRoomCode("1234567890")).toBe("123456");
			expect(formatRoomCode("123")).toBe("123");
		});

		it("should handle empty string", () => {
			expect(formatRoomCode("")).toBe("");
		});
	});
});
