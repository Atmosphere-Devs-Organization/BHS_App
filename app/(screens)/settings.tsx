import { View, Text, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { User, onAuthStateChanged } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";

const App = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });
  }, []);

  return user ? <NormalSettings /> : <LoggedOutSettings />;
};

const LoggedOutSettings = () => {
  return (
    <View>
      <Text>You need to be signed in to access your settings</Text>
    </View>
  );
};

const NormalSettings = () => {
  return (
    <View>
      <Text>You need to be signed in to access your settings</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  normalSettingsContainer: {},
  loggedOutSettingsContainer: {},
});

export default App;
