import { Server as SocketServer } from 'socket.io'
import type { Server as HttpServer } from 'http'
import { redisSub, channels } from './redis/client.js'
import { config } from './config.js'

// ─── Socket.io server ──────────────────────────────────────────────────────────
// Passengers connect and join a room for their selected variant.
// When Redis publishes a bus update or alert, we fan it out to that room.

export function createSocketServer(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin:      config.corsOrigins,
      credentials: true,
    },
    // Use websocket first, fall back to polling for bad connections
    transports: ['websocket', 'polling'],
  })

  // ── Connection handler ──────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    if (config.isDev) console.log(`[Socket] connected: ${socket.id}`)

    // ── Join a variant room ──────────────────────────────────────────────────
    // Passenger sends: { variantId: 'clxyz...' }
    // They are added to a room so they only receive updates for their route.
    socket.on('join:variant', (variantId: string) => {
      // Leave any previous variant room first
      socket.rooms.forEach((room) => {
        if (room.startsWith('variant:')) socket.leave(room)
      })
      socket.join(`variant:${variantId}`)
      if (config.isDev) console.log(`[Socket] ${socket.id} joined variant:${variantId}`)
    })

    // ── Leave variant room ───────────────────────────────────────────────────
    socket.on('leave:variant', (variantId: string) => {
      socket.leave(`variant:${variantId}`)
    })

    socket.on('disconnect', () => {
      if (config.isDev) console.log(`[Socket] disconnected: ${socket.id}`)
    })
  })

  // ── Redis subscriber ────────────────────────────────────────────────────────
  // Subscribe to wildcard pattern so we catch all variant updates in one place.
  // Redis pattern: bus:update:*  and  alert:*

  redisSub.psubscribe('bus:update:*', 'alert:*', (err) => {
    if (err) console.error('[Socket] Redis psubscribe error:', err)
    else console.log('[Socket] Subscribed to Redis channels')
  })

  redisSub.on('pmessage', (_pattern, channel, message) => {
    try {
      const payload = JSON.parse(message) as { type: string; data: unknown }

      // Extract variantId from channel name
      // bus:update:clxyz123  →  clxyz123
      // alert:clxyz123       →  clxyz123
      const variantId = channel.split(':').pop()
      if (!variantId) return

      // Emit to everyone in the variant room
      io.to(`variant:${variantId}`).emit('event', payload)

      if (config.isDev) {
        console.log(`[Socket] Emitted ${payload.type} to variant:${variantId}`)
      }
    } catch (err) {
      console.error('[Socket] Failed to parse Redis message:', err)
    }
  })

  return io
}
