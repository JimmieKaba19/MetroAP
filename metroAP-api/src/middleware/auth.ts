import type { FastifyRequest, FastifyReply } from 'fastify'
import type { JwtPayload } from '../types/index.js'

// ─── Auth middleware ───────────────────────────────────────────────────────────
// Attach to any route that requires a logged-in conductor.
// Usage: { preHandler: [verifyToken] }

export async function verifyToken(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify()
  } catch {
    reply.code(401).send({ ok: false, error: 'Unauthorised — invalid or expired token' })
  }
}

// ─── Type augmentation ────────────────────────────────────────────────────────
// Adds request.conductor so route handlers get typed access to the JWT payload.

declare module 'fastify' {
  interface FastifyRequest {
    conductor: JwtPayload
  }
}
