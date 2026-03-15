import { useState, useEffect } from 'react'

// BeforeInstallPromptEvent is not in the standard lib — extend it here
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface UseInstallPromptReturn {
  canInstall: boolean
  isInstalled: boolean
  triggerInstall: () => Promise<void>
  dismissInstall: () => void
}

export function useInstallPrompt(): UseInstallPromptReturn {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Already installed (running in standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setPromptEvent(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setPromptEvent(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const triggerInstall = async () => {
    if (!promptEvent) return
    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    setPromptEvent(null)
  }

  const dismissInstall = () => {
    setDismissed(true)
    setPromptEvent(null)
  }

  return {
    canInstall: Boolean(promptEvent) && !dismissed && !isInstalled,
    isInstalled,
    triggerInstall,
    dismissInstall,
  }
}