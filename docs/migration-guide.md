# Migration from Original PartyKit

This project has been migrated from the original PartyKit to **Cloudflare PartyKit**. Here are the key changes:

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
