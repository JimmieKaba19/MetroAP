# PRD for MetroAP

## Features

### Passenger app

1. working pwa

2. moving to the backend now

3. working on location service

4. working on eta service

5. working on websocket server

6. working on rest api endpoints

### Conductor app

1. building the react native application

2. adding background gps

3. adding shift management features

### Ops dashboard

1. adding a fleet map

2. adding route management

3. adding analytics
   
   

# MetroAP Back-end

Let's plan the full backend before writing a single line, so we build it in the right order and nothing is left behind.

---

## The Backend — What We're Building

The backend is three things working together:

```
REST API          — serves data to the passenger app and ops dashboard
WebSocket Server  — pushes live updates to passengers in real time  
Worker Services   — processes GPS pings, calculates ETAs, fires notifications
```

All three live in one Node.js + TypeScript project. They share the same database and Redis instance.

---

## Technology Decisions

| Concern            | Choice               | Why                                                |
| ------------------ | -------------------- | -------------------------------------------------- |
| Runtime            | Node.js + TypeScript | Matches frontend, strong ecosystem                 |
| Framework          | Fastify              | Faster than Express, built-in schema validation    |
| Database           | PostgreSQL           | Relational, handles routes/stops/shifts perfectly  |
| ORM                | Prisma               | Type-safe queries, auto-generates TypeScript types |
| Cache + PubSub     | Redis (ioredis)      | Sub-5ms ETA cache, fan-out to WebSocket clients    |
| WebSocket          | Socket.io            | Room-based routing, handles reconnects gracefully  |
| Map matching       | OSRM (HTTP API)      | Snaps GPS coords to actual roads, self-hostable    |
| Auth               | JWT + bcrypt         | Stateless, works for both passenger and conductor  |
| Push notifications | Firebase Admin SDK   | FCM for in-app alerts                              |
| Validation         | Zod                  | Runtime schema validation, TypeScript-first        |
| Testing            | Vitest               | Fast, same config as frontend                      |

---

## Folder Structure

```
nairobi-transit-api/
├── src/
│   ├── server.ts           ← Fastify app entry point
│   ├── socket.ts           ← Socket.io server
│   ├── config.ts           ← All env variables in one place
│   ├── db/
│   │   ├── client.ts       ← Prisma client singleton
│   │   └── schema.prisma   ← Database schema
│   ├── routes/             ← REST API route handlers
│   │   ├── auth.ts
│   │   ├── corridors.ts
│   │   ├── buses.ts
│   │   ├── alerts.ts
│   │   └── feedback.ts
│   ├── services/           ← Business logic
│   │   ├── location.ts     ← Receives + processes GPS pings
│   │   ├── eta.ts          ← Calculates arrival times
│   │   ├── notification.ts ← FCM + WebSocket push
│   │   └── osrm.ts         ← Map matching
│   ├── middleware/
│   │   ├── auth.ts         ← JWT verification
│   │   └── validate.ts     ← Zod request validation
│   ├── redis/
│   │   └── client.ts       ← Redis singleton + pub/sub
│   └── types/
│       └── index.ts        ← Shared backend types
├── prisma/
│   └── schema.prisma
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Database Schema — The Foundation

This is the most important thing to get right before anything else. Every other service depends on it.

```
Operator          — Super Metro (future: other SACCOs)
  └── Corridor    — Thika Road, Westlands etc
        └── RouteVariant  — Outbound, Inbound, Express
              └── Stop    — ordered stops with GPS coords

Bus               — physical vehicle (fleet number, capacity)
Conductor         — login credentials, tied to Operator

Shift             — one conductor + one bus + one variant per working session
  └── GpsPing     — time-series: every 30s ping from conductor app

Alert             — conductor or system generated delay/arrival notice
FeedbackReport    — passenger crowd report
FeedbackVote      — one vote per user per report
```

---

## Build Order

This is the sequence that makes sense — each step unlocks the next:

**Step 1 — Project scaffold + config** Init the repo, install deps, set up TypeScript, Fastify, Prisma, Redis clients.

**Step 2 — Database schema + migrations** Write the full Prisma schema, run the first migration, seed with Super Metro test data (corridors, stops, buses, one conductor account).

**Step 3 — Auth routes** `POST /auth/conductor/login` → returns JWT. This unblocks conductor app development. `POST /auth/passenger/register` (optional — passengers can be anonymous for v0).

**Step 4 — Corridor + bus REST routes** `GET /corridors` → all routes with stops. `GET /buses?variantId=1` → active buses. These are the first endpoints the passenger app calls — swap the stubs in `services/api.ts` one by one.

**Step 5 — GPS ping endpoint** `POST /location/ping` — the conductor app's heartbeat. Receives lat/lng, validates the conductor's JWT, stores the ping, triggers the ETA calculation pipeline.

**Step 6 — ETA service** Subscribes to GPS pings via Redis pub/sub. Calculates which stop the bus is approaching, computes ETAs for all remaining stops, writes results to Redis cache with a 60-second TTL.

**Step 7 — WebSocket server** Passengers join a room per variant (`variant:1`). When ETA service publishes a bus update, the WebSocket server fans it out to everyone in that room. This is the moment the map dot starts moving with real data.

**Step 8 — Alert + feedback routes** `POST /alerts` — conductor files a delay. `POST /feedback` — passenger crowd report. `POST /feedback/:id/vote`. Both trigger real-time pushes via WebSocket.

**Step 9 — Notification service** Firebase Admin SDK integration. Sends FCM push when a bus enters a stop's geofence.

---

## What You Need Before We Start

Three things to set up locally:

**1. PostgreSQL**

bash

```bash
# macOS
brew install postgresql@15 && brew services start postgresql@15

# Windows — download from postgresql.org installer
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib
```

**2. Redis**

bash

```bash
# macOS
brew install redis && brew services start redis

# Windows — use Redis via WSL or Docker
docker run -d -p 6379:6379 redis:alpine

# Ubuntu
sudo apt install redis-server
```

**3. Node.js already installed** ✅ — you have it from the frontend.

Verify both are running:

bash

```bash
psql --version
redis-cli ping   # should reply PONG
```

---

Once you confirm PostgreSQL and Redis are running, we go straight to Step 1 — scaffold the project and wire up the config. Shall we proceed?



# Working on backend

- installing postgresql and redis-server

- creating a `metroAP-api` directory and initialising npm for the package.json file

- building the foundation files

**Step 1 — Create the project and copy files**

In your terminal, from the same parent folder where `metroAP` lives:

```bash
mkdir metroAP-api
cd metroAP-api
```

Then recreate this folder structure and paste each file in:
```
metroAP-api/
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── src/
    ├── config.ts
    ├── server.ts
    ├── socket.ts
    ├── types/index.ts
    ├── db/client.ts
    ├── redis/client.ts
    ├── middleware/auth.ts
    ├── services/osrm.ts
    ├── services/location.ts
    └── routes/
        ├── auth.ts
        ├── corridors.ts
        ├── buses.ts
        ├── alerts.ts
        └── feedback.ts
```

Create the folders first:
