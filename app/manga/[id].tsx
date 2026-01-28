import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTheme } from '@/lib/ThemeContext';
import { useLibraryStore } from '@/lib/store';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  Heart,
  Download,
  Play,
  BookOpen,
  AlertCircle,
} from 'lucide-react-native';
import {
  useMangaDetails,
  useChapterList,
  useNativeModuleAvailability,
} from '@/lib/hooks';
import { downloadService } from '@/lib/services';
import type { Manga, MangaChapter, MangaState } from '@/lib/services/kotatsu';

export default function MangaDetailsScreen() {
  const theme = useTheme();
  const { id, sourceId, mangaData } = useLocalSearchParams<{
    id: string;
    sourceId: string;
    mangaData: string;
  }>();
  const { library, addToLibrary } = useLibraryStore();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const { isAvailable } = useNativeModuleAvailability();

  // Parse manga data from params
  const initialManga: Manga | null = React.useMemo(() => {
    if (mangaData) {
      try {
        return JSON.parse(mangaData);
      } catch {
        return null;
      }
    }
    return null;
  }, [mangaData]);

  // Fetch full manga details
  const {
    data: mangaDetails,
    isLoading: detailsLoading,
    error: detailsError,
  } = useMangaDetails(sourceId ?? '', initialManga);

  // Fetch chapters
  const {
    data: chapters,
    isLoading: chaptersLoading,
    error: chaptersError,
  } = useChapterList(sourceId ?? '', mangaDetails ?? initialManga);

  const manga = mangaDetails ?? initialManga;
  const isInLibrary = manga ? library.some((m) => m.id === manga.id) : false;

  const handleAddToLibrary = async (category: string) => {
    if (!manga) return;
    
    await addToLibrary({
      id: manga.id,
      sourceId: manga.source,
      title: manga.title,
      coverUrl: manga.coverUrl,
      author: manga.author,
      status: manga.state === 'ONGOING' ? 'Ongoing' : manga.state === 'FINISHED' ? 'Finished' : undefined,
      genres: manga.tags?.map((t) => t.title),
      synopsis: manga.description,
      category,
    });
    setShowCategoryModal(false);
  };

  const handleDownloadChapter = async (chapter: MangaChapter) => {
    if (!manga) return;
    await downloadService.queueDownload(manga, chapter);
  };

  const navigateToReader = (chapter: MangaChapter) => {
    if (!manga) return;
    router.push({
      pathname: '/reader/[chapterId]',
      params: {
        chapterId: chapter.id,
        sourceId: manga.source,
        mangaId: manga.id,
        chapterData: JSON.stringify(chapter),
        mangaData: JSON.stringify(manga),
      },
    });
  };

  const getStateLabel = (state: MangaState | null | undefined): string => {
    if (!state) return 'Unknown';
    switch (state) {
      case 'ONGOING':
        return 'Ongoing';
      case 'FINISHED':
        return 'Completed';
      case 'ABANDONED':
        return 'Abandoned';
      case 'PAUSED':
        return 'On Hiatus';
      case 'UPCOMING':
        return 'Upcoming';
      default:
        return state;
    }
  };

  if (!manga) {
    return (
      <View
        style={{ backgroundColor: theme.background }}
        className="flex-1 items-center justify-center"
      >
        <AlertCircle size={64} color={theme.accent} />
        <Text
          style={{
            color: theme.text,
            fontSize: 20,
            fontWeight: '700',
            marginTop: 16,
          }}
        >
          Manga Not Found
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section with Cover */}
        <View style={{ height: 400, position: 'relative' }}>
          <Image
            source={{ uri: manga.largeCoverUrl || manga.coverUrl }}
            style={{
              width: '100%',
              height: '100%',
              opacity: 0.4,
            }}
            contentFit="cover"
            transition={200}
          />
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: `${theme.background}99`,
            }}
          />

          {/* Back Button */}
          <SafeAreaView
            style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
                borderWidth: 3,
                margin: 16,
                width: 48,
                height: 48,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeft size={24} color={theme.text} />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Cover and Title */}
          <View
            style={{
              position: 'absolute',
              bottom: 24,
              left: 24,
              right: 24,
              flexDirection: 'row',
            }}
          >
            <Image
              source={{ uri: manga.coverUrl }}
              style={{
                width: 120,
                height: 180,
                borderRadius: 16,
                borderWidth: 3,
                borderColor: theme.border,
              }}
              contentFit="cover"
              transition={200}
            />
            <View className="flex-1 ml-4 justify-end">
              <Text
                style={{
                  color: theme.text,
                  fontWeight: '900',
                  fontSize: 28,
                  letterSpacing: -1,
                }}
                numberOfLines={3}
              >
                {manga.title}
              </Text>
              {manga.author && (
                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 16,
                    marginTop: 4,
                  }}
                >
                  {manga.author}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 px-6 py-6">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowCategoryModal(true)}
            style={{
              backgroundColor: isInLibrary ? theme.accent : theme.primary,
              borderColor: theme.border,
              borderWidth: 3,
              flex: 1,
            }}
            className="py-4 rounded-2xl flex-row items-center justify-center"
          >
            <Heart
              size={20}
              color={isInLibrary ? theme.text : theme.background}
              fill={isInLibrary ? theme.text : 'transparent'}
            />
            <Text
              style={{
                color: isInLibrary ? theme.text : theme.background,
                fontWeight: '800',
                fontSize: 16,
                marginLeft: 8,
              }}
            >
              {isInLibrary ? 'In Library' : 'Add to Library'}
            </Text>
          </TouchableOpacity>

          {chapters && chapters.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigateToReader(chapters[0])}
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
                borderWidth: 3,
              }}
              className="px-6 py-4 rounded-2xl items-center justify-center"
            >
              <Play size={20} color={theme.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Metadata Tags */}
        <View className="px-6 mb-6">
          <View className="flex-row flex-wrap gap-2">
            <View
              style={{
                backgroundColor: theme.primary,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: theme.background,
                  fontWeight: '700',
                  fontSize: 14,
                }}
              >
                {getStateLabel(manga.state)}
              </Text>
            </View>
            {manga.tags?.map((tag, index) => (
              <View
                key={`${tag.key}-${index}`}
                style={{
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  borderWidth: 2,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color: theme.text,
                    fontWeight: '600',
                    fontSize: 14,
                  }}
                >
                  {tag.title}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Synopsis */}
        {manga.description && (
          <View className="px-6 mb-8">
            <Text
              style={{
                color: theme.text,
                fontWeight: '800',
                fontSize: 20,
                marginBottom: 12,
              }}
            >
              Synopsis
            </Text>
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 16,
                lineHeight: 24,
              }}
            >
              {manga.description}
            </Text>
          </View>
        )}

        {/* Chapters List */}
        <View className="px-6 pb-6">
          <Text
            style={{
              color: theme.text,
              fontWeight: '800',
              fontSize: 20,
              marginBottom: 12,
            }}
          >
            Chapters
          </Text>

          {chaptersLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color={theme.primary} />
              <Text
                style={{
                  color: theme.textSecondary,
                  marginTop: 8,
                }}
              >
                Loading chapters...
              </Text>
            </View>
          ) : chaptersError || !isAvailable ? (
            <View
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.accent,
                borderWidth: 3,
              }}
              className="p-4 rounded-2xl flex-row items-center"
            >
              <AlertCircle size={24} color={theme.accent} />
              <View className="flex-1 ml-3">
                <Text
                  style={{
                    color: theme.text,
                    fontWeight: '700',
                    fontSize: 16,
                  }}
                >
                  {isAvailable ? 'Failed to Load Chapters' : 'Native Module Required'}
                </Text>
                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 14,
                    marginTop: 4,
                  }}
                >
                  {isAvailable
                    ? 'Please check your connection and try again'
                    : 'Build the Android app to fetch chapters from sources'}
                </Text>
              </View>
            </View>
          ) : chapters && chapters.length > 0 ? (
            chapters.map((chapter) => (
              <TouchableOpacity
                key={chapter.id}
                activeOpacity={0.7}
                onPress={() => navigateToReader(chapter)}
                style={{
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  borderWidth: 3,
                }}
                className="mb-3 p-4 rounded-2xl flex-row items-center justify-between"
              >
                <View className="flex-1 mr-3">
                  <Text
                    style={{
                      color: theme.text,
                      fontWeight: '700',
                      fontSize: 16,
                    }}
                    numberOfLines={2}
                  >
                    {chapter.name || `Chapter ${chapter.number}`}
                  </Text>
                  {chapter.uploadDate > 0 && (
                    <Text
                      style={{
                        color: theme.textSecondary,
                        fontSize: 14,
                        marginTop: 4,
                      }}
                    >
                      {new Date(chapter.uploadDate).toLocaleDateString()}
                    </Text>
                  )}
                  {chapter.scanlator && (
                    <Text
                      style={{
                        color: theme.textSecondary,
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {chapter.scanlator}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleDownloadChapter(chapter)}
                  style={{
                    backgroundColor: theme.background,
                    padding: 10,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: theme.border,
                  }}
                >
                  <Download size={20} color={theme.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          ) : (
            <View
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
                borderWidth: 3,
              }}
              className="p-6 rounded-2xl items-center"
            >
              <BookOpen size={48} color={theme.textSecondary} />
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 16,
                  marginTop: 12,
                  textAlign: 'center',
                }}
              >
                No chapters available
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          className="flex-1 justify-end"
        >
          <View
            style={{
              backgroundColor: theme.background,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
            }}
          >
            <View className="px-6 py-6">
              <Text
                style={{
                  color: theme.text,
                  fontWeight: '900',
                  fontSize: 24,
                  marginBottom: 20,
                }}
              >
                Select Category
              </Text>

              {['Reading', 'Completed', 'Plan to Read'].map((category) => (
                <TouchableOpacity
                  key={category}
                  activeOpacity={0.7}
                  onPress={() => handleAddToLibrary(category)}
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    borderWidth: 3,
                  }}
                  className="mb-3 p-4 rounded-2xl"
                >
                  <Text
                    style={{
                      color: theme.text,
                      fontWeight: '700',
                      fontSize: 18,
                    }}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowCategoryModal(false)}
                className="mt-4 p-4"
              >
                <Text
                  style={{
                    color: theme.textSecondary,
                    fontWeight: '600',
                    fontSize: 16,
                    textAlign: 'center',
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
