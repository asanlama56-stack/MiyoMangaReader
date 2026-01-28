import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/ThemeContext';
import { useAppStore } from '@/lib/store';
import { themes } from '@/lib/themes';
import {
  Palette,
  BookOpen,
  Download,
  Settings as SettingsIcon,
  Info,
  ChevronRight,
  X,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const theme = useTheme();
  const { setTheme } = useAppStore();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [wifiOnlyDownload, setWifiOnlyDownload] = useState(true);

  const handleThemeChange = async (themeId: string) => {
    await setTheme(themeId);
    setShowThemeModal(false);
  };

  const SettingSection = ({
    icon: Icon,
    title,
    items,
  }: {
    icon: any;
    title: string;
    items: { label: string; value?: string; onPress?: () => void; toggle?: boolean; toggleValue?: boolean; onToggle?: (value: boolean) => void }[];
  }) => (
    <View className="mb-8">
      <View className="flex-row items-center mb-4 px-6">
        <Icon size={24} color={theme.primary} />
        <Text
          style={{
            color: theme.text,
            fontWeight: '800',
            fontSize: 20,
            marginLeft: 12,
          }}
        >
          {title}
        </Text>
      </View>

      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          activeOpacity={item.toggle ? 1 : 0.7}
          onPress={item.onPress}
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
            borderWidth: 3,
          }}
          className="mx-6 mb-3 px-4 py-4 rounded-2xl flex-row items-center justify-between"
        >
          <View className="flex-1">
            <Text
              style={{
                color: theme.text,
                fontWeight: '600',
                fontSize: 16,
              }}
            >
              {item.label}
            </Text>
            {item.value && (
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 14,
                  marginTop: 4,
                }}
              >
                {item.value}
              </Text>
            )}
          </View>

          {item.toggle ? (
            <Switch
              value={item.toggleValue}
              onValueChange={item.onToggle}
              trackColor={{ false: theme.background, true: theme.primary }}
              thumbColor={theme.text}
            />
          ) : (
            <ChevronRight size={20} color={theme.textSecondary} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

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
            Settings
          </Text>
        </View>

        {/* Settings Content */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
          <SettingSection
            icon={Palette}
            title="Appearance"
            items={[
              {
                label: 'Theme',
                value: theme.name || 'Cyberpunk Dark',
                onPress: () => setShowThemeModal(true),
              },
            ]}
          />

          <SettingSection
            icon={BookOpen}
            title="Reader"
            items={[
              { label: 'Reading Direction', value: 'Left to Right' },
              { label: 'Zoom Mode', value: 'Fit Width' },
              { label: 'Preload Pages', value: '3 pages' },
            ]}
          />

          <SettingSection
            icon={Download}
            title="Downloads"
            items={[
              { label: 'Download Location', value: 'App Storage' },
              {
                label: 'WiFi Only',
                toggle: true,
                toggleValue: wifiOnlyDownload,
                onToggle: setWifiOnlyDownload,
              },
            ]}
          />

          <SettingSection
            icon={SettingsIcon}
            title="Advanced"
            items={[
              { label: 'Clear Cache', value: '125 MB' },
              { label: 'Backup Library' },
              { label: 'Restore Library' },
            ]}
          />

          <SettingSection
            icon={Info}
            title="About"
            items={[
              { label: 'Version', value: '1.0.0' },
              { label: 'Licenses' },
              { label: 'DMCA Disclaimer' },
            ]}
          />
        </ScrollView>
      </View>

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowThemeModal(false)}
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
              maxHeight: '80%',
            }}
          >
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-6 py-6">
              <Text
                style={{
                  color: theme.text,
                  fontWeight: '900',
                  fontSize: 28,
                }}
              >
                Select Theme
              </Text>
              <TouchableOpacity
                onPress={() => setShowThemeModal(false)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: theme.surface,
                  padding: 10,
                  borderRadius: 12,
                }}
              >
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Theme List */}
            <ScrollView className="px-6 pb-6">
              {themes.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  activeOpacity={0.7}
                  onPress={() => handleThemeChange(t.id)}
                  style={{
                    backgroundColor: t.surface,
                    borderColor: t.border,
                    borderWidth: 3,
                  }}
                  className="mb-3 p-4 rounded-2xl"
                >
                  <Text
                    style={{
                      color: t.text,
                      fontWeight: '700',
                      fontSize: 18,
                    }}
                  >
                    {t.name}
                  </Text>
                  <View className="flex-row gap-2 mt-3">
                    <View
                      style={{ backgroundColor: t.primary }}
                      className="w-12 h-8 rounded-lg"
                    />
                    <View
                      style={{ backgroundColor: t.accent }}
                      className="w-12 h-8 rounded-lg"
                    />
                    <View
                      style={{ backgroundColor: t.border }}
                      className="w-12 h-8 rounded-lg"
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
