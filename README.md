# Miyo Manga Reader

A production-ready manga reader app for Android built with React Native (Expo). Features 12+ customizable themes, a robust reader with multiple modes, and a modular architecture designed for long-term extensibility.

## Design Philosophy

**Neo-Brutalism meets HUD Glassmorphism** - Raw, high-contrast UI with glowing data accents, thick borders, and translucent panels. Perfect for a content-heavy app that needs to feel modern, edgy, and functional.

## Features Implemented

### Core Functionality
- ✅ **Theme Selection Screen** - First-launch experience with 12+ theme options and live previews
- ✅ **Bottom Navigation** - 5 tabs: Feed, Explore, Library, Downloads, Settings
- ✅ **Feed/Updates Screen** - Vertical scrolling list of recently updated manga
- ✅ **Explore/Browse Sources** - Grid of manga sources with global search capability
- ✅ **Manga Details Screen** - Hero section with cover art, metadata, synopsis, and chapter list
- ✅ **Reader Screen** - Full-screen immersive reader with auto-hiding UI controls
- ✅ **Library Management** - Grid view with category filtering and sorting
- ✅ **Downloads Management** - List view of downloaded chapters with progress tracking
- ✅ **Settings Screen** - Comprehensive settings with theme switching modal

### Theme System
12 pre-built themes with persistent storage:
1. Cyberpunk Dark (default)
2. Light Mode
3. AMOLED Black
4. Sunset Gradient
5. Forest Green
6. Ocean Blue
7. Cherry Blossom
8. Midnight Purple
9. Burnt Orange
10. Monochrome
11. Neon Green
12. Custom Accent

### State Management
- **Zustand** for global state (theme, library, downloads)
- **AsyncStorage** for persistent settings
- **React Query** ready for server state management

### UI/UX Features
- Shared element transitions for cover art
- Auto-hiding reader controls (3s timeout)
- Smooth animations with React Native Reanimated
- Safe area handling across all screens
- Gesture-based navigation in reader
- Card interactions with lift effects
- Theme color transitions (300ms)

## Project Structure

```
app/
├── (tabs)/              # Bottom tab navigation
│   ├── feed.tsx         # Recent updates feed
│   ├── explore.tsx      # Browse sources & search
│   ├── library.tsx      # Saved manga grid
│   ├── downloads.tsx    # Download management
│   └── settings.tsx     # App settings
├── manga/
│   └── [id].tsx         # Manga details screen
├── reader/
│   └── [chapterId].tsx  # Reading interface
└── index.tsx            # Entry point with theme selection

components/
└── ThemeSelectionScreen.tsx  # First-launch theme picker

lib/
├── themes.ts            # Theme definitions
├── store.ts             # Zustand stores
└── ThemeContext.tsx     # Theme provider

android/
├── app/
│   ├── src/main/java/com/miyomangareader/
│   │   ├── MainActivity.kt
│   │   ├── MainApplication.kt
│   │   ├── KotatsuParserModule.kt     # Native module for Kotatsu parsers
│   │   └── KotatsuParserPackage.kt    # React Native package registration
│   └── build.gradle
├── build.gradle
├── settings.gradle
└── gradle.properties
```

## Technology Stack

### Dependencies
- **expo**: ^54.0.25
- **react-native**: 0.81.5
- **expo-router**: ^6.0.15 (file-based routing)
- **zustand**: ^5.0.0 (state management)
- **@tanstack/react-query**: ^5.62.0 (server state)
- **@react-native-async-storage/async-storage**: ^2.1.0 (persistence)
- **expo-image**: ^3.0.10 (optimized images)
- **react-native-reanimated**: ^4.1.1 (animations)
- **react-native-gesture-handler**: ^2.28.0 (gestures)
- **react-native-safe-area-context**: ^5.6.0 (safe areas)
- **lucide-react-native**: ^0.479.0 (icons)
- **nativewind**: ^4.1.23 (Tailwind CSS)
- **axios**: ^1.7.0 (HTTP client)

## Getting Started

### Prerequisites
- **Node.js**: 18+ (LTS recommended)
- **npm** or **yarn**: Package manager
- **Expo CLI**: `npm install -g expo-cli` (optional but recommended)
- **EAS CLI**: `npm install -g eas-cli` (for cloud builds)
- **Android Studio**: SDK 33+ with Android Emulator
- **JDK**: Version 17+ (for local Android builds)
- **Git**: For version control

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd miyo-manga-reader

# Install dependencies
npm install
```

### Development
```bash
npm start        # Start Expo dev server
npm run android  # Run on Android
npm run ios      # Run on iOS (Mac only)
```

## Build Instructions

### Prerequisites for Building

**Android:**
- Android Studio installed with SDK 33+
- JDK 17+ (recommended: Amazon Corretto or OpenJDK)
- Gradle 8.6+ (bundled with project)
- Android device or emulator (API 24+)

**iOS (Mac only):**
- Xcode 15+ installed
- iOS device or simulator
- Apple Developer account (for physical device deployment)

### Building with EAS (Recommended)

EAS Build is Expo's cloud build service that handles the complexity of native builds.

**1. Login to Expo:**
```bash
npx eas-cli login
```

**2. Configure the project:**
```bash
npx eas-cli build:configure
```

**3. Build Android APK (internal testing):**
```bash
npx eas-cli build --platform android --profile preview
```

**4. Build Android AAB (Play Store):**
```bash
npx eas-cli build --platform android --profile production
```

**5. Build iOS (App Store/TestFlight):**
```bash
npx eas-cli build --platform ios --profile production
```

### Local Android Builds

If you prefer to build locally without cloud services:

**1. Prebuild native code:**
```bash
npx expo prebuild --platform android
```

**2. Navigate to android directory:**
```bash
cd android
```

**3. Build Debug APK:**
```bash
./gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

