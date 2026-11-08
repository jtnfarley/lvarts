import type { ConfigContext, ExpoConfig } from 'expo/config';

// google-services.json is gitignored, so EAS cloud builds receive it as a file secret
// in GOOGLE_SERVICES_JSON; local runs use the file itself.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'LV Art & Music',
  slug: config.slug ?? 'lvartsmusic',
  android: {
    ...config.android,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
  },
});
