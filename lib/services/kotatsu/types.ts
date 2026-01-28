/**
 * Kotatsu Parser Types
 * 
 * These TypeScript types mirror the Kotlin data classes from the Kotatsu Parsers library.
 * Reference: https://github.com/KotatsuApp/kotatsu-parsers
 * 
 * IMPORTANT: In a production build, these types are populated by the KotatsuParserModule
 * native Kotlin module. The types here serve as the contract between JS and Kotlin layers.
 */

/**
 * Manga source information from Kotatsu parsers
 */
export interface MangaSource {
  id: string;
  name: string;
  locale: string;
  contentType: MangaContentType;
  sortCapabilities: SortCapability[];
  isNsfw: boolean;
  domain: string;
}

export enum MangaContentType {
  MANGA = 'MANGA',
  MANHWA = 'MANHWA',
  MANHUA = 'MANHUA',
  COMICS = 'COMICS',
  OTHER = 'OTHER',
}

export enum SortCapability {
  POPULARITY = 'POPULARITY',
  UPDATED = 'UPDATED',
  NEWEST = 'NEWEST',
  ALPHABETICAL = 'ALPHABETICAL',
  RATING = 'RATING',
}

/**
 * Manga state enumeration
 */
export enum MangaState {
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
  ABANDONED = 'ABANDONED',
  PAUSED = 'PAUSED',
  UPCOMING = 'UPCOMING',
}

/**
 * Manga data model - corresponds to org.koitharu.kotatsu.parsers.model.Manga
 */
export interface Manga {
  id: string;
  title: string;
  altTitle?: string;
  url: string;
  publicUrl: string;
  rating: number; // 0.0 to 1.0
  isNsfw: boolean;
  coverUrl: string;
  largeCoverUrl?: string;
  description?: string;
  tags: MangaTag[];
  state: MangaState | null;
  author?: string;
  source: string; // Source ID
  chapters?: MangaChapter[];
}

/**
 * Manga tag/genre
 */
export interface MangaTag {
  key: string;
  title: string;
}

/**
 * Chapter data model - corresponds to org.koitharu.kotatsu.parsers.model.MangaChapter
 */
export interface MangaChapter {
  id: string;
  name: string;
  number: number;
  volume: number;
  url: string;
  scanlator?: string;
  uploadDate: number; // Unix timestamp
  branch?: string;
  source: string;
}

/**
 * Page data model - corresponds to org.koitharu.kotatsu.parsers.model.MangaPage
 */
export interface MangaPage {
  id: string;
  url: string;
  preview?: string;
  source: string;
  chapterId: string;
}

/**
 * Filter options for manga search/browse
 */
export interface MangaFilter {
  query?: string;
  tags?: MangaTag[];
  tagsExclude?: MangaTag[];
  locale?: string;
  states?: MangaState[];
  sortOrder?: SortCapability;
  page?: number;
}

/**
 * Paginated response for manga lists
 */
export interface MangaListResponse {
  list: Manga[];
  hasNextPage: boolean;
  page: number;
}

/**
 * Error response from native module
 */
export interface KotatsuError {
  code: string;
  message: string;
  sourceId?: string;
}

/**
 * Native module bridge interface
 * This interface defines the methods exposed by KotatsuParserModule.kt
 */
export interface IKotatsuParserModule {
  // Source management
  getSources(): Promise<MangaSource[]>;
  getSourceById(sourceId: string): Promise<MangaSource | null>;
  
  // Manga operations
  searchManga(sourceId: string, query: string, page?: number): Promise<MangaListResponse>;
  getPopularManga(sourceId: string, page?: number): Promise<MangaListResponse>;
  getLatestManga(sourceId: string, page?: number): Promise<MangaListResponse>;
  getMangaList(sourceId: string, filter: MangaFilter): Promise<MangaListResponse>;
  
  // Manga details
  getMangaDetails(sourceId: string, manga: Manga): Promise<Manga>;
  
  // Chapters
  getChapterList(sourceId: string, manga: Manga): Promise<MangaChapter[]>;
  
  // Pages
  getPageList(sourceId: string, chapter: MangaChapter): Promise<MangaPage[]>;
  getPageUrl(sourceId: string, page: MangaPage): Promise<string>;
  
  // Tags/Genres
  getAvailableTags(sourceId: string): Promise<MangaTag[]>;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  maxSize: number; // In MB
  maxAge: number; // In milliseconds
  directory: string;
}

/**
 * Download task status
 */
export enum DownloadStatus {
  PENDING = 'PENDING',
  DOWNLOADING = 'DOWNLOADING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
}

/**
 * Download task
 */
export interface DownloadTask {
  id: string;
  mangaId: string;
  chapterId: string;
  sourceId: string;
  status: DownloadStatus;
  progress: number; // 0-100
  totalPages: number;
  downloadedPages: number;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Reader settings
 */
export interface ReaderSettings {
  readingMode: 'vertical' | 'horizontal' | 'webtoon';
  readingDirection: 'ltr' | 'rtl';
  backgroundColor: string;
  showPageNumber: boolean;
  keepScreenOn: boolean;
  preloadPages: number;
  zoomMode: 'fit-width' | 'fit-height' | 'fit-screen' | 'original';
}

/**
 * Reading progress tracking
 */
export interface ReadingProgress {
  mangaId: string;
  sourceId: string;
  chapterId: string;
  page: number;
  totalPages: number;
  percentage: number;
  lastRead: number; // Unix timestamp
}
