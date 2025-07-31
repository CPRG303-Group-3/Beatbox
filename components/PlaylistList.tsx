import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  ImageStyle,
  ListRenderItem,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PlaylistService, Playlist } from "../lib/playlistService";
import { CreatePlaylistModal } from "./CreatePlaylistModal";

interface PlaylistListProps {
  onSelectPlaylist: (playlistId: string) => void;
}

interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  createButton: ViewStyle;
  createButtonText: TextStyle;
  listContainer: ViewStyle;
  playlistItem: ViewStyle;
  playlistInfo: ViewStyle;
  playlistName: TextStyle;
  playlistDescription: TextStyle;
  playlistCover: ImageStyle;
  placeholderCover: ViewStyle;
  placeholderText: TextStyle;
  emptyContainer: ViewStyle;
  emptyText: TextStyle;
  loadingContainer: ViewStyle;
}

export const PlaylistList: React.FC<PlaylistListProps> = ({
  onSelectPlaylist,
}) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  const loadPlaylists = async () => {
    setIsLoading(true);
    try {
      const userPlaylists = await PlaylistService.getPlaylists();
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error("Error loading playlists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  const handleCreatePlaylist = () => {
    setIsCreateModalVisible(true);
  };

  const handleCreateModalClose = (playlistId?: string) => {
    setIsCreateModalVisible(false);
    if (playlistId) {
      loadPlaylists();
    }
  };

  const renderPlaylistItem: ListRenderItem<Playlist> = ({ item }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => onSelectPlaylist(item.id)}
    >
      {item.cover_image_url ? (
        <Image
          source={{ uri: item.cover_image_url }}
          style={styles.playlistCover}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderCover}>
          <Text style={styles.placeholderText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.playlistDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={24} color="#999" />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading playlists...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Playlists</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreatePlaylist}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.createButtonText}>Create New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {playlists.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              You don't have any playlists yet.
            </Text>
            <Text style={styles.emptyText}>
              Create one to start organizing your music!
            </Text>
          </View>
        ) : (
          <FlatList
            data={playlists}
            keyExtractor={(item) => item.id}
            renderItem={renderPlaylistItem}
          />
        )}
      </View>

      <CreatePlaylistModal
        visible={isCreateModalVisible}
        onClose={handleCreateModalClose}
      />
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  createButton: {
    backgroundColor: "#007bff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: "#fff",
    marginLeft: 4,
    fontWeight: "bold",
  },
  listContainer: {
    flex: 1,
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  playlistCover: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 16,
  },
  placeholderCover: {
    width: 60,
    height: 60,
    borderRadius: 4,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  placeholderText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  playlistDescription: {
    fontSize: 14,
    color: "#666",
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
});
