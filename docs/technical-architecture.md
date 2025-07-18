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
- `gamePhase` - Current phase: 'lobby', 'writing-clues', 'checking-duplicates', 'reviewing-clues', 'guessing', 'round-end', 'set-end'
- `currentGuesser` - ID of the player who is guessing this round
- `currentChecker` - ID of the player who is checking for duplicates this round
- `submittedClues` - All clues submitted by players for the current round
- `validClues` - Clues remaining after both automatic and manual duplicate elimination
- `setScore` - Team's current score in this set
- `gamesAttempted` - Number of rounds attempted in the current set
- `setTarget` - Target number of words for the current set (default: 20)
- `setHistory` - Results from previous completed sets
- `gameSettings` - Configurable options (set targets, time limits, etc.)
- `timers` - Optional timer settings for each game phase
- `currentTimer` - Active timer state (remaining time, phase, enabled/disabled)

## GameAction Type

Actions available in Just One:

### Player Actions (available to all players)
- `join-session`: Join a session using a game code
- `submit-clue`: Submit a one-word clue
- `mark-invalid-clues`: Mark clues as invalid during the duplicate checking phase (only available to the selected checker)
- `submit-guess`: Make a guess for the current word

### Host-Only Actions (restricted to game host)
- `start-set`: Begin a new set
- `end-session`: Terminate the entire session
- `end-set`: End the current set early
- `end-round`: Skip the current word/round
- `remove-player`: Remove a player from the session
- `next-round`: Force advance to the next word
- `pass-word`: Allow skipping a difficult word
- `pause-game`/`resume-game`: Temporarily halt/continue progression
- `update-settings`: Modify set parameters
- `update-timers`: Configure timer settings for each phase (clue writing, duplicate checking, guessing)
- `extend-timer`: Add extra time to current phase if needed
- `timer-update`: Broadcast timer state to all players (host-only, automatic)

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
- **mark-invalid-clues**: Allows the selected checker to mark additional clues as invalid (only available during duplicate checking phase)
- **submit-guess**: Evaluates the guess and updates the set score (only for current guesser)

### Host-Only Actions (restricted to game host)
- **start-set**: Initializes a new set, selects the first guesser, and draws the first word
- **end-session**: Terminates the entire session and removes all players
- **end-set**: Completes the current set early and shows final results
- **end-round**: Skips the current word and moves to the next round in the set
- **remove-player**: Removes a player from the session (with host transfer if needed)
- **next-round**: Advances to the next round with a new guesser and word
- **pass-word**: Allows skipping a difficult word (same as end-round)
- **pause-game/resume-game**: Temporarily halt/continue game progression
- **update-settings**: Modify set parameters like target word count or time limits
- **update-timers**: Configure optional timer settings for each game phase
- **extend-timer**: Give players additional time during the current phase if needed
- **timer-update**: Broadcast current timer state to all players (automatic host action)

The function automatically handles:
- **Game Code Generation**: Creates unique 8-digit codes for new sessions
- **Code Validation**: Ensures entered codes are valid and session exists
- **Permission Validation**: Ensures only the host can execute administrative actions
- **Host Transfer**: If the host leaves, automatically promotes another player
- **Phase Transitions**: Manages flow between lobby, rounds, and set completion including the duplicate checking phase
- **Guesser Rotation**: Automatically selects the next player in sequence to be the guesser each round
- **Checker Selection**: Automatically selects the next player in rotation (who will be the guesser in the following round) to review clues for duplicates
- **Set Completion**: Detects when set target is reached and transitions to set-end phase
- **Duplicate Elimination**: Removes identical clues automatically, then allows manual review
- **Score Tracking**: Maintains set score and round history
- **Timer Management**: Host manages timer state and broadcasts updates to all players

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
- **Game Phase**: Different UI for waiting, writing clues, checking duplicates, reviewing clues, guessing, etc.
- **Player Role**: Different views for the guesser vs. clue-writers vs. duplicate checker
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

## Timer System Implementation

### Non-Distracting Timer Design
The timer system is designed to keep the game flowing without creating stress or pressure for players:

#### Timer UI Guidelines
- **Subtle Visual Indicators**: Use gentle progress bars or small countdown displays rather than large, prominent timers
- **Soft Color Transitions**: Avoid harsh red warnings; use calm color progressions (green → yellow → orange)
- **No Sudden Alerts**: No jarring sounds or pop-ups when time is running low
- **Graceful Auto-Advance**: When time expires, smoothly transition to the next phase without penalties
- **Progress-Based Display**: Show completion progress rather than countdown anxiety ("3 of 4 players submitted clues")

