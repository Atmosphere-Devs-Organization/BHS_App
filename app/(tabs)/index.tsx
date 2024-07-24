import {
  Text,
  Button,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Link, router } from "expo-router";
import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import Numbers from "@/constants/Numbers";

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
      <StatusBar
        animated={true}
        barStyle={"dark-content"}
        showHideTransition={"fade"}
        hidden={false}
      />
      <TouchableOpacity
        onPress={() => router.push("(screens)/profile")}
        style={styles.profileButton}
      >
        <Ionicons
          name="person-circle-sharp"
          size={Numbers.profileButtonSize}
          color={Colors.profileButton}
        />
      </TouchableOpacity>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  home_BG_Image: {
    flex: 1,
    justifyContent: "center",
  },
  profileButton: {
    transform: [
      { translateY: Numbers.profileButtonYTranslate },
      { translateX: Numbers.profileButtonXTranslate },
    ],
  },
});

export default Home;
