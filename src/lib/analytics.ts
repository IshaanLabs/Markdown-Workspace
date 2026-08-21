import { SITE_NAME } from '@/config/site'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

const MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim()
const ENABLE_IN_DEV = import.meta.env.VITE_GA_IN_DEV === 'true'

function shouldTrack(): boolean {
  if (!MEASUREMENT_ID || !MEASUREMENT_ID.startsWith('G-')) return false
  if (import.meta.env.DEV && !ENABLE_IN_DEV) return false
  return true
}

/** Load GA4 only when a valid Measurement ID is configured. */
export function initAnalytics(): void {
  if (!shouldTrack() || typeof document === 'undefined') return
  if (document.getElementById('ga4-gtag')) return

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: true,
    app_name: SITE_NAME,
  })

  const script = document.createElement('script')
  script.id = 'ga4-gtag'
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
  document.head.appendChild(script)
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (!shouldTrack() || typeof window.gtag !== 'function') return
  window.gtag('event', name, params)
}
