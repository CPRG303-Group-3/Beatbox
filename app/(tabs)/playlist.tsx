import { View, StyleSheet, Text, Image, Pressable } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function Playlists() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Playlists</Text>

      <Pressable style={styles.button}>
        <Image source={require("../../assets/plus.png")} style={styles.icon} />
        <Text style={styles.buttonText}>Create New Playlist</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  icon: {
    width: 24,
    height: 24,
    justifyContent: "space-between",
    verticalAlign: "middle",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginLeft: 160,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    alignSelf: "center",
    marginRight: 30,
  },
});
