import { View, StyleSheet, Text, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function Songs() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Songs</Text>
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
});
