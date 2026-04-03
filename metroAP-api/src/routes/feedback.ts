import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import db from '../db/client.js'
import { redis, channels } from '../redis/client.js'

const FeedbackSchema = z.object({
  variantId:    z.string(),
  stopName:     z.string().min(1),
  type:         z.enum(['FULL', 'DELAYED', 'ARRIVED', 'SKIPPED', 'ACCIDENT', 'SMOOTH']),
  text:         z.string().max(280).optional().default(''),
  sessionToken: z.string().min(10),   // anonymous passenger ID from localStorage
})

const VoteSchema = z.object({
  sessionToken: z.string().min(10),
})

export async function feedbackRoutes(app: FastifyInstance): Promise<void> {

  // ── GET /feedback?variantId=xxx ────────────────────────────────────────────
  app.get<{ Querystring: { variantId?: string } }>(
    '/feedback',
    async (request, reply) => {
      const { variantId } = request.query

      const reports = await db.feedbackReport.findMany({
        where: {
          ...(variantId ? { variantId } : {}),
          createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }, // last 1 hour
        },
        orderBy: { voteCount: 'desc' },
        take: 30,
      })

      return reply.send({ ok: true, data: reports })
    }
  )

  // ── POST /feedback ─────────────────────────────────────────────────────────
  app.post('/feedback', async (request, reply) => {
    const result = FeedbackSchema.safeParse(request.body)
    if (!result.success) {
      return reply.code(400).send({ ok: false, error: 'Invalid request', details: result.error.flatten() })
    }

    const { variantId, stopName, type, text, sessionToken } = result.data

    const report = await db.feedbackReport.create({
      data: { variantId, stopName, type, text },
    })

    // Publish as an alert to the WebSocket room so others see it live
    await redis.publish(
      channels.alert(variantId),
      JSON.stringify({
        type: 'ALERT',
        data: {
          id:        report.id,
          variantId,
          alertType: 'CROWDSOURCE',
          source:    'PASSENGER',
          message:   text || type.toLowerCase(),
          stopName,
          createdAt: report.createdAt.toISOString(),
        },
      })
    )

    return reply.code(201).send({ ok: true, data: report })
  })

  // ── POST /feedback/:id/vote ────────────────────────────────────────────────
  app.post<{ Params: { id: string } }>(
    '/feedback/:id/vote',
    async (request, reply) => {
      const result = VoteSchema.safeParse(request.body)
      if (!result.success) {
        return reply.code(400).send({ ok: false, error: 'Session token required' })
      }

      const { id }           = request.params
      const { sessionToken } = result.data

      try {
        // Create vote (unique constraint prevents double-voting)
        await db.feedbackVote.create({
          data: { reportId: id, sessionToken },
        })

        // Increment counter
        const updated = await db.feedbackReport.update({
          where: { id },
          data:  { voteCount: { increment: 1 } },
        })

        return reply.send({ ok: true, data: { voteCount: updated.voteCount } })
      } catch {
        // Unique constraint violation = already voted
        return reply.code(409).send({ ok: false, error: 'Already voted' })
      }
    }
  )
}
