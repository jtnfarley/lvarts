const SITE_HOSTS = new Set(['lvartandmusic.com', 'www.lvartandmusic.com']);
// Google is allowed in the WebView because the site's "Sign in with Google" flow
// runs there and returns to the site.
const IN_APP_HOSTS = new Set([...SITE_HOSTS, 'accounts.google.com']);

function hostIsIn(url: string, hosts: Set<string>): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    return (protocol === 'https:' || protocol === 'http:') && hosts.has(hostname);
  } catch (error) {
    console.warn('Unparseable navigation URL, sending it to the system', url, error);
    return false;
  }
}

export function shouldOpenInApp(url: string): boolean {
  return url === 'about:blank' || hostIsIn(url, IN_APP_HOSTS);
}

export function isSiteUrl(url: string): boolean {
  return hostIsIn(url, SITE_HOSTS);
}
