import type { FastifyInstance } from 'fastify'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import db from '../db/client.js'

const LoginSchema = z.object({
  phone:    z.string().min(10),
  password: z.string().min(6),
})

export async function authRoutes(app: FastifyInstance): Promise<void> {

  // ── POST /auth/conductor/login ─────────────────────────────────────────────
  app.post('/auth/conductor/login', async (request, reply) => {
    const result = LoginSchema.safeParse(request.body)
    if (!result.success) {
      return reply.code(400).send({ ok: false, error: 'Invalid request', details: result.error.flatten() })
    }

    const { phone, password } = result.data

    const conductor = await db.conductor.findUnique({
      where: { phone },
      include: { operator: true },
    })

    if (!conductor || !conductor.isActive) {
      return reply.code(401).send({ ok: false, error: 'Invalid credentials' })
    }

    const valid = await bcrypt.compare(password, conductor.passwordHash)
    if (!valid) {
      return reply.code(401).send({ ok: false, error: 'Invalid credentials' })
    }

    const token = app.jwt.sign({
      sub:        conductor.id,
      operatorId: conductor.operatorId,
      type:       'conductor',
    })

    return reply.send({
      ok: true,
      data: {
        token,
        conductor: {
          id:       conductor.id,
          name:     conductor.name,
          phone:    conductor.phone,
          operator: { id: conductor.operator.id, name: conductor.operator.name },
        },
      },
    })
  })
}
