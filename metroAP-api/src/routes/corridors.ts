import type { FastifyInstance } from 'fastify'
import db from '../db/client.js'

export async function corridorRoutes(app: FastifyInstance): Promise<void> {

  // ── GET /corridors ─────────────────────────────────────────────────────────
  // Returns all active corridors with their variants and ordered stops.
  // This is what the passenger app calls on load to build the route selector.
  app.get('/corridors', async (_request, reply) => {
    const corridors = await db.corridor.findMany({
      include: {
        variants: {
          where: { isActive: true },
          include: {
            stops: {
              include: { stop: true },
              orderBy: { stopOrder: 'asc' },
            },
          },
        },
      },
    })

    // Shape the response to match what the passenger app expects
    const data = corridors.map((corridor) => ({
      id:    corridor.id,
      name:  corridor.name,
      color: corridor.color,
      variants: corridor.variants.map((v) => ({
        id:        v.id,
        code:      v.code,
        label:     v.label,
        direction: v.direction.toLowerCase(),
        short:     `${v.stops[0]?.stop.name ?? ''} → ${v.stops[v.stops.length - 1]?.stop.name ?? ''}`,
        stops:     v.stops.map((vs) => ({
          id:     vs.stop.id,
          name:   vs.stop.name,
          coords: { lat: vs.stop.lat, lng: vs.stop.lng },
        })),
      })),
    }))

    return reply.send({ ok: true, data })
  })

  // ── GET /corridors/:corridorId ─────────────────────────────────────────────
  app.get<{ Params: { corridorId: string } }>(
    '/corridors/:corridorId',
    async (request, reply) => {
      const corridor = await db.corridor.findUnique({
        where: { id: request.params.corridorId },
        include: {
          variants: {
            where: { isActive: true },
            include: {
              stops: {
                include: { stop: true },
                orderBy: { stopOrder: 'asc' },
              },
            },
          },
        },
      })

      if (!corridor) {
        return reply.code(404).send({ ok: false, error: 'Corridor not found' })
      }

      return reply.send({ ok: true, data: corridor })
    }
  )
}
