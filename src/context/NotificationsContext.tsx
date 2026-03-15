import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { Alert, FeedbackReport, FeedbackTypeId } from '../types'
import { MOCK_ALERTS, MOCK_FEEDBACK } from '../data/mockData'

// ─── Context shape ─────────────────────────────────────────────────────────────

interface NotificationsContextValue {
  // Alerts
  alerts: Alert[]
  unreadCount: number
  markAllRead: () => void
  addAlert: (alert: Omit<Alert, 'id'>) => void

  // Crowd feedback
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

// ─── Context ───────────────────────────────────────────────────────────────────

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

// ─── Provider ──────────────────────────────────────────────────────────────────

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS)
  const [unreadCount, setUnreadCount] = useState(2)
  const [feedbackList, setFeedbackList] = useState<FeedbackReport[]>(MOCK_FEEDBACK)

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

      // Surface as an alert so the bell badge increments
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

  return (
    <NotificationsContext.Provider
      value={{
        alerts,
        unreadCount,
        markAllRead,
        addAlert,
        feedbackList,
        submitFeedback,
        voteFeedback,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * useNotifications — consume shared alert + feedback state anywhere in the tree.
 *
 * @example
 * const { unreadCount, submitFeedback } = useNotifications()
 */
export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext)
  if (!ctx) {
    throw new Error('useNotifications must be used inside <NotificationsProvider>')
  }
  return ctx
}