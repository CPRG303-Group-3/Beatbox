import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  Switch,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { signOut } from "../../lib/supabase-auth";
import { supabase } from "../../lib/supabase";

export default function Settings() {
  const router = useRouter();
  const [username, setUsername] = useState("Loading...");
  const [email, setEmail] = useState("Loading...");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setEmail(user.email || "No email");

          const { data, error } = await supabase
            .from("user")
            .select("name")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("Error fetching user name:", error);
            setUsername("No name");
          } else {
            setUsername(data.name || "No name");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUsername("Error loading");
        setEmail("Error loading");
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/"); // Navigate to home or login screen
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.userDetails}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>{username}</Text>
        <Text>{email}</Text>
      </View>

      <View style={styles.setting}>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
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
  logoutButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
