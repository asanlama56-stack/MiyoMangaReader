/**
 * Kotatsu Parser Module Bridge
 * 
 * This service acts as the JavaScript interface to the Kotlin KotatsuParserModule.
 * In development/web preview, it returns placeholder responses indicating native module required.
 * In production Android build, it bridges to the actual Kotlin implementation.
 * 
 * Build Instructions:
 * 1. Clone kotatsu-parsers: git clone https://github.com/KotatsuApp/kotatsu-parsers.git
 * 2. Configure JitPack in android/build.gradle
 * 3. Add dependency: implementation("com.github.KotatsuApp:kotatsu-parsers:$version")
 * 4. Enable core library desugaring
 * 5. Create KotatsuParserModule.kt in android/app/src/main/java/
 */

import { NativeModules, Platform } from 'react-native';
import type {
  IKotatsuParserModule,
  MangaSource,
  Manga,
  MangaChapter,
  MangaPage,
  MangaFilter,
  MangaListResponse,
  MangaTag,
  KotatsuError,
} from './types';

/**
 * Check if native module is available
 */
const isNativeModuleAvailable = (): boolean => {
  return Platform.OS === 'android' && !!NativeModules.KotatsuParserModule;
};

/**
 * Get the native module if available
 */
const getNativeModule = (): IKotatsuParserModule | null => {
  if (isNativeModuleAvailable()) {
    return NativeModules.KotatsuParserModule as IKotatsuParserModule;
  }
  return null;
};

/**
 * Error for when native module is not available
 */
class NativeModuleNotAvailableError extends Error {
  code = 'NATIVE_MODULE_NOT_AVAILABLE';
  
  constructor() {
    super(
      'KotatsuParserModule is not available. ' +
      'This app requires the Android native module to be built and configured. ' +
      'Please build the Android app with proper Kotatsu parsers integration.'
    );
    this.name = 'NativeModuleNotAvailableError';
  }
}

/**
 * Kotatsu Parser Module Bridge
 * Provides type-safe access to the native Kotlin module
 */
class KotatsuParserBridge implements IKotatsuParserModule {
  private nativeModule: IKotatsuParserModule | null = null;
  private isAvailable: boolean = false;

  constructor() {
    this.nativeModule = getNativeModule();
    this.isAvailable = isNativeModuleAvailable();
  }

  /**
   * Check if the native module is available
   */
  public checkAvailability(): boolean {
    return this.isAvailable;
  }

  /**
   * Get error message for unavailable module
   */
  public getUnavailableMessage(): string {
    return (
      'Native Kotatsu parser module not available.\n\n' +
      'This functionality requires:\n' +
      '• Android device/emulator\n' +
      '• Kotatsu parsers library integrated\n' +
      '• Native module properly configured\n\n' +
      'See android/ directory for implementation.'
    );
  }

  /**
   * Ensure native module is available before operations
   */
  private ensureNativeModule(): IKotatsuParserModule {
    if (!this.nativeModule) {
      throw new NativeModuleNotAvailableError();
    }
    return this.nativeModule;
  }

  async getSources(): Promise<MangaSource[]> {
    const nativeModule = this.ensureNativeModule();
    const sources = await nativeModule.getSources();
    return sources.map((source: any) => ({
      id: source.id,
      name: source.name,
      language: source.language,
      available: source.available ?? true,
    }));
  }

  async getSourceById(sourceId: string): Promise<MangaSource | null> {
    const sources = await this.getSources();
    return sources.find(s => s.id === sourceId) || null;
  }

  async searchManga(
    sourceId: string,
    query: string,
    page: number = 0
  ): Promise<MangaListResponse> {
    const nativeModule = this.ensureNativeModule();
    const results = await nativeModule.searchManga(sourceId, query, page);
    return {
      manga: results.map((item: any) => ({
        id: item.id,
        title: item.title,
        coverUrl: item.coverUrl,
        sourceId: item.sourceId,
      })),
      hasNextPage: false,
      currentPage: page,
    };
  }

  async getPopularManga(
    sourceId: string,
    page: number = 0
  ): Promise<MangaListResponse> {
    // Use empty search with sorting for popular manga
    return this.searchManga(sourceId, '', page);
  }

  async getLatestManga(
    sourceId: string,
    page: number = 0
  ): Promise<MangaListResponse> {
    // Use empty search to get latest manga
    return this.searchManga(sourceId, '', page);
  }

  async getMangaList(
    sourceId: string,
    filter: MangaFilter
  ): Promise<MangaListResponse> {
    return this.searchManga(sourceId, filter.query || '', 0);
  }

  async getMangaDetails(sourceId: string, manga: Manga): Promise<Manga> {
    const nativeModule = this.ensureNativeModule();
    const details = await nativeModule.getMangaDetails(sourceId, manga.id);
    return {
      ...manga,
      description: details.description,
      author: details.author,
      status: details.status,
      rating: parseFloat(details.rating),
      genres: details.genres,
    };
  }

  async getChapterList(
    sourceId: string,
    manga: Manga
  ): Promise<MangaChapter[]> {
    const nativeModule = this.ensureNativeModule();
    const chapters = await nativeModule.getChapterList(sourceId, manga.id);
    return chapters.map((chapter: any) => ({
      id: chapter.id,
      name: chapter.name,
      number: parseFloat(chapter.number),
      uploadDate: new Date(chapter.uploadDate),
      scanlator: chapter.scanlator,
    }));
  }

  async getPageList(
    sourceId: string,
    chapter: MangaChapter
  ): Promise<MangaPage[]> {
    const nativeModule = this.ensureNativeModule();
    const pages = await nativeModule.getPageList(sourceId, chapter.id);
    return pages.map((page: any) => ({
      index: page.index,
      url: page.url,
      width: page.width,
      height: page.height,
    }));
  }

  async getPageUrl(sourceId: string, page: MangaPage): Promise<string> {
    return page.url;
  }

  async getAvailableTags(sourceId: string): Promise<MangaTag[]> {
    // TODO: Implement tag retrieval when Kotatsu API exposes it
    return [];
  }
}

// Export singleton instance
export const kotatsuParser = new KotatsuParserBridge();

// Export class for testing
export { KotatsuParserBridge, NativeModuleNotAvailableError };
