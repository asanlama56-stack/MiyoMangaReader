import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAppStore } from '@/lib/store';
import { router } from 'expo-router';
import ThemeSelectionScreen from '@/components/ThemeSelectionScreen';

export default function Index() {
  const { isFirstLaunch, theme } = useAppStore();

  useEffect(() => {
    if (!isFirstLaunch) {
      // Small delay to ensure theme is loaded
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    }
  }, [isFirstLaunch]);

  if (isFirstLaunch) {
    return <ThemeSelectionScreen />;
  }

  return (
    <View
      style={{ backgroundColor: theme.background }}
      className="flex-1 items-center justify-center"
    >
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
}
