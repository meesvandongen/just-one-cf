import { routePartykitRequest, Server } from "partyserver";

import { gameUpdater, initialGame, Action, ServerAction } from "../game/logic";
import { GameState } from "../game/logic";

import type { Connection, WSMessage } from "partyserver";

type Env = { 
  GameServer: DurableObjectNamespace<GameServer>;
};


export class GameServer extends Server<Env> {
  private gameState: GameState;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.gameState = initialGame();
    // Note: this.name is not available in constructor, will be set later by routePartykitRequest
    console.log("Room created");
    console.log("Room target", this.gameState.target);
  }

  onConnect(connection: Connection) {
    // A websocket just connected!
    console.log("Connection to room:", this.name, "from user:", connection.id);

    // let's send a message to the connection
    this.gameState = gameUpdater(
      { type: "UserEntered", user: { id: connection.id } },
      this.gameState
    );
    this.broadcast(JSON.stringify(this.gameState));
  }

  onClose(connection: Connection) {
    this.gameState = gameUpdater(
      {
        type: "UserExit",
        user: { id: connection.id },
      },
      this.gameState
    );
    this.broadcast(JSON.stringify(this.gameState));
  }

  onMessage(connection: Connection, message: WSMessage) {
    const action: ServerAction = {
      ...(JSON.parse(message as string) as Action),
      user: { id: connection.id },
    };
    console.log(`Received action ${action.type} from user ${connection.id}`);
    this.gameState = gameUpdater(action, this.gameState);
    this.broadcast(JSON.stringify(this.gameState));
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return (
      (await routePartykitRequest(request, env)) ||
      new Response("Not Found", { status: 404 })
    );
  }
} satisfies ExportedHandler<Env>;
