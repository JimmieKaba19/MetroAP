import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import db from '../db/client.js'
import { redis, keys } from '../redis/client.js'
import { verifyToken } from '../middleware/auth.js'
import { processGpsPing } from '../services/location.js'
import type { LiveBusState, GpsPingPayload } from '../types/index.js'

const PingSchema = z.object({
  lat:       z.number().min(-90).max(90),
  lng:       z.number().min(-180).max(180),
  speed:     z.number().min(0).max(200),
  heading:   z.number().min(0).max(360).optional(),
  accuracy:  z.number().min(0).optional(),
})

const StartShiftSchema = z.object({
  busId:     z.string(),
  variantId: z.string(),
})

export async function busRoutes(app: FastifyInstance): Promise<void> {

  // ── GET /buses?variantId=xxx ───────────────────────────────────────────────
  // Returns live bus states for a variant from Redis cache.
  // Falls back to DB if Redis is cold (e.g. after a restart).
  app.get<{ Querystring: { variantId?: string } }>(
    '/buses',
    async (request, reply) => {
      const { variantId } = request.query

      // Find active shifts for the variant
      const shifts = await db.shift.findMany({
        where: {
          status: 'ACTIVE',
          ...(variantId ? { variantId } : {}),
        },
        include: { bus: true },
      })

      // Pull live state from Redis for each shift
      const buses: LiveBusState[] = []
      for (const shift of shifts) {
        const raw = await redis.get(keys.busPosition(shift.id))
        if (raw) {
          buses.push(JSON.parse(raw) as LiveBusState)
        }
        // If Redis has no entry the bus is offline — skip it
      }

      return reply.send({ ok: true, data: buses })
    }
  )

  // ── POST /buses/shift/start ────────────────────────────────────────────────
  // Conductor starts a shift. Requires JWT auth.
  app.post(
    '/buses/shift/start',
    { preHandler: [verifyToken] },
    async (request, reply) => {
      const result = StartShiftSchema.safeParse(request.body)
      if (!result.success) {
        return reply.code(400).send({ ok: false, error: 'Invalid request', details: result.error.flatten() })
      }

      const conductorId = (request.user as { sub: string }).sub
      const { busId, variantId } = result.data

      // Check for an existing active shift for this conductor
      const existing = await db.shift.findFirst({
        where: { conductorId, status: 'ACTIVE' },
      })
      if (existing) {
        return reply.code(409).send({ ok: false, error: 'You already have an active shift. End it first.' })
      }

      const shift = await db.shift.create({
        data: { conductorId, busId, variantId },
        include: { bus: true, variant: true },
      })

      // Register the active shift in Redis
      await redis.set(keys.busShift(busId), shift.id)

      return reply.code(201).send({ ok: true, data: { shiftId: shift.id } })
    }
  )

  // ── POST /buses/shift/end ──────────────────────────────────────────────────
  app.post(
    '/buses/shift/end',
    { preHandler: [verifyToken] },
    async (request, reply) => {
      const conductorId = (request.user as { sub: string }).sub

      const shift = await db.shift.findFirst({
        where: { conductorId, status: 'ACTIVE' },
      })

      if (!shift) {
        return reply.code(404).send({ ok: false, error: 'No active shift found' })
      }

      await db.shift.update({
        where: { id: shift.id },
        data:  { status: 'COMPLETED', endedAt: new Date() },
      })

      // Remove from Redis
      await redis.del(keys.busPosition(shift.id))
      await redis.del(keys.busShift(shift.busId))

      return reply.send({ ok: true, data: { message: 'Shift ended' } })
    }
  )

  // ── POST /buses/ping ───────────────────────────────────────────────────────
  // The conductor app's heartbeat — fires every 30 seconds.
  app.post(
    '/buses/ping',
    { preHandler: [verifyToken] },
    async (request, reply) => {
      const result = PingSchema.safeParse(request.body)
      if (!result.success) {
        return reply.code(400).send({ ok: false, error: 'Invalid ping data', details: result.error.flatten() })
      }

      const conductorId = (request.user as { sub: string }).sub

      const shift = await db.shift.findFirst({
        where: { conductorId, status: 'ACTIVE' },
      })

      if (!shift) {
        return reply.code(404).send({ ok: false, error: 'No active shift. Start a shift first.' })
      }

      // Process asynchronously — don't make the conductor app wait
      processGpsPing(shift.id, result.data as GpsPingPayload).catch((err) =>
        console.error('[Location] processGpsPing error:', err)
      )

      return reply.code(202).send({ ok: true, data: { message: 'Ping received' } })
    }
  )
}
