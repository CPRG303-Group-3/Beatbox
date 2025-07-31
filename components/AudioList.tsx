import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
  Image,
  ImageStyle,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { AudioDatabase, AudioFileRecord } from "../lib/audioDatabase";
import { AudioMetadataModal } from "./AudioMetadataModal";
import { AudioFileManagerModal } from "./AudioFileManagerModal";
import { useAudioPlayer } from "../lib/AudioPlayerContext";

interface Styles {
  container: ViewStyle;
  itemContainer: ViewStyle;
  playingItemContainer: ViewStyle;
  filename: TextStyle;
  duration: TextStyle;
  emptyText: TextStyle;
  playingIndicator: TextStyle;
  selectButton: ViewStyle;
  selectButtonText: TextStyle;
  loadingContainer: ViewStyle;
  rowContainer: ViewStyle;
  coverArt: ImageStyle;
  placeholderCover: ViewStyle;
  placeholderText: TextStyle;
  textContainer: ViewStyle;
}

const AudioList: React.FC = () => {
  const [audioFiles, setAudioFiles] = useState<AudioFileRecord[]>([]);
  const [newFiles, setNewFiles] = useState<AudioFileRecord[]>([]);
  const [isMetadataModalVisible, setIsMetadataModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<AudioFileRecord | null>(
    null
  );
  const [isFileManagerModalVisible, setIsFileManagerModalVisible] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Use the shared audio player context
  const { currentSong, isPlaying, playAudio, stopAudio, showNowPlaying } =
    useAudioPlayer();

  const loadAudioFiles = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const includedFiles = await AudioDatabase.getIncludedRecords();
      setAudioFiles(includedFiles);
    } catch (error) {
      console.error("Error loading audio files:", error);
      alert(
        `Error loading audio files: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAudioFiles();
  }, []);

  const selectAudioFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/mpeg",
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      setIsLoading(true);

      const newUnprocessedFiles: AudioFileRecord[] = [];

      for (const file of result.assets) {
        // Get file details (in a real app, you would extract duration from the file)
        const fileDetails = await AudioDatabase.getFileDetails(file.uri);

        const newFile: Omit<AudioFileRecord, "id"> = {
          filename: file.name,
          uri: file.uri,
          duration: fileDetails.duration,
          included: true,
          lastScanned: Date.now(),
        };

        // Create a temporary ID for the modal
        const tempRecord = {
          ...newFile,
          id: `temp-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`,
        };

        newUnprocessedFiles.push(tempRecord);
      }

      if (newUnprocessedFiles.length > 0) {
        setNewFiles(newUnprocessedFiles);
        setIsMetadataModalVisible(true);
      }
    } catch (error) {
      console.error("Error selecting audio files:", error);
      alert(
        `Error selecting audio files: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = (audioFile: AudioFileRecord) => {
    playAudio(audioFile);
  };

  const renderItem: ListRenderItem<AudioFileRecord> = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        currentSong?.id === item.id && styles.playingItemContainer,
      ]}
      onPress={() => handlePlayAudio(item)}
      onLongPress={() => {
        setSelectedFile(item);
        setIsFileManagerModalVisible(true);
      }}
    >
      <View style={styles.rowContainer}>
        {item.cover_art_url ? (
          <Image
            source={{ uri: item.cover_art_url }}
            style={styles.coverArt}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderCover}>
            <Text style={styles.placeholderText}>
              {(item.title || item.filename).charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.filename}>{item.title || item.filename}</Text>
          {item.artist && (
            <Text style={styles.duration}>Artist: {item.artist}</Text>
          )}
          <Text style={styles.duration}>
            Duration: {Math.round(item.duration)}s
          </Text>
          {currentSong?.id === item.id ? (
            <Text style={styles.playingIndicator}>Now Playing</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleMetadataModalClose = async (
    processedFiles?: AudioFileRecord[]
  ) => {
    setIsMetadataModalVisible(false);

    if (processedFiles && processedFiles.length > 0) {
      setIsLoading(true);

      try {
        // Stop any currently playing audio
        await stopAudio();

        // Save each file to Supabase
        for (const file of processedFiles) {
          await AudioDatabase.saveRecord({
            filename: file.filename,
            uri: file.uri,
            duration: file.duration,
            included: true,
            title: file.title,
            artist: file.artist,
            lastScanned: Date.now(),
          });
        }

        // Clear the current files list before reloading
        setAudioFiles([]);

        // Reload the audio files
        await loadAudioFiles();
      } catch (error) {
        console.error("Error saving files:", error);
        alert(
          `Error saving files: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFileManagerUpdate = async () => {
    await loadAudioFiles();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.selectButton} onPress={selectAudioFiles}>
        <Text style={styles.selectButtonText}>Select MP3 Files</Text>
      </Pressable>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={audioFiles}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: currentSong ? 140 : 0, // Add padding for mini player (60px) + tab bar (80px)
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No audio files found.</Text>
          }
        />
      )}

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
  selectButton: {
    backgroundColor: "#007bff",
    padding: 15,
    margin: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  selectButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  coverArt: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 10,
  },
  placeholderCover: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  placeholderText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  textContainer: {
    flex: 1,
  },
});

export default AudioList;
