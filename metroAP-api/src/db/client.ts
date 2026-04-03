import { PrismaClient } from '@prisma/client'
import { config } from '../config.js'

// ─── Prisma singleton ──────────────────────────────────────────────────────────
// One shared instance across the whole app.
// In development, log queries to help debug.

const db = new PrismaClient({
  log: config.isDev ? ['query', 'error', 'warn'] : ['error'],
})

export default db
