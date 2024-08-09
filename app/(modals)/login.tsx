import React, { useState } from "react";
import {
  getAuth,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { FIREBASE_AUTH, FIREBASE_DB } from "@/FirebaseConfig";
import { collection, doc, setDoc } from "firebase/firestore";
import AwesomeButton from "react-native-really-awesome-button";
import {
  StyleSheet,
  Dimensions,
  Text,
  View,
  TextInput,
  Alert,
  Pressable,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { router } from "expo-router";
import { Entypo, Ionicons } from "@expo/vector-icons";
import Numbers from "@/constants/Numbers";
import Colors from "@/constants/Colors";

const screenWidth = Dimensions.get("window").width;

const App = () => {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const auth = FIREBASE_AUTH;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const signIn = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Logged in successfully.");
      router.back();
    } catch (error: any) {
      console.log(error);
      if (
        error instanceof Error &&
        error.message === "Firebase: Error (auth/invalid-credential)."
      ) {
        Alert.alert(
          "Sign in failed",
          "Incorrect Password or you need to create an account."
        );
      } else {
        Alert.alert("Error", "Please enter a valid email and password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async () => {
    setLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = response.user;
      const userCollection = collection(FIREBASE_DB, "users");
      const userDoc = doc(userCollection, user?.uid);

      await setDoc(userDoc, {
        name: name,
        email: user.email,
        HACusername: "",
        HACpassword: "",
        clubs: [
          "Computer Science Club",
          "Future Business leaders of America (FBLA)",
        ],
      });

      signIn();
    } catch (error: any) {
      console.log(error.message);
      if (
        error.message ===
        "Firebase: Password should be at least 6 characters (auth/weak-password)."
      ) {
        Alert.alert("Error", "Password must be at least 6 characters.");
      } else if (
        error.message === "Firebase: Error (auth/email-already-in-use)."
      ) {
        Alert.alert("Error", "That email is already in use.");
      } else {
        Alert.alert("Error", "Please enter a valid email and password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      Alert.alert(
        "Success",
        "Password reset email sent. Please check your inbox."
      );
      setIsResettingPassword(false);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      Alert.alert(
        "Error",
        "Failed to send password reset email. Please check the email address and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToCreateAccount = () => {
    setIsCreatingAccount(true);
    setIsResettingPassword(false);
  };

  const handleSwitchToLogin = () => {
    setIsCreatingAccount(false);
    setIsResettingPassword(false);
  };

  const handleForgotPassword = () => {
    setIsResettingPassword(true);
    setIsCreatingAccount(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
          <TouchableOpacity onPress={router.back} style={styles.close_button}>
            <Ionicons name="close-sharp" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.welcomeText}>Welcome To The Bridgeland App</Text>

          {isResettingPassword ? (
            <View style={styles.form}>
              <View style={styles.box}>
                <Text style={styles.title}>Reset Password</Text>
                <TextInput
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  style={styles.input}
                  placeholderTextColor="white"
                  textContentType="oneTimeCode"
                />
                <AwesomeButton
                  style={styles.login_button}
                  backgroundColor={Colors.loginButtonBG}
                  backgroundDarker={Colors.loginButtonDarkerBG}
                  height={screenWidth * 0.15}
                  width={Numbers.loginButtonWidth}
                  raiseLevel={1}
                  onPress={handleResetPassword}
                >
                  <Entypo
                    name="login"
                    size={16}
                    color="white" // Reverted to original
                    style={{ alignSelf: "center", marginRight: 15 }}
                  />
                  <Text style={styles.buttonText}>
                    Send Password Reset Email
                  </Text>
                </AwesomeButton>
              </View>
              <Pressable onPress={handleSwitchToLogin}>
                <Text style={styles.pressableText}>Back to Login</Text>
              </Pressable>
            </View>
          ) : isCreatingAccount ? (
            <View style={styles.form}>
              <View style={styles.box}>
                <Text style={styles.title}>Create Account</Text>
                <TextInput
                  placeholder="Name"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  placeholderTextColor="white"
                  textContentType="oneTimeCode"
                />
                <TextInput
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  placeholderTextColor="white"
                  textContentType="oneTimeCode"
                />
                <View style={styles.passwordContainer}>
                  <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!isPasswordVisible}
                    style={styles.passwordInput}
                    placeholderTextColor="white"
                    textContentType="oneTimeCode"
                  />
                  <TouchableOpacity onPress={togglePasswordVisibility}>
                    <Ionicons
                      name={isPasswordVisible ? "eye-off" : "eye"}
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
                <AwesomeButton
                  style={styles.login_button}
                  backgroundColor={Colors.loginButtonBG}
                  backgroundDarker={Colors.loginButtonDarkerBG}
                  height={screenWidth * 0.15}
                  width={Numbers.loginButtonWidth}
                  raiseLevel={1}
                  onPress={signUp}
                >
                  <Entypo
                    name="login"
                    size={16}
                    color={Colors.loginIcon}
                    style={{ alignSelf: "center", marginRight: 15 }}
                  />
                  <Text style={styles.buttonText}>Create Account</Text>
                </AwesomeButton>
              </View>
              <Pressable onPress={handleSwitchToLogin}>
                <Text style={styles.pressableText}>Back to Login</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.box}>
                <Text style={styles.title}>Login</Text>
                <TextInput
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  placeholderTextColor="white"
                  textContentType="oneTimeCode"
                />
                <View style={styles.passwordContainer}>
                  <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!isPasswordVisible}
                    style={styles.passwordInput}
                    placeholderTextColor="white"
                    textContentType="oneTimeCode"
                  />
                  <TouchableOpacity onPress={togglePasswordVisibility}>
                    <Ionicons
                      name={isPasswordVisible ? "eye-off" : "eye"}
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
                <AwesomeButton
                  style={styles.login_button}
                  backgroundColor={Colors.loginButtonBG} // Reverted to original
                  backgroundDarker={Colors.loginButtonDarkerBG} // Reverted to original
                  height={screenWidth * 0.15}
                  width={Numbers.loginButtonWidth}
                  raiseLevel={1}
                  onPress={signIn}
                >
                  <Entypo
                    name="login"
                    size={16}
                    color="white" // Reverted to original
                    style={{ alignSelf: "center", marginRight: 15 }}
                  />
                  <Text style={styles.buttonText}>Login</Text>
                </AwesomeButton>
              </View>
              <Pressable onPress={handleForgotPassword}>
                <Text style={styles.pressableText}>Forgot Password?</Text>
              </Pressable>
              <Pressable onPress={handleSwitchToCreateAccount}>
                <Text style={styles.pressableText}>
                  Don't have an account? Create one
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: Colors.overallBackground,
  },
  icon: {
    width: "200%", // Double the width as a percentage of the screen width
    height: "20%", // Double the height as a percentage of the screen height
    alignSelf: "center",
    resizeMode: "contain", // Maintain aspect ratio
  },
  login_button: {
    marginVertical: 25,
    alignContent: "center",
    alignSelf: "center",
  },
  form: {
    width: "100%",
    marginTop: "25%",
  },
  input: {
    height: 41,
    flexDirection: "row",
    alignItems: "center",
    borderColor: "gray",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    color: "white",
  },
  box: {
    backgroundColor: "navy",
    borderColor: "orange",
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "orange",
    textAlign: "center",
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "orange",
    textAlign: "center",
    marginBottom: 16,
    marginTop: "15%", // Maintain the top margin
  },
  pressableText: {
    color: "orange",
    textAlign: "center",
    paddingVertical: 10,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: 'gray', // Reverted to original
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
    
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "white", // Reverted to original
  },
  buttonText: {
    fontSize: 20,
    color: "orange",
    textAlign: "center",
    paddingVertical: 10,
  },
  close_button: { padding: 10 },
});

export default App;