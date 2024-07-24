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
  TouchableOpacity,
} from "react-native";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AwesomeButton from "react-native-really-awesome-button";

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
      console.log(error);
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
    } catch (error: any) {
      console.log(error.message);
      if (
        error.message ===
        "Firebase: Password should be at least 6 characters (auth/weak-password)."
      ) {
        alert("Password must be at least than 6 characters");
      } else if (
        error.message === "Firebase: Error (auth/email-already-in-use)."
      ) {
        alert("That email is already in use");
      } else {
        alert("Please enter a valid email and password.");
      }
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
          <TouchableOpacity onPress={router.back} style={styles.close_button}>
            <Ionicons name="close-sharp" size={24} color="black" />
          </TouchableOpacity>
          <TextInput
            style={styles.user_input}
            onChangeText={onChangeEmail}
            value={email}
            placeholder="jsmi####@stu.cfisd.net"
            placeholderTextColor={Colors.signInPlaceholderText}
            autoComplete="email"
            textContentType="oneTimeCode"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.password_input}
            onChangeText={onChangePass}
            value={pass}
            placeholder="Password"
            placeholderTextColor={Colors.signInPlaceholderText}
            autoComplete="current-password"
            textContentType="oneTimeCode"
            autoCapitalize="none"
            secureTextEntry={true}
          />
          <AwesomeButton
            style={styles.signInButton}
            backgroundColor={Colors.signInButtonNormal}
            backgroundDarker={Colors.signInButtonDark}
            height={60}
            width={270}
            raiseLevel={10}
            onPressOut={() => signIn()}
          >
            <Text style={styles.signin_text}>Sign In</Text>
          </AwesomeButton>
          <Pressable style={styles.createAccountButton} onPressIn={signUp}>
            <Text style={styles.signup_text}>Create an Account</Text>
          </Pressable>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  close_button: {
    transform: [{ translateY: -55 }, { translateX: 10 }],
  },
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
    marginTop: 361,
    padding: 10,
    color: Colors.loginInputText,
  },
  password_input: {
    height: 40,
    marginLeft: 60,
    marginRight: 60,
    marginTop: 53.5,
    padding: 10,
    color: Colors.loginInputText,
  },
  signin_text: {
    fontSize: 16,
    color: Colors.signInButtonText,
    textAlign: "center",
    fontWeight: "bold",
  },
  signInButton: {
    marginVertical: 10,
    alignSelf: "center",
  },
  signup_text: {
    fontSize: 16,
    color: Colors.createAccountText,
    textAlign: "center",
    fontWeight: "normal",
  },
  createAccountButton: {
    padding: 10,
    marginHorizontal: 60,
    transform: [{ translateY: 23.5 }],
  },
});

export default App;
