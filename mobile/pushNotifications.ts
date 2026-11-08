import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Show pushes as banners even while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Returns null when the user declines notifications. Throws where Android push
// isn't available (e.g. Expo Go), so callers should handle that.
export async function getPushToken(): Promise<string | null> {
  // Android 13+ only shows the permission prompt once a channel exists.
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Likes and comments',
    importance: Notifications.AndroidImportance.DEFAULT,
  });

  const existing = await Notifications.getPermissionsAsync();
  const permission = existing.granted ? existing : await Notifications.requestPermissionsAsync();
  if (!permission.granted) return null;

  const projectId: unknown = Constants.expoConfig?.extra?.eas?.projectId;
  if (typeof projectId !== 'string') throw new Error('EAS projectId is missing from app config');

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}

// Runs inside the page so the request carries the user's session cookie. The server
// attaches the token to the logged-in user, or removes it when logged out.
export function registrationScript(siteUrl: string, token: string): string {
  const endpoint = JSON.stringify(`${siteUrl}/api/push-token`);
  const body = JSON.stringify(JSON.stringify({ token }));
  return `fetch(${endpoint}, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: ${body},
  }).catch(function (error) { console.warn('Push registration failed', error); });
  true;`;
}

// The path the server put in the push's data, if this response is a normal tap.
export function tappedPath(response: Notifications.NotificationResponse | null | undefined): string | null {
  if (response?.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return null;
  const path: unknown = response.notification.request.content.data?.path;
  return typeof path === 'string' && path.startsWith('/') ? path : null;
}
