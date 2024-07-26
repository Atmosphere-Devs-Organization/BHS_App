import {
  View,
  Text,
  Button,
  ImageBackground,
  StatusBar,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import roomData from "@/assets/data/map-data.json";
import { Room } from "@/interfaces/Room";

const Map = () => {
  const [user, setUser] = useState<User | null>(null);
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [error, setError] = useState<string | null>(null);

  const data = useMemo(() => roomData as any, []); // More efficient, idk what it does tbh

  const [room1, setRoom1] = useState<number>(0);
  const [room2, setRoom2] = useState<number>(0);
  const room1Item = (data as Room[]).find((item) =>
    item.roomId.includes(room1)
  );
  const room2Item = (data as Room[]).find((item) =>
    item.roomId.includes(room2)
  );

  const handleSubmit = () => {
    const regex = /^\d{4}$/; // Regex to check if input is a 4-digit number
    const validNumbers = [1111, 2000]; // List of valid 4-digit numbers

    if (!regex.test(text1) || !regex.test(text2)) {
      setError("Both inputs must be 4-digit numbers.");
    } else if (
      !validNumbers.includes(Number(text1)) ||
      !validNumbers.includes(Number(text2))
    ) {
      setError("Both rooms must be valid.");
    } else {
      setRoom1(Number(text1));
      setRoom2(Number(text2));
      setError(null);
    }
  };

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });
  }, []);

  return (
    <ImageBackground
      source={require("@/assets/images/GenericBG.png")}
      resizeMode="cover"
      style={styles.home_BG_Image}
    >
      <ScrollView>
        <Text style={styles.title}>School Map</Text>
        <Text style={styles.title}>Find Your Room!</Text>
        <Text style={styles.subtitle}>For cafeteria, type 5000 </Text>
        <Text style={styles.subtitle}>
          If your room number starts with PB, you are in the portables. Access
          them from courtyard(5001){" "}
        </Text>
        <Text style={styles.subtitle}>For councilor pod, type </Text>
        <Text style={styles.subtitle}>For AP pod, type </Text>

        <TextInput
          style={{
            width: "75%",
            marginTop: "10%",
            height: 40,
            borderColor: "gray",
            borderWidth: 1,
            alignSelf: "center",
            padding: 10,
          }}
          onChangeText={setText1}
          value={text1}
          keyboardType="numeric"
          maxLength={4}
          placeholder="Enter first 4-digit number"
        />
        <TextInput
          style={{
            width: "75%",
            marginTop: "10%",
            height: 40,
            borderColor: "gray",
            borderWidth: 1,
            alignSelf: "center",
            padding: 10,
          }}
          onChangeText={setText2}
          value={text2}
          keyboardType="numeric"
          maxLength={4}
          placeholder="Enter second 4-digit number"
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <Button title="Submit" onPress={handleSubmit} />

        {error === null && (
          <Image
            source={{ uri: room1Item?.imageURL }}
            style={styles.image}
            resizeMode="contain"
          />
        )}
        {error === null && (
          <Image
            source={{ uri: room2Item?.imageURL }}
            style={styles.image}
            resizeMode="contain"
            onError={(error) => console.log("Image load error:", error)}
          />
        )}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  home_BG_Image: {
    flex: 1,
    justifyContent: "center",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  image: {
    width: "92%", // Set width to 90% of the screen width
    height: undefined, // Allow the height to adjust to maintain aspect ratio
    aspectRatio: 1, // Ensure the image maintains its original aspect ratio
    marginTop: 5, // Check this value
    marginBottom: 5, // If present, check this too
    alignSelf: "center",
    borderColor: "gray",
    borderWidth: 1,
  },
  title: {
    fontSize: 24,
    justifyContent: "flex-start",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    marginTop: 30,
    color: "white",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "white",
  },
});

export default Map;
