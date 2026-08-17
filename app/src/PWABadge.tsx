import './PWABadge.css'

import { useRegisterSW } from 'virtual:pwa-register/react'

function PWABadge() {
  const period = 60 * 60 * 1000

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(swUrl, registration) {
      if (!registration) return

      const checkForUpdate = async () => {
        if ('onLine' in navigator && !navigator.onLine)
          return

        try {
          const response = await fetch(swUrl, {
            cache: 'no-store',
            headers: {
              'cache': 'no-store',
              'cache-control': 'no-cache',
            },
          })
          if (response.status === 200)
            await registration.update()
        }
        catch {
          // Update checks are best-effort. The service worker keeps the app usable offline.
        }
      }

      void checkForUpdate()

      const intervalId = window.setInterval(() => void checkForUpdate(), period)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible')
          void checkForUpdate()
      }
      const handleOnline = () => void checkForUpdate()

      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('online', handleOnline)

      window.addEventListener('pagehide', () => {
        window.clearInterval(intervalId)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        window.removeEventListener('online', handleOnline)
      }, { once: true })
    },
  })

  function close() {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div className="PWABadge" role="alert" aria-labelledby="toast-message">
      { (offlineReady || needRefresh)
      && (
        <div className="PWABadge-toast">
          <div className="PWABadge-message">
            { offlineReady
              ? <span id="toast-message">App ready to work offline</span>
              : <span id="toast-message">New content available, click on reload button to update.</span>}
          </div>
          <div className="PWABadge-buttons">
            { needRefresh && <button className="PWABadge-toast-button" onClick={() => updateServiceWorker(true)}>Reload</button> }
            <button className="PWABadge-toast-button" onClick={() => close()}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PWABadge
