# Migration from Next.js to Vite and PartyKit Changes

This project has been migrated from Next.js to Vite and from the original PartyKit to **Cloudflare PartyKit**. Here are the key changes:

## Framework Migration: Next.js → Vite

### Dependencies Changed
- Removed `next` dependency
- Added `vite` and `@vitejs/plugin-react`
- Added `react-router-dom` for client-side routing
- Removed Next.js specific types

### Configuration Changes
- `next.config.js` → `vite.config.ts`
- Added `index.html` at project root

### Client Changes
- Updated PartySocket configuration to use `party` parameter
- Uses kebab-case server names (e.g., "game-server" for `GameServer`)
- **Updated to use same-domain connection with `/api/` prefix**
- **Removed VITE_SERVER_URL dependency** - now connects to same domain automatically
- **Environment Variables**: Changed from `process.env.NEXT_PUBLIC_*` to `import.meta.env.VITE_*`
- Created `src/main.tsx` as entry point
- Moved from pages-based routing to React Router

### File Structure Changes
- Removed `src/pages/` directory structure
- Created `src/App.tsx` for main application component
- Updated `src/components/Layout.tsx` to remove Next.js font imports
- All React components remain in `src/components/`

### Development & Build Commands
- Development: `npm run dev` (now uses Vite instead of Next.js)
- Build: `npm run build` (outputs to `dist/` instead of `.next/`)
- Preview: `npm run start` (now uses `vite preview`)

### Deployment Changes
- Static files are now built to `dist/` directory
- Vite builds standard HTML, CSS, and JS files
- Can be deployed to any static hosting service
- No server-side rendering (SSR) - fully client-side application

## PartyKit Migration: Original → Cloudflare

## Dependencies Changed
- `partykit` → `partyserver` (in devDependencies)
- `partysocket` updated to latest version (^1.1.0)
- Added `wrangler` for deployment and development
- Added `@cloudflare/workers-types` for TypeScript support

## Configuration Changes
- `partykit.json` → `wrangler.toml`
- Server now runs on port 8787 (default Wrangler port) instead of 1999
- Durable Object bindings must be explicitly configured in `wrangler.toml`

## Server API Changes
- Import from `partyserver` instead of `partykit/server`
- Extend `Server` class instead of implementing `Party.Server`
- Constructor takes `(ctx: DurableObjectState, env: Env)` instead of `party: Party.Party`
- Use `this.name` instead of `party.id`
- Use `this.broadcast()` instead of `party.broadcast()`
- Export a default fetch handler using `routePartykitRequest`

## Client Changes
- Updated PartySocket configuration to use `party` parameter
- Uses kebab-case server names (e.g., "game-server" for `GameServer`)
- Updated default host to use port 8787

## Development Commands
- `npm run dev:server` now uses `wrangler dev` instead of `partykit dev`
- Both commands can run simultaneously for full-stack development

The migration maintains the same game logic and user experience while leveraging Cloudflare's infrastructure for better performance and scalability.

## Benefits of the Migration

### Vite Benefits
- **Faster Development**: Lightning-fast hot module replacement (HMR)
- **Simpler Deployment**: Builds to static files that can be hosted anywhere
- **Smaller Bundle Size**: Better tree-shaking and optimization
- **Modern Build Tool**: Native ES modules support and faster builds

### Cloudflare PartyKit Benefits  
- **Better Performance**: Runs on Cloudflare's edge network
- **Improved Scalability**: Durable Objects for reliable state management
- **Global Distribution**: Lower latency for users worldwide
