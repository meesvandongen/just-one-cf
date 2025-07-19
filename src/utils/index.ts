export const stringToColor = (value: string) => {
	let hash = 0;
	for (let i = 0; i < value.length; i++) {
		hash = value.charCodeAt(i) + ((hash << 5) - hash);
	}

	return `hsl(${hash % 360}, 85%, 35%)`;
};

export const isValidRoomCode = (code: string): boolean => {
	return /^\d{6}$/.test(code);
};

export const formatRoomCode = (code: string): string => {
	return code.replace(/\D/g, "").slice(0, 6);
};

// Local storage utilities for game state management
export const saveRoomCode = (roomCode: string): void => {
	if (isValidRoomCode(roomCode)) {
		localStorage.setItem("just-one-room-code", roomCode);
	}
};

export const getSavedRoomCode = (): string | null => {
	const saved = localStorage.getItem("just-one-room-code");
	return saved && isValidRoomCode(saved) ? saved : null;
};

export const clearSavedRoomCode = (): void => {
	localStorage.removeItem("just-one-room-code");
};

export const saveUsername = (username: string): void => {
	if (username.trim()) {
		localStorage.setItem("just-one-username", username.trim());
	}
};

export const getSavedUsername = (): string | null => {
	const saved = localStorage.getItem("just-one-username");
	return saved?.trim() || null;
};

export const clearSavedUsername = (): void => {
	localStorage.removeItem("just-one-username");
};
