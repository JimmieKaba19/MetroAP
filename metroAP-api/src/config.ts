// ─── config.ts ─────────────────────────────────────────────────────────────────
// Single source of truth for all environment variables.
// The app will throw at startup if a required variable is missing —
// better than a mysterious runtime error later.

function require(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback
}

export const config = {
  // Server
  port:        parseInt(optional('PORT', '3000'), 10),
  nodeEnv:     optional('NODE_ENV', 'development'),
  isDev:       optional('NODE_ENV', 'development') === 'development',
  corsOrigins: optional('CORS_ORIGINS', 'http://localhost:5173').split(','),

  // Database
  databaseUrl: require('DATABASE_URL'),

  // Redis
  redisUrl: optional('REDIS_URL', 'redis://localhost:6379'),

  // Auth
  jwtSecret:    require('JWT_SECRET'),
  jwtExpiresIn: optional('JWT_EXPIRES_IN', '7d'),

  // Firebase
  firebaseServiceAccount: optional('FIREBASE_SERVICE_ACCOUNT_JSON', ''),

  // OSRM
  osrmUrl: optional('OSRM_URL', 'http://router.project-osrm.org'),

  // GPS
  gpsPingIntervalMs: parseInt(optional('GPS_PING_INTERVAL_MS', '35000'), 10),

  // Geofence
  geofenceRadiusM: parseInt(optional('GEOFENCE_RADIUS_M', '150'), 10),
} as const

export type Config = typeof config
