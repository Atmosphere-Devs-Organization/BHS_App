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
import * as SecureStore from "expo-secure-store";

const screenWidth = Dimensions.get("window").width;

const App = () => {
  const [sid, setSID] = useState("");
  const [HACpassword, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // Default to false so the password is hidden initially

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const updateUser = async (field: "HACusername" | "HACpassword") => {
    try {
      if (field === "HACusername") {
        await SecureStore.setItemAsync("HACusername", sid);
      } else if (field === "HACpassword") {
        await SecureStore.setItemAsync("HACpassword", HACpassword);
      }
    } catch (error) {
      throw error;
    }
  };

  const signIn = async () => {
    setLoading(true);
    try {
      await updateUser("HACusername");
      await updateUser("HACpassword");
      Alert.alert("Logged In", "");
      router.back();
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.welcomeText}>Welcome To The Bear Den</Text>
          <View style={styles.form}>
            <View style={styles.box}>
              <Text style={styles.title}>Login</Text>
              <TextInput
                placeholder="SID: Include S"
                value={sid}
                onChangeText={setSID}
                style={styles.input}
                placeholderTextColor="white"
                textContentType="oneTimeCode"
              />
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Password"
                  value={HACpassword}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible} // Password hidden by default
                  style={styles.passwordInput}
                  placeholderTextColor="white"
                  textContentType="oneTimeCode"
                />
                <TouchableOpacity onPress={togglePasswordVisibility}>
                  <Ionicons
                    name={isPasswordVisible ? "eye" : "eye-off"} // Show eye-off when password is hidden
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
              <AwesomeButton
                style={styles.login_button}
                backgroundColor={"#2176ff"} // Reverted to original
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
          </View>
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
    backgroundColor: "#121212",
  },
  icon: {
    width: "200%", // Double the width as a percentage of the screen width
    height: "20%", // Double the height as a percentage of the screen height
    alignSelf: "center",
    resizeMode: "contain", // Maintain aspect ratio
    color: "white",
  },
  login_button: {
    marginVertical: 25,
    alignContent: "center",
    alignSelf: "center",
  },
  form: {
    width: "100%",
    marginTop: "30%",
    marginBottom: "15%",
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
    backgroundColor: "#1e1e1e",
    borderColor: Colors.primary,
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 0,
    marginTop: "5%", // Maintain the top margin
  },
  pressableText: {
    color: Colors.loginPressableText,
    textAlign: "center",
    paddingVertical: 10,
    fontSize: 20,
    fontWeight: "bold",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 15,
    marginBottom: 10,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "gray", // Reverted to original
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
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 10,
  },
  close_button: { padding: 10 },
});

export default App;
