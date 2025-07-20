# Just One - Multiplayer Guessing Game

A cooperative word-guessing party game where players work together to help one player guess a mystery word using single-word clues. The twist? Duplicate clues are eliminated, so players must be creative and think uniquely!

Built with [Vite](https://vitejs.dev/) + [React](https://reactjs.org/) and [Cloudflare PartyKit](https://github.com/cloudflare/partykit) for real-time multiplayer functionality.

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open http://localhost:3000 to play!

## Key Features

- **Real-time multiplayer** using Cloudflare PartyKit
- **QR code joining** for easy mobile access
- **Host controls** for game management
- **Cooperative gameplay** for 3-8 players
- **Automatic duplicate elimination** of clues
- **Cross-platform** - works on phones, tablets, and desktop

## Documentation

📖 **[Game Design & Rules](docs/game-design.md)** - How to play Just One, game rules, terminology, and feature ideas

🔧 **[Technical Architecture](docs/technical-architecture.md)** - Code structure, API reference, and development guide

🏗️ **[Layout System](docs/layout-system.md)** - Responsive design and component architecture

🚀 **[Deployment Guide](docs/deployment.md)** - How to deploy to production (Cloudflare Workers + Vite hosting)

📦 **[Migration Guide](docs/migration-guide.md)** - Changes from original PartyKit to Cloudflare PartyKit

## Project Structure

- `/src/components/Game.tsx` - Main game interface
- `/game/logic.ts` - Core game logic and state management
- `/party/index.ts` - PartyKit server implementation
- `/src/wordlist.txt` - Game words (customizable)
- `/docs/` - Detailed documentation

Happy coding! Make it a party 🎈
