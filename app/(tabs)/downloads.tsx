import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/ThemeContext';
import { downloadService } from '@/lib/services';
import type { DownloadTask } from '@/lib/services/kotatsu';
import { Download as DownloadIcon, Pause, Play, Trash2, FolderOpen } from 'lucide-react-native';

export default function DownloadsScreen() {
  const theme = useTheme();
  const [downloads, setDownloads] = useState<DownloadTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize download service and get initial tasks
    const init = async () => {
      await downloadService.initialize();
      setDownloads(downloadService.getTasks());
      setIsLoading(false);
    };
    init();

    // Subscribe to download updates
    const unsubscribe = downloadService.subscribe((tasks) => {
      setDownloads(tasks);
    });

    return unsubscribe;
  }, []);

  const handlePause = async (taskId: string) => {
    await downloadService.pauseDownload(taskId);
  };

  const handleResume = async (taskId: string) => {
    await downloadService.resumeDownload(taskId);
  };

  const handleCancel = async (taskId: string) => {
    await downloadService.cancelDownload(taskId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return theme.primary;
      case 'DOWNLOADING':
        return theme.accent;
      case 'FAILED':
        return '#FF4444';
      case 'PAUSED':
        return theme.textSecondary;
      default:
        return theme.textSecondary;
    }
  };

  const getStatusText = (download: DownloadTask) => {
    switch (download.status) {
      case 'COMPLETED':
        return 'Completed';
      case 'DOWNLOADING':
        return `Downloading... ${download.progress}%`;
      case 'FAILED':
        return `Failed: ${download.error || 'Unknown error'}`;
      case 'PAUSED':
        return 'Paused';
      case 'PENDING':
        return 'Pending';
      default:
        return download.status;
    }
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
            Downloads
          </Text>
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 16,
              marginTop: 4,
            }}
          >
            {downloads.length} chapter{downloads.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Downloads List */}
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : downloads.length > 0 ? (
            downloads.map((download) => (
              <View
                key={download.id}
                style={{
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  borderWidth: 3,
                }}
                className="mb-4 p-4 rounded-2xl"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1 mr-4">
                    <Text
                      style={{
                        color: theme.text,
                        fontWeight: '700',
                        fontSize: 16,
                      }}
                      numberOfLines={2}
                    >
                      Manga: {download.mangaId}
                    </Text>
                    <Text
                      style={{
                        color: theme.textSecondary,
                        fontSize: 14,
                        marginTop: 2,
                      }}
                    >
                      Chapter: {download.chapterId}
                    </Text>
                    <Text
                      style={{
                        color: getStatusColor(download.status),
                        fontSize: 14,
                        marginTop: 4,
                        fontWeight: '600',
                      }}
                    >
                      {getStatusText(download)}
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row gap-2">
                    {download.status === 'DOWNLOADING' && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handlePause(download.id)}
                        style={{
                          backgroundColor: theme.primary,
                          padding: 10,
                          borderRadius: 12,
                        }}
                      >
                        <Pause size={20} color={theme.background} />
                      </TouchableOpacity>
                    )}
                    {(download.status === 'PENDING' || download.status === 'PAUSED') && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleResume(download.id)}
                        style={{
                          backgroundColor: theme.primary,
                          padding: 10,
                          borderRadius: 12,
                        }}
                      >
                        <Play size={20} color={theme.background} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleCancel(download.id)}
                      style={{
                        backgroundColor: theme.accent,
                        padding: 10,
                        borderRadius: 12,
                      }}
                    >
                      <Trash2 size={20} color={theme.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Progress Bar */}
                {download.status !== 'COMPLETED' && download.status !== 'FAILED' && (
                  <View>
                    <View
                      style={{
                        backgroundColor: theme.background,
                        height: 8,
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: theme.primary,
                          width: `${download.progress}%`,
                          height: '100%',
                        }}
                      />
                    </View>
                    {download.totalPages > 0 && (
                      <Text
                        style={{
                          color: theme.textSecondary,
                          fontSize: 12,
                          marginTop: 4,
                        }}
                      >
                        {download.downloadedPages} / {download.totalPages} pages
                      </Text>
                    )}
                  </View>
                )}
              </View>
            ))
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <FolderOpen size={64} color={theme.textSecondary} />
              <Text
                style={{
                  color: theme.text,
                  fontSize: 20,
                  fontWeight: '700',
                  marginTop: 16,
                }}
              >
                No Downloads
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
                Download chapters for offline reading from the manga details page
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
