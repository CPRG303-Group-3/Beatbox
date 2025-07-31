import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Switch,
  ActivityIndicator,
} from "react-native";
import { AudioDatabase, AudioFileRecord } from "../lib/audioDatabase";
import * as Haptics from "expo-haptics";
import { AddToPlaylistModal } from "./AddToPlaylistModal";

interface AudioFileManagerModalProps {
  visible: boolean;
  file: AudioFileRecord | null;
  onClose: () => void;
  onUpdate: () => void;
}

export const AudioFileManagerModal: React.FC<AudioFileManagerModalProps> = ({
  visible,
  file,
  onClose,
  onUpdate,
}) => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddToPlaylistModalVisible, setIsAddToPlaylistModalVisible] =
    useState(false);

  useEffect(() => {
    if (file) {
      setTitle(file.title || "");
      setArtist(file.artist || "");
    }
  }, [file]);

  const handleSave = async () => {
    if (!file) return;

    try {
      setIsLoading(true);

      const success = await AudioDatabase.updateRecord(file.id, {
        title: title.trim() || undefined,
        artist: artist.trim() || undefined,
      });

      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onUpdate();
        onClose();
      } else {
        throw new Error("Failed to update record");
      }
    } catch (error) {
      console.error("Error updating file:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!file) return;

    try {
      setIsLoading(true);

      const success = await AudioDatabase.deleteRecord(file.id);

      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        onUpdate();
        onClose();
      } else {
        throw new Error("Failed to delete record");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!file) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Manage Audio File</Text>
          <Text style={styles.fileNameText}>
            Original Filename: {file.filename}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Song Title (optional)"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={styles.input}
            placeholder="Artist (optional)"
            value={artist}
            onChangeText={setArtist}
          />

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#007bff"
              style={styles.loader}
            />
          ) : (
            <>
              <View style={styles.buttonContainer}>
                <Pressable
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </Pressable>

                <Pressable
                  style={[styles.button, styles.deleteButton]}
                  onPress={handleDelete}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </Pressable>
              </View>

              <Pressable
                style={styles.playlistButton}
                onPress={() => setIsAddToPlaylistModalVisible(true)}
              >
                <Text style={styles.playlistButtonText}>Add to Playlist</Text>
              </Pressable>
            </>
          )}

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>

          {file && (
            <AddToPlaylistModal
              visible={isAddToPlaylistModalVisible}
              audioFileId={file.id}
              onClose={() => setIsAddToPlaylistModalVisible(false)}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  playlistButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  playlistButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  fileNameText: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
    color: "#666",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  button: {
    padding: 12,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#007bff",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: 15,
  },
  cancelButtonText: {
    color: "#007bff",
  },
  loader: {
    marginVertical: 20,
  },
});
