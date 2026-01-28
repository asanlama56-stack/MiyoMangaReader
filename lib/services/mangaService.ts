/**
 * Manga Service
 * 
 * High-level service layer that wraps the Kotatsu native bridge
 * and provides React-friendly APIs for manga operations.
 */

import { kotatsuParser } from './kotatsu';
import type {
  MangaSource,
  Manga,
  MangaChapter,
  MangaPage,
  MangaFilter,
  MangaListResponse,
  MangaTag,
  MangaState,
} from './kotatsu';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  ENABLED_SOURCES: 'manga_enabled_sources',
  READING_HISTORY: 'manga_reading_history',
  FAVORITES: 'manga_favorites',
};

/**
 * Reading history entry
 */
export interface ReadingHistoryEntry {
  manga: Manga;
  chapter: MangaChapter;
  page: number;
  totalPages: number;
  timestamp: number;
}

/**
 * Manga service class - singleton
 */
class MangaService {
  private enabledSourceIds: Set<string> = new Set();
  private sourcesCache: MangaSource[] | null = null;

  /**
   * Check if native module is available
   */
  isNativeModuleAvailable(): boolean {
    return kotatsuParser.checkAvailability();
  }

  /**
   * Get unavailable message for UI display
   */
  getUnavailableMessage(): string {
    return kotatsuParser.getUnavailableMessage();
  }

