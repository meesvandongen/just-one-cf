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

For production, deploy your Next.js application to your preferred hosting platform.

### Environment Variables

You may need to set environment variables for production, such as:
- Server URL configuration
- Any API keys or configuration specific to your deployment

### Next.js Deployment

Standard Next.js deployment options:
- **Vercel**: Connect your repository and deploy
- **Netlify**: Set build command to `npm run build`
- **Other platforms**: Follow standard Next.js deployment procedures

## Configuration

The project includes:
- `wrangler.toml` - Cloudflare Worker configuration
- Durable Objects configured for game state management
- Development server runs on port 8787 (Wrangler default)

Refer to the [Migration Guide](migration-guide.md) for details about the Cloudflare PartyKit setup.
