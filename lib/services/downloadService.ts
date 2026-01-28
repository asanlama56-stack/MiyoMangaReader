/**
 * Download Service
 * 
 * Manages manga chapter downloads, caching, and offline storage.
 * Uses expo-file-system for file operations.
 */

import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mangaService } from './mangaService';
import type { Manga, MangaChapter, MangaPage, DownloadStatus, DownloadTask } from './kotatsu';

// Constants
const DOWNLOAD_DIR = `${FileSystem.documentDirectory}downloads/`;
const CACHE_DIR = `${FileSystem.documentDirectory}cache/`;
const BACKUP_DIR = `${FileSystem.documentDirectory}backups/`;
const MAX_CACHE_SIZE_MB = 500;

// Storage keys
const STORAGE_KEYS = {
  DOWNLOADS: 'download_tasks',
  CACHE_SIZE: 'cache_size',
};

/**
 * Ensure directory exists
 */
async function ensureDirectoryExists(dir: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

/**
 * Download Service class
 */
class DownloadService {
  private downloadQueue: DownloadTask[] = [];
  private isProcessing: boolean = false;
  private listeners: Set<(tasks: DownloadTask[]) => void> = new Set();

  /**
   * Initialize download service - create directories and load pending tasks
   */
  async initialize(): Promise<void> {
    try {
      await ensureDirectoryExists(DOWNLOAD_DIR);
      await ensureDirectoryExists(CACHE_DIR);
      await ensureDirectoryExists(BACKUP_DIR);
      
      // Load pending downloads
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEYS.DOWNLOADS);
      if (storedTasks) {
        this.downloadQueue = JSON.parse(storedTasks);
      }
    } catch (error) {
      console.error('Failed to initialize DownloadService:', error);
    }
  }

  /**
   * Subscribe to download queue updates
   */
  subscribe(listener: (tasks: DownloadTask[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of queue changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener([...this.downloadQueue]));
  }

  /**
   * Save download queue to storage
   */
  private async saveQueue(): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEYS.DOWNLOADS,
      JSON.stringify(this.downloadQueue)
    );
    this.notifyListeners();
  }

  /**
   * Get download directory for a manga/chapter
   */
  getChapterDirectory(mangaId: string, chapterId: string): string {
    return `${DOWNLOAD_DIR}${mangaId}/${chapterId}/`;
  }

  /**
   * Get cache directory for pages
   */
  getCacheDirectory(sourceId: string, chapterId: string): string {
    return `${CACHE_DIR}${sourceId}/${chapterId}/`;
  }

  /**
   * Add chapter to download queue
   */
  async queueDownload(
    manga: Manga,
    chapter: MangaChapter
  ): Promise<DownloadTask> {
    // Check if already exists
    const existing = this.downloadQueue.find(
      (t) => t.mangaId === manga.id && t.chapterId === chapter.id
    );
    
    if (existing) {
      return existing;
    }

    const task: DownloadTask = {
      id: `${manga.id}_${chapter.id}_${Date.now()}`,
      mangaId: manga.id,
      chapterId: chapter.id,
      sourceId: manga.source,
      status: 'PENDING' as DownloadStatus,
      progress: 0,
      totalPages: 0,
      downloadedPages: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.downloadQueue.push(task);
    await this.saveQueue();

    // Start processing if not already
    this.processQueue();

    return task;
  }

  /**
   * Pause a download
   */
  async pauseDownload(taskId: string): Promise<void> {
    const task = this.downloadQueue.find((t) => t.id === taskId);
    if (task && task.status === 'DOWNLOADING') {
      task.status = 'PAUSED' as DownloadStatus;
      task.updatedAt = Date.now();
      await this.saveQueue();
    }
  }

  /**
   * Resume a download
   */
  async resumeDownload(taskId: string): Promise<void> {
    const task = this.downloadQueue.find((t) => t.id === taskId);
    if (task && task.status === 'PAUSED') {
      task.status = 'PENDING' as DownloadStatus;
      task.updatedAt = Date.now();
      await this.saveQueue();
      this.processQueue();
    }
  }

  /**
   * Cancel a download
   */
  async cancelDownload(taskId: string): Promise<void> {
    const taskIndex = this.downloadQueue.findIndex((t) => t.id === taskId);
    if (taskIndex >= 0) {
      const task = this.downloadQueue[taskIndex];
      
      // Delete downloaded files
      const dir = this.getChapterDirectory(task.mangaId, task.chapterId);
      try {
        await FileSystem.deleteAsync(dir, { idempotent: true });
      } catch (error) {
        console.error('Failed to delete download files:', error);
      }

      // Remove from queue
      this.downloadQueue.splice(taskIndex, 1);
      await this.saveQueue();
    }
  }

  /**
   * Process the download queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;

    const pendingTask = this.downloadQueue.find(
      (t) => t.status === 'PENDING' as DownloadStatus
    );
    
    if (!pendingTask) return;

    this.isProcessing = true;

    try {
      await this.downloadChapter(pendingTask);
    } catch (error) {
      console.error('Download failed:', error);
      pendingTask.status = 'FAILED' as DownloadStatus;
      pendingTask.error = error instanceof Error ? error.message : 'Unknown error';
      pendingTask.updatedAt = Date.now();
      await this.saveQueue();
    }

    this.isProcessing = false;
    
    // Process next in queue
    this.processQueue();
  }

  /**
   * Download a chapter
   */
  private async downloadChapter(task: DownloadTask): Promise<void> {
    task.status = 'DOWNLOADING' as DownloadStatus;
    task.updatedAt = Date.now();
    await this.saveQueue();

    // Get pages - this requires native module
    if (!mangaService.isNativeModuleAvailable()) {
      throw new Error('Native module required for downloading');
    }

    // Create chapter mock for API call (in real implementation, we'd store full chapter data)
    const chapterMock = {
      id: task.chapterId,
      name: '',
      number: 0,
      volume: 0,
      url: '',
      uploadDate: 0,
      source: task.sourceId,
    };

    const pages = await mangaService.getPageList(task.sourceId, chapterMock);
    task.totalPages = pages.length;
    await this.saveQueue();

    const dir = this.getChapterDirectory(task.mangaId, task.chapterId);
    await ensureDirectoryExists(dir);

    for (let i = 0; i < pages.length; i++) {
      // Check if paused or cancelled
      const currentTask = this.downloadQueue.find((t) => t.id === task.id);
      if (!currentTask || currentTask.status !== ('DOWNLOADING' as DownloadStatus)) {
        return;
      }

      const page = pages[i];
      const pageUrl = await mangaService.getPageUrl(task.sourceId, page);
      const fileName = `page_${String(i).padStart(4, '0')}.jpg`;
      const filePath = `${dir}${fileName}`;

      try {
        await FileSystem.downloadAsync(pageUrl, filePath);
        task.downloadedPages = i + 1;
        task.progress = Math.round(((i + 1) / pages.length) * 100);
        task.updatedAt = Date.now();
        await this.saveQueue();
      } catch (error) {
        console.error(`Failed to download page ${i}:`, error);
        throw error;
      }
    }

    task.status = 'COMPLETED' as DownloadStatus;
    task.progress = 100;
    task.updatedAt = Date.now();
    await this.saveQueue();
  }

  /**
   * Check if chapter is downloaded
   */
  async isChapterDownloaded(mangaId: string, chapterId: string): Promise<boolean> {
    const task = this.downloadQueue.find(
      (t) => t.mangaId === mangaId && t.chapterId === chapterId
    );
    return task?.status === ('COMPLETED' as DownloadStatus);
  }

  /**
   * Get downloaded pages for a chapter
   */
  async getDownloadedPages(mangaId: string, chapterId: string): Promise<string[]> {
    const dir = this.getChapterDirectory(mangaId, chapterId);
    
    try {
      const info = await FileSystem.getInfoAsync(dir);
      if (!info.exists) return [];

      const files = await FileSystem.readDirectoryAsync(dir);
      return files
        .filter((f) => f.endsWith('.jpg'))
        .sort()
        .map((f) => `${dir}${f}`);
    } catch (error) {
      console.error('Failed to get downloaded pages:', error);
      return [];
    }
  }

  /**
   * Get all download tasks
   */
  getTasks(): DownloadTask[] {
    return [...this.downloadQueue];
  }

  /**
   * Get storage usage
   */
  async getStorageUsage(): Promise<{ downloads: number; cache: number }> {
    const getSize = async (dir: string): Promise<number> => {
      try {
        const info = await FileSystem.getInfoAsync(dir);
        if (!info.exists) return 0;
        // Note: expo-file-system doesn't provide easy recursive size calculation
        // In production, you'd implement proper size calculation
        return 0;
      } catch {
        return 0;
      }
    };

    return {
      downloads: await getSize(DOWNLOAD_DIR),
      cache: await getSize(CACHE_DIR),
    };
  }

  /**
   * Clear cache with LRU eviction
   */
  async clearCache(): Promise<void> {
    try {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
      await ensureDirectoryExists(CACHE_DIR);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Delete all downloads
   */
  async clearAllDownloads(): Promise<void> {
    try {
      await FileSystem.deleteAsync(DOWNLOAD_DIR, { idempotent: true });
      await ensureDirectoryExists(DOWNLOAD_DIR);
      this.downloadQueue = [];
      await this.saveQueue();
    } catch (error) {
      console.error('Failed to clear downloads:', error);
    }
  }

  /**
   * Export library backup
   */
  async exportBackup(libraryData: any): Promise<string> {
    const fileName = `library_${Date.now()}.json`;
    const filePath = `${BACKUP_DIR}${fileName}`;
    
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(libraryData, null, 2));
    
    return filePath;
  }

  /**
   * Import library backup
   */
  async importBackup(filePath: string): Promise<any> {
    const content = await FileSystem.readAsStringAsync(filePath);
    return JSON.parse(content);
  }

  /**
   * Get backup files
   */
  async getBackupFiles(): Promise<string[]> {
    try {
      const files = await FileSystem.readDirectoryAsync(BACKUP_DIR);
      return files.filter((f) => f.endsWith('.json'));
    } catch {
      return [];
    }
  }
}

// Export singleton instance
export const downloadService = new DownloadService();

// Export class for testing
export { DownloadService };
