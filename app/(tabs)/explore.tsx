import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTheme } from '@/lib/ThemeContext';
import { Search, Globe, AlertCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import {
  useNativeModuleAvailability,
  useEnabledSources,
  usePopularManga,
  useSourceSearch,
} from '@/lib/hooks';
import NativeModuleRequired from '@/components/NativeModuleRequired';
import type { Manga, MangaSource } from '@/lib/services/kotatsu';

export default function ExploreScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  // Check native module availability
  const { isAvailable } = useNativeModuleAvailability();

  // Fetch sources
  const {
    data: sources,
    isLoading: sourcesLoading,
    error: sourcesError,
  } = useEnabledSources();

  // Auto-select first source
  React.useEffect(() => {
    if (sources && sources.length > 0 && !selectedSourceId) {
      setSelectedSourceId(sources[0].id);
    }
  }, [sources, selectedSourceId]);

  // Fetch popular manga from selected source
  const {
    data: popularMangaResponse,
    isLoading: popularLoading,
    error: popularError,
  } = usePopularManga(selectedSourceId ?? '');

  // Search manga
  const {
    data: searchResults,
    isLoading: searchLoading,
  } = useSourceSearch(selectedSourceId ?? '', searchQuery);

  // Show native module required message if not available
  if (!isAvailable) {
    return (
      <SafeAreaView
        style={{ backgroundColor: theme.background }}
        className="flex-1"
      >
        <View className="px-6 py-6">
          <Text
            style={{
              color: theme.text,
              fontWeight: '900',
              fontSize: 42,
              letterSpacing: -1,
            }}
          >
            Explore
          </Text>
        </View>
        <NativeModuleRequired title="Manga Sources Required" />
      </SafeAreaView>
    );
  }

  const mangaToDisplay = searchQuery.length >= 2
    ? searchResults?.list ?? []
    : popularMangaResponse?.list ?? [];

  const isLoading = sourcesLoading || popularLoading || searchLoading;

  const navigateToManga = (manga: Manga) => {
    // Pass manga data through route params
    router.push({
      pathname: '/manga/[id]',
      params: {
        id: manga.id,
        sourceId: manga.source,
        mangaData: JSON.stringify(manga),
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
            Explore
          </Text>
        </View>

        {/* Search Bar */}
        <View className="px-6 mb-6">
          <View
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderWidth: 3,
            }}
            className="flex-row items-center px-4 py-3 rounded-2xl"
          >
            <Search size={20} color={theme.textSecondary} />
            <TextInput
              placeholder="Search manga..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                color: theme.text,
                fontSize: 16,
                marginLeft: 12,
                flex: 1,
              }}
            />
            {searchLoading && (
              <ActivityIndicator size="small" color={theme.primary} />
            )}
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
          {/* Sources Section */}
          <View className="px-6 mb-8">
            <Text
              style={{
                color: theme.text,
                fontWeight: '800',
                fontSize: 24,
                marginBottom: 16,
              }}
            >
              Sources
            </Text>

            {sourcesLoading ? (
              <ActivityIndicator size="large" color={theme.primary} />
            ) : sourcesError ? (
              <View
                style={{
                  backgroundColor: theme.surface,
                  borderColor: theme.accent,
                  borderWidth: 3,
                }}
                className="p-4 rounded-xl flex-row items-center"
              >
                <AlertCircle size={20} color={theme.accent} />
                <Text
                  style={{
                    color: theme.textSecondary,
                    marginLeft: 8,
                    flex: 1,
                  }}
                >
                  Failed to load sources. Please check native module.
                </Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {sources?.map((source: MangaSource) => (
                  <TouchableOpacity
                    key={source.id}
                    activeOpacity={0.7}
                    onPress={() => setSelectedSourceId(source.id)}
                    style={{
                      backgroundColor:
                        selectedSourceId === source.id
                          ? theme.primary
                          : theme.surface,
                      borderColor: theme.border,
                      borderWidth: 3,
                    }}
                    className="px-6 py-4 rounded-xl mr-3"
                  >
                    <View className="flex-row items-center">
                      <Globe
                        size={20}
                        color={
                          selectedSourceId === source.id
                            ? theme.background
                            : theme.primary
                        }
                      />
                      <Text
                        style={{
                          color:
                            selectedSourceId === source.id
                              ? theme.background
                              : theme.text,
                          fontWeight: '700',
                          fontSize: 16,
                          marginLeft: 8,
                        }}
                      >
                        {source.name}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color:
                          selectedSourceId === source.id
                            ? theme.background
                            : theme.textSecondary,
                        fontSize: 12,
                        marginTop: 4,
                        opacity: selectedSourceId === source.id ? 0.8 : 1,
                      }}
                    >
                      {source.locale.toUpperCase()} • {source.contentType}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Manga Section */}
          <View className="px-6 mb-8">
            <Text
              style={{
                color: theme.text,
                fontWeight: '800',
                fontSize: 24,
                marginBottom: 16,
              }}
            >
              {searchQuery.length >= 2 ? 'Search Results' : 'Popular Manga'}
            </Text>

            {isLoading && mangaToDisplay.length === 0 ? (
              <ActivityIndicator size="large" color={theme.primary} />
            ) : mangaToDisplay.length === 0 ? (
              <View
                style={{
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  borderWidth: 3,
                }}
                className="p-6 rounded-xl items-center"
              >
                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 16,
                    textAlign: 'center',
                  }}
                >
                  {searchQuery.length >= 2
                    ? 'No manga found for this search'
                    : 'Select a source to browse manga'}
                </Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-4">
                {mangaToDisplay.map((manga: Manga) => (
                  <TouchableOpacity
                    key={`${manga.source}-${manga.id}`}
                    activeOpacity={0.7}
                    onPress={() => navigateToManga(manga)}
                    style={{
                      width: '47%',
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      borderWidth: 3,
                    }}
                    className="rounded-2xl overflow-hidden"
                  >
                    <Image
                      source={{ uri: manga.coverUrl }}
                      style={{ width: '100%', height: 240 }}
                      contentFit="cover"
                      transition={200}
                    />
                    <View className="p-3">
                      <Text
                        style={{
                          color: theme.text,
                          fontWeight: '700',
                          fontSize: 16,
                        }}
                        numberOfLines={2}
                      >
                        {manga.title}
                      </Text>
                      {manga.rating > 0 && (
                        <View
                          style={{
                            backgroundColor: theme.primary,
                            alignSelf: 'flex-start',
                            marginTop: 8,
                          }}
                          className="px-3 py-1 rounded-lg"
                        >
                          <Text
                            style={{
                              color: theme.background,
                              fontWeight: '700',
                              fontSize: 12,
                            }}
                          >
                            ⭐ {(manga.rating * 10).toFixed(1)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
