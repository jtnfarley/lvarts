import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Linking,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { WebView } from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import { shouldOpenInApp } from './navigationRules';

const SITE_URL = 'https://www.lvartandmusic.com';
// The site can detect the app from this suffix in the user-agent (e.g. to hide UI).
const USER_AGENT_SUFFIX = 'LVArtMusicApp';
const BACKGROUND_COLOR = '#000000';
const ACCENT_COLOR = '#eb7f2e';
// A page that hasn't finished loading by now is treated as unreachable.
const LOAD_TIMEOUT_MS = 30000;

SplashScreen.preventAutoHideAsync().catch((error: unknown) => {
  console.warn('Could not hold the splash screen', error);
});

export default function App() {
  const webViewRef = useRef<WebView<object>>(null);
  const canGoBackRef = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Pull-to-refresh must only trigger when the page itself is scrolled to the top.
  const [isAtTop, setIsAtTop] = useState(true);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [sourceUrl, setSourceUrl] = useState(SITE_URL);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLoadTimeout = useCallback(() => {
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    loadTimeoutRef.current = null;
  }, []);

  useEffect(() => clearLoadTimeout, [clearLoadTimeout]);

  // Android App Links (e.g. the emailed sign-in link) launch the app with a URL;
  // load it in the WebView so the session cookie is set here, not in the browser.
  useEffect(() => {
    const openIncomingUrl = (url: string) => {
      if (shouldOpenInApp(url)) setSourceUrl(url);
    };
    Linking.getInitialURL()
      .then((url) => {
        if (url) openIncomingUrl(url);
      })
      .catch((error: unknown) => console.warn('Could not read the launch URL', error));
    const subscription = Linking.addEventListener('url', ({ url }) => openIncomingUrl(url));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!canGoBackRef.current) return false;
      webViewRef.current?.goBack();
      return true;
    });
    return () => subscription.remove();
  }, []);

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    canGoBackRef.current = navState.canGoBack;
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setHasTimedOut(false);
    webViewRef.current?.reload();
  }, []);

  const handleLoadStart = useCallback(() => {
    clearLoadTimeout();
    loadTimeoutRef.current = setTimeout(() => setHasTimedOut(true), LOAD_TIMEOUT_MS);
  }, [clearLoadTimeout]);

  const handleLoadEnd = useCallback(() => {
    clearLoadTimeout();
    setIsRefreshing(false);
    setHasTimedOut(false);
    SplashScreen.hideAsync().catch((error: unknown) => {
      console.warn('Could not hide the splash screen', error);
    });
  }, [clearLoadTimeout]);

  // Keep the site's own pages in the app; hand everything else (other websites,
  // mailto:, tel:, geo:, Maps links) to the system.
  const handleShouldStartLoad = useCallback((request: ShouldStartLoadRequest) => {
    if (!request.isTopFrame || shouldOpenInApp(request.url)) return true;
    Linking.openURL(request.url).catch((error: unknown) => {
      console.warn('No app could open', request.url, error);
    });
    return false;
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              enabled={isAtTop}
              colors={[ACCENT_COLOR]}
              progressBackgroundColor={BACKGROUND_COLOR}
            />
          }
        >
          <WebView<object>
            ref={webViewRef}
            source={{ uri: sourceUrl }}
            style={styles.container}
            applicationNameForUserAgent={USER_AGENT_SUFFIX}
            onNavigationStateChange={handleNavigationStateChange}
            onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => setIsAtTop(event.nativeEvent.contentOffset.y <= 0)}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            // Open target="_blank" links in the same view so the rules above apply to them.
            setSupportMultipleWindows={false}
            renderError={() => <OfflineScreen onRetry={handleRefresh} />}
            startInLoadingState={false}
          />
        </ScrollView>
        {hasTimedOut && <OfflineScreen onRetry={handleRefresh} />}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function OfflineScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.offline}>
      <Text style={styles.offlineTitle}>Can't reach LV Art & Music</Text>
      <Text style={styles.offlineBody}>Check your connection and try again.</Text>
      <Pressable style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryLabel}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  offline: {
    ...StyleSheet.absoluteFill,
    backgroundColor: BACKGROUND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  offlineTitle: { color: '#f4f4f5', fontSize: 20, fontWeight: '600', marginBottom: 8 },
  offlineBody: { color: '#a1a1aa', fontSize: 16, marginBottom: 24 },
  retryButton: {
    backgroundColor: ACCENT_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryLabel: { color: '#fffaf3', fontSize: 16, fontWeight: '600' },
});
