import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  Switch,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function Settings() {
  const router = useRouter();
  const username = "User Name"; // Placeholder for username
  const email = "useremail@emailaddress.com"; // Placeholder for email

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.userDetails}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>{username}</Text>
        <Text>{email}</Text>
        <Pressable style={styles.edit}>
          <Text style={{ color: "#007bff", fontWeight: "bold" }}>
            Change Password
          </Text>
        </Pressable>
      </View>

      <View style={styles.setting}>
        <Text style={{ fontWeight: "bold" }}>A Setting To Do Something</Text>
        <Switch value={true} onValueChange={() => {}} />
      </View>
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
  userDetails: {
    backgroundColor: "#d9d6d6ff",
    paddingVertical: 32,
    alignItems: "center",
    borderRadius: 14,
    marginHorizontal: 20,
  },
  edit: {
    marginTop: 16,
  },
  setting: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 28,
  },
});
