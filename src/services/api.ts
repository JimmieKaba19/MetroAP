/**
 * services/api.ts
 *
 * All network calls go through here.
 * Currently returns mock data so the app works without a backend.
 *
 * When the backend is ready, replace each function body with a real
 * axios call — nothing else in the codebase needs to change.
 *
 * Base URL is read from the Vite env variable VITE_API_URL.
 * Create a .env.local file at the project root and add:
 *   VITE_API_URL=http://localhost:3000
 */

import axios from 'axios'
import type { Bus, Alert, FeedbackReport, FeedbackTypeId, Corridor } from '../types'
import { MOCK_BUSES, MOCK_ALERTS, MOCK_FEEDBACK, CORRIDORS } from '../data/mockData'

// ─── Axios instance ────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export const http = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * Fetch all route corridors and their variants.
 * Real endpoint: GET /api/corridors
 */
export async function getCorridors(): Promise<Corridor[]> {
  // TODO: return (await http.get('/api/corridors')).data
  return Promise.resolve(CORRIDORS)
}

// ─── Buses ────────────────────────────────────────────────────────────────────

/**
 * Fetch all active buses for a given route variant.
 * Real endpoint: GET /api/buses?variantId=1
 */
export async function getBusesByVariant(variantId: number): Promise<Bus[]> {
  // TODO: return (await http.get('/api/buses', { params: { variantId } })).data
  return Promise.resolve(MOCK_BUSES.filter((b) => b.variantId === variantId))
}

/**
 * Fetch a single bus by ID.
 * Real endpoint: GET /api/buses/:id
 */
export async function getBusById(id: string): Promise<Bus | null> {
  // TODO: return (await http.get(`/api/buses/${id}`)).data
  return Promise.resolve(MOCK_BUSES.find((b) => b.id === id) ?? null)
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

/**
 * Fetch recent alerts for a variant.
 * Real endpoint: GET /api/alerts?variantId=1
 */
export async function getAlerts(variantId?: number): Promise<Alert[]> {
  // TODO: return (await http.get('/api/alerts', { params: { variantId } })).data
  const filtered = variantId
    ? MOCK_ALERTS.filter((a) => a.variantId === variantId)
    : MOCK_ALERTS
  return Promise.resolve(filtered)
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

/**
 * Fetch crowd-sourced feedback reports for a variant.
 * Real endpoint: GET /api/feedback?variantId=1
 */
export async function getFeedback(variantId?: number): Promise<FeedbackReport[]> {
  // TODO: return (await http.get('/api/feedback', { params: { variantId } })).data
  const filtered = variantId
    ? MOCK_FEEDBACK.filter((f) => f.variantId === variantId)
    : MOCK_FEEDBACK
  return Promise.resolve(filtered)
}

/**
 * Submit a passenger feedback report.
 * Real endpoint: POST /api/feedback
 */
export async function submitFeedbackReport(payload: {
  variantId: number
  stopName: string
  type: FeedbackTypeId
  text: string
  busId?: string
}): Promise<FeedbackReport> {
  // TODO: return (await http.post('/api/feedback', payload)).data
  const report: FeedbackReport = {
    id: Date.now(),
    variantId: payload.variantId,
    stopName: payload.stopName,
    type: payload.type,
    text: payload.text,
    time: 'just now',
    votes: 0,
  }
  return Promise.resolve(report)
}

/**
 * Upvote a feedback report.
 * Real endpoint: POST /api/feedback/:id/vote
 */
export async function voteFeedbackReport(_id: number): Promise<void> {
  // TODO: await http.post(`/api/feedback/${_id}/vote`)
  return Promise.resolve()
}