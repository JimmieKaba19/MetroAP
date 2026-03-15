import { useState, useCallback } from 'react'
import type { Alert, FeedbackReport, FeedbackTypeId } from '../types'
import { MOCK_ALERTS, MOCK_FEEDBACK } from '../data/mockData'

// ─── Return shape ──────────────────────────────────────────────────────────────

interface UseNotificationsReturn {
  alerts: Alert[]
  unreadCount: number
  markAllRead: () => void
  addAlert: (alert: Omit<Alert, 'id'>) => void

  feedbackList: FeedbackReport[]
  submitFeedback: (
    variantId: number,
    stopName: string,
    type: FeedbackTypeId,
    text: string,
    busId?: string
  ) => void
  voteFeedback: (id: number) => void
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useNotifications(): UseNotificationsReturn {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS)
  const [unreadCount, setUnreadCount] = useState(2)
  const [feedbackList, setFeedbackList] = useState<FeedbackReport[]>(
    MOCK_FEEDBACK
  )

  const markAllRead = useCallback(() => {
    setUnreadCount(0)
  }, [])

  const addAlert = useCallback((alert: Omit<Alert, 'id'>) => {
    const newAlert: Alert = { ...alert, id: Date.now() }
    setAlerts((prev) => [newAlert, ...prev])
    setUnreadCount((prev) => prev + 1)
  }, [])

  const submitFeedback = useCallback(
    (
      variantId: number,
      stopName: string,
      type: FeedbackTypeId,
      text: string,
      busId = '—'
    ) => {
      // Add to feedback list
      const report: FeedbackReport = {
        id: Date.now(),
        variantId,
        stopName,
        type,
        text,
        time: 'just now',
        votes: 0,
      }
      setFeedbackList((prev) => [report, ...prev])

      // Also surface it as an alert
      addAlert({
        busId,
        variantId,
        msg: text || type,
        time: 'just now',
        type: 'crowdsource',
        source: 'passenger',
      })
    },
    [addAlert]
  )

  const voteFeedback = useCallback((id: number) => {
    setFeedbackList((prev) =>
      prev.map((f) => (f.id === id ? { ...f, votes: f.votes + 1 } : f))
    )
  }, [])

  return {
    alerts,
    unreadCount,
    markAllRead,
    addAlert,
    feedbackList,
    submitFeedback,
    voteFeedback,
  }
}