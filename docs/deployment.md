# Deployment Guide

## Overview

This guide covers how to deploy your Just One multiplayer game to production.

## Server Deployment

Deploy your PartyServer to Cloudflare Workers using Wrangler:

```bash
# Authenticate with Cloudflare (one time setup)
wrangler login

# Deploy the server
npm run deploy:server
```

The project is configured with:
- Server name: `partykit-starter-party` (defined in `wrangler.toml`)
- Durable Object binding for `GameServer`
- TypeScript support

## Client Deployment

For production, deploy your Vite application to your preferred hosting platform.

### Environment Variables

For production, you may need to set environment variables specific to your deployment. In Vite, environment variables must be prefixed with `VITE_` to be exposed to the client.

The application now connects to the same domain using the `/api/` prefix, so no server URL configuration is needed.

**Note**: Unlike Next.js which used `NEXT_PUBLIC_*` prefix, Vite uses `VITE_*` prefix for client-accessible environment variables.

### Vite Deployment

Standard Vite deployment options:
- **Vercel**: Connect your repository and deploy (Vite is supported out of the box)
- **Netlify**: Set build command to `npm run build` and publish directory to `dist`
- **GitHub Pages**: Use the `gh-pages` package or GitHub Actions
- **Other platforms**: Follow standard static site deployment procedures

## Configuration

The project includes:
- `wrangler.toml` - Cloudflare Worker configuration
- Durable Objects configured for game state management
- Development server runs on port 8787 (Wrangler default)

Refer to the [Migration Guide](migration-guide.md) for details about the Cloudflare PartyKit setup.
