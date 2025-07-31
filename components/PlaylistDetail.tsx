import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ViewStyle,
  TextStyle,
  ImageStyle,
  ListRenderItem,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import {
  PlaylistService,
  PlaylistWithSongs,
  PlaylistAudioFile,
} from "../lib/playlistService";

interface PlaylistDetailProps {
  playlistId: string;
  onBack: () => void;
  onPlaySong: (song: PlaylistAudioFile) => void;
}

interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  headerContent: ViewStyle;
  coverContainer: ViewStyle;
  playlistCover: ImageStyle;
  placeholderCover: ViewStyle;
  placeholderText: TextStyle;
  playlistInfo: ViewStyle;
  playlistName: TextStyle;
  playlistDescription: TextStyle;
  songCount: TextStyle;
  playAllButton: ViewStyle;
  playAllButtonText: TextStyle;
  listContainer: ViewStyle;
  songItem: ViewStyle;
  songInfo: ViewStyle;
  songTitle: TextStyle;
  songArtist: TextStyle;
  songCover: ImageStyle;
  songPlaceholderCover: ViewStyle;
  songPlaceholderText: TextStyle;
  emptyContainer: ViewStyle;
  emptyText: TextStyle;
  loadingContainer: ViewStyle;
  actionsContainer: ViewStyle;
  actionButton: ViewStyle;
}

export const PlaylistDetail: React.FC<PlaylistDetailProps> = ({
  playlistId,
  onBack,
  onPlaySong,
}) => {
  const [playlist, setPlaylist] = useState<PlaylistWithSongs | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlaylist = async () => {
    setIsLoading(true);
    try {
      const playlistData = await PlaylistService.getPlaylistWithSongs(
        playlistId
      );
      setPlaylist(playlistData);
    } catch (error) {
      console.error("Error loading playlist:", error);
      Alert.alert("Error", "Failed to load playlist. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylist();
  }, [playlistId]);

  const handlePlayAll = () => {
    if (playlist && playlist.songs.length > 0) {
      onPlaySong(playlist.songs[0]);
    }
  };

  const handleRemoveSong = async (songId: string) => {
    if (!playlist) return;

    Alert.alert(
      "Remove Song",
      "Are you sure you want to remove this song from the playlist?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              const success = await PlaylistService.removeSongFromPlaylist(
                playlistId,
                songId
              );
              if (success) {
                await loadPlaylist();
              } else {
                Alert.alert(
                  "Error",
                  "Failed to remove song from playlist. Please try again."
                );
              }
            } catch (error) {
              console.error("Error removing song:", error);
              Alert.alert(
                "Error",
                "An error occurred while removing the song."
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderSongItem: ListRenderItem<PlaylistAudioFile> = ({ item }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => onPlaySong(item)}
      onLongPress={() => handleRemoveSong(item.id)}
    >
      {item.cover_art_url ? (
        <Image
          source={{ uri: item.cover_art_url }}
          style={styles.songCover}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.songPlaceholderCover}>
          <Text style={styles.songPlaceholderText}>
            {(item.title || item.filename).charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{item.title || item.filename}</Text>
        {item.artist && <Text style={styles.songArtist}>{item.artist}</Text>}
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleRemoveSong(item.id)}
        >
          <Ionicons name="remove-circle-outline" size={24} color="#ff3b30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading playlist...</Text>
      </View>
    );
  }

  if (!playlist) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#007bff" />
          </TouchableOpacity>
          <Text style={styles.playlistName}>Playlist not found</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            This playlist could not be found or has been deleted.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
      </View>

      <View style={styles.headerContent}>
        <View style={styles.coverContainer}>
          {playlist.cover_image_url ? (
            <Image
              source={{ uri: playlist.cover_image_url }}
              style={styles.playlistCover}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderCover}>
              <Text style={styles.placeholderText}>
                {playlist.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.playlistInfo}>
          <Text style={styles.playlistName}>{playlist.name}</Text>
          {playlist.description && (
            <Text style={styles.playlistDescription}>
              {playlist.description}
            </Text>
          )}
          <Text style={styles.songCount}>
            {playlist.songs.length}{" "}
            {playlist.songs.length === 1 ? "song" : "songs"}
          </Text>

          {playlist.songs.length > 0 && (
            <TouchableOpacity
              style={styles.playAllButton}
              onPress={handlePlayAll}
            >
              <Ionicons name="play" size={20} color="#fff" />
              <Text style={styles.playAllButtonText}>Play All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.listContainer}>
        {playlist.songs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              This playlist doesn't have any songs yet.
            </Text>
            <Text style={styles.emptyText}>
              Add songs from the Songs tab to get started!
            </Text>
          </View>
        ) : (
          <FlatList
            data={playlist.songs}
            keyExtractor={(item) => item.id}
            renderItem={renderSongItem}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  coverContainer: {
    marginRight: 16,
  },
  playlistCover: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  placeholderCover: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "white",
    fontSize: 48,
    fontWeight: "bold",
  },
  playlistInfo: {
    flex: 1,
    justifyContent: "center",
  },
  playlistName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  playlistDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  songCount: {
    fontSize: 14,
    color: "#999",
    marginBottom: 16,
  },
  playAllButton: {
    backgroundColor: "#007bff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  playAllButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  listContainer: {
    flex: 1,
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  songCover: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  songPlaceholderCover: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  songPlaceholderText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  songArtist: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actionsContainer: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
  },
});
