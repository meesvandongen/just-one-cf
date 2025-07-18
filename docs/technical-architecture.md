# Technical Architecture

## Technology Stack

This multiplayer implementation is built using:
- [Next.js](https://nextjs.org/) for the client
- [Cloudflare PartyKit](https://github.com/cloudflare/partykit) for real-time multiplayer functionality

## Getting Started

First, install dependencies:
```bash
npm install
```

Then, run the client's development server:
```bash
npm run dev
```

In a different terminal, start the server:
```bash
npm run dev:server
```

Open http://localhost:3000 with your browser to see the result.

## Code Structure

The main files you might want to modify are:

- `/src/components/Game.tsx` - The frontend game interface showing the current game state, clue submission, and guessing interface
- `/game/logic.ts` - Contains all the game logic including game states, actions, and the game update logic
- `/src/wordlist.txt` - The word list used for the game (one word per line)

## GameState Interface

The GameState for Just One includes:

- `users` - List of players with their roles and submitted clues
- `hostId` - ID of the player who is the game host (has administrative privileges)
- `gameCode` - Unique 8-digit alphanumeric code for joining the session
- `currentWord` - The word that needs to be guessed (hidden from the guesser)
- `gamePhase` - Current phase: 'lobby', 'writing-clues', 'reviewing-clues', 'guessing', 'round-end', 'set-end'
- `currentGuesser` - ID of the player who is guessing this round
- `submittedClues` - All clues submitted by players for the current round
- `validClues` - Clues remaining after duplicate elimination
- `setScore` - Team's current score in this set
- `gamesAttempted` - Number of rounds attempted in the current set
- `setTarget` - Target number of words for the current set (default: 20)
- `setHistory` - Results from previous completed sets
- `gameSettings` - Configurable options (set targets, time limits, etc.)

## GameAction Type

Actions available in Just One:

### Player Actions (available to all players)
- `join-session`: Join a session using a game code
- `submit-clue`: Submit a one-word clue
- `submit-guess`: Make a guess for the current word

### Host-Only Actions (restricted to game host)
- `start-set`: Begin a new set
- `end-session`: Terminate the entire session
- `end-set`: End the current set early
- `end-round`: Skip the current word/round
- `kick-player`: Remove a player from the session
- `next-round`: Force advance to the next word
- `pass-word`: Allow skipping a difficult word
- `pause-game`/`resume-game`: Temporarily halt/continue progression
- `update-settings`: Modify set parameters

**Host Privileges**: Only the game host can execute host-only actions. If a non-host player attempts these actions, they will be ignored by the server.

**Action Clarifications**:
- `start-set`: Begins a new set (only available when no set is active)
- `end-session`: Terminates the entire session and removes all players  
- `end-set`: Ends the current set early and shows results
- `end-round`: Skips the current word and moves to the next round
- `next-round`: Forces progression to the next word (similar to end-round)

## The gameUpdater Function

This function handles all the game logic for Just One and enforces host permissions:

### Player Actions (available to all players)
- **join-session**: Validates game code and adds player to the session
- **submit-clue**: Processes clue submissions and checks for duplicates
- **submit-guess**: Evaluates the guess and updates the set score (only for current guesser)

### Host-Only Actions (restricted to game host)
- **start-set**: Initializes a new set, selects the first guesser, and draws the first word
- **end-session**: Terminates the entire session and removes all players
- **end-set**: Completes the current set early and shows final results
- **end-round**: Skips the current word and moves to the next round in the set
- **kick-player**: Removes a player from the session (with host transfer if needed)
- **next-round**: Advances to the next round with a new guesser and word
- **pass-word**: Allows skipping a difficult word (same as end-round)
- **pause-game/resume-game**: Temporarily halt/continue game progression
- **update-settings**: Modify set parameters like target word count or time limits

The function automatically handles:
- **Game Code Generation**: Creates unique 8-digit codes for new sessions
- **Code Validation**: Ensures entered codes are valid and session exists
- **Permission Validation**: Ensures only the host can execute administrative actions
- **Host Transfer**: If the host leaves, automatically promotes another player
- **Phase Transitions**: Manages flow between lobby, rounds, and set completion
- **Set Completion**: Detects when set target is reached and transitions to set-end phase
- **Duplicate Elimination**: Removes identical clues automatically
- **Score Tracking**: Maintains set score and round history

## The useGameRoom Hook

On the client side, we use this essential hook that provides us with two key things:

- `gameState` - The current `GameState` for this room, automatically synchronized across all players
- `dispatch` - A function that allows the client to send `GameActions` to the server

You can use the `gameState` to visualize your game and show different interfaces based on the current game phase and player role.

The `dispatch` function is the only way to communicate with the server. It sends any of your defined `GameActions`. You do not need to send the `user` field as that is automatically handled on the server.

### What happens when you dispatch an action?

When you dispatch an action, here's the complete flow:

1. **Client to Server**: The action is sent from the client to the server
2. **User Augmentation**: On the server, the action is augmented with the user information (who performed the action)
3. **Game Logic**: The server passes the augmented action to the `gameUpdater` function, which returns a new `GameState`
4. **Broadcast**: The new `GameState` is automatically broadcast to all clients in the room
5. **UI Update**: All clients receive the updated state and re-render their interfaces accordingly
6. **Wait for Next Action**: The server waits for the next action to be dispatched

This creates a real-time, synchronized multiplayer experience where all players see updates instantly.

## React Component Structure

The main `Game.tsx` component receives the `gameState` and renders different interfaces based on:

- **Connection Status**: Different UI for joining vs. already in game
- **Game Phase**: Different UI for waiting, writing clues, reviewing clues, guessing, etc.
- **Player Role**: Different views for the guesser vs. clue-writers
- **Host Status**: Additional controls and options for the game host
- **User Permissions**: Only allow relevant actions based on current state and role

## UI Components for Game Joining

### JoinGameView Component
This component provides the interface for players to join a session either by scanning a QR code or manually entering the 8-digit game code. It includes a camera button for QR scanning and input fields for manual code entry.

### LobbyView Component
The lobby displays the QR code and game code for sharing, shows the list of joined players, and provides host controls for starting the set. The host can also kick players if needed.

## Data Flow Architecture

The application follows a predictable data flow pattern similar to Redux:

1. **Single Source of Truth**: The `GameState` on the server is the single source of truth
2. **State is Read-Only**: Clients can only read the state, not modify it directly
3. **Changes via Actions**: State changes happen only through dispatched `GameActions`
4. **Pure Functions**: The `gameUpdater` function is pure - same input always produces same output
5. **Immutable Updates**: Each action returns a new `GameState` rather than mutating the existing one

This architecture ensures:
- **Consistency**: All players always see the same game state
- **Predictability**: Game logic is deterministic and testable
- **Debuggability**: You can trace exactly how the state changed through actions
- **Scalability**: Easy to add new features by adding new actions and state properties

## QR Code & Game Code System

### Game Code Generation
- 8-digit alphanumeric codes (e.g., `ABC12DEF`) are generated when a game is created
- Codes use uppercase letters and numbers for clarity (avoiding similar characters like 0/O, 1/I)
- Each code is unique and maps to a specific game room

### QR Code Implementation
- QR codes encode the full join URL: `https://yourapp.com/join/ABC12DEF`
- Generated using libraries like `qrcode` or `react-qr-code`
- Displayed prominently in the lobby for easy scanning

### Code Input Interface
- 8 separate input fields for easy manual entry
- Auto-advance to next field on character input
- Paste support for full codes
- Real-time validation and formatting

### Technical Implementation
Game codes are generated server-side using a character set that avoids confusing characters like 0/O and 1/I. QR codes encode the full join URL and are generated using standard QR code libraries. The code input interface features 8 separate input fields with auto-advance functionality and paste support for better user experience.

## Word List

The game uses `/src/wordlist.txt` which should contain one word per line. You can customize this file with your own words of varying difficulty levels.