**4. Build Release APK:**
```bash
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

**5. Build Release AAB (for Play Store):**
```bash
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Development Builds with Dev Client

For faster iteration with native modules:

```bash
# Install dev client
npx expo install expo-dev-client

# Build development client
npx eas-cli build --platform android --profile development

# Or build locally
npx expo run:android
```

### EAS Build Profiles

The `eas.json` includes these profiles:

| Profile | Distribution | Build Type | Use Case |
|---------|-------------|------------|----------|
| `development` | internal | APK | Local dev with native debugging |
| `preview` | internal | APK | Testing/QA builds |
| `production` | store | AAB | Play Store submission |

### Signing Configuration

**Debug Builds:**
- Uses auto-generated debug keystore (no config needed)

**Release Builds (EAS):**
- EAS manages signing automatically
- Credentials stored securely in Expo's infrastructure

**Release Builds (Local):**
```bash
# Generate your own keystore
keytool -genkeypair -v \
  -keystore my-release-key.keystore \
  -alias my-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Move keystore to android/app/
mv my-release-key.keystore android/app/

# Update android/app/build.gradle signing config
```

### Installing Built APK

**Via ADB:**
```bash
adb install app-release.apk
```

**Via Device:**
- Transfer APK to device
- Enable "Install from unknown sources" in settings
- Tap APK to install

### Build Troubleshooting

**1. "gradlew not found" error:**
```bash
# The gradlew files are included in the project
# Make sure they're executable:
chmod +x android/gradlew
```

**2. Gradle build fails:**
```bash
cd android
./gradlew clean
./gradlew build --stacktrace
```

**3. JDK version mismatch:**
```bash
# Check your Java version
java -version

# Should be 17+. If not, install JDK 17:
# macOS: brew install openjdk@17
# Linux: sudo apt install openjdk-17-jdk
# Windows: Download from adoptium.net
```

**4. Out of memory during build:**
```bash
# Edit android/gradle.properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
```

**5. Metro bundler errors:**
```bash
# Clear all caches
npx expo start --clear
rm -rf node_modules
npm install
```

**6. Native module not found:**
```bash
# Rebuild native code
npx expo prebuild --clean --platform android
```

**7. SDK/Build tools not found:**
```bash
# Open Android Studio → SDK Manager
# Install required SDK versions (33+)
# Install Build Tools (35.0.0)
```

## Kotatsu Parser Integration

The app includes a Kotlin native module that integrates with Kotatsu Parsers library for real manga source support.

### Native Module Location
`android/app/src/main/java/com/miyomangareader/`

### Exposed Methods (JavaScript Bridge)
- `getSources()` - Returns list of available manga sources
- `searchManga(sourceId, query, offset)` - Search within a source
- `getMangaDetails(sourceId, mangaId)` - Get manga information
- `getChapterList(sourceId, mangaId)` - Get chapter listing
- `getPageList(sourceId, chapterId)` - Get page image URLs
- `globalSearch(query)` - Search across all sources

### Usage from React Native
```tsx
import { NativeModules } from 'react-native';
const { KotatsuParserModule } = NativeModules;

// Get sources
const sources = await KotatsuParserModule.getSources();

// Search manga
const results = await KotatsuParserModule.searchManga(
  'mangadex',
  'one piece',
  0
);
```

## Theme System Usage

Themes are stored in `lib/themes.ts` and accessed via the `useTheme()` hook:

```tsx
import { useTheme } from '@/lib/ThemeContext';

const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.background }}>
      <Text style={{ color: theme.text }}>Hello</Text>
    </View>
  );
};
```

Change theme programmatically:
```tsx
import { useAppStore } from '@/lib/store';

const { setTheme } = useAppStore();
await setTheme('amoled-black');
```

## State Management

### App Store (Settings)
```tsx
import { useAppStore } from '@/lib/store';

const { theme, isFirstLaunch, setTheme, loadSettings } = useAppStore();
```

### Library Store
```tsx
import { useLibraryStore } from '@/lib/store';

const { library, addToLibrary, removeFromLibrary } = useLibraryStore();
```

### Downloads Store
```tsx
import { useDownloadsStore } from '@/lib/store';

const { downloads, addDownload, updateDownload } = useDownloadsStore();
```

## Design Specifications

### Typography
- **Display/Headings**: Ultra-bold (900 weight), geometric
- **UI Labels**: Semi-bold (600 weight), technical feel
- **Body Text**: Regular/Medium (400/500 weight)

### Color System
Each theme includes:
- `background`: Main background color
- `surface`: Card/panel background
- `primary`: Main accent color
- `accent`: Secondary accent
- `text`: Primary text color
- `textSecondary`: Dimmed text
- `border`: Border color (3px thick)
- `shadow`: Shadow color with opacity

### Spacing
- Major sections: 24px minimum
- Card padding: 16px
- Grid gaps: 12px
- Screen padding: 24px (px-6)

### Animation Timings
- Page transitions: 150ms ease-out
- Button press: 100ms spring
- Card hover: 200ms ease-out
- Theme transition: 300ms ease-in-out
- UI auto-hide: 3000ms delay

## License

This is a learning/portfolio project. Manga content is accessed via third-party sources - users are responsible for compliance with local copyright laws.

## DMCA Disclaimer

This app does not host or store copyrighted content. All manga is accessed via third-party sources. DMCA takedown requests should be directed to the respective source providers.
