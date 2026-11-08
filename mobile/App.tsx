import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
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

const SITE_URL = 'https://www.lvartandmusic.com';
// The site can detect the app from this suffix in the user-agent (e.g. to hide UI).
const USER_AGENT_SUFFIX = 'LVArtMusicApp';
const BACKGROUND_COLOR = '#000000';
const ACCENT_COLOR = '#eb7f2e';

SplashScreen.preventAutoHideAsync().catch((error: unknown) => {
  console.warn('Could not hold the splash screen', error);
});

export default function App() {
  const webViewRef = useRef<WebView<object>>(null);
  const canGoBackRef = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Pull-to-refresh must only trigger when the page itself is scrolled to the top.
  const [isAtTop, setIsAtTop] = useState(true);

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
    webViewRef.current?.reload();
  }, []);

  const handleLoadEnd = useCallback(() => {
    setIsRefreshing(false);
    SplashScreen.hideAsync().catch((error: unknown) => {
      console.warn('Could not hide the splash screen', error);
    });
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
            source={{ uri: SITE_URL }}
            style={styles.container}
            applicationNameForUserAgent={USER_AGENT_SUFFIX}
            onNavigationStateChange={handleNavigationStateChange}
            onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => setIsAtTop(event.nativeEvent.contentOffset.y <= 0)}
            onLoadEnd={handleLoadEnd}
            renderError={() => <OfflineScreen onRetry={handleRefresh} />}
            startInLoadingState={false}
          />
        </ScrollView>
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
