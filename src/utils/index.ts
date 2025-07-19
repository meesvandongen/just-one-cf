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
