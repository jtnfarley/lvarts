// Hosts that must stay inside the WebView. Google is here because the site's
// "Sign in with Google" flow runs in the WebView and returns to the site.
const IN_APP_HOSTS = new Set([
  'lvartandmusic.com',
  'www.lvartandmusic.com',
  'accounts.google.com',
]);

export function shouldOpenInApp(url: string): boolean {
  if (url === 'about:blank') return true;
  try {
    const { protocol, hostname } = new URL(url);
    return (protocol === 'https:' || protocol === 'http:') && IN_APP_HOSTS.has(hostname);
  } catch (error) {
    console.warn('Unparseable navigation URL, sending it to the system', url, error);
    return false;
  }
}
