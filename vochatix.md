Important: Implement this project inside the current working directory. Do not ask follow-up questions. Make reasonable decisions, run checks after each phase, fix errors, and commit after every phase.
---

# Codex Agent Project Prompt

You are an expert full-stack engineer. Build a complete end-to-end real-time chat application with text chat, audio call, video call, incoming call flow, call history, and LiveKit integration.

The project must be production-style, clean, modern, easy to understand, and well-structured.

You must work phase by phase. After each phase is completed and verified, commit the changes using Git with a clear commit message.

Do not stop after generating partial code. Continue implementing, testing, fixing issues, and improving the app until the full flow works successfully.

---

# Main goal

Build a full-stack real-time communication app similar to a basic WhatsApp / Google Meet / Teams hybrid.

The app should support:

1. User authentication
2. One-to-one conversations
3. Real-time text messaging
4. Typing indicator
5. Online/offline status
6. Incoming audio/video call notification
7. Accept/reject call flow
8. LiveKit-powered audio/video calling
9. Camera on/off
10. Microphone mute/unmute
11. Screen sharing
12. End call flow
13. Missed call handling
14. Call history inside chat
15. Clean modern responsive UI
16. Clear folder structure
17. Easy-to-read code with proper names
18. Git initialized at the beginning
19. Git commit after each completed phase

---

# Required tech stack

Use this stack unless there is a strong technical reason not to.

## Frontend

Use:

```txt
Next.js
React
TypeScript
Tailwind CSS
LiveKit React SDK
Socket.IO Client
Axios
Zustand or React Context for state management
React Hook Form
Zod
Lucide React icons
```

## Backend

Use:

```txt
Node.js
Express.js
TypeScript
Socket.IO
Prisma ORM
PostgreSQL
JWT authentication
bcrypt
LiveKit Server SDK
Zod for request validation
```

## Database

Use:

```txt
PostgreSQL
Prisma ORM
```

## Realtime

Use:

```txt
Socket.IO for chat and call events
LiveKit for audio/video media streaming
```

## Dev tooling

Use:

```txt
ESLint
Prettier
dotenv
tsx or ts-node-dev
concurrently
Git
```

---

# Important architecture rule

Do not stream audio or video through Socket.IO.

Use:

```txt
Socket.IO = text messages, typing, online status, call invite, call accept, call reject, call ended
LiveKit = actual microphone audio, camera video, screen sharing
PostgreSQL = users, conversations, messages, calls, call participants
```

---

# Project name

Use this project name:

```txt
realtime-chat-video-app
```

Create a monorepo structure:

```txt
realtime-chat-video-app/
  apps/
    web/
    server/
  packages/
    shared/
  .gitignore
  README.md
  package.json
```

---

# Initialize Git first

Before implementing anything, run:

```bash
git init
```

Create the initial folder structure and commit:

```bash
git add .
git commit -m "chore: initialize project structure"
```

After every phase, run:

```bash
git add .
git commit -m "<clear phase commit message>"
```

Every commit message must be meaningful.

Example:

```bash
git commit -m "feat: add user authentication"
git commit -m "feat: implement realtime text messaging"
git commit -m "feat: add LiveKit video calling"
```

---

# Environment variables

Create example environment files.

## Root

```txt
.env.example
```

## Backend

Create:

```txt
apps/server/.env.example
```

With:

```env
NODE_ENV=development
PORT=5000

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/realtime_chat_video_app"

JWT_SECRET="replace_with_strong_secret"
JWT_EXPIRES_IN="7d"

CLIENT_URL="http://localhost:3000"

LIVEKIT_URL="wss://your-livekit-project.livekit.cloud"
LIVEKIT_API_KEY="your_livekit_api_key"
LIVEKIT_API_SECRET="your_livekit_api_secret"
```

## Frontend

Create:

```txt
apps/web/.env.example
```

With:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5000"
NEXT_PUBLIC_LIVEKIT_URL="wss://your-livekit-project.livekit.cloud"
```

Never expose the LiveKit API secret to the frontend.

---

# Complete folder structure

Create and follow this structure.

```txt
realtime-chat-video-app/
  apps/
    web/
      src/
        app/
          layout.tsx
          page.tsx
          login/
            page.tsx
          register/
            page.tsx
          chat/
            page.tsx
            [conversationId]/
              page.tsx
          call/
            [callId]/
              page.tsx

        components/
          auth/
            LoginForm.tsx
            RegisterForm.tsx
            AuthCard.tsx

          chat/
            ChatLayout.tsx
            ConversationList.tsx
            ChatHeader.tsx
            MessageList.tsx
            MessageBubble.tsx
            MessageInput.tsx
            TypingIndicator.tsx
            EmptyChatState.tsx
            CallHistoryItem.tsx

          call/
            IncomingCallModal.tsx
            CallScreen.tsx
            CallControls.tsx
            ParticipantGrid.tsx
            LocalParticipantTile.tsx
            RemoteParticipantTile.tsx
            CallStatusBanner.tsx

          layout/
            AppShell.tsx
            Navbar.tsx
            Sidebar.tsx

          ui/
            Button.tsx
            Input.tsx
            Avatar.tsx
            Modal.tsx
            Card.tsx
            Badge.tsx
            Spinner.tsx
            Toast.tsx

        hooks/
          useAuth.ts
          useSocket.ts
          useConversations.ts
          useMessages.ts
          useCalls.ts
          useLiveKitToken.ts

        lib/
          api.ts
          socket.ts
          auth-storage.ts
          date.ts
          cn.ts

        providers/
          AuthProvider.tsx
          SocketProvider.tsx
          ToastProvider.tsx

        store/
          auth.store.ts
          chat.store.ts
          call.store.ts

        types/
          auth.types.ts
          chat.types.ts
          call.types.ts
          socket.types.ts

        styles/
          globals.css

      package.json
      next.config.ts
      tailwind.config.ts
      tsconfig.json
      .env.example

    server/
      src/
        index.ts
        app.ts

        config/
          env.ts
          cors.ts

        modules/
          auth/
            auth.routes.ts
            auth.controller.ts
            auth.service.ts
            auth.validation.ts
            auth.types.ts

          users/
            users.routes.ts
            users.controller.ts
            users.service.ts

          conversations/
            conversations.routes.ts
            conversations.controller.ts
            conversations.service.ts
            conversations.validation.ts

          messages/
            messages.routes.ts
            messages.controller.ts
            messages.service.ts
            messages.validation.ts

          calls/
            calls.routes.ts
            calls.controller.ts
            calls.service.ts
            calls.validation.ts

          livekit/
            livekit.routes.ts
            livekit.controller.ts
            livekit.service.ts
            livekit.validation.ts

          sockets/
            socket.server.ts
            socket.auth.ts
            socket.events.ts
            chat.socket.ts
            call.socket.ts
            presence.socket.ts

        middleware/
          auth.middleware.ts
          error.middleware.ts
          validate.middleware.ts

        prisma/
          prisma.service.ts

        utils/
          ApiError.ts
          asyncHandler.ts
          jwt.ts
          password.ts
          logger.ts
          room-name.ts
          date.ts

        types/
          express.d.ts
          socket.types.ts

      prisma/
        schema.prisma
        seed.ts

      package.json
      tsconfig.json
      .env.example

  packages/
    shared/
      src/
        types/
          auth.ts
          chat.ts
          call.ts
          socket.ts
        constants/
          socket-events.ts
          call-status.ts
        validations/
          auth.ts
          chat.ts
          call.ts
        index.ts
      package.json
      tsconfig.json

  package.json
  README.md
  .gitignore
  .env.example
```

---

# Database schema

Use Prisma.

Create these models:

```prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  avatarUrl    String?
  isOnline     Boolean  @default(false)
  lastSeenAt   DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  conversationMembers ConversationMember[]
  messages            Message[]
  startedCalls        Call[] @relation("StartedCalls")
  callParticipants    CallParticipant[]
}