  /**
   * Initialize the service - load enabled sources from storage
   */
  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.ENABLED_SOURCES);
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        this.enabledSourceIds = new Set(ids);
      }
    } catch (error) {
      console.error('Failed to initialize MangaService:', error);
    }
  }

  /**
   * Get all available manga sources
   */
  async getSources(): Promise<MangaSource[]> {
    if (!this.isNativeModuleAvailable()) {
      throw new Error(this.getUnavailableMessage());
    }

    if (this.sourcesCache) {
      return this.sourcesCache;
    }

    const sources = await kotatsuParser.getSources();
    this.sourcesCache = sources;
    return sources;
  }

  /**
   * Get enabled sources
   */
  async getEnabledSources(): Promise<MangaSource[]> {
    const allSources = await this.getSources();
    if (this.enabledSourceIds.size === 0) {
      // Default: enable first 5 sources
      return allSources.slice(0, 5);
    }
    return allSources.filter((s) => this.enabledSourceIds.has(s.id));
  }

  /**
   * Enable/disable a source
   */
  async toggleSource(sourceId: string, enabled: boolean): Promise<void> {
    if (enabled) {
      this.enabledSourceIds.add(sourceId);
    } else {
      this.enabledSourceIds.delete(sourceId);
    }

    await AsyncStorage.setItem(
      STORAGE_KEYS.ENABLED_SOURCES,
      JSON.stringify([...this.enabledSourceIds])
    );
  }

  /**
   * Search manga across all enabled sources
   */
  async searchAllSources(
    query: string,
    page: number = 0
  ): Promise<{ sourceId: string; results: MangaListResponse }[]> {
    if (!this.isNativeModuleAvailable()) {
      throw new Error(this.getUnavailableMessage());
    }

    const enabledSources = await this.getEnabledSources();
    
    const searchPromises = enabledSources.map(async (source) => {
      try {
        const results = await kotatsuParser.searchManga(source.id, query, page);
        return { sourceId: source.id, results };
      } catch (error) {
        console.error(`Search failed for source ${source.id}:`, error);
        return {
          sourceId: source.id,
          results: { list: [], hasNextPage: false, page: 0 },
        };
      }
    });

    return Promise.all(searchPromises);
  }

  /**
   * Search manga in a specific source
   */
  async searchManga(
    sourceId: string,
    query: string,
    page: number = 0
  ): Promise<MangaListResponse> {
    if (!this.isNativeModuleAvailable()) {
      throw new Error(this.getUnavailableMessage());
    }
    return kotatsuParser.searchManga(sourceId, query, page);
  }

  /**
   * Get popular manga from a source
   */
  async getPopularManga(
    sourceId: string,
    page: number = 0
  ): Promise<MangaListResponse> {
    if (!this.isNativeModuleAvailable()) {
      throw new Error(this.getUnavailableMessage());
    }
    return kotatsuParser.getPopularManga(sourceId, page);
  }

  /**
   * Get latest manga from a source
   */
  async getLatestManga(
    sourceId: string,
    page: number = 0
  ): Promise<MangaListResponse> {
    if (!this.isNativeModuleAvailable()) {
      throw new Error(this.getUnavailableMessage());
    }
    return kotatsuParser.getLatestManga(sourceId, page);
  }

  /**
   * Get manga with filters
   */
  async getMangaList(
    sourceId: string,
    filter: MangaFilter
  ): Promise<MangaListResponse> {
    if (!this.isNativeModuleAvailable()) {
      throw new Error(this.getUnavailableMessage());
    }
    return kotatsuParser.getMangaList(sourceId, filter);
  }

  /**
   * Get full manga details
   */
  async getMangaDetails(sourceId: string, manga: Manga): Promise<Manga> {
    if (!this.isNativeModuleAvailable()) {
      throw new Error(this.getUnavailableMessage());
    }
    return kotatsuParser.getMangaDetails(sourceId, manga);
  }

  /**
   * Get chapter list for manga
   */
  async getChapterList(
    sourceId: string,
    manga: Manga
  ): Promise<MangaChapter[]> {
    if (!this.isNativeModuleAvailable()) {
      throw new Error(this.getUnavailableMessage());
    }
    return kotatsuParser.getChapterList(sourceId, manga);
  }

  /**
   * Get pages for a chapter
   */
  async getPageList(
    sourceId: string,
    chapter: MangaChapter
  ): Promise<MangaPage[]> {
    if (!this.isNativeModuleAvailable()) {
      throw new Error(this.getUnavailableMessage());
    }
    return kotatsuParser.getPageList(sourceId, chapter);
  }

  /**
   * Get resolved page URL
   */
  async getPageUrl(sourceId: string, page: MangaPage): Promise<string> {
    if (!this.isNativeModuleAvailable()) {
      throw new Error(this.getUnavailableMessage());
    }
    return kotatsuParser.getPageUrl(sourceId, page);
  }

  /**
   * Get available tags/genres for a source
   */
  async getAvailableTags(sourceId: string): Promise<MangaTag[]> {
    if (!this.isNativeModuleAvailable()) {
      throw new Error(this.getUnavailableMessage());
    }
    return kotatsuParser.getAvailableTags(sourceId);
  }

  /**
   * Save reading progress
   */
  async saveReadingProgress(
    manga: Manga,
    chapter: MangaChapter,
    page: number,
    totalPages: number
  ): Promise<void> {
    try {
      const historyStr = await AsyncStorage.getItem(STORAGE_KEYS.READING_HISTORY);
      const history: ReadingHistoryEntry[] = historyStr ? JSON.parse(historyStr) : [];
      
      // Update or add entry
      const existingIndex = history.findIndex(
        (h) => h.manga.id === manga.id && h.manga.source === manga.source
      );
      
      const entry: ReadingHistoryEntry = {
        manga,
        chapter,
        page,
        totalPages,
        timestamp: Date.now(),
      };

      if (existingIndex >= 0) {
        history[existingIndex] = entry;
      } else {
        history.unshift(entry);
      }

      // Keep only last 100 entries
      const trimmed = history.slice(0, 100);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.READING_HISTORY,
        JSON.stringify(trimmed)
      );
    } catch (error) {
      console.error('Failed to save reading progress:', error);
    }
  }

  /**
   * Get reading history
   */
  async getReadingHistory(): Promise<ReadingHistoryEntry[]> {
    try {
      const historyStr = await AsyncStorage.getItem(STORAGE_KEYS.READING_HISTORY);
      return historyStr ? JSON.parse(historyStr) : [];
    } catch (error) {
      console.error('Failed to get reading history:', error);
      return [];
    }
  }

  /**
   * Clear source cache
   */
  clearCache(): void {
    this.sourcesCache = null;
  }
}

// Export singleton instance
export const mangaService = new MangaService();

// Export class for testing
export { MangaService };
