import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import db from '../db/client.js'
import { redis, channels } from '../redis/client.js'
import { verifyToken } from '../middleware/auth.js'

const AlertSchema = z.object({
  type:      z.enum(['DELAY', 'BREAKDOWN', 'DIVERSION', 'RESUMED']),
  message:   z.string().min(1).max(280),
  delayMins: z.number().min(1).max(120).optional(),
})

export async function alertRoutes(app: FastifyInstance): Promise<void> {

  // ── GET /alerts?variantId=xxx ──────────────────────────────────────────────
  app.get<{ Querystring: { variantId?: string; limit?: string } }>(
    '/alerts',
    async (request, reply) => {
      const { variantId, limit = '20' } = request.query

      const alerts = await db.alert.findMany({
        where: {
          ...(variantId ? { variantId } : {}),
          // Only return alerts from the last 2 hours
          createdAt: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        },
        orderBy: { createdAt: 'desc' },
        take:    Math.min(parseInt(limit, 10), 50),
        include: { shift: { include: { bus: true } } },
      })

      const data = alerts.map((a) => ({
        id:        a.id,
        variantId: a.variantId,
        type:      a.type,
        source:    a.source,
        message:   a.message,
        delayMins: a.delayMins,
        busId:     a.shift?.bus.fleetNumber ?? null,
        createdAt: a.createdAt.toISOString(),
      }))

      return reply.send({ ok: true, data })
    }
  )

  // ── POST /alerts ───────────────────────────────────────────────────────────
  // Conductor files a delay, breakdown, or diversion report.
  app.post(
    '/alerts',
    { preHandler: [verifyToken] },
    async (request, reply) => {
      const result = AlertSchema.safeParse(request.body)
      if (!result.success) {
        return reply.code(400).send({ ok: false, error: 'Invalid request', details: result.error.flatten() })
      }

      const conductorId = (request.user as { sub: string }).sub

      const shift = await db.shift.findFirst({
        where: { conductorId, status: 'ACTIVE' },
      })

      if (!shift) {
        return reply.code(404).send({ ok: false, error: 'No active shift found' })
      }

      const alert = await db.alert.create({
        data: {
          variantId: shift.variantId,
          shiftId:   shift.id,
          type:      result.data.type,
          source:    'CONDUCTOR',
          message:   result.data.message,
          delayMins: result.data.delayMins,
        },
        include: { shift: { include: { bus: true } } },
      })

      // Publish immediately to WebSocket so passengers see it in real time
      await redis.publish(
        channels.alert(shift.variantId),
        JSON.stringify({
          type: 'ALERT',
          data: {
            id:        alert.id,
            variantId: alert.variantId,
            alertType: alert.type,
            source:    alert.source,
            message:   alert.message,
            delayMins: alert.delayMins,
            busId:     alert.shift?.bus.fleetNumber,
            createdAt: alert.createdAt.toISOString(),
          },
        })
      )

      return reply.code(201).send({ ok: true, data: { id: alert.id } })
    }
  )
}
