import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
} from "react-native";
import type { Asset } from "expo-media-library";
import { AudioDatabase, AudioFileRecord } from "../lib/audioDatabase";

interface AudioMetadataModalProps {
  visible: boolean;
  files: AudioFileRecord[];
  onClose: (updatedFiles?: AudioFileRecord[]) => void;
}

export const AudioMetadataModal: React.FC<AudioMetadataModalProps> = ({
  visible,
  files,
  onClose,
}) => {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");

  const currentFile = files[currentFileIndex];

  const handleSave = async () => {
    // Save metadata for current file
    await AudioDatabase.updateRecord(currentFile.id, {
      title: title.trim() || undefined,
      artist: artist.trim() || undefined,
      included: title.trim() !== "",
    });

    // Move to next file or close if done
    if (currentFileIndex < files.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
      setTitle("");
      setArtist("");
    } else {
      onClose();
    }
  };

  const handleSkip = async () => {
    // Mark file as not included
    await AudioDatabase.updateRecord(currentFile.id, {
      included: false,
    });

    // Move to next file or close if done
    if (currentFileIndex < files.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
      setTitle("");
      setArtist("");
    } else {
      onClose();
    }
  };

  if (!currentFile) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => onClose()}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Add Metadata</Text>
          <Text style={styles.fileNameText}>File: {currentFile.filename}</Text>

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

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>
                {currentFileIndex < files.length - 1 ? "Next" : "Finish"}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.skipButton]}
              onPress={handleSkip}
            >
              <Text style={styles.buttonText}>Skip</Text>
            </Pressable>
          </View>

          <Text style={styles.progressText}>
            {currentFileIndex + 1} of {files.length} files
          </Text>
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
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
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
  skipButton: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  progressText: {
    marginTop: 10,
    color: "#666",
  },
});
