import {
  StyleSheet,
  View,
  Text,
  Pressable,
  SafeAreaView,
  TextInput,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { signUp } from "../lib/supabase-auth";

export default function SignUp() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Handle user sign-up via supabase authentication
  const handleSignUp = async () => {
    let valid = true;
    setErrorMsg("");
    setEmailError("");
    setNameError("");
    setPasswordError("");
    setConfirmPasswordError("");

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!email) {
      setEmailError("Email is required");
      valid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Email format is invalid");
      valid = false;
    }

    if (!name) {
      setNameError("Name is required");
      valid = false;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (!passwordRegex.test(password)) {
      setPasswordError(
        "Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character."
      );
      valid = false;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      valid = false;
    }

    if (!valid) {
      setErrorMsg("Please fix the errors above");
      return;
    } else {
      try {
        await signUp(email.trim(), name.trim(), password);
        console.log(
          `Sign Up Successful for user: ${name.trim()} with email: ${email.trim()}`
        );
        alert("Sign Up Successful! You can now log in.");
        setEmail("");
        setName("");
        setPassword("");
        setConfirmPassword("");
      } catch (error: any) {
        console.log("Sign Up Error: ", error);

        if (error.message.includes("already registered")) {
          setErrorMsg("This email is already registered.");
        }
      }
    }
  };

  // Navigate back to the login page
  const goToLogin = () => {
    router.push("/");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.headingText}>Sign up for a Beatbox account.</Text>

        <View style={styles.form}>
          <Text style={styles.formText}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
          {emailError ? (
            <Text style={styles.errorMsg}>{emailError}</Text>
          ) : null}

          <Text style={styles.formText}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
          {nameError ? <Text style={styles.errorMsg}>{nameError}</Text> : null}

          <Text style={styles.formText}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {passwordError ? (
            <Text style={styles.errorMsg}>{passwordError}</Text>
          ) : null}

          <Text style={styles.formText}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          {confirmPasswordError ? (
            <Text style={styles.errorMsg}>{confirmPasswordError}</Text>
          ) : null}

          {errorMsg ? (
            <Text style={styles.mainErrorMsg}>{errorMsg}</Text>
          ) : null}
        </View>

        <View style={styles.buttonContainer}>
          <Pressable style={styles.signupButton} onPress={handleSignUp}>
            <Text style={styles.signupText}>Sign Up</Text>
          </Pressable>
          <Pressable style={styles.loginButton} onPress={goToLogin}>
            <Text style={styles.loginText}>Back to Login</Text>
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
    marginTop: 20,
  },
  headingText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  form: {
    marginTop: 40,
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
  mainErrorMsg: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  buttonContainer: {
    width: "80%",
    marginTop: 50,
  },
  signupButton: {
    backgroundColor: "#007bff",
    padding: 16,
    marginVertical: 10,
    borderRadius: 15,
  },
  loginButton: {
    backgroundColor: "#efefef",
    padding: 16,
    marginVertical: 10,
    borderRadius: 15,
  },
  signupText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginText: {
    textAlign: "center",
    color: "#007bff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
