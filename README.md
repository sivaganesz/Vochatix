# Vochatix — Real-Time Chat & Video App

A full-stack real-time communication app with text chat, audio/video calling, and LiveKit integration.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, LiveKit React SDK, Socket.IO Client, Zustand
- **Backend**: Node.js, Express, TypeScript, Socket.IO, Prisma ORM
- **Database**: PostgreSQL
- **Media**: LiveKit (audio/video/screen-share)

## Monorepo Structure

```
apps/
  web/      - Next.js frontend
  server/   - Express backend
packages/
  shared/   - Shared types and constants
```

## Quick Start

1. Copy `.env.example` files and fill in values
2. Run `npm install`
3. Run database migrations: `npm run prisma:migrate --workspace=apps/server`
4. Run dev: `npm run dev`

See individual app READMEs for more details.