#### Stress-Free Timer Implementation
- **Chunked Time Display**: Update timer every 10 seconds to avoid anxiety-inducing countdown
  - 90s → "About 1 minute 30 seconds left"
  - 60s → "About 1 minute left" 
  - 30s → "About 30 seconds left"
  - 10s → Switch to precise countdown: "10, 9, 8..." for final urgency
- **Natural Language**: Use friendly phrases like "Plenty of time", "Getting close", "Almost done"
- **Progress Bar Alternative**: Visual fill/empty progress indicator instead of numbers
- **Contextual Messaging**: 
  - "Waiting for 2 more clues..." (focus on completion, not time pressure)
  - "Take your time thinking of a unique clue"
  - "Almost ready to reveal clues!"
- **Gentle Transitions**: Fade between time states rather than jarring updates

#### Timer Configuration
- **Flexible Durations**: Host can adjust timer lengths based on group preferences
  - **Clue Writing**: 60-90 seconds (adjustable 30-180s)
  - **Duplicate Checking**: 30-45 seconds (adjustable 15-90s) 
  - **Guessing**: 60-90 seconds (adjustable 30-180s)
- **Disable Option**: Timers can be completely disabled for casual play
- **Extension Capability**: Host can add extra time during any phase if needed

#### Implementation Considerations
- **Host-Based Processing**: Timer logic runs on the host's client to leverage serverless architecture efficiently
- **Timer Synchronization**: Host broadcasts timer updates to all players for synchronized experience
- **Host Override**: Host can manually advance phases or extend time as needed
- **Player Feedback**: Clear but unobtrusive indication of remaining time
- **Accessibility**: Support for users who may need additional time or have different needs

## Disconnect and Reconnect Handling

The game implements a robust disconnect/reconnect system designed around the assumption that players intend to return to the session.

### Core Disconnect Philosophy
- **Optimistic Continuity**: Players are expected to return, so their slot remains reserved
- **Graceful Degradation**: Game continues with disconnected players' slots preserved
- **Host Oversight**: Host has control over removing disconnected players when necessary
- **Seamless Rejoining**: Players can rejoin at any time using the same game code

### Player Disconnect Behavior

#### Automatic Slot Preservation
- **Game State Persistence**: Disconnected players remain in the `users` array with their role and progress intact
- **Round Participation**: Their turn in guesser/checker rotation is preserved
- **Clue Submissions**: Any submitted clues remain valid and visible
- **Score Tracking**: Their contributions to set score are maintained

#### Timer Considerations with Disconnected Players
- **Patient Timer Logic**: Timers wait for ALL players, including disconnected ones, assuming they will return
  - **Clue Writing Phase**: Timer waits for ALL players (connected + disconnected) to submit clues
  - **Duplicate Checking**: If checker is disconnected, timer waits indefinitely for their return
  - **Guessing Phase**: If guesser is disconnected, timer pauses and waits for their return
- **Progress Calculation**: "3 of 5 players submitted clues" counts ALL players, showing disconnected players as pending
- **Phase Completion**: Phases only complete when ALL players (including disconnected) have completed their actions OR host manually overrides

#### Guesser/Checker Role Handling
- **Disconnected Guesser**: 
  - Timer pauses and waits indefinitely for their return
  - Host receives notification: "Current guesser [Name] has disconnected. Game is waiting for their return."
  - Host options: "Skip Round", "Remove Player" (only then does game continue)
- **Disconnected Checker**: 
  - Duplicate checking phase pauses and waits for checker to return
  - Host can override: "Skip duplicate check" or "Remove player and auto-advance"
- **Future Roles**: Disconnected players remain in rotation, and game waits when it's their turn

### Host Disconnect Notifications

#### Real-Time Disconnect Alerts
When a player disconnects, the host receives an unobtrusive notification:

```
⚠️ [Player Name] has disconnected
└─ Remove from session? [Yes] [No]
   └─ They can still rejoin if you choose No
```

#### Notification Behavior
- **Non-Blocking**: Notifications don't interrupt game flow
- **Dismissible**: Host can dismiss without taking action
- **Persistent**: Notifications remain until host makes a decision
- **Contextual**: Different messages based on player's current role

#### Host Decision Options
- **Remove Player**: Permanently removes player from session (they can rejoin using the same game code)
- **Keep Slot**: Maintains player's slot for potential return
- **Auto-Dismiss**: Notifications auto-dismiss after 60 seconds, defaulting to "keep slot"

#### What Happens When a Player Gets Removed

##### During Different Game Phases
- **Lobby Phase**: 
  - Player is immediately removed from the session
  - Other players see "[Player] has been removed by the host"
  - No impact on game progression

