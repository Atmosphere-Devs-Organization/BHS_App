import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { router } from "expo-router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import React from "react";
import {
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
  StatusBar,
  TextInput,
  Pressable,
} from "react-native";

const App = () => {
  const [email, onChangeEmail] = React.useState("");
  const [pass, onChangePass] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const auth = FIREBASE_AUTH;

  const signIn = async () => {
    setLoading(true);

    try {
      const response = await signInWithEmailAndPassword(auth, email, pass);

      router.back();
    } catch (error: any) {
      if (
        error instanceof Error &&
        error.message === "Firebase: Error (auth/invalid-credential)."
      ) {
        alert("Sign in failed: You need to create an account.");
      } else {
        alert("Please enter a valid email and password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async () => {
    setLoading(true);

    try {
      const response = await createUserWithEmailAndPassword(auth, email, pass);

      signIn();
    } catch (error) {
      console.log(error);
      alert("Please enter a valid email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar
        animated={true}
        barStyle={"dark-content"}
        showHideTransition={"fade"}
        hidden={true}
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ImageBackground
          source={require("@/assets/images/LoginBG.png")}
          resizeMode="cover"
          style={styles.login_BG_Image}
        >
          <TextInput
            style={styles.user_input}
            onChangeText={onChangeEmail}
            value={email}
            placeholder="name####@stu.cfisd.net"
            placeholderTextColor={"#B3B3B3"}
            autoComplete="email"
            textContentType="oneTimeCode"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.password_input}
            onChangeText={onChangePass}
            value={pass}
            placeholder="Password"
            placeholderTextColor={"#B3B3B3"}
            autoComplete="current-password"
            textContentType="oneTimeCode"
            autoCapitalize="none"
            secureTextEntry={true}
          />
          <Pressable
            onPressIn={signIn}
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "#808080" : "#1A5570",
              },
              styles.signInButton,
            ]}
          >
            <Text style={styles.signin_text}>Sign In</Text>
          </Pressable>
          <Pressable style={styles.createAccountButton} onPressIn={signUp}>
            <Text style={styles.signup_text}>Create an Account</Text>
          </Pressable>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  login_BG_Image: {
    flex: 1,
    justifyContent: "center",
  },
  user_input: {
    height: 40,
    marginLeft: 60,
    marginRight: 60,
    marginTop: 347.5,
    padding: 10,
    color: "#B3B3B3",
  },
  password_input: {
    height: 40,
    marginLeft: 60,
    marginRight: 60,
    marginTop: 53.5,
    padding: 10,
    color: "#B3B3B3",
  },
  signin_text: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  signInButton: {
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 60,
    transform: [{ translateY: 23.5 }],
  },
  signup_text: {
    fontSize: 16,
    color: "orange",
    textAlign: "center",
    fontWeight: "normal",
  },
  createAccountButton: {
    padding: 10,
    marginHorizontal: 60,
    transform: [{ translateY: 53.5 }],
  },
});

export default App;
