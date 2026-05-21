# Vochatix — Real-Time Chat & Video App

A production-style full-stack real-time communication app built as a **WhatsApp + Google Meet hybrid**. Supports one-to-one text messaging, audio calls, and video calls powered by LiveKit.

---

## ✨ Features

- 🔐 **User authentication** — Register, login, JWT-protected routes
- 💬 **Real-time messaging** — Instant delivery via Socket.IO
- ⌨️ **Typing indicators** — Live "is typing..." with animated dots
- 🟢 **Online/offline status** — Real-time presence with last seen
- 📞 **Audio & video calls** — LiveKit-powered WebRTC streaming
- 📲 **Incoming call flow** — Accept/reject with pulsing ring animation
- 🎛️ **Call controls** — Mute, camera on/off, screen sharing, end call
- ⏱️ **Call duration** — Live timer during active calls
- 📋 **Call history** — Missed/rejected/ended call records in chat
- 🌐 **Responsive UI** — Clean, modern Tailwind CSS design
- 🔒 **Security** — Password hashing, no secrets on frontend, member validation

---

## 🛠 Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| Next.js 14 (App Router) | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Zustand | Global state management |
| Socket.IO Client | Real-time events |
| LiveKit React SDK | Audio/video UI components |
| Axios | HTTP client |
| React Hook Form + Zod | Form validation |
| Lucide React | Icons |

### Backend
| Tool | Purpose |
|------|---------|
| Node.js + Express | HTTP server |
| TypeScript | Type safety |
| Socket.IO | Real-time events |
| Prisma ORM | Database access |
| PostgreSQL | Persistent storage |
| JWT + bcrypt | Authentication |
| LiveKit Server SDK | Call token generation |
| Zod | Request validation |
| Winston | Logging |

---

## 🏗 Folder Structure

```
vochatix/
  apps/
    web/                    Next.js frontend
      app/                  App Router pages
      components/           React components
        auth/               Login, Register forms
        call/               CallScreen, IncomingCallModal, controls
        chat/               ChatLayout, MessageList, input
        layout/             AppShell, Navbar, Sidebar
        ui/                 Button, Input, Avatar, Modal, etc.
      hooks/                Custom hooks (useAuth, useMessages, etc.)
      lib/                  API client, socket, utilities
      providers/            AuthProvider, SocketProvider, ToastProvider
      store/                Zustand stores (auth, chat, call)
      types/                TypeScript types

    server/                 Express backend
      src/
        modules/
          auth/             Authentication
          users/            User search
          conversations/    Conversation management
          messages/         Text messaging
          calls/            Call lifecycle
          livekit/          Token generation
          sockets/          Socket.IO event handlers
        middleware/         Auth, error, validation
        prisma/             Prisma client singleton
        utils/              Helpers (jwt, password, logger, etc.)
      prisma/               Schema + seed

  packages/
    shared/                 Shared types, constants, validations
```

---

## ⚙️ Architecture

```
Socket.IO = text messages, typing, online status, call signaling
LiveKit   = actual audio/video/screen-share streaming
PostgreSQL = all persistent data (users, messages, calls)
```

LiveKit tokens are generated **server-side only** — the `LIVEKIT_API_SECRET` is never sent to the browser.

---

## 📦 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- LiveKit account (free at [livekit.io](https://livekit.io))
- npm 8+

---

## 🚀 Installation

### 1. Clone & install dependencies

```bash
git clone <repo-url>
cd vochatix
npm install
```

### 2. Configure environment variables

**Backend** — copy and fill in `apps/server/.env.example`:

```bash
cp apps/server/.env.example apps/server/.env
```

```env
NODE_ENV=development
PORT=5000

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vochatix"

JWT_SECRET="replace_with_a_strong_random_secret"
JWT_EXPIRES_IN="7d"

CLIENT_URL="http://localhost:3000"

LIVEKIT_URL="wss://your-project.livekit.cloud"
LIVEKIT_API_KEY="your_api_key"
LIVEKIT_API_SECRET="your_api_secret"
```

**Frontend** — copy and fill in `apps/web/.env.example`:

```bash
cp apps/web/.env.example apps/web/.env.local
```

```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5000"
NEXT_PUBLIC_LIVEKIT_URL="wss://your-project.livekit.cloud"
```

### 3. Set up the database

```bash
# Generate Prisma client
npx prisma generate --schema=apps/server/prisma/schema.prisma

# Run migrations
npx prisma migrate dev --schema=apps/server/prisma/schema.prisma --name init

# (Optional) Seed with sample data
npm run prisma:seed --workspace=apps/server
```

### 4. Run the app

```bash
npm run dev
```

This starts both:
- 🖥 **Backend** on `http://localhost:5000`
- 🌐 **Frontend** on `http://localhost:3000`

---

## 🧪 Testing Two Users Locally

To test video/audio calls you need two separate browser sessions:

1. Open `http://localhost:3000` in **Chrome** → register as User A → login
2. Open `http://localhost:3000` in **Chrome Incognito** → register as User B → login
3. User A searches for User B → starts a conversation → sends messages
4. User A clicks the 📞 or 📹 button → User B sees the incoming call modal
5. User B accepts → both enter the LiveKit room

---

## 🔑 LiveKit Setup

1. Create a free account at [livekit.io](https://livekit.io)
2. Create a new project
3. Copy your **API Key**, **API Secret**, and **WebSocket URL**
4. Add them to `apps/server/.env`

---

## 📜 Prisma Commands

```bash
# Generate client after schema changes
npx prisma generate --schema=apps/server/prisma/schema.prisma

# Create and run a migration
npx prisma migrate dev --schema=apps/server/prisma/schema.prisma

# Open Prisma Studio (visual DB browser)
npx prisma studio --schema=apps/server/prisma/schema.prisma

# Seed the database
npm run prisma:seed --workspace=apps/server
```

---

## 🚦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both server and web in dev mode |
| `npm run dev:web` | Start only the frontend |
| `npm run dev:server` | Start only the backend |
| `npm run build` | Build both apps for production |
| `npm run typecheck` | Run TypeScript checks on all workspaces |
| `npm run lint` | Run ESLint on all workspaces |

---

## ⚠️ Common Issues

| Issue | Fix |
|-------|-----|
| `DATABASE_URL` connection error | Make sure PostgreSQL is running and credentials are correct |
| LiveKit token error | Check `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` in server `.env` |
| Camera/mic permission denied | Allow browser permissions, then rejoin the call |
| Socket not connecting | Check `NEXT_PUBLIC_SOCKET_URL` points to the running server |
| `CORS error` | Check `CLIENT_URL` in server `.env` matches your frontend URL |

---

## 🔮 Future Improvements

- Group conversations (3+ members)
- Message read receipts (delivered/seen)
- File and image sharing
- Push notifications
- Message search
- User profile editing
- Dark mode
- Mobile app (React Native)

---

## 📄 License

MIT
