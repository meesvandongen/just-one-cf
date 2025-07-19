# Game Logic Tests

This directory contains comprehensive tests for the Just One game logic.

## Test Files

- `logic.test.ts` - Main test suite covering core game functionality
- `logic-edge-cases.test.ts` - Edge cases and error handling scenarios

## Test Coverage

The tests cover:

### Core Functionality
- ✅ Initial game state creation
- ✅ User management (join/leave/host transfer)
- ✅ Game flow (lobby → writing clues → checking duplicates → guessing → round end)
- ✅ Clue submission and validation
- ✅ Duplicate clue detection and removal
- ✅ Guessing logic with case-insensitive matching
- ✅ Set completion and scoring
- ✅ Player rotation (guesser, checker)
- ✅ Host-only actions (start/end game, remove players, settings)

### Edge Cases
- ✅ Invalid user actions (non-existent users, wrong game phase)
- ✅ Error handling (empty user lists, non-existent players)
- ✅ Word list management (exhausted words, reuse logic)
- ✅ State immutability
- ✅ Log management and size limits
- ✅ Player removal during active game
- ✅ Whitespace and case handling in guesses

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui
```

## Test Statistics
- **Total tests**: 44
- **Test files**: 2
- **Coverage**: All major game logic paths and edge cases

## Key Test Scenarios

### User Management
- First user becomes host automatically
- Host transfer when current host leaves
- Multiple users joining and leaving
- Custom player names via join-session

### Game Flow
- Minimum 3 players required to start
- Proper phase transitions
- Player role assignments (guesser, checker)
- Round progression and player rotation

### Clue Handling
- Non-guessers can submit clues
- Guesser cannot submit clues
- Automatic duplicate removal (case-insensitive)
- Manual invalid clue marking by checker

### Guessing
- Case-insensitive and whitespace-trimmed matching
- Score tracking and set progression
- Set completion logic
- Round end handling

### Host Controls
- Start/end sessions and sets
- Remove players mid-game
- Update game settings
- Skip words (pass-word functionality)

### Edge Cases
- Actions from non-existent users
- Invalid phase transitions
- Empty user lists
- Exhausted word lists
- State immutability verification
