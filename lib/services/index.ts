/**
 * Services Index
 * 
 * Re-exports all services for easy importing
 */

export type { DownloadTask } from './kotatsu';
export * from './kotatsu';
export { mangaService, type ReadingHistoryEntry } from './mangaService';
export { downloadService } from './downloadService';
