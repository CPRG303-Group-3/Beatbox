import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ViewStyle,
  TextStyle,
  ListRenderItem,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PlaylistService, Playlist } from "../lib/playlistService";
import { CreatePlaylistModal } from "./CreatePlaylistModal";

interface AddToPlaylistModalProps {
  visible: boolean;
  audioFileId: string;
  onClose: () => void;
}

interface Styles {
  modalContainer: ViewStyle;
  modalContent: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  closeButton: ViewStyle;
  listContainer: ViewStyle;
  playlistItem: ViewStyle;
  playlistName: TextStyle;
  createNewButton: ViewStyle;
  createNewText: TextStyle;
  emptyContainer: ViewStyle;
  emptyText: TextStyle;
  loadingContainer: ViewStyle;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  visible,
  audioFileId,
  onClose,
}) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  const loadPlaylists = async () => {
    if (!visible) return;

    setIsLoading(true);
    try {
      const userPlaylists = await PlaylistService.getPlaylists();
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error("Error loading playlists:", error);
      Alert.alert("Error", "Failed to load playlists. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadPlaylists();
    }
  }, [visible]);

  const handleAddToPlaylist = async (playlistId: string) => {
    setIsAddingToPlaylist(true);
    try {
      const success = await PlaylistService.addSongToPlaylist(
        playlistId,
        audioFileId
      );
      if (success) {
        Alert.alert("Success", "Song added to playlist successfully.");
        onClose();
      } else {
        Alert.alert(
          "Error",
          "Failed to add song to playlist. Please try again."
        );
      }
    } catch (error) {
      console.error("Error adding song to playlist:", error);
      Alert.alert("Error", "An error occurred while adding the song.");
    } finally {
      setIsAddingToPlaylist(false);
    }
  };

  const handleCreatePlaylist = () => {
    setIsCreateModalVisible(true);
  };

  const handleCreateModalClose = async (playlistId?: string) => {
    setIsCreateModalVisible(false);
    if (playlistId) {
      // Add the song to the newly created playlist
      await handleAddToPlaylist(playlistId);
    }
  };

  const renderPlaylistItem: ListRenderItem<Playlist> = ({ item }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => handleAddToPlaylist(item.id)}
      disabled={isAddingToPlaylist}
    >
      <Text style={styles.playlistName}>{item.name}</Text>
      <Ionicons name="add-circle-outline" size={24} color="#007bff" />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Add to Playlist</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text>Loading playlists...</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              <TouchableOpacity
                style={styles.createNewButton}
                onPress={handleCreatePlaylist}
                disabled={isAddingToPlaylist}
              >
                <Ionicons name="add-circle" size={24} color="#007bff" />
                <Text style={styles.createNewText}>Create New Playlist</Text>
              </TouchableOpacity>

              {playlists.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    You don't have any playlists yet.
                  </Text>
                  <Text style={styles.emptyText}>
                    Create one using the button above!
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
          )}
        </View>
      </View>

      <CreatePlaylistModal
        visible={isCreateModalVisible}
        onClose={handleCreateModalClose}
      />
    </Modal>
  );
};

const styles = StyleSheet.create<Styles>({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    height: "70%",
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  listContainer: {
    flex: 1,
  },
  playlistItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  playlistName: {
    fontSize: 16,
    flex: 1,
  },
  createNewButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#f8f8f8",
  },
  createNewText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
    marginLeft: 8,
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
