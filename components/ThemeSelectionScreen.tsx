import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { themes } from '@/lib/themes';
import { useAppStore } from '@/lib/store';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function ThemeSelectionScreen() {
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const { setTheme, setFirstLaunch } = useAppStore();
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleApply = async () => {
    await setTheme(selectedTheme.id);
    await setFirstLaunch(false);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: selectedTheme.background }}
      className="flex-1"
    >
      <View className="flex-1 px-6 pt-12">
        {/* Header */}
        <View className="mb-8">
          <Text
            style={{
              color: selectedTheme.text,
              fontWeight: '900',
              fontSize: 48,
              letterSpacing: -1,
            }}
          >
            Choose Your
          </Text>
          <Text
            style={{
              color: selectedTheme.primary,
              fontWeight: '900',
              fontSize: 48,
              letterSpacing: -1,
            }}
          >
            Theme
          </Text>
        </View>

        {/* Theme Preview Carousel */}
        <View className="flex-1">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              {
                useNativeDriver: false,
                listener: (event: any) => {
                  const index = Math.round(
                    event.nativeEvent.contentOffset.x / (width - 48)
                  );
                  if (themes[index]) {
                    setSelectedTheme(themes[index]);
                  }
                },
              }
            )}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={width - 48}
          >
            {themes.map((theme, index) => (
              <View
                key={theme.id}
                style={{ width: width - 48, marginRight: 16 }}
                className="mr-4"
              >
                <View
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    borderWidth: 3,
                    shadowColor: theme.shadow,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.6,
                    shadowRadius: 24,
                  }}
                  className="h-96 rounded-3xl p-6 justify-between"
                >
                  {/* Theme Preview Content */}
                  <View>
                    <Text
                      style={{
                        color: theme.text,
                        fontWeight: '900',
                        fontSize: 32,
                      }}
                    >
                      {theme.name}
                    </Text>

                    {/* Sample Card */}
                    <View
                      style={{
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                        borderWidth: 2,
                      }}
                      className="mt-6 p-4 rounded-xl"
                    >
                      <Text
                        style={{
                          color: theme.text,
                          fontWeight: '700',
                          fontSize: 18,
                        }}
                      >
                        Sample Manga Title
                      </Text>
                      <Text
                        style={{
                          color: theme.textSecondary,
                          fontSize: 14,
                          marginTop: 8,
                        }}
                      >
                        Latest Chapter • 2 hours ago
                      </Text>
                    </View>
                  </View>

                  {/* Color Palette */}
                  <View className="flex-row gap-3">
                    <View
                      style={{ backgroundColor: theme.primary }}
                      className="flex-1 h-12 rounded-lg"
                    />
                    <View
                      style={{ backgroundColor: theme.accent }}
                      className="flex-1 h-12 rounded-lg"
                    />
                    <View
                      style={{ backgroundColor: theme.border }}
                      className="flex-1 h-12 rounded-lg"
                    />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Dots Indicator */}
          <View className="flex-row justify-center mt-6 gap-2">
            {themes.map((theme, index) => (
              <View
                key={theme.id}
                style={{
                  backgroundColor:
                    theme.id === selectedTheme.id
                      ? selectedTheme.primary
                      : selectedTheme.textSecondary,
                  width: theme.id === selectedTheme.id ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                }}
              />
            ))}
          </View>
        </View>

        {/* Apply Button */}
        <TouchableOpacity
          onPress={handleApply}
          activeOpacity={0.8}
          style={{
            backgroundColor: selectedTheme.primary,
            borderColor: selectedTheme.border,
            borderWidth: 3,
            shadowColor: selectedTheme.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.6,
            shadowRadius: 12,
          }}
          className="py-5 rounded-2xl mb-8"
        >
          <Text
            style={{
              color: selectedTheme.background,
              fontWeight: '900',
              fontSize: 20,
              textAlign: 'center',
            }}
          >
            Apply Theme
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
