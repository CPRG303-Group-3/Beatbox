import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AudioFileRecord } from "../lib/audioDatabase";
import { getLyrics } from "../lib/lyricsService";

interface NowPlayingScreenProps {
  currentSong: AudioFileRecord;
  isPlaying: boolean;
  onPlayPause: () => void;
  onClose: () => void;
}

interface Styles {
  container: ViewStyle;
  safeArea: ViewStyle;
  header: ViewStyle;
  closeButton: ViewStyle;
  content: ViewStyle;
  coverArtContainer: ViewStyle;
  coverArt: ImageStyle;
  placeholderCover: ViewStyle;
  placeholderText: TextStyle;
  songInfo: ViewStyle;
  title: TextStyle;
  artist: TextStyle;
  controls: ViewStyle;
  playButton: ViewStyle;
  lyricsContainer: ViewStyle;
  lyricsHeader: TextStyle;
  lyrics: TextStyle;
  loadingContainer: ViewStyle;
  noLyrics: TextStyle;
}

const { width } = Dimensions.get("window");
const COVER_ART_SIZE = width * 0.7;

export const NowPlayingScreen: React.FC<NowPlayingScreenProps> = ({
  currentSong,
  isPlaying,
  onPlayPause,
  onClose,
}) => {
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLyrics = async () => {
      if (currentSong.title && currentSong.artist) {
        setLoading(true);
        try {
          const songLyrics = await getLyrics(
            currentSong.artist,
            currentSong.title
          );
          setLyrics(songLyrics);
        } catch (error) {
          console.error("Error fetching lyrics:", error);
          setLyrics(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLyrics(null);
        setLoading(false);
      }
    };

    fetchLyrics();
  }, [currentSong]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="chevron-down" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.coverArtContainer}>
            {currentSong.cover_art_url ? (
              <Image
                source={{ uri: currentSong.cover_art_url }}
                style={styles.coverArt}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderCover}>
                <Text style={styles.placeholderText}>
                  {(currentSong.title || currentSong.filename)
                    .charAt(0)
                    .toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.songInfo}>
            <Text style={styles.title}>
              {currentSong.title || currentSong.filename}
            </Text>
            {currentSong.artist && (
              <Text style={styles.artist}>{currentSong.artist}</Text>
            )}
          </View>

          <View style={styles.controls}>
            <TouchableOpacity style={styles.playButton} onPress={onPlayPause}>
              <Ionicons
                name={isPlaying ? "pause-circle" : "play-circle"}
                size={60}
                color="#007bff"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.lyricsContainer}>
            <Text style={styles.lyricsHeader}>Lyrics</Text>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text>Loading lyrics...</Text>
              </View>
            ) : lyrics ? (
              <Text style={styles.lyrics}>{lyrics}</Text>
            ) : (
              <Text style={styles.noLyrics}>
                No lyrics found for this song.
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create<Styles>({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  header: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  coverArtContainer: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  coverArt: {
    width: COVER_ART_SIZE,
    height: COVER_ART_SIZE,
    borderRadius: 8,
  },
  placeholderCover: {
    width: COVER_ART_SIZE,
    height: COVER_ART_SIZE,
    borderRadius: 8,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  placeholderText: {
    color: "white",
    fontSize: 80,
    fontWeight: "bold",
  },
  songInfo: {
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  artist: {
    fontSize: 18,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  playButton: {
    padding: 10,
  },
  lyricsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  lyricsHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  lyrics: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  noLyrics: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },
});
