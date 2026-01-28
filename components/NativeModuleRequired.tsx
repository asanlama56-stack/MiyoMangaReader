/**
 * NativeModuleRequired Component
 * 
 * Displays a message when native Kotatsu parser module is not available.
 * This is shown in web/development mode.
 */

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { AlertCircle, Smartphone, Terminal, FileCode } from 'lucide-react-native';
import { useTheme } from '@/lib/ThemeContext';

interface Props {
  title?: string;
}

export default function NativeModuleRequired({ title = 'Native Module Required' }: Props) {
  const theme = useTheme();

  const steps = [
    {
      icon: Terminal,
      title: 'Clone Kotatsu Parsers',
      command: 'git clone https://github.com/KotatsuApp/kotatsu-parsers.git',
    },
    {
      icon: FileCode,
      title: 'Configure android/build.gradle',
      command: `maven { url 'https://jitpack.io' }`,
    },
    {
      icon: FileCode,
      title: 'Add Dependency',
      command: `implementation("com.github.KotatsuApp:kotatsu-parsers:VERSION") {
    exclude group: 'org.json', module: 'json'
}`,
    },
    {
      icon: Smartphone,
      title: 'Build for Android',
      command: 'npx expo run:android',
    },
  ];

  return (
    <View className="flex-1 p-6">
      {/* Warning Header */}
      <View
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.accent,
          borderWidth: 3,
        }}
        className="p-6 rounded-2xl mb-6"
      >
        <View className="flex-row items-center mb-4">
          <View
            style={{ backgroundColor: theme.accent }}
            className="p-3 rounded-xl mr-4"
          >
            <AlertCircle size={28} color={theme.text} />
          </View>
          <View className="flex-1">
            <Text
              style={{
                color: theme.text,
                fontWeight: '900',
                fontSize: 22,
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 14,
                marginTop: 4,
              }}
            >
              This feature requires Android native module
            </Text>
          </View>
        </View>

        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 15,
            lineHeight: 22,
          }}
        >
          The manga parsing functionality uses the Kotatsu Parsers Kotlin library,
          which must be compiled as a native Android module. This is not available
          in web preview mode.
        </Text>
      </View>

      {/* Setup Instructions */}
      <Text
        style={{
          color: theme.text,
          fontWeight: '800',
          fontSize: 20,
          marginBottom: 16,
        }}
      >
        Setup Instructions
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {steps.map((step, index) => (
          <View
            key={index}
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderWidth: 3,
            }}
            className="p-4 rounded-2xl mb-4"
          >
            <View className="flex-row items-center mb-3">
              <View
                style={{ backgroundColor: theme.primary }}
                className="w-8 h-8 rounded-lg items-center justify-center mr-3"
              >
                <Text
                  style={{
                    color: theme.background,
                    fontWeight: '800',
                    fontSize: 14,
                  }}
                >
                  {index + 1}
                </Text>
              </View>
              <step.icon size={20} color={theme.primary} />
              <Text
                style={{
                  color: theme.text,
                  fontWeight: '700',
                  fontSize: 16,
                  marginLeft: 8,
                }}
              >
                {step.title}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: theme.background,
                borderRadius: 8,
                padding: 12,
              }}
            >
              <Text
                style={{
                  color: theme.primary,
                  fontFamily: 'monospace',
                  fontSize: 12,
                }}
              >
                {step.command}
              </Text>
            </View>
          </View>
        ))}

        {/* Documentation Link */}
        <View
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.primary,
            borderWidth: 3,
          }}
          className="p-4 rounded-2xl mb-6"
        >
          <Text
            style={{
              color: theme.text,
              fontWeight: '700',
              fontSize: 16,
              marginBottom: 8,
            }}
          >
            📚 Documentation
          </Text>
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            For complete setup instructions, see the android/ directory and the
            Kotatsu Parsers documentation at:
          </Text>
          <Text
            style={{
              color: theme.primary,
              fontSize: 14,
              marginTop: 8,
            }}
          >
            https://github.com/KotatsuApp/kotatsu-parsers
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
