import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAppStore } from '@/lib/store';
import { router } from 'expo-router';
import ThemeSelectionScreen from '@/components/ThemeSelectionScreen';

export default function Index() {
  const { isFirstLaunch, theme } = useAppStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isFirstLaunch && !isReady) {
      setIsReady(true);
      // Navigate to tabs after state is ready
      setTimeout(() => {
        router.replace('/(tabs)/feed');
      }, 50);
    }
  }, [isFirstLaunch, isReady]);

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
