// Simple Desktop Notification Service
// Works in Electron (renderer) and standard browsers via HTML5 Notification API

const isNotificationSupported = () => typeof window !== 'undefined' && 'Notification' in window;

export const initNotifications = async () => {
  try {
    if (!isNotificationSupported()) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  } catch {
    return false;
  }
};

export const notify = (options) => {
  try {
    if (!isNotificationSupported()) return;
    const { title, body, icon } = options || {};
    const safeTitle = title || 'GIR Business Suite';
    const safeBody = body || '';

    if (Notification.permission === 'granted') {
      const n = new Notification(safeTitle, {
        body: safeBody,
        icon: icon || '/icon.png',
        silent: false,
      });
      setTimeout(() => {
        try { n.close(); } catch {}
      }, 5000);
    }
  } catch {}
};

export const pushViaServer = async (payload) => {
  try {
    await fetch('/api/push/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {}
};
