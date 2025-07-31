import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { AudioFileRecord } from "../lib/audioDatabase";

interface MiniPlayerProps {
  currentSong: AudioFileRecord | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onPress: () => void;
}

interface Styles {
  container: ViewStyle;
  content: ViewStyle;
  coverArt: ImageStyle;
  placeholderCover: ViewStyle;
  placeholderText: TextStyle;
  infoContainer: ViewStyle;
  title: TextStyle;
  artist: TextStyle;
  controls: ViewStyle;
  playButton: ViewStyle;
}

const { width } = Dimensions.get("window");

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentSong,
  isPlaying,
  onPlayPause,
  onPress,
}) => {
  if (!currentSong) return null;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
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

        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.title || currentSong.filename}
          </Text>
          {currentSong.artist && (
            <Text style={styles.artist} numberOfLines={1}>
              {currentSong.artist}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.playButton}
          onPress={(e) => {
            e.stopPropagation(); // Prevent triggering the parent onPress
            onPlayPause();
          }}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={24}
            color="#007bff"
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create<Styles>({
  container: {
    width: width,
    height: 60,
    backgroundColor: "#f8f8f8",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    position: "absolute",
    bottom: 49, // Position above tab bar (49 is the default tab bar height)
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  coverArt: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  placeholderCover: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  placeholderText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  artist: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  playButton: {
    padding: 8,
  },
});
