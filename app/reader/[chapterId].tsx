import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/lib/ThemeContext';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  Settings,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react-native';
import { usePageList, useNativeModuleAvailability, useSaveReadingProgress } from '@/lib/hooks';
import { downloadService } from '@/lib/services';
import type { Manga, MangaChapter, MangaPage } from '@/lib/services/kotatsu';

const { width, height } = Dimensions.get('window');

export default function ReaderScreen() {
  const theme = useTheme();
  const {
    chapterId,
    sourceId,
    mangaId,
    chapterData,
    mangaData,
    startPage,
  } = useLocalSearchParams<{
    chapterId: string;
    sourceId: string;
    mangaId: string;
    chapterData: string;
    mangaData: string;
    startPage: string;
  }>();

  const [currentPage, setCurrentPage] = useState(
    startPage ? parseInt(startPage, 10) : 0
  );
  const [showUI, setShowUI] = useState(true);
  const [offlinePages, setOfflinePages] = useState<string[]>([]);
  const opacity = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
  const { isAvailable } = useNativeModuleAvailability();
  const saveProgress = useSaveReadingProgress();

  // Parse chapter and manga data
  const chapter: MangaChapter | null = React.useMemo(() => {
    if (chapterData) {
      try {
        return JSON.parse(chapterData);
      } catch {
        return null;
      }
    }
    return null;
  }, [chapterData]);

  const manga: Manga | null = React.useMemo(() => {
    if (mangaData) {
      try {
        return JSON.parse(mangaData);
      } catch {
        return null;
      }
    }
    return null;
  }, [mangaData]);

  // Check for offline pages first
  useEffect(() => {
    const checkOfflinePages = async () => {
      if (mangaId && chapterId) {
        const pages = await downloadService.getDownloadedPages(mangaId, chapterId);
        setOfflinePages(pages);
      }
    };
    checkOfflinePages();
  }, [mangaId, chapterId]);

  // Fetch pages from source (if not offline)
  const {
    data: pages,
    isLoading: pagesLoading,
    error: pagesError,
  } = usePageList(sourceId ?? '', chapter);

  // Determine which pages to display
  const displayPages = React.useMemo(() => {
    if (offlinePages.length > 0) {
      // Use offline pages
      return offlinePages.map((path, index) => ({
        id: `offline-${index}`,
        url: path,
        source: sourceId ?? '',
        chapterId: chapterId ?? '',
      }));
    }
    return pages ?? [];
  }, [offlinePages, pages, sourceId, chapterId]);

  const totalPages = displayPages.length;

  // Save reading progress
  useEffect(() => {
    if (manga && chapter && totalPages > 0) {
      saveProgress.mutate({
        manga,
        chapter,
        page: currentPage,
        totalPages,
      });
    }
  }, [currentPage, totalPages, manga, chapter]);

  // Auto-hide UI after 3 seconds
  useEffect(() => {
    if (showUI) {
      hideTimeout.current = setTimeout(() => {
        toggleUI();
      }, 3000);
    }

    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, [showUI]);

  const toggleUI = () => {
    const toValue = showUI ? 0 : 1;
    Animated.timing(opacity, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setShowUI(!showUI);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      scrollViewRef.current?.scrollTo({
        y: nextPage * height,
        animated: true,
      });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      scrollViewRef.current?.scrollTo({
        y: prevPage * height,
        animated: true,
      });
    }
  };

  // Show error state if no pages available
  if (!pagesLoading && displayPages.length === 0 && !isAvailable) {
    return (
      <View
        style={{ backgroundColor: theme.background }}
        className="flex-1 items-center justify-center p-6"
      >
        <AlertCircle size={64} color={theme.accent} />
        <Text
          style={{
            color: theme.text,
            fontSize: 20,
            fontWeight: '700',
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          Native Module Required
        </Text>
        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 16,
            marginTop: 8,
            textAlign: 'center',
          }}
        >
          To read manga, please build the Android app with Kotatsu parsers integration.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: theme.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
            marginTop: 24,
          }}
        >
          <Text style={{ color: theme.background, fontWeight: '700' }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: theme.background }} className="flex-1">
      <StatusBar hidden={!showUI} />

      {/* Top Bar */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          opacity,
          backgroundColor: `${theme.background}E6`,
          paddingTop: 48,
          paddingHorizontal: 16,
          paddingBottom: 16,
          borderBottomWidth: 2,
          borderBottomColor: theme.border,
        }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderWidth: 2,
              padding: 10,
              borderRadius: 12,
            }}
          >
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>

          <View className="flex-1 mx-4">
            <Text
              style={{
                color: theme.text,
                fontWeight: '700',
                fontSize: 16,
              }}
              numberOfLines={1}
            >
              {chapter?.name || `Chapter ${chapter?.number || chapterId}`}
            </Text>
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 14,
                marginTop: 2,
              }}
            >
              {totalPages > 0 ? `Page ${currentPage + 1} of ${totalPages}` : 'Loading...'}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderWidth: 2,
              padding: 10,
              borderRadius: 12,
            }}
          >
            <Settings size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Reader Content */}
      {pagesLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
          <Text
            style={{
              color: theme.textSecondary,
              marginTop: 16,
            }}
          >
            Loading pages...
          </Text>
        </View>
      ) : pagesError ? (
        <View className="flex-1 items-center justify-center p-6">
          <AlertCircle size={48} color={theme.accent} />
          <Text
            style={{
              color: theme.text,
              fontSize: 18,
              fontWeight: '700',
              marginTop: 16,
            }}
          >
            Failed to Load Pages
          </Text>
          <Text
            style={{
              color: theme.textSecondary,
              marginTop: 8,
              textAlign: 'center',
            }}
          >
            Please check your connection and try again.
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={1}
          onPress={toggleUI}
          className="flex-1"
        >
          <ScrollView
            ref={scrollViewRef}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const page = Math.round(
                event.nativeEvent.contentOffset.y / height
              );
              setCurrentPage(page);
            }}
          >
            {displayPages.map((page, index) => (
              <View
                key={page.id || index}
                style={{
                  width,
                  height,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Image
                  source={{ uri: page.url }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="contain"
                  transition={200}
                  placeholder={require('@/assets/images/splash-icon.png')}
                />
              </View>
            ))}
          </ScrollView>
        </TouchableOpacity>
      )}

      {/* Bottom Navigation Bar */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          opacity,
          backgroundColor: `${theme.background}E6`,
          paddingHorizontal: 16,
          paddingVertical: 20,
          paddingBottom: 40,
          borderTopWidth: 2,
          borderTopColor: theme.border,
        }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handlePrevPage}
            disabled={currentPage === 0}
            activeOpacity={0.7}
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderWidth: 3,
              padding: 12,
              borderRadius: 16,
              opacity: currentPage === 0 ? 0.4 : 1,
            }}
          >
            <ChevronLeft size={28} color={theme.primary} />
          </TouchableOpacity>

          {/* Page Progress */}
          <View className="flex-1 mx-4">
            <View
              style={{
                backgroundColor: theme.surface,
                height: 8,
                borderRadius: 4,
                overflow: 'hidden',
                borderWidth: 2,
                borderColor: theme.border,
              }}
            >
              <View
                style={{
                  backgroundColor: theme.primary,
                  width: totalPages > 0 ? `${((currentPage + 1) / totalPages) * 100}%` : '0%',
                  height: '100%',
                }}
              />
            </View>
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 12,
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              {totalPages > 0 ? `${currentPage + 1} / ${totalPages}` : '-- / --'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleNextPage}
            disabled={currentPage === totalPages - 1}
            activeOpacity={0.7}
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderWidth: 3,
              padding: 12,
              borderRadius: 16,
              opacity: currentPage === totalPages - 1 ? 0.4 : 1,
            }}
          >
            <ChevronRight size={28} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
