import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, getThemeById } from './themes';

interface AppState {
  theme: Theme;
  isFirstLaunch: boolean;
  setTheme: (themeId: string) => Promise<void>;
  setFirstLaunch: (value: boolean) => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  theme: getThemeById('cyberpunk-dark'),
  isFirstLaunch: true,

  setTheme: async (themeId: string) => {
    const theme = getThemeById(themeId);
    set({ theme });
    await AsyncStorage.setItem('selectedTheme', themeId);
  },

  setFirstLaunch: async (value: boolean) => {
    set({ isFirstLaunch: value });
    await AsyncStorage.setItem('isFirstLaunch', JSON.stringify(value));
  },

  loadSettings: async () => {
    try {
      const [themeId, firstLaunch] = await Promise.all([
        AsyncStorage.getItem('selectedTheme'),
        AsyncStorage.getItem('isFirstLaunch'),
      ]);

      const updates: Partial<AppState> = {};
      
      if (themeId) {
        updates.theme = getThemeById(themeId);
      }
      
      if (firstLaunch !== null) {
        updates.isFirstLaunch = JSON.parse(firstLaunch);
      }

      if (Object.keys(updates).length > 0) {
        set(updates);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },
}));

// Library State
export interface Manga {
  id: string;
  sourceId: string;
  title: string;
  coverUrl: string;
  author?: string;
  status?: string;
  genres?: string[];
  synopsis?: string;
  category?: string;
  lastRead?: Date;
  lastUpdated?: Date;
}

interface LibraryState {
  library: Manga[];
  categories: string[];
  addToLibrary: (manga: Manga) => Promise<void>;
  removeFromLibrary: (mangaId: string) => Promise<void>;
  updateManga: (mangaId: string, updates: Partial<Manga>) => Promise<void>;
  loadLibrary: () => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  library: [],
  categories: ['Reading', 'Completed', 'Plan to Read'],

  addToLibrary: async (manga: Manga) => {
    const { library } = get();
    const updated = [...library, manga];
    set({ library: updated });
    await AsyncStorage.setItem('library', JSON.stringify(updated));
  },

  removeFromLibrary: async (mangaId: string) => {
    const { library } = get();
    const updated = library.filter((m) => m.id !== mangaId);
    set({ library: updated });
    await AsyncStorage.setItem('library', JSON.stringify(updated));
  },

  updateManga: async (mangaId: string, updates: Partial<Manga>) => {
    const { library } = get();
    const updated = library.map((m) =>
      m.id === mangaId ? { ...m, ...updates } : m
    );
    set({ library: updated });
    await AsyncStorage.setItem('library', JSON.stringify(updated));
  },

  loadLibrary: async () => {
    try {
      const data = await AsyncStorage.getItem('library');
      if (data) {
        set({ library: JSON.parse(data) });
      }
    } catch (error) {
      console.error('Failed to load library:', error);
    }
  },
}));

// Downloads State
export interface Download {
  mangaId: string;
  chapterId: string;
  title: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
}

interface DownloadsState {
  downloads: Download[];
  addDownload: (download: Download) => void;
  updateDownload: (chapterId: string, updates: Partial<Download>) => void;
  removeDownload: (chapterId: string) => void;
}

export const useDownloadsStore = create<DownloadsState>((set) => ({
  downloads: [],

  addDownload: (download: Download) => {
    set((state) => ({
      downloads: [...state.downloads, download],
    }));
  },

  updateDownload: (chapterId: string, updates: Partial<Download>) => {
    set((state) => ({
      downloads: state.downloads.map((d) =>
        d.chapterId === chapterId ? { ...d, ...updates } : d
      ),
    }));
  },

  removeDownload: (chapterId: string) => {
    set((state) => ({
      downloads: state.downloads.filter((d) => d.chapterId !== chapterId),
    }));
  },
}));
