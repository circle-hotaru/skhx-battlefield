const measurementId = 'G-1VTZZ3JJY4'

type GtagCommand = 'config' | 'event' | 'js'
type GtagParameters = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (
      command: GtagCommand,
      target: string | Date,
      parameters?: GtagParameters,
    ) => void
  }
}

export function initAnalytics() {
  if (
    !measurementId ||
    !/^G-[A-Z0-9]+$/i.test(measurementId) ||
    typeof window === 'undefined'
  )
    return
  if (
    document.querySelector(`script[data-ga-measurement-id="${measurementId}"]`)
  )
    return

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args) {
    window.dataLayer.push(args)
  }

  window.gtag('js', new Date())
  window.gtag('config', measurementId, {
    send_page_view: true,
  })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
  script.dataset.gaMeasurementId = measurementId
  document.head.appendChild(script)
}

export function trackEvent(name: string, parameters: GtagParameters = {}) {
  if (
    !measurementId ||
    typeof window === 'undefined' ||
    typeof window.gtag !== 'function'
  )
    return
  window.gtag('event', name, parameters)
}
