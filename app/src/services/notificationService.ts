import type { ReminderOccurrence } from '@/types/reminder';

export type NotificationCapability = 'unsupported' | 'default' | 'granted' | 'denied';

export function getNotificationCapability(): NotificationCapability {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) return 'unsupported';
  return Notification.permission;
}

export async function requestSystemNotificationPermission(): Promise<NotificationPermission> {
  if (getNotificationCapability() === 'unsupported') return 'denied';
  return Notification.requestPermission();
}

export async function showReminderNotification(occurrence: ReminderOccurrence): Promise<boolean> {
  if (getNotificationCapability() !== 'granted') return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const dueTime = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(occurrence.dueAt));
    await registration.showNotification(occurrence.reminder.title, {
      body: occurrence.reminder.note || `Đến giờ nhắc lúc ${dueTime}`,
      icon: '/pwa-192x192.png',
      badge: '/pwa-64x64.png',
      tag: occurrence.occurrenceId,
      data: {
        reminderId: occurrence.reminderId,
        occurrenceId: occurrence.occurrenceId,
        quickLogAction: occurrence.reminder.quickLogAction,
      },
      actions: [
        { action: 'complete', title: 'Đã xong' },
        { action: 'snooze', title: 'Nhắc lại sau' },
        { action: 'quick-log', title: 'Ghi nhanh' },
      ],
    } as NotificationOptions);
    return true;
  } catch {
    return false;
  }
}
