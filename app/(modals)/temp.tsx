import React, { useState } from 'react';
import { getAuth, sendPasswordResetEmail, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
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
  Image,
} from "react-native";
import { router } from "expo-router";
import Colors from '@/constants/Colors';
import { Entypo } from '@expo/vector-icons';
import Numbers from '@/constants/Numbers';

const screenWidth = Dimensions.get('window').width;

const App = () => {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const auth = FIREBASE_AUTH;

  const signIn = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Logged in successfully.");
      router.back();
    } catch (error: any) {
      console.log(error);
      if (error instanceof Error && error.message === "Firebase: Error (auth/invalid-credential).") {
        Alert.alert("Sign in failed", "Incorrect Password or you need to create an account.");
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
      const response = await createUserWithEmailAndPassword(auth, email, password);
      const user = response.user;
      const userCollection = collection(FIREBASE_DB, "users");
      const userDoc = doc(userCollection, user?.uid);

      await setDoc(userDoc, {
        name: name,
        email: user.email,
        HACusername: "",
        HACpassword: "",
        clubs: ["Computer Science Club", "Future Business Leaders of America"]
      });

      signIn();
    } catch (error: any) {
      console.log(error.message);
      if (error.message === "Firebase: Password should be at least 6 characters (auth/weak-password).") {
        Alert.alert("Error", "Password must be at least 6 characters.");
      } else if (error.message === "Firebase: Error (auth/email-already-in-use).") {
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
      Alert.alert("Success", "Password reset email sent. Please check your inbox.");
      setIsResettingPassword(false);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      Alert.alert("Error", "Failed to send password reset email. Please check the email address and try again.");
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
    <View style={[styles.container, { backgroundColor: Colors.AmarBackground }]}>
      <Image source={require('assets/images/icon.png')} style={styles.icon} />
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
            />
            <AwesomeButton
                style={styles.login_button}
                backgroundColor={Colors.loginButtonBG}
                backgroundDarker={Colors.loginButtonDarkerBG}
                height={screenWidth * .15}
                width={Numbers.loginButtonWidth}
                raiseLevel={10}
                onPress={handleResetPassword}
            >
                <Entypo
                    name="login"
                    size={16}
                    color={Colors.loginIcon}
                    style={{ alignSelf: "center", marginRight: 15 }}
                />
            <Text style={styles.pressableText}>Send Password Reset Email</Text>
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
            />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholderTextColor="white"
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              placeholderTextColor="white"
            />
            <AwesomeButton
                style={styles.login_button}
                backgroundColor={Colors.loginButtonBG}
                backgroundDarker={Colors.loginButtonDarkerBG}
                height={screenWidth * .15}
                width={Numbers.loginButtonWidth}
                raiseLevel={10}
                onPress={signUp}
            >
                <Entypo
                    name="login"
                    size={16}
                    color={Colors.loginIcon}
                    style={{ alignSelf: "center", marginRight: 15 }}
                />
            <Text style={styles.pressableText}>Create Account</Text>
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
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              placeholderTextColor="white"
            />
            <AwesomeButton
                style={styles.login_button}
                backgroundColor={Colors.loginButtonBG}
                backgroundDarker={Colors.loginButtonDarkerBG}
                height={screenWidth * .15}
                width={Numbers.loginButtonWidth}
                raiseLevel={10}
                onPress={signIn}
            >
            <Entypo
                name="login"
                size={16}
                color={Colors.loginIcon}
                style={{ alignSelf: "center", marginRight: 15 }}
            />
          <Text style={styles.pressableText}>Login</Text>
        </AwesomeButton>
  
          </View>
          <Pressable onPress={handleSwitchToCreateAccount}>
            <Text style={styles.pressableText}>Create New Account</Text>
          </Pressable>
          <Pressable onPress={handleForgotPassword}>
            <Text style={styles.pressableText}>Forgot Password</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 16,
    },
    icon: {
      width: '200%', // Double the width as a percentage of the screen width
      height: '20%', // Double the height as a percentage of the screen height
      alignSelf: 'center',
      marginTop: '15%', // Maintain the top margin
      resizeMode: 'contain', // Maintain aspect ratio
    },
    login_button: {
        marginVertical: 25,
        alignContent: "center",
        alignSelf: "center",
      },
    form: {
      width: '100%',
      marginTop: '25%',
    },
    input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginBottom: 12,
      paddingHorizontal: 8,
      color: 'white',
    },
    box: {
      backgroundColor: 'navy',
      borderColor: 'orange',
      borderWidth: 2,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'orange',
      textAlign: 'center',
      marginBottom: 16,
    },
    pressableText: {
      color: 'orange',
      textAlign: 'center',
      paddingVertical: 10,
    },
  });
  

export default App;
