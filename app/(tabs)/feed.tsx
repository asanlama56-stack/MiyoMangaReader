import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTheme } from '@/lib/ThemeContext';
import { Clock, BookOpen } from 'lucide-react-native';
import { router } from 'expo-router';
import { useReadingHistory, useNativeModuleAvailability } from '@/lib/hooks';
import type { ReadingHistoryEntry } from '@/lib/services';
import NativeModuleRequired from '@/components/NativeModuleRequired';

/**
 * Format relative time
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  return new Date(timestamp).toLocaleDateString();
}

export default function FeedScreen() {
  const theme = useTheme();
  const { isAvailable } = useNativeModuleAvailability();
  
  const {
    data: readingHistory,
    isLoading,
    error,
  } = useReadingHistory();

  const navigateToManga = (entry: ReadingHistoryEntry) => {
    router.push({
      pathname: '/manga/[id]',
      params: {
        id: entry.manga.id,
        sourceId: entry.manga.source,
        mangaData: JSON.stringify(entry.manga),
      },
    });
  };

  const navigateToReader = (entry: ReadingHistoryEntry) => {
    router.push({
      pathname: '/reader/[chapterId]',
      params: {
        chapterId: entry.chapter.id,
        sourceId: entry.manga.source,
        mangaId: entry.manga.id,
        chapterData: JSON.stringify(entry.chapter),
        mangaData: JSON.stringify(entry.manga),
        startPage: entry.page.toString(),
      },
    });
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: theme.background }}
      className="flex-1"
    >
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-6">
          <Text
            style={{
              color: theme.text,
              fontWeight: '900',
              fontSize: 42,
              letterSpacing: -1,
            }}
          >
            Feed
          </Text>
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 16,
              marginTop: 4,
            }}
          >
            Continue reading from your history
          </Text>
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : !isAvailable ? (
            <NativeModuleRequired title="Reading History" />
          ) : readingHistory && readingHistory.length > 0 ? (
            readingHistory.map((entry, index) => (
              <TouchableOpacity
                key={`${entry.manga.id}-${entry.chapter.id}-${index}`}
                activeOpacity={0.7}
                onPress={() => navigateToManga(entry)}
                style={{
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  borderWidth: 3,
                  shadowColor: theme.shadow,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                }}
                className="mb-6 rounded-2xl overflow-hidden"
              >
                <View className="flex-row">
                  {/* Cover Image */}
                  <View
                    style={{
                      borderRightWidth: 3,
                      borderRightColor: theme.border,
                    }}
                  >
                    <Image
                      source={{ uri: entry.manga.coverUrl }}
                      style={{
                        width: 120,
                        height: 160,
                      }}
                      contentFit="cover"
                      transition={200}
                    />
                  </View>

                  {/* Info */}
                  <View className="flex-1 p-4 justify-between">
                    <View>
                      <Text
                        style={{
                          color: theme.text,
                          fontWeight: '900',
                          fontSize: 20,
                        }}
                        numberOfLines={2}
                      >
                        {entry.manga.title}
                      </Text>
                      <Text
                        style={{
                          color: theme.primary,
                          fontWeight: '700',
                          fontSize: 16,
                          marginTop: 8,
                        }}
                      >
                        {entry.chapter.name || `Chapter ${entry.chapter.number}`}
                      </Text>
                      
                      {/* Progress */}
                      <View className="mt-3">
                        <View
                          style={{
                            backgroundColor: theme.background,
                            height: 6,
                            borderRadius: 3,
                            overflow: 'hidden',
                          }}
                        >
                          <View
                            style={{
                              backgroundColor: theme.primary,
                              width: `${entry.percentage}%`,
                              height: '100%',
                            }}
                          />
                        </View>
                        <Text
                          style={{
                            color: theme.textSecondary,
                            fontSize: 12,
                            marginTop: 4,
                          }}
                        >
                          Page {entry.page + 1} / {entry.totalPages}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Clock size={16} color={theme.textSecondary} />
                        <Text
                          style={{
                            color: theme.textSecondary,
                            fontSize: 14,
                            marginLeft: 6,
                          }}
                        >
                          {formatRelativeTime(entry.timestamp)}
                        </Text>
                      </View>
                      
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => navigateToReader(entry)}
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
                            fontSize: 12,
                          }}
                        >
                          Continue
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="py-20 items-center">
              <BookOpen size={64} color={theme.textSecondary} />
              <Text
                style={{
                  color: theme.text,
                  fontWeight: '700',
                  fontSize: 20,
                  marginTop: 16,
                }}
              >
                No Reading History
              </Text>
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 16,
                  marginTop: 8,
                  textAlign: 'center',
                  paddingHorizontal: 32,
                }}
              >
                Start reading manga to see your progress here
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/(tabs)/explore')}
                style={{
                  backgroundColor: theme.primary,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 12,
                  marginTop: 24,
                }}
              >
                <Text
                  style={{
                    color: theme.background,
                    fontWeight: '700',
                    fontSize: 16,
                  }}
                >
                  Browse Manga
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
