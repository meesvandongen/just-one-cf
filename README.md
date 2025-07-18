# � Just One - Multiplayer Word Guessing Game

## A cooperative word-guessing party game built with PartyKit!

**Just One** is a fun, cooperative word-guessing game where players work together to help one player guess a mystery word using single-word clues. The twist? Duplicate clues are eliminated, so players must be creative and think uniquely!

This multiplayer implementation is built using [Next.js](https://nextjs.org/) for the client and [Cloudflare PartyKit](https://github.com/cloudflare/partykit) for real-time multiplayer functionality.

## 📚 Game Terminology

Understanding the game structure:

- **Session**: The entire multiplayer experience from when players first join until everyone leaves or the host ends the session
- **Set**: A complete playthrough with a target number of words (e.g., trying to guess 20 words total)
- **Round**: A single word-guessing attempt (one word, clues, and one guess)
- **Game**: Synonym for "round" - one word-guessing attempt

**Example Flow:**
1. **Session Starts**: Players join the lobby using game codes/QR codes
2. **Set 1 Begins**: Host starts the first set (target: 20 words)
3. **Round 1**: Players guess the first word ("ocean" → success!)
4. **Round 2**: Players guess the second word ("bicycle" → failed)
5. **...Rounds 3-20**: Continue until set target is reached
6. **Set 1 Ends**: Score displayed (e.g., 15/20 correct)
7. **Set 2 Begins**: Host can start a new set with fresh score
8. **Session Ends**: Host ends session or all players leave

## 🎮 How to Play Just One

### Game Overview
Just One is a cooperative party game for 3-8 players where teamwork and creativity are key to success!

### Setup
- **Players**: 3-8 players (recommended: 4-6)
- **Game Host**: The first player to join becomes the host and has special privileges
- **Joining Games**: Players can join by scanning a QR code or entering an 8-digit game code
- **Objective**: Work together as a team to guess as many words as possible
- **Duration**: 15-30 minutes per game

### Joining a Game

**For the Host (Game Creator):**
- When you create a game, you'll see a QR code and an 8-digit game code
- Share either the QR code or the 8-digit code with other players
- The game lobby will show all joined players

**For Other Players:**
- **QR Code**: Use your device's camera to scan the host's QR code
- **Manual Entry**: Enter the 8-digit game code in the input fields
- **Camera Button**: Tap to activate QR code scanning mode

### Game Code System
- Each game generates a unique 8-digit alphanumeric code (e.g., `ABC12DEF`)
- Codes are case-insensitive for easier entry
- Codes remain valid for the entire game session
- New codes are generated when a game is restarted

### Game Host Responsibilities
The game host has exclusive control over these actions:
- **Start Set**: Begin a new set (series of word-guessing rounds)
- **End Session**: Terminate the entire session and kick all players
- **Kick Players**: Remove disruptive players from the session
- **End Set**: Terminate the current set early and show results
- **End Round**: Skip the current word/round and move to next
- **Game Settings**: Adjust set parameters (word count target, time limits, etc.)
- **Next Round**: Force advance to the next word if needed
- **Pause/Resume**: Pause the current round temporarily

Other players can suggest these actions, but only the host can execute them.

### Game Rules

#### Round Structure (Single Word)
1. **Choose a Guesser**: One player becomes the "Guesser" for this round
2. **Reveal the Word**: All other players can see the mystery word, but the Guesser cannot
3. **Write Clues**: Each non-guessing player writes exactly ONE word as a clue on their device
4. **Eliminate Duplicates**: Any identical clues are automatically removed from the round
5. **Present Clues**: The Guesser sees all remaining (unique) clues
6. **Make a Guess**: The Guesser has ONE attempt to guess the word
7. **Score**: The team scores a point if the guess is correct, then moves to the next round

#### Clue Writing Rules
- **One Word Only**: Clues must be exactly one word (no phrases, no hyphenated words)
- **No Variants**: Can't use plural/singular forms of the mystery word or obvious derivatives
- **No Proper Nouns**: Generally avoid names of people, places, brands, etc.
- **No Numbers**: Stick to words, not numerical clues
- **Be Creative**: Think of unique angles since duplicate clues will be eliminated!

#### Winning Conditions
- **Cooperative Gameplay**: The team works together to score as many points as possible in each set
- **Set Target**: A typical set aims for 20 words, try to guess 13+ for an excellent score
- **Set Scoring**: 8-10 correct = Good, 11-12 = Very Good, 13+ = Excellent
- **Multiple Sets**: After completing a set, the host can start a new set to play again

#### Special Situations
- **Invalid Clues**: Clues that break the rules are eliminated (same as duplicates)
- **Pass Option**: The Guesser can choose to pass if the clues are too confusing
- **Time Limit**: Optional 60-second time limit for writing clues and guessing

### Strategy Tips
- **Think Uniquely**: Avoid obvious clues that others might write
- **Consider Connections**: Think about less obvious associations with the word
- **Avoid Categories**: Don't just name the category the word belongs to
- **Be Specific**: Sometimes a very specific clue is better than a general one

## Getting Started

First, install dependencies using npm install.

Then, run the client's development server using npm run dev.

In a different terminal, start the server using npm run dev:server.

Open http://localhost:3000 with your browser to see the result.

## Modifying the code

The code of this project implements the Just One game logic. The main files you might want to modify are:

- `/src/components/Game.tsx` - The frontend game interface showing the current game state, clue submission, and guessing interface
- `/game/logic.ts` - Contains all the game logic including game states, actions, and the game update logic
- `/src/wordlist.txt` - The word list used for the game (one word per line)

### The `GameState` interface

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

### The `GameAction` type

Actions available in Just One:

- **Player actions** (available to all players):
  - `join-session`: Join a session using a game code
  - `submit-clue`: Submit a one-word clue
  - `submit-guess`: Make a guess for the current word
  
- **Host-only actions** (restricted to game host):
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

### The `gameUpdater` function

This function handles all the game logic for Just One and enforces host permissions:

**Player Actions** (available to all players):
- **join-session**: Validates game code and adds player to the session
- **submit-clue**: Processes clue submissions and checks for duplicates
- **submit-guess**: Evaluates the guess and updates the set score (only for current guesser)

**Host-Only Actions** (restricted to game host):
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

### The `useGameRoom` hook

On the client side, we use this essential hook that provides us with two key things:

- `gameState` - The current `GameState` for this room, automatically synchronized across all players
- `dispatch` - A function that allows the client to send `GameActions` to the server

You can use the `gameState` to visualize your game and show different interfaces based on the current game phase and player role.

The `dispatch` function is the only way to communicate with the server. It sends any of your defined `GameActions`. You do not need to send the `user` field as that is automatically handled on the server.

#### What happens when you dispatch an action?

When you dispatch an action, here's the complete flow:

1. **Client to Server**: The action is sent from the client to the server
2. **User Augmentation**: On the server, the action is augmented with the user information (who performed the action)
3. **Game Logic**: The server passes the augmented action to the `gameUpdater` function, which returns a new `GameState`
4. **Broadcast**: The new `GameState` is automatically broadcast to all clients in the room
5. **UI Update**: All clients receive the updated state and re-render their interfaces accordingly
6. **Wait for Next Action**: The server waits for the next action to be dispatched

This creates a real-time, synchronized multiplayer experience where all players see updates instantly.

### React Component Structure

The main `Game.tsx` component receives the `gameState` and renders different interfaces based on:

- **Connection Status**: Different UI for joining vs. already in game
- **Game Phase**: Different UI for waiting, writing clues, reviewing clues, guessing, etc.
- **Player Role**: Different views for the guesser vs. clue-writers
- **Host Status**: Additional controls and options for the game host
- **User Permissions**: Only allow relevant actions based on current state and role

### UI Components for Game Joining

**JoinGameView Component:**
This component provides the interface for players to join a session either by scanning a QR code or manually entering the 8-digit game code. It includes a camera button for QR scanning and input fields for manual code entry.

**LobbyView Component:**
The lobby displays the QR code and game code for sharing, shows the list of joined players, and provides host controls for starting the set. The host can also kick players if needed.

### Data Flow Architecture

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

### QR Code & Game Code System

**Game Code Generation:**
- 8-digit alphanumeric codes (e.g., `ABC12DEF`) are generated when a game is created
- Codes use uppercase letters and numbers for clarity (avoiding similar characters like 0/O, 1/I)
- Each code is unique and maps to a specific game room

**QR Code Implementation:**
- QR codes encode the full join URL: `https://yourapp.com/join/ABC12DEF`
- Generated using libraries like `qrcode` or `react-qr-code`
- Displayed prominently in the lobby for easy scanning

**Code Input Interface:**
- 8 separate input fields for easy manual entry
- Auto-advance to next field on character input
- Paste support for full codes
- Real-time validation and formatting

**Technical Implementation:**
Game codes are generated server-side using a character set that avoids confusing characters like 0/O and 1/I. QR codes encode the full join URL and are generated using standard QR code libraries. The code input interface features 8 separate input fields with auto-advance functionality and paste support for better user experience.

### Game Flow

1. **Lobby Phase**: Players join the session, first player becomes host, host can start the first set
2. **Set Start**: Host initiates a set, first word is selected and shown to all players except the guesser
3. **Round Play**: 
   - **Clue Writing**: Non-guessing players submit one-word clues, host can pass word if needed
   - **Clue Review**: System eliminates duplicate clues and shows remaining clues
   - **Guessing**: The guesser sees the unique clues and makes their guess, or passes
   - **Round End**: Success/failure is displayed, set score updated
4. **Next Round**: New guesser is selected and the cycle continues with a new word
5. **Set Completion**: When target words are reached (or host ends set), final results are shown
6. **New Set**: Host can start a new set, or end the session

### Host Management

- **Host Assignment**: The first player to join the room automatically becomes the host
- **Host Transfer**: If the host leaves the game, the next player in the list becomes the new host
- **Host Indicators**: The UI clearly shows who the current host is with special badges/icons
- **Emergency Controls**: Host can pause the round, kick disruptive players, or end sets if needed
- **Settings Access**: Only the host can modify game settings like target score or time limits

### Word List

The game uses `/src/wordlist.txt` which should contain one word per line. You can customize this file with your own words of varying difficulty levels.

## Building Your Own Features

Want to extend Just One? Here are some ideas:

**Core Game Features:**
- **Difficulty Levels**: Categorize words by difficulty and let players choose
- **Team vs Team**: Split into competing teams
- **Time Pressure**: Add countdown timers for clue writing and guessing
- **Score Targets**: Set specific score goals for different game lengths
- **Custom Word Lists**: Allow players to upload their own word lists
- **Hint System**: Give the guesser one extra clue if they're struggling

**QR Code & Joining Features:**
- **Custom Game Codes**: Allow hosts to set memorable game codes
- **Game Code History**: Remember recently joined games
- **Invitation Links**: Generate shareable URLs that automatically join games
- **NFC Support**: Add Near Field Communication for quick joining
- **Game Discovery**: Show public games that others can join
- **Private/Public Modes**: Toggle between private (code-only) and discoverable games

**Social Features:**
- **Player Profiles**: User avatars and statistics
- **Friends System**: Add and invite friends to games
- **Game Replay**: Review past game sessions and funny clues
- **Leaderboards**: Track best scores across multiple games

Happy coding! Make it a party 🎈

## Migration from Original PartyKit

This project has been migrated from the original PartyKit to **Cloudflare PartyKit**. Here are the key changes:

### Dependencies Changed
- `partykit` → `partyserver` (in devDependencies)
- `partysocket` updated to latest version (^1.1.0)
- Added `wrangler` for deployment and development
- Added `@cloudflare/workers-types` for TypeScript support

### Configuration Changes
- `partykit.json` → `wrangler.toml`
- Server now runs on port 8787 (default Wrangler port) instead of 1999
- Durable Object bindings must be explicitly configured in `wrangler.toml`

### Server API Changes
- Import from `partyserver` instead of `partykit/server`
- Extend `Server` class instead of implementing `Party.Server`
- Constructor takes `(ctx: DurableObjectState, env: Env)` instead of `party: Party.Party`
- Use `this.name` instead of `party.id`
- Use `this.broadcast()` instead of `party.broadcast()`
- Export a default fetch handler using `routePartykitRequest`

### Client Changes
- Updated PartySocket configuration to use `party` parameter
- Uses kebab-case server names (e.g., "game-server" for `GameServer`)
- Updated default host to use port 8787

### Development Commands
- `npm run dev:server` now uses `wrangler dev` instead of `partykit dev`
- Both commands can run simultaneously for full-stack development

The migration maintains the same game logic and user experience while leveraging Cloudflare's infrastructure for better performance and scalability.

## Deployment

### Server Deployment
Deploy your PartyServer to Cloudflare Workers using the provided npm script.

### Client Deployment
For production, update your `NEXT_PUBLIC_SERVER_URL` environment variable to point to your deployed PartyServer URL, then deploy your Next.js application to your preferred hosting platform (Vercel, Netlify, Cloudflare Pages, etc.).
