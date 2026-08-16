/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

declare let self: ServiceWorkerGlobalScope

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING')
    self.skipWaiting()
})

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()

  const data = (event.notification.data ?? {}) as {
    reminderId?: string
    occurrenceId?: string
    quickLogAction?: string
  }
  const action = event.action || 'quick-log'
  const target = new URL('/', self.location.origin)
  target.searchParams.set('reminderAction', action)
  if (data.reminderId) target.searchParams.set('reminderId', data.reminderId)
  if (data.occurrenceId) target.searchParams.set('occurrenceId', data.occurrenceId)

  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const existing = clients.find((client) => new URL(client.url).origin === self.location.origin) as WindowClient | undefined
    if (existing) {
      const navigated = await existing.navigate(target.toString())
      await (navigated ?? existing).focus()
      return
    }
    await self.clients.openWindow(target.toString())
  })())
})

// self.__WB_MANIFEST is the default injection point
precacheAndRoute(self.__WB_MANIFEST)

cleanupOutdatedCaches()

/** @type {RegExp[] | undefined} */
let allowlist
if (import.meta.env.DEV)
  allowlist = [/^\/$/]

registerRoute(new NavigationRoute(
  createHandlerBoundToURL('index.html'),
  { allowlist },
))
