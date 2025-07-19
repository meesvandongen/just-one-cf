import usePartySocket from "partysocket/react";
import { useEffect, useRef, useState } from "react";
import { Action, GameState } from "../../party/logic";

export const useGameRoom = (username: string, roomId: string) => {
	const [gameState, setGameState] = useState<GameState | null>(null);
	const previousLogLength = useRef<number>(0);

	const socket = usePartySocket({
		party: "game-server", // kebab-case version of GameServer
		room: roomId,
		id: username,

		onMessage(event: MessageEvent<string>) {
			const newGameState: GameState = JSON.parse(event.data);
			setGameState(newGameState);
		},
	});

	// Log new game log messages to browser console
	useEffect(() => {
		if (gameState && gameState.log.length > previousLogLength.current) {
			const newLogEntries = gameState.log.slice(
				0,
				gameState.log.length - previousLogLength.current,
			);
			newLogEntries.forEach((logEntry) => {
				console.log(`[Game Log] ${logEntry.message}`);
			});
		}
		if (gameState) {
			previousLogLength.current = gameState.log.length;
		}
	}, [gameState]);

	const dispatch = (action: Action) => {
		socket.send(JSON.stringify(action));
	};

	return {
		gameState,
		dispatch,
	};
};
