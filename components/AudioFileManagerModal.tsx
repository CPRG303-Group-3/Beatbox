import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Switch,
} from "react-native";
import { AudioDatabase, AudioFileRecord } from "../lib/audioDatabase";
import * as Haptics from "expo-haptics";

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
  const [isIncluded, setIsIncluded] = useState(true);

  useEffect(() => {
    if (file) {
      setTitle(file.title || "");
      setArtist(file.artist || "");
      setIsIncluded(file.included);
    }
  }, [file]);

  const handleSave = async () => {
    if (!file) return;

    try {
      await AudioDatabase.updateRecord(file.id, {
        title: title.trim() || undefined,
        artist: artist.trim() || undefined,
        included: isIncluded,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating file:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDelete = async () => {
    if (!file) return;

    try {
      await AudioDatabase.updateRecord(file.id, {
        included: false,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error deleting file:", error);
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

          <View style={styles.switchContainer}>
            <Text>Include in Library</Text>
            <Switch value={isIncluded} onValueChange={setIsIncluded} />
          </View>

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
              <Text style={styles.buttonText}>Remove</Text>
            </Pressable>
          </View>

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginVertical: 10,
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
});
