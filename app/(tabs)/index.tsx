import {
  View,
  Text,
  Button,
  ImageBackground,
  StatusBar,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Link, router } from "expo-router";
import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";

const Home = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });
  }, []);

  return (
    <ImageBackground
      source={require("@/assets/images/HomeScreenBG.png")}
      resizeMode="cover"
      style={styles.home_BG_Image}
    >
      <Text>
        Home: {user ? "You are all logged in! as: " + user.email : "Null user"}
      </Text>
      <Button
        title={user ? "Logout" : "Login"}
        onPress={() =>
          user ? FIREBASE_AUTH.signOut() : router.push("(modals)/login")
        }
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  home_BG_Image: {
    flex: 1,
    justifyContent: "center",
  },
});

export default Home;
