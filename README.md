# Manga Reader App

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

### Installation
```bash
npm install
```

### Development
```bash
npm start        # Start Expo dev server
npm run android  # Run on Android
npm run ios      # Run on iOS (Mac only)
```

### Build
```bash
npx expo build:android  # Build Android APK
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

## Next Steps (Kotatsu Parser Integration)

This implementation provides the complete UI foundation. To integrate Kotatsu parsers:

1. **Create Kotlin Native Module** (`android/app/src/main/java/com/mangareader/KotatsuParserModule.kt`)
   - Implement `MangaLoaderContext`
   - Expose methods: `getSources()`, `searchManga()`, `getMangaDetails()`, `getChapterList()`, `getPageList()`

2. **Configure Android Build** (`android/build.gradle`)
   - Add JitPack repository
   - Add Kotatsu parsers dependency
   - Enable desugaring

3. **Replace Mock Data**
   - Update screens to call native module methods
   - Implement error handling
   - Add loading states

4. **File System Management**
   - Implement download manager using `expo-file-system`
   - Setup cache directory structure
   - Implement LRU cache eviction

## Current Implementation Status

✅ **Fully Functional UI** - All screens, navigation, and interactions
✅ **Theme System** - 12 themes with persistence
✅ **State Management** - Zustand stores for app, library, downloads
✅ **Reader Interface** - Auto-hiding controls, page navigation
✅ **Type Safety** - Full TypeScript coverage, no compilation errors
⏳ **Native Module** - Requires Kotlin implementation for Kotatsu parsers
⏳ **Real Data** - Currently using mock data (easy to replace)
⏳ **Downloads** - UI complete, needs file system integration

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