model Conversation {
  id        String   @id @default(cuid())
  type      ConversationType @default(DIRECT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  members  ConversationMember[]
  messages Message[]
  calls    Call[]
}

model ConversationMember {
  id             String   @id @default(cuid())
  conversationId String
  userId         String
  joinedAt       DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([conversationId, userId])
}

model Message {
  id             String        @id @default(cuid())
  conversationId String
  senderId       String?
  text           String?
  type           MessageType   @default(TEXT)
  status         MessageStatus @default(SENT)
  metadata       Json?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender       User?        @relation(fields: [senderId], references: [id], onDelete: SetNull)
}

model Call {
  id             String     @id @default(cuid())
  conversationId String
  roomName       String     @unique
  callType       CallType
  status         CallStatus @default(RINGING)
  startedById    String
  startedAt      DateTime?
  endedAt        DateTime?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  conversation Conversation      @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  startedBy    User              @relation("StartedCalls", fields: [startedById], references: [id], onDelete: Cascade)
  participants CallParticipant[]
}

model CallParticipant {
  id       String                @id @default(cuid())
  callId   String
  userId   String
  status   CallParticipantStatus @default(RINGING)
  joinedAt DateTime?
  leftAt   DateTime?

  call Call @relation(fields: [callId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([callId, userId])
}

enum ConversationType {
  DIRECT
  GROUP
}

enum MessageType {
  TEXT
  SYSTEM
  CALL
}

enum MessageStatus {
  SENT
  DELIVERED
  SEEN
}

enum CallType {
  AUDIO
  VIDEO
}

enum CallStatus {
  RINGING
  ACCEPTED
  REJECTED
  MISSED
  ENDED
  FAILED
}

enum CallParticipantStatus {
  RINGING
  ACCEPTED
  REJECTED
  MISSED
  LEFT
}
```

---

# Socket event names

Create shared constants for all socket events.

```ts
export const SOCKET_EVENTS = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",

  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:offline",

  MESSAGE_SEND: "message:send",
  MESSAGE_NEW: "message:new",
  MESSAGE_DELIVERED: "message:delivered",
  MESSAGE_SEEN: "message:seen",

  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",

  CALL_INVITE: "call:invite",
  CALL_INCOMING: "call:incoming",
  CALL_ACCEPT: "call:accept",
  CALL_ACCEPTED: "call:accepted",
  CALL_REJECT: "call:reject",
  CALL_REJECTED: "call:rejected",
  CALL_END: "call:end",
  CALL_ENDED: "call:ended",
  CALL_MISSED: "call:missed",
  CALL_BUSY: "call:busy",
  CALL_ERROR: "call:error",
} as const;
```

---

# API routes

Implement these backend routes.

## Auth

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

## Users

```txt
GET /api/users
GET /api/users/search?q=
GET /api/users/:userId
```

## Conversations

```txt
GET  /api/conversations
POST /api/conversations/direct
GET  /api/conversations/:conversationId
```

## Messages

```txt
GET  /api/conversations/:conversationId/messages
POST /api/conversations/:conversationId/messages
```

## Calls

```txt
POST /api/calls
GET  /api/calls/:callId
POST /api/calls/:callId/accept
POST /api/calls/:callId/reject
POST /api/calls/:callId/end
```

## LiveKit

```txt
POST /api/livekit/token
```

---

# Required backend behavior

## Authentication

Implement:

```txt
Register user
Login user
Hash password with bcrypt
Return JWT token
Protect private routes
Attach req.user to authenticated requests
```

JWT payload should contain:

```ts
{
  userId: string;
  email: string;
}
```

---

## Conversation behavior

Support direct conversations.

When creating a direct conversation:

1. Check both users exist.
2. Check if a direct conversation already exists between them.
3. If it exists, return the existing conversation.
4. If it does not exist, create a new conversation and two members.

---

## Message behavior

When a user sends a message:

1. Validate the user is part of the conversation.
2. Save the message.
3. Emit `message:new` to all conversation members.
4. Return the message.

---

## Presence behavior

When socket connects:

1. Authenticate socket using JWT.
2. Save `socket.userId`.
3. Join personal room:

```txt
user:<userId>
```

4. Mark user online.
5. Notify relevant users.

When socket disconnects:

1. Mark user offline if no active sockets remain.
2. Set `lastSeenAt`.
3. Notify relevant users.

---

## Typing behavior

When user emits `typing:start`:

1. Validate membership in conversation.
2. Emit to other conversation members.

When user emits `typing:stop`:

1. Validate membership in conversation.
2. Emit to other conversation members.

---

# Call behavior

## Start call

When User A starts a call:

1. Frontend emits `call:invite`.
2. Backend validates:

   * user is authenticated
   * conversation exists
   * caller is conversation member
   * target users are conversation members
3. Backend creates a `Call`.
4. Backend creates `CallParticipant` rows.
5. Backend creates unique LiveKit `roomName`.
6. Backend creates system message inside conversation.
7. Backend emits `call:incoming` to receiver.
8. Backend emits call state to caller.
9. Set missed-call timeout, around 45 seconds.

Room name format:

```txt
call_<conversationId>_<timestamp>
```

Use a helper:

```ts
createCallRoomName(conversationId: string): string
```

---

## Accept call

When User B accepts:

1. Frontend emits `call:accept`.
2. Backend validates user is a participant.
3. Update call status to `ACCEPTED`.
4. Update participant status to `ACCEPTED`.
5. Set `startedAt`.
6. Emit `call:accepted` to caller and receiver.
7. Both users request LiveKit token.
8. Both users join LiveKit room.

---

## Reject call

When User B rejects:

1. Frontend emits `call:reject`.
2. Backend validates user is participant.
3. Update participant status to `REJECTED`.
4. Update call status to `REJECTED`.
5. Create system message.
6. Emit `call:rejected` to caller.

---

## Missed call

If call is still `RINGING` after timeout:

1. Update call status to `MISSED`.
2. Update ringing participants to `MISSED`.
3. Create system message.
4. Emit `call:missed` to caller and receiver.

---

## End call

When a participant ends the call:

1. Frontend emits `call:end`.
2. Backend validates user is participant.
3. Update participant status to `LEFT`.
4. Update `leftAt`.
5. Update call status to `ENDED`.
6. Set `endedAt`.
7. Create system message with duration.
8. Emit `call:ended` to all participants.
9. Frontend disconnects from LiveKit room.
10. Frontend returns to chat screen.

---

# LiveKit behavior

Implement backend endpoint:

```txt
POST /api/livekit/token
```

Request body:

```json
{
  "callId": "call_id_here"
}
```

Backend must:

1. Authenticate user.
2. Load call with participants.
3. Verify user is a participant.
4. Verify call is `ACCEPTED` or valid to join.
5. Create LiveKit token.
6. Grant:

   * roomJoin
   * canPublish
   * canSubscribe
   * room
7. Return:

```json
{
  "token": "livekit_jwt",
  "url": "wss://your-livekit-url",
  "roomName": "call_room_name"
}
```

Use `livekit-server-sdk`.

Do not expose `LIVEKIT_API_SECRET` to frontend.

---

# Frontend behavior

## Auth pages

Create clean pages:

```txt
/login
/register
```

Requirements:

1. Modern centered card.
2. Input validation.
3. Loading state.
4. Error state.
5. Redirect to `/chat` after login.
6. Store auth token.
7. Attach auth token to API requests.

---

## Chat page

Create:

```txt
/chat
/chat/[conversationId]
```

UI layout:

```txt
------------------------------------------------
| Sidebar conversations | Chat window           |
|                       | Header                |
|                       | Messages              |
|                       | Input                 |
------------------------------------------------
```

Chat header should show:

```txt
User avatar
User name
Online / last seen
Audio call button
Video call button
```

Message UI:

1. Sender messages on right.
2. Receiver messages on left.
3. Different style for system/call messages.
4. Timestamp.
5. Auto-scroll to bottom.
6. Empty chat state.

---

## Conversation sidebar

Show:

```txt
User/conversation name
Last message
Unread count if implemented
Online status dot
```

Also include:

```txt
New chat button
Search users
```

When selecting a user, create or open direct conversation.

---

## Typing indicator

Show:

```txt
User is typing...
```

Use debounce to emit `typing:start` and `typing:stop`.

---

## Incoming call modal

When frontend receives `call:incoming`, show modal:

```txt
Incoming Video Call

Caller avatar
Caller name

Accept
Reject
```

For audio call:

```txt
Incoming Audio Call
```

Accept should:

1. Emit `call:accept`.
2. Navigate to `/call/[callId]`.

Reject should:

1. Emit `call:reject`.
2. Close modal.

---

## Call screen

Create:

```txt
/call/[callId]
```

Behavior:

1. Fetch call details.
2. Request LiveKit token.
3. Connect to LiveKit room.
4. Show modern call UI.

Use LiveKit React components first for stability.

Minimum:

```tsx
<LiveKitRoom
  token={token}
  serverUrl={url}
  connect={true}
  video={call.callType === "VIDEO"}
  audio={true}
>
  <VideoConference />
</LiveKitRoom>
```

Then wrap with custom header/footer UI if needed.

Call screen should show:

```txt
Call status
Participants
Local video
Remote video
Mute button
Camera on/off button
Screen share button
End call button
```

On end call:

1. Emit `call:end`.
2. Disconnect LiveKit room.
3. Navigate back to chat.

---

# UI design requirements

The UI must be:

```txt
Clean
Modern
Responsive
User-friendly
Consistent spacing
Good typography
Good loading states
Good empty states
Good error states
```

Use Tailwind CSS.

Style direction:

```txt
Rounded corners
Soft shadows
Light background
Modern buttons
Readable chat bubbles
Clean sidebar
Clear call buttons
Professional video screen
```

Do not create a messy demo UI. Make it presentable.

---

# Error handling requirements

Implement proper error handling.

Backend:

1. Use centralized error middleware.
2. Use `ApiError` class.
3. Validate request bodies with Zod.
4. Return consistent JSON errors.

Error response shape:

```json
{
  "success": false,
  "message": "Error message"
}
```

Success response shape:

```json
{
  "success": true,
  "data": {}
}
```

Frontend:

1. Show toast errors.
2. Show loading states.
3. Handle token expiration.
4. Handle socket disconnect.
5. Handle call failed.
6. Handle camera/mic permission errors.

---

# Code quality rules

Follow these rules strictly:

1. Use TypeScript everywhere.
2. Avoid `any` unless absolutely required.
3. Use meaningful names.
4. Keep functions small.
5. Separate controller, service, validation, and routes.
6. Keep socket logic separated by domain.
7. Keep UI components reusable.
8. Do not put business logic directly inside React components when it can be moved to hooks/services.
9. Add comments only when helpful.
10. Avoid over-engineering.
11. Make the code easy for a junior developer to understand.

Examples of good names:

```ts
createDirectConversation()
sendMessageToConversation()
generateLiveKitToken()
validateConversationMembership()
emitIncomingCall()
handleCallAccepted()
```

Bad names to avoid:

```ts
doStuff()
handleData()
process()
abc()
temp()
```

---

# Phase-by-phase implementation plan

You must implement in the following phases.

After each phase:

1. Run formatting/linting if available.
2. Run TypeScript checks.
3. Fix all errors.
4. Commit changes.

---

## Phase 0: Initialize project

Tasks:

1. Create root project folder.
2. Initialize Git.
3. Create monorepo folder structure.
4. Create root package.json.
5. Create .gitignore.
6. Create README.md.
7. Create environment example files.

Commit:

```bash
git add .
git commit -m "chore: initialize project structure"
```

---

## Phase 1: Setup backend foundation

Tasks:

1. Create Express TypeScript server.
2. Add environment config.
3. Add CORS.
4. Add JSON middleware.
5. Add health route:

```txt
GET /health
```

6. Add centralized error handling.
7. Add API response helpers.
8. Setup Prisma.
9. Add database schema.
10. Add seed script.

Commit:

```bash
git add .
git commit -m "chore: setup backend foundation"
```

---

## Phase 2: Setup frontend foundation

Tasks:

1. Create Next.js app.
2. Setup Tailwind CSS.
3. Add global styles.
4. Add reusable UI components:

   * Button
   * Input
   * Card
   * Modal
   * Avatar
   * Spinner
5. Setup Axios client.
6. Setup auth token storage.
7. Setup basic layout.

Commit:

```bash
git add .
git commit -m "chore: setup frontend foundation"
```

---

## Phase 3: Authentication

Tasks:

Backend:

1. Register route.
2. Login route.
3. Me route.
4. Password hashing.
5. JWT generation.
6. Auth middleware.

Frontend:

1. Register page.
2. Login page.
3. Auth provider/store.
4. Protected pages.
5. Redirect behavior.
6. Logout.

Commit:

```bash
git add .
git commit -m "feat: add authentication flow"
```

---

## Phase 4: Conversations and users

Tasks:

Backend:

1. Get users.
2. Search users.
3. Create direct conversation.
4. List conversations.
5. Get conversation detail.

Frontend:

1. Chat layout.
2. Conversation sidebar.
3. User search.
4. Start new direct chat.
5. Empty chat state.

Commit:

```bash
git add .
git commit -m "feat: add conversations and user search"
```

---

## Phase 5: Text messaging

Tasks:

Backend:

1. Create message route.
2. Get messages route.
3. Validate conversation membership.
4. Save messages to DB.

Frontend:

1. Message list.
2. Message bubble.
3. Message input.
4. Send message using REST initially.
5. Auto-scroll.
6. Loading and error states.

Commit:

```bash
git add .
git commit -m "feat: add text messaging"
```

---

## Phase 6: Socket.IO realtime foundation

Tasks:

Backend:

1. Setup Socket.IO server.
2. Authenticate socket using JWT.
3. Join personal room:

```txt
user:<userId>
```

4. Join conversation rooms when needed.
5. Add shared socket event constants.

Frontend:

1. Socket provider.
2. Connect socket after login.
3. Disconnect socket after logout.
4. Reconnect handling.

Commit:

```bash
git add .
git commit -m "feat: setup realtime socket foundation"
```

---

## Phase 7: Realtime chat features

Tasks:

Backend:

1. Handle `message:send`.
2. Emit `message:new`.
3. Handle `typing:start`.
4. Handle `typing:stop`.
5. Handle online/offline presence.

Frontend:

1. Send messages through Socket.IO.
2. Receive messages instantly.
3. Typing indicator.
4. Online status dot.
5. Last seen display.

Commit:

```bash
git add .
git commit -m "feat: add realtime chat and presence"
```

---

## Phase 8: Call database and call sockets

Tasks:

Backend:

1. Implement call service.
2. Create call records.
3. Create call participants.
4. Implement `call:invite`.
5. Implement `call:incoming`.
6. Implement `call:accept`.
7. Implement `call:accepted`.
8. Implement `call:reject`.
9. Implement `call:rejected`.
10. Implement `call:missed`.
11. Implement `call:end`.
12. Implement `call:ended`.

Frontend:

1. Add audio/video buttons in chat header.
2. Add incoming call modal.
3. Accept call.
4. Reject call.
5. Show call system messages in chat.

Commit:

```bash
git add .
git commit -m "feat: add realtime call signaling"
```

---

## Phase 9: LiveKit integration

Tasks:

Backend:

1. Add LiveKit SDK.
2. Implement token generation endpoint.
3. Validate call participant before issuing token.
4. Return token, room name, and LiveKit URL.

Frontend:

1. Install LiveKit React SDK.
2. Add call page.
3. Fetch LiveKit token.
4. Join LiveKit room.
5. Enable audio/video based on call type.
6. Display video UI.
7. Add end call behavior.

Commit:

```bash
git add .
git commit -m "feat: integrate LiveKit audio and video calls"
```

---

## Phase 10: Call UI improvements

Tasks:

1. Improve video call screen design.
2. Add clean call header.
3. Add call controls.
4. Add mute/unmute.
5. Add camera on/off.
6. Add screen share.
7. Add call duration.
8. Add connection state display.
9. Add permission error handling.

Commit:

```bash
git add .
git commit -m "feat: improve call screen UI and controls"
```

---

## Phase 11: Call history

Tasks:

Backend:

1. Save call system messages.
2. Save call status and duration.
3. Add call history display data.

Frontend:

1. Render call history items inside chat.
2. Show:

   * missed call
   * rejected call
   * ended call with duration
   * audio/video icon

Commit:

```bash
git add .
git commit -m "feat: add call history in chat"
```

---

## Phase 12: Polish and reliability

Tasks:

1. Improve loading states.
2. Improve empty states.
3. Improve error messages.
4. Improve responsive design.
5. Fix socket reconnection edge cases.
6. Fix duplicate messages.
7. Fix duplicate incoming call modals.
8. Prevent users from calling themselves.
9. Prevent invalid users from joining calls.
10. Handle browser camera/mic errors.
11. Add README setup instructions.

Commit:

```bash
git add .
git commit -m "chore: polish app and improve reliability"
```

---

## Phase 13: Final verification

Tasks:

Run full manual verification.

Test these flows:

```txt
1. Register User A
2. Register User B
3. Login as User A in one browser
4. Login as User B in another browser/incognito
5. User A searches User B
6. User A opens direct chat
7. User A sends message
8. User B receives message instantly
9. User B sends reply
10. User A sees reply instantly
11. Typing indicator works
12. Online status works
13. User A starts audio call
14. User B receives incoming audio call
15. User B rejects call
16. User A sees rejected state
17. User A starts video call
18. User B accepts call
19. Both users join LiveKit room
20. Both users can see/hear each other
21. Mute/unmute works
22. Camera on/off works
23. Screen sharing works
24. End call works
25. Both users return to chat
26. Call history appears in chat
27. Missed call works after timeout
28. Logout works
```

Fix any issues found.

Final commit:

```bash
git add .
git commit -m "test: verify complete realtime chat and video call flow"
```

---

# README requirements

Write a clear README with:

```txt
Project overview
Tech stack
Features
Folder structure
Environment variables
Database setup
LiveKit setup
Installation
Running locally
Testing two users locally
Common issues
Future improvements
```

Include commands:

```bash
npm install
npm run dev
```

Include Prisma commands:

```bash
cd apps/server
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

Include note:

```txt
To test video calls locally, open two browsers or one normal browser and one incognito window.
Login as two different users.
```

---

# Root package.json scripts

Create root scripts similar to:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --workspace apps/server\" \"npm run dev --workspace apps/web\"",
    "dev:web": "npm run dev --workspace apps/web",
    "dev:server": "npm run dev --workspace apps/server",
    "build": "npm run build --workspaces",
    "lint": "npm run lint --workspaces",
    "typecheck": "npm run typecheck --workspaces"
  }
}
```

Adjust if needed for the selected package manager.

---

# Backend package scripts

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src --ext .ts",
    "typecheck": "tsc --noEmit",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "tsx prisma/seed.ts"
  }
}
```

