type GtagParameters = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (command: 'event', name: string, parameters?: GtagParameters) => void
  }
}

export function trackEvent(name: string, parameters: GtagParameters = {}) {
  if (
    typeof window === 'undefined' ||
    typeof window.gtag !== 'function'
  )
    return
  window.gtag('event', name, parameters)
}
