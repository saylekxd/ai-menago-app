import 'dotenv/config';

export default {
  name: "Task Manager",
  slug: "task-manager-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true
  },
  web: {
    bundler: "metro",
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "expo-router"
  ],
  extra: {
    SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || "",
    }
  }
};