---

# Frontend package scripts

```json
{
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

---

# Security requirements

Implement these minimum security rules:

```txt
1. Hash passwords.
2. Never expose password hash.
3. Never expose LiveKit API secret.
4. Protect private API routes.
5. Validate conversation membership.
6. Validate call participation before issuing token.
7. Validate all request bodies.
8. Use CORS only for allowed frontend URL.
9. Do not allow user to call themselves.
10. Do not allow unauthorized users to join conversations or calls.
```

---

# LiveKit token requirement

Token generation must be server-side only.

Correct:

```txt
Frontend asks backend for LiveKit token.
Backend creates token using API key and secret.
Frontend receives temporary token.
Frontend joins LiveKit room.
```

Wrong:

```txt
Frontend creates LiveKit token.
Frontend contains LIVEKIT_API_SECRET.
```

Never do the wrong approach.

---

# Data flow summary

Implement the app according to this exact flow.

## Text message flow

```txt
User A types message
    ↓
Frontend emits message:send
    ↓
Backend validates membership
    ↓
Backend saves message
    ↓
Backend emits message:new to conversation members
    ↓
User B receives message instantly
```

## Video call flow

```txt
User A clicks video call
    ↓
Frontend emits call:invite
    ↓
Backend creates call record and room name
    ↓
