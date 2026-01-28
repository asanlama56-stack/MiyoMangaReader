import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTheme } from '@/lib/ThemeContext';
import { useLibraryStore, Manga } from '@/lib/store';
import { BookOpen, Search, Plus } from 'lucide-react-native';
import { router } from 'expo-router';

const categories = ['All', 'Reading', 'Completed', 'Plan to Read'];

export default function LibraryScreen() {
  const theme = useTheme();
  const { library } = useLibraryStore();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredLibrary =
    selectedCategory === 'All'
      ? library
      : library.filter((m) => m.category === selectedCategory);

  const navigateToManga = (manga: Manga) => {
    router.push({
      pathname: '/manga/[id]',
      params: {
        id: manga.id,
        sourceId: manga.sourceId,
        // Re-construct manga data for the details screen
        mangaData: JSON.stringify({
          id: manga.id,
          title: manga.title,
          coverUrl: manga.coverUrl,
          author: manga.author,
          description: manga.synopsis,
          state: manga.status === 'Ongoing' ? 'ONGOING' : manga.status === 'Finished' ? 'FINISHED' : null,
          tags: (manga.genres || []).map((g) => ({ key: g.toLowerCase(), title: g })),
          rating: 0,
          isNsfw: false,
          url: '',
          publicUrl: '',
          source: manga.sourceId,
        }),
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
            Library
          </Text>
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 16,
              marginTop: 4,
            }}
          >
            {library.length} manga saved
          </Text>
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-6 mb-6"
          style={{ maxHeight: 50 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              activeOpacity={0.7}
              style={{
                backgroundColor:
                  selectedCategory === category ? theme.primary : theme.surface,
                borderColor: theme.border,
                borderWidth: 3,
              }}
              className="px-6 py-3 rounded-xl mr-3"
            >
              <Text
                style={{
                  color:
                    selectedCategory === category
                      ? theme.background
                      : theme.text,
                  fontWeight: '700',
                  fontSize: 16,
                }}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Library Grid */}
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          {filteredLibrary.length > 0 ? (
            <View className="flex-row flex-wrap gap-4 pb-6">
              {filteredLibrary.map((manga) => (
                <TouchableOpacity
                  key={manga.id}
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
                    {manga.category && (
                      <View
                        style={{
                          backgroundColor: theme.primary,
                          alignSelf: 'flex-start',
                          marginTop: 8,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 6,
                        }}
                      >
                        <Text
                          style={{
                            color: theme.background,
                            fontSize: 12,
                            fontWeight: '600',
                          }}
                        >
                          {manga.category}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <BookOpen size={64} color={theme.textSecondary} />
              <Text
                style={{
                  color: theme.text,
                  fontSize: 20,
                  fontWeight: '700',
                  marginTop: 16,
                  textAlign: 'center',
                }}
              >
                {selectedCategory === 'All'
                  ? 'Your Library is Empty'
                  : `No Manga in "${selectedCategory}"`}
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
                {selectedCategory === 'All'
                  ? 'Add manga from the Explore tab to build your collection'
                  : 'Add manga to this category to see them here'}
              </Text>
              
              {selectedCategory === 'All' && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push('/(tabs)/explore')}
                  style={{
                    backgroundColor: theme.primary,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 12,
                    marginTop: 24,
                  }}
                >
                  <Plus size={20} color={theme.background} />
                  <Text
                    style={{
                      color: theme.background,
                      fontWeight: '700',
                      fontSize: 16,
                      marginLeft: 8,
                    }}
                  >
                    Browse Manga
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