- **Writing Clues Phase**:
  - Player's submitted clue (if any) is removed from the round
  - Progress updates immediately: "2 of 4 players submitted clues" (adjusted count)
  - Phase can complete with remaining players
  - If all remaining players have submitted, phase auto-advances

- **Checking Duplicates Phase**:
  - If removed player was the checker: Phase auto-completes with automatic duplicate removal only
  - If removed player was not the checker: Their clue (if submitted) is removed, checker continues normally
  - Progress updates to reflect new player count

- **Guessing Phase**:
  - If removed player was the guesser: Round immediately advances to next player in rotation
  - If removed player was not the guesser: No immediate impact, round continues normally
  - Any clues they submitted earlier in the round remain removed

##### Role Rotation Impact
- **Guesser Rotation**: Removed player is removed from rotation, next player in line becomes guesser
- **Checker Rotation**: Removed player is removed from rotation, rotation adjusts automatically
- **Future Rounds**: Removed player no longer participates in any future role assignments

##### Score and Progress Impact
- **Set Score**: No penalty for removing a player - team score remains unchanged
- **Round History**: Previous successful rounds where removed player participated remain counted
- **Target Adjustment**: Set target remains the same regardless of reduced player count

### Manual Player Management

#### Host Controls for Player Management
The host has access to manual player management tools at all times:

- **Player List Management**: 
  - View all players with connection status indicators
  - "Connected" (green dot), "Disconnected" (amber dot), "Removed" (red X)
- **Manual Removal**: 
  - Remove any player regardless of connection status
  - Confirm dialog: "Remove [Player Name]? They will not be able to rejoin this session."
- **Force Skip Turn**: 
  - Skip disconnected player's turn as guesser/checker
  - "Skip [Player Name]'s turn and continue to next player?"

#### Removing Players vs. Skipping Turns

##### Manual Removal (Remove)
- **Permanent Action**: Player is removed from the session but can rejoin using the same game code
- **Immediate Effect**: Player is removed from all rotations and game state
- **Progress Impact**: Game adjusts immediately to new player count
- **Notification**: All players see "[Player] has been removed from the session"

##### Skip Turn (Temporary)
- **Temporary Action**: Player remains in session but their current turn is skipped
- **Future Participation**: Player can still participate in future rounds when they reconnect
- **Rotation Preserved**: Player stays in guesser/checker rotation for subsequent rounds
- **Notification**: All players see "[Player]'s turn has been skipped"

##### When to Use Each Option
- **Use Remove**: When player has left permanently or is causing disruption
- **Use Skip**: When player is temporarily disconnected but expected to return
- **Host Guidance**: UI suggests "Skip Turn" for recent disconnects, "Remove" for longer absences

#### Player Management UI
```
Players (4/8)
├─ 🟢 Host (You)
├─ 🟢 Alice         [Remove]
├─ 🟠 Bob (disconnected) [Remove] [Skip Turn]
└─ 🟢 Charlie       [Remove]

[+ Invite More Players]
```

#### Removed Player Experience

##### Immediate Removal Response
When a player gets removed, they immediately receive:
```
┌─────────────────────────────────────┐
│ You have been removed from the game │
├─────────────────────────────────────┤
│ The host has removed you from this  │
│ session. You can rejoin using the   │
│ same game code if you'd like.       │
│                                     │
│ [Rejoin Game] [Start New Game] [Join Different Game] │
└─────────────────────────────────────┘
```

##### Post-Removal Experience
- **Rejoin Capability**: Player can immediately rejoin using the same game code
- **Fresh Start**: When rejoining, player is treated as a new participant
- **No Penalties**: No restrictions or penalties for being removed and rejoining

### Reconnection System

#### Seamless Rejoin Process
- **Same Game Code**: Players rejoin using the original 8-digit code
- **State Restoration**: Player rejoins exactly where they left off
- **Role Continuity**: All roles and progress are immediately restored
- **No Penalties**: No score deduction or role reassignment for disconnections

#### Reconnection User Experience
1. Player opens game URL or enters game code again
2. System recognizes returning player automatically
3. Game state loads showing current phase and their role
4. Player can immediately participate in current or next phase

#### Mid-Phase Reconnection
- **Writing Clues**: Can immediately submit clue if time remains
- **Checking Duplicates**: Can review and mark clues if they are the checker
- **Guessing**: Can make guess if they are the guesser and time remains
- **Between Phases**: Rejoins smoothly during transitions

### In-Game Invite System

#### Persistent Invite Access
Players have continuous access to invite new players during the game:

```
[Game Interface]
├─ Current Phase: Writing Clues
├─ [Your Clue Input]
└─ [⊕ Invite Players] ← Always visible button
```

#### Invite Modal/Overlay
When clicked, shows a non-disruptive overlay:

```
┌─────────────────────────────────────┐
│ Invite More Players                 │
├─────────────────────────────────────┤
│ Game Code: ABC12DEF                 │
│ [Copy Code] [Share Link]            │
│                                     │
│ [QR Code Display]                   │
│                                     │
│ Players can join at any time!       │
│ [Close]                             │
└─────────────────────────────────────┘
```

#### New Player Mid-Game Joining
- **Lobby Phase**: New players join normally and can participate from the start
- **Active Set**: New players join as observers initially
  - Automatically added to guesser rotation for next round
  - Can participate in clue writing immediately if round is active
- **Between Sets**: New players fully integrated for next set

### Technical Implementation

#### Connection State Management
```typescript
interface User {
  id: string;
  name: string;
  connected: boolean;          // Real-time connection status
  lastSeen: number;           // Timestamp of last activity
  sessionStartTime: number;   // When they first joined
  disconnectNotified: boolean; // Whether host has been notified of disconnect
}
```

#### New GameAction Types
```typescript
// Host actions for player management
| { type: 'remove-player'; playerId: string }
| { type: 'skip-player-turn'; playerId: string }
| { type: 'dismiss-disconnect-notification'; playerId: string }

// System actions for connection management
| { type: 'player-disconnected'; playerId: string }
| { type: 'player-reconnected'; playerId: string }
```

#### GameState Changes for Removed Players
```typescript
interface GameState {
  // ... existing properties
  pendingActions: {            // Actions waiting for disconnected players
    playerId: string;
    actionType: 'clue' | 'guess' | 'check';
    timeoutAt?: number;
  }[];
}
```

#### Remove Action Processing
When `remove-player` action is processed:

1. **Immediate State Changes**:
   - Player removed from `users` array
   - Any pending actions for that player are cleared
   - Progress counters recalculated

2. **Role-Specific Handling**:
   - **Current Guesser**: Advance to next player in rotation
   - **Current Checker**: Auto-complete duplicate checking phase
   - **Clue Writer**: Remove their clue if submitted, update progress

3. **Broadcast Changes**:
   - New game state sent to all remaining players
   - Removed player receives removal message with rejoin option
   - Host receives confirmation of successful removal

#### Timer Logic with Disconnections
- **Wait-for-All Logic**: Calculate total players including disconnected ones
- **Phase Completion**: Check if ALL players (connected + disconnected) have completed their actions
- **Auto-Advance Conditions**: Never auto-advance when disconnected players haven't completed their actions
- **Host Override Required**: Only manual host actions can skip disconnected players or advance phases early

### Error Recovery and Edge Cases

#### Host Disconnection
- **Host Transfer**: Automatic promotion of longest-connected player to host
- **Host Reconnection**: Original host can reclaim host status if rejoining within 5 minutes
- **Multiple Disconnections**: System handles cascading disconnections gracefully

#### Edge Case: Removing Players During Critical Moments

##### Host Gets Removed (Impossible Scenario)
- Host cannot remove themselves
- Only way for host to leave is voluntary departure, which triggers host transfer

##### Removed Player Was About to Win/Lose Round
- **Correct Guess Submitted**: If guesser submits correct guess then gets removed, the guess still counts
- **Timer Expires Simultaneously**: Remove action takes precedence over timer expiration
- **Mid-Action Remove**: Any action in progress when remove occurs is cancelled

##### Mass Removal Scenarios
- **Minimum Players**: Host cannot remove players if it would reduce game below minimum (typically 3 players)
- **Solo Host**: If only host and one other player remain, remove action shows warning about ending session
- **All Players Removed**: Impossible scenario - host cannot remove all players, would end session instead

##### Removed Player Had Special Items/State
- **Submitted Clues**: Removed from current round
- **Future Rotation**: Completely removed from all future role assignments
- **Persistent Data**: Any game history or statistics preserved for remaining players
- **Rejoin Status**: If they rejoin, they start fresh in the next available rotation slot

#### Network Issues
- **Connection Retries**: Automatic reconnection attempts with exponential backoff
- **State Synchronization**: Full state resync on successful reconnection
- **Partial Connectivity**: Handle cases where some players connect/disconnect repeatedly

#### Session Recovery
- **Persistent Sessions**: Game state maintained on server even with all players disconnected (up to 1 hour)
- **Mass Disconnection**: If all players disconnect, session enters "hibernation" mode
- **Revival Window**: Players can revive hibernated sessions by rejoining within the time limit