Backend emits call:incoming to User B
    ↓
User B accepts
    ↓
Backend emits call:accepted
    ↓
Both users request LiveKit token
    ↓
Both users join same LiveKit room
    ↓
LiveKit handles camera and microphone streaming
    ↓
User ends call
    ↓
Backend updates call status
    ↓
Both users return to chat
```

---

# Final output expected from Codex

When finished, provide:

1. Summary of what was built.
2. Final folder structure.
3. Commands to run locally.
4. Environment variables needed.
5. Any known limitations.
6. Git commit history summary.
7. Confirmation that TypeScript checks passed.
8. Confirmation that the full manual flow was verified or what could not be verified locally.

---

# Do not finish until complete

Do not stop after scaffolding.

Do not only generate pseudo-code.

Do not skip the backend.

Do not skip the frontend.

Do not skip database schema.

Do not skip LiveKit token generation.

Do not skip Socket.IO call signaling.

Do not skip Git commits.

Do not leave broken imports.

Do not leave TypeScript errors.

Do not leave missing environment examples.

Do not leave the README empty.

Continue fixing issues until the complete app runs successfully.

---

# Final instruction

Begin now by initializing Git, creating the monorepo structure, and committing the initial project structure. Then continue phase by phase until the full real-time chat, audio call, and video call flow is complete.
