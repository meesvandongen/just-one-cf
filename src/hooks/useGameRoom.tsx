import usePartySocket from "partysocket/react";
import { useState } from "react";
import { Action, GameState } from "../../game/logic";

export const useGameRoom = (username: string, roomId: string) => {
	const [gameState, setGameState] = useState<GameState | null>(null);

	const socket = usePartySocket({
		party: "game-server", // kebab-case version of GameServer
		room: roomId,
		id: username,

		onMessage(event: MessageEvent<string>) {
			setGameState(JSON.parse(event.data));
		},
	});

	const dispatch = (action: Action) => {
		socket.send(JSON.stringify(action));
	};

	return {
		gameState,
		dispatch,
	};
};
