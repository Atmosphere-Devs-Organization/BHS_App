import { View, Text, Button } from "react-native";
import React, { useEffect, useState } from "react";
import { Link } from "expo-router";
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
    <View>
      <Text>Home: {user ? "You are all logged in!" : "Null user"}</Text>
      <Link href={"(modals)/login"}>Login</Link>
      <Button title="Logout" onPress={() => FIREBASE_AUTH.signOut()} />
    </View>
  );
};

export default Home;
