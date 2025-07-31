import { View, StyleSheet, Text, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import AudioList from "../../components/AudioList";

export default function Songs() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Songs</Text>
      <AudioList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    paddingTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});
