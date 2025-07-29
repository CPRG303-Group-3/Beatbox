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
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import { Audio } from "expo-av";
import type { Asset } from "expo-media-library";

interface Styles {
  container: ViewStyle;
  itemContainer: ViewStyle;
  playingItemContainer: ViewStyle;
  filename: TextStyle;
  duration: TextStyle;
  emptyText: TextStyle;
  playingIndicator: TextStyle;
}

const AudioList: React.FC = () => {
  const [audioFiles, setAudioFiles] = useState<Asset[]>([]);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const getAudio = async (): Promise<void> => {
    if (!permissionResponse?.granted) {
      const permission = await requestPermission();
      if (!permission.granted) {
        alert("Permission to access media library is required!");
        return;
      }
    }

    try {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: "audio",
        first: 100,
      });
      setAudioFiles(media.assets);
    } catch (error) {
      console.error("Error fetching audio files:", error);
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

  const playAudio = async (asset: Asset) => {
    try {
      // Stop and unload current sound if exists
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      // Load and play new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: asset.uri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setCurrentlyPlaying(asset.id);
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

  const renderItem: ListRenderItem<Asset> = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        currentlyPlaying === item.id && styles.playingItemContainer,
      ]}
      onPress={() => playAudio(item)}
    >
      <Text style={styles.filename}>{item.filename}</Text>
      <Text style={styles.duration}>
        Duration: {Math.round(item.duration)}s
      </Text>
      {currentlyPlaying === item.id ? (
        <Text style={styles.playingIndicator}>Now Playing</Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={audioFiles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No audio files found.</Text>
        }
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
});

export default AudioList;
