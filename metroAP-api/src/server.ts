import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import { createServer } from 'http'

import { config } from './config.js'
import { connectRedis } from './redis/client.js'
import db from './db/client.js'
import { createSocketServer } from './socket.js'

import { authRoutes }     from './routes/auth.js'
import { corridorRoutes } from './routes/corridors.js'
import { busRoutes }      from './routes/buses.js'
import { alertRoutes }    from './routes/alerts.js'
import { feedbackRoutes } from './routes/feedback.js'

// ─── Build app ────────────────────────────────────────────────────────────────

const app = Fastify({
  logger: config.isDev
    ? { level: 'info', transport: { target: 'pino-pretty' } }
    : { level: 'warn' },
})

async function start(): Promise<void> {

  // ── Plugins ────────────────────────────────────────────────────────────────
  await app.register(helmet, { contentSecurityPolicy: false })

  await app.register(cors, {
    origin:      config.corsOrigins,
    credentials: true,
  })

  await app.register(jwt, {
    secret: config.jwtSecret,
  })

  await app.register(rateLimit, {
    max:       100,
    timeWindow: '1 minute',
  })

  // ── Routes ─────────────────────────────────────────────────────────────────
  await app.register(authRoutes,     { prefix: '/api' })
  await app.register(corridorRoutes, { prefix: '/api' })
  await app.register(busRoutes,      { prefix: '/api' })
  await app.register(alertRoutes,    { prefix: '/api' })
  await app.register(feedbackRoutes, { prefix: '/api' })

  // ── Health check ───────────────────────────────────────────────────────────
  app.get('/health', async () => ({
    status: 'ok',
    uptime: process.uptime(),
    env:    config.nodeEnv,
  }))

  // ── Connect to Redis ───────────────────────────────────────────────────────
  await connectRedis()

  // ── Create HTTP server + attach Socket.io ─────────────────────────────────
  // We use Node's raw http.Server so Socket.io can share the same port
  // as Fastify rather than needing a second port.
  const httpServer = createServer(app.server)
  createSocketServer(httpServer)

  // ── Start listening ────────────────────────────────────────────────────────
  await app.ready()

  httpServer.listen(config.port, '0.0.0.0', () => {
    console.log(`\n🚌 MetroAP API running`)
    console.log(`   http://localhost:${config.port}`)
    console.log(`   http://localhost:${config.port}/health`)
    console.log(`   ENV: ${config.nodeEnv}\n`)
  })

  // ── Graceful shutdown ──────────────────────────────────────────────────────
  const shutdown = async (signal: string) => {
    console.log(`\n[Server] ${signal} received — shutting down gracefully`)
    await app.close()
    await db.$disconnect()
    process.exit(0)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT',  () => shutdown('SIGINT'))
}

start().catch((err) => {
  console.error('[Server] Failed to start:', err)
  process.exit(1)
})
