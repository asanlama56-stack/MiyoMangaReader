/**
 * Manga Hooks
 * 
 * React Query hooks for manga data fetching and caching.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mangaService, downloadService } from '../services';
import type {
  MangaSource,
  Manga,
  MangaChapter,
  MangaPage,
  MangaFilter,
  MangaListResponse,
  MangaTag,
} from '../services/kotatsu';

// Query keys
export const mangaKeys = {
  all: ['manga'] as const,
  sources: () => [...mangaKeys.all, 'sources'] as const,
  enabledSources: () => [...mangaKeys.all, 'enabledSources'] as const,
  search: (query: string) => [...mangaKeys.all, 'search', query] as const,
  popular: (sourceId: string) => [...mangaKeys.all, 'popular', sourceId] as const,
  latest: (sourceId: string) => [...mangaKeys.all, 'latest', sourceId] as const,
  list: (sourceId: string, filter: MangaFilter) =>
    [...mangaKeys.all, 'list', sourceId, filter] as const,
  details: (sourceId: string, mangaId: string) =>
    [...mangaKeys.all, 'details', sourceId, mangaId] as const,
  chapters: (sourceId: string, mangaId: string) =>
    [...mangaKeys.all, 'chapters', sourceId, mangaId] as const,
  pages: (sourceId: string, chapterId: string) =>
    [...mangaKeys.all, 'pages', sourceId, chapterId] as const,
  tags: (sourceId: string) => [...mangaKeys.all, 'tags', sourceId] as const,
  history: () => [...mangaKeys.all, 'history'] as const,
};

/**
 * Hook to check if native module is available
 */
export function useNativeModuleAvailability() {
  return {
    isAvailable: mangaService.isNativeModuleAvailable(),
    message: mangaService.getUnavailableMessage(),
  };
}

/**
 * Hook to get all manga sources
 */
export function useSources() {
  return useQuery({
    queryKey: mangaKeys.sources(),
    queryFn: () => mangaService.getSources(),
    enabled: mangaService.isNativeModuleAvailable(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to get enabled manga sources
 */
export function useEnabledSources() {
  return useQuery({
    queryKey: mangaKeys.enabledSources(),
    queryFn: () => mangaService.getEnabledSources(),
    enabled: mangaService.isNativeModuleAvailable(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to search manga across all sources
 */
export function useGlobalSearch(query: string, page: number = 0) {
  return useQuery({
    queryKey: mangaKeys.search(query),
    queryFn: () => mangaService.searchAllSources(query, page),
    enabled: mangaService.isNativeModuleAvailable() && query.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to search manga in a specific source
 */
export function useSourceSearch(
  sourceId: string,
  query: string,
  page: number = 0
) {
  return useQuery({
    queryKey: [...mangaKeys.search(query), sourceId, page],
    queryFn: () => mangaService.searchManga(sourceId, query, page),
    enabled: mangaService.isNativeModuleAvailable() && !!sourceId && query.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to get popular manga from a source
 */
export function usePopularManga(sourceId: string, page: number = 0) {
  return useQuery({
    queryKey: [...mangaKeys.popular(sourceId), page],
    queryFn: () => mangaService.getPopularManga(sourceId, page),
    enabled: mangaService.isNativeModuleAvailable() && !!sourceId,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

/**
 * Hook to get latest manga from a source
 */
export function useLatestManga(sourceId: string, page: number = 0) {
  return useQuery({
    queryKey: [...mangaKeys.latest(sourceId), page],
    queryFn: () => mangaService.getLatestManga(sourceId, page),
    enabled: mangaService.isNativeModuleAvailable() && !!sourceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get manga list with filters
 */
export function useMangaList(sourceId: string, filter: MangaFilter) {
  return useQuery({
    queryKey: mangaKeys.list(sourceId, filter),
    queryFn: () => mangaService.getMangaList(sourceId, filter),
    enabled: mangaService.isNativeModuleAvailable() && !!sourceId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to get manga details
 */
export function useMangaDetails(sourceId: string, manga: Manga | null) {
  return useQuery({
    queryKey: mangaKeys.details(sourceId, manga?.id ?? ''),
    queryFn: () => mangaService.getMangaDetails(sourceId, manga!),
    enabled: mangaService.isNativeModuleAvailable() && !!sourceId && !!manga,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to get chapter list
 */
export function useChapterList(sourceId: string, manga: Manga | null) {
  return useQuery({
    queryKey: mangaKeys.chapters(sourceId, manga?.id ?? ''),
    queryFn: () => mangaService.getChapterList(sourceId, manga!),
    enabled: mangaService.isNativeModuleAvailable() && !!sourceId && !!manga,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

/**
 * Hook to get page list for a chapter
 */
export function usePageList(sourceId: string, chapter: MangaChapter | null) {
  return useQuery({
    queryKey: mangaKeys.pages(sourceId, chapter?.id ?? ''),
    queryFn: () => mangaService.getPageList(sourceId, chapter!),
    enabled: mangaService.isNativeModuleAvailable() && !!sourceId && !!chapter,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to get available tags for a source
 */
export function useTags(sourceId: string) {
  return useQuery({
    queryKey: mangaKeys.tags(sourceId),
    queryFn: () => mangaService.getAvailableTags(sourceId),
    enabled: mangaService.isNativeModuleAvailable() && !!sourceId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to get reading history
 */
export function useReadingHistory() {
  return useQuery({
    queryKey: mangaKeys.history(),
    queryFn: () => mangaService.getReadingHistory(),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}

/**
 * Hook to toggle source enabled state
 */
export function useToggleSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sourceId, enabled }: { sourceId: string; enabled: boolean }) =>
      mangaService.toggleSource(sourceId, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mangaKeys.enabledSources() });
    },
  });
}

/**
 * Hook to save reading progress
 */
export function useSaveReadingProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      manga,
      chapter,
      page,
      totalPages,
    }: {
      manga: Manga;
      chapter: MangaChapter;
      page: number;
      totalPages: number;
    }) => mangaService.saveReadingProgress(manga, chapter, page, totalPages),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mangaKeys.history() });
    },
  });
}

/**
 * Hook to queue chapter download
 */
export function useQueueDownload() {
  return useMutation({
    mutationFn: ({ manga, chapter }: { manga: Manga; chapter: MangaChapter }) =>
      downloadService.queueDownload(manga, chapter),
  });
}
