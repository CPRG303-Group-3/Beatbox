import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ListRenderItem,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Pressable,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import { Audio } from "expo-av";
import type { Asset } from "expo-media-library";
import { AudioDatabase, AudioFileRecord } from "../../../lib/audioDatabase";
import { AudioMetadataModal } from "../../../components/AudioMetadataModal";
import { AudioFileManagerModal } from "../../../components/AudioFileManagerModal";

interface Styles {
  container: ViewStyle;
  itemContainer: ViewStyle;
  playingItemContainer: ViewStyle;
  filename: TextStyle;
  duration: TextStyle;
  emptyText: TextStyle;
  playingIndicator: TextStyle;
  scanButton: ViewStyle;
  scanButtonText: TextStyle;
}

const AudioList: React.FC = () => {
  const [audioFiles, setAudioFiles] = useState<AudioFileRecord[]>([]);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [newFiles, setNewFiles] = useState<AudioFileRecord[]>([]);
  const [isMetadataModalVisible, setIsMetadataModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<AudioFileRecord | null>(
    null
  );
  const [isFileManagerModalVisible, setIsFileManagerModalVisible] =
    useState(false);

  const getAudio = async (): Promise<void> => {
    console.log("getAudio called, current permission:", permissionResponse);

    // Ensure we have permission
    let permission = permissionResponse;
    if (!permission?.granted) {
      console.log("Requesting media library permission");
      permission = await requestPermission();
    }

    if (!permission?.granted) {
      console.error("Media library permission denied");
      alert("Permission to access media library is required!");
      return;
    }

    try {
      console.log("Fetching media library assets");
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: "audio",
        first: 100,
      });

      console.log(`Found ${media.assets.length} audio files`);

      // Sync media library with our database
      await AudioDatabase.syncWithMediaLibrary(media.assets);

      // Get new files that need metadata
      const newUnprocessedFiles = await AudioDatabase.getNewFiles(media.assets);

      console.log(`${newUnprocessedFiles.length} new unprocessed files`);

      if (newUnprocessedFiles.length > 0) {
        setNewFiles(newUnprocessedFiles);
        setIsMetadataModalVisible(true);
      }

      // Fetch included files from database
      const includedFiles = await AudioDatabase.getIncludedRecords();
      console.log(`${includedFiles.length} included files`);
      setAudioFiles(includedFiles);
    } catch (error) {
      console.error("Comprehensive error fetching audio files:", error);
      alert(
        `Error scanning media library: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  useEffect(() => {
    // Request permissions and load audio files on component mount
    if (permissionResponse?.granted) {
      getAudio();
    }
  }, [permissionResponse]);

  useEffect(() => {
    // Cleanup sound when component unmounts
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playAudio = async (audioFile: AudioFileRecord) => {
    try {
      // Stop and unload current sound if exists
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      // Load and play new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioFile.uri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setCurrentlyPlaying(audioFile.id);
    } catch (error) {
      console.error("Error playing audio:", error);
      alert("Could not play audio file");
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setCurrentlyPlaying(null);
      setSound(null);
    }
  };

  const renderItem: ListRenderItem<AudioFileRecord> = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        currentlyPlaying === item.id && styles.playingItemContainer,
      ]}
      onPress={() => playAudio(item)}
      onLongPress={() => {
        setSelectedFile(item);
        setIsFileManagerModalVisible(true);
      }}
    >
      <Text style={styles.filename}>{item.title || item.filename}</Text>
      {item.artist && (
        <Text style={styles.duration}>Artist: {item.artist}</Text>
      )}
      <Text style={styles.duration}>
        Duration: {Math.round(item.duration)}s
      </Text>
      {currentlyPlaying === item.id ? (
        <Text style={styles.playingIndicator}>Now Playing</Text>
      ) : null}
    </TouchableOpacity>
  );

  const handleMetadataModalClose = async () => {
    setIsMetadataModalVisible(false);
    const includedFiles = await AudioDatabase.getIncludedRecords();
    setAudioFiles(includedFiles);
  };

  const handleFileManagerUpdate = async () => {
    const includedFiles = await AudioDatabase.getIncludedRecords();
    setAudioFiles(includedFiles);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.scanButton} onPress={getAudio}>
        <Text style={styles.scanButtonText}>Scan Media Library</Text>
      </Pressable>

      <FlatList
        data={audioFiles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No audio files found.</Text>
        }
      />

      <AudioMetadataModal
        visible={isMetadataModalVisible}
        files={newFiles}
        onClose={handleMetadataModalClose}
      />

      <AudioFileManagerModal
        visible={isFileManagerModalVisible}
        file={selectedFile}
        onClose={() => setIsFileManagerModalVisible(false)}
        onUpdate={handleFileManagerUpdate}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    marginTop: 20,
    backgroundColor: "#f5f5f5",
  },
  itemContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  playingItemContainer: {
    backgroundColor: "#e0e0e0",
  },
  filename: {
    fontSize: 16,
    fontWeight: "bold",
  },
  duration: {
    fontSize: 12,
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
  },
  playingIndicator: {
    fontSize: 12,
    color: "#007bff",
    marginTop: 5,
  },
  scanButton: {
    backgroundColor: "#007bff",
    padding: 15,
    margin: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  scanButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AudioList;
