# Game Design - Just One

## Game Overview
Just One is a cooperative party game for 3-8 players where teamwork and creativity are key to success!

## Game Terminology

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

## How to Play Just One

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

## Game Flow

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

## Host Management

- **Host Assignment**: The first player to join the room automatically becomes the host
- **Host Transfer**: If the host leaves the game, the next player in the list becomes the new host
- **Host Indicators**: The UI clearly shows who the current host is with special badges/icons
- **Emergency Controls**: Host can pause the round, kick disruptive players, or end sets if needed
- **Settings Access**: Only the host can modify game settings like target score or time limits

## Feature Ideas

Want to extend Just One? Here are some ideas:

### Core Game Features
- **Difficulty Levels**: Categorize words by difficulty and let players choose
- **Team vs Team**: Split into competing teams
- **Time Pressure**: Add countdown timers for clue writing and guessing
- **Score Targets**: Set specific score goals for different game lengths
- **Custom Word Lists**: Allow players to upload their own word lists
- **Hint System**: Give the guesser one extra clue if they're struggling

### QR Code & Joining Features
- **Custom Game Codes**: Allow hosts to set memorable game codes
- **Game Code History**: Remember recently joined games
- **Invitation Links**: Generate shareable URLs that automatically join games
- **NFC Support**: Add Near Field Communication for quick joining
- **Game Discovery**: Show public games that others can join
- **Private/Public Modes**: Toggle between private (code-only) and discoverable games

### Social Features
- **Player Profiles**: User avatars and statistics
- **Friends System**: Add and invite friends to games
- **Game Replay**: Review past game sessions and funny clues
- **Leaderboards**: Track best scores across multiple games
