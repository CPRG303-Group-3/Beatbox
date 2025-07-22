import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  Pressable,
  TextInput,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function App() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState("");

  const goToSignUp = () => {
    router.push("/signup");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.heading}>
          <Image style={styles.logo} source={require("../assets/icon.png")} />
          <Text style={styles.logoName}>Beatbox</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formText}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
          <Text style={styles.formText}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null}
        </View>

        <View style={styles.buttonContainer}>
          <Pressable style={styles.loginButton}>
            <Text style={styles.loginText}>Log In</Text>
          </Pressable>
          <Pressable style={styles.signupButton} onPress={goToSignUp}>
            <Text style={styles.signupText}>Sign Up</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    marginTop: 100,
  },
  heading: {
    flexDirection: "row",
    gap: 20,
  },
  logo: {
    height: 120,
    width: 120,
  },
  logoName: {
    alignSelf: "center",
    fontSize: 44,
    fontWeight: "bold",
  },
  form: {
    marginTop: 100,
    width: "80%",
  },
  formText: {
    fontSize: 18,
    fontWeight: 600,
    paddingBottom: 10,
    paddingTop: 20,
  },
  input: {
    borderRadius: 15,
    backgroundColor: "#efefef",
    padding: 12,
  },
  errorMsg: {
    color: "red",
  },
  buttonContainer: {
    width: "80%",
    marginTop: 50,
  },
  loginButton: {
    backgroundColor: "#007bff",
    padding: 16,
    marginVertical: 10,
    borderRadius: 15,
  },
  signupButton: {
    backgroundColor: "#efefef",
    padding: 16,
    marginVertical: 10,
    borderRadius: 15,
  },
  loginText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  signupText: {
    textAlign: "center",
    color: "#007bff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
