import type { Connection, WSMessage } from "partyserver";
import { routePartykitRequest, Server } from "partyserver";
import {
	Action,
	GameState,
	gameUpdater,
	initialGame,
	ServerAction,
} from "../game/logic";

type Env = {
	GameServer: any; // DurableObjectNamespace<GameServer> - using any to avoid type issues
};

export class GameServer extends Server<Env> {
	private gameState: GameState;

	constructor(ctx: any, env: Env) {
		// Using any for DurableObjectState to avoid type issues
		super(ctx, env);
		this.gameState = initialGame();
		// Note: this.name is not available in constructor, will be set later by routePartykitRequest
		console.log("Room created");
	}

	onConnect(connection: Connection) {
		// A websocket just connected!
		console.log("Connection to room:", this.name, "from user:", connection.id);

		// let's send a message to the connection
		this.gameState = gameUpdater(
			{
				type: "UserEntered",
				user: {
					id: connection.id,
					name: connection.id,
					isHost: false,
				},
			},
			this.gameState,
		);
		this.broadcast(JSON.stringify(this.gameState));
	}

	onClose(connection: Connection) {
		this.gameState = gameUpdater(
			{
				type: "UserExit",
				user: {
					id: connection.id,
					name: connection.id,
					isHost: false,
				},
			},
			this.gameState,
		);
		this.broadcast(JSON.stringify(this.gameState));
	}

	onMessage(connection: Connection, message: WSMessage) {
		const action: ServerAction = {
			...(JSON.parse(message as string) as Action),
			user: {
				id: connection.id,
				name: connection.id,
				isHost: false,
			},
		};
		console.log(`Received action ${action.type} from user ${connection.id}`);
		this.gameState = gameUpdater(action, this.gameState);
		this.broadcast(JSON.stringify(this.gameState));
	}
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		return (
			(await routePartykitRequest(request, env, {})) ||
			new Response("Not Found", { status: 404 })
		);
	},
};
