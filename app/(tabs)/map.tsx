import {
  Text,
  Button,
  ImageBackground,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useMemo, useState } from "react";
import roomData from "@/assets/data/map-data.json";
import { Room } from "@/interfaces/Room";
import { router } from "expo-router";

const Map = () => {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [error, setError] = useState<string | null>("Blank Error");

  const [room1Width, setRoom1Width] = useState<number>(1);
  const [room1Height, setRoom1Height] = useState<number>(1);
  const [room2Width, setRoom2Width] = useState<number>(1);
  const [room2Height, setRoom2Height] = useState<number>(1);

  const data = useMemo(() => roomData as any, []); // More efficient, idk what it does tbh

  const [room1, setRoom1] = useState<number>(0);
  const [room2, setRoom2] = useState<number>(0);
  const room1Item = (data as Room[]).find((item) =>
    item.roomId.includes(room1)
  );
  const room2Item = (data as Room[]).find((item) =>
    item.roomId.includes(room2)
  );

  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = () => {
    setLoading(true);

    const regex = /^\d{4}$/; // Regex to check if input is a 4-digit number
    const validNumbers = [1111, 2000]; // List of valid 4-digit numbers

    if (!regex.test(text1) || !regex.test(text2)) {
      setError("Both inputs must be 4-digit numbers.");
      setLoading(false);
    } else if (
      !validNumbers.includes(Number(text1)) ||
      !validNumbers.includes(Number(text2))
    ) {
      setError("Both rooms must be valid.");
      setLoading(false);
    } else {
      setRoom1(Number(text1));
      setRoom2(Number(text2));

      setError(null);

      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/GenericBG.png")}
      resizeMode="cover"
      style={styles.home_BG_Image}
    >
      <ScrollView
        contentContainerStyle={{ marginTop: 50, paddingBottom: 100 }}
        style={{ marginBottom: 100 }}
      >
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
        {error && error !== "Blank Error" && (
          <Text style={styles.error}>{error}</Text>
        )}
        <Button title="Submit" onPress={handleSubmit} />

        {!error &&
          !loading &&
          (Image.getSize(
            room1Item ? room1Item.imageURL : "",
            (width, height) => {
              setRoom1Height(height);
              setRoom1Width(width);
            }
          ),
          Image.getSize(
            room2Item ? room2Item.imageURL : "",
            (width, height) => {
              setRoom2Height(height);
              setRoom2Width(width);
            }
          ),
          (
            <TouchableOpacity
              onPress={() => router.push("/imageZoom/" + room1)}
            >
              <Image
                source={{ uri: room1Item?.imageURL }}
                style={{
                  aspectRatio: room1Width / room1Height,
                  width: "95%", // Set width to 95% of the screen width
                  height: undefined, // Allow the height to adjust to maintain aspect ratio
                  marginTop: 5, // Check this value
                  marginBottom: 5, // If present, check this too
                  alignSelf: "center",
                  borderColor: "gray",
                  borderWidth: 3,
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
        {!error && !loading && (
          <TouchableOpacity onPress={() => router.push("/imageZoom/" + room2)}>
            <Image
              source={{ uri: room2Item?.imageURL }}
              style={{
                aspectRatio: room2Width / room2Height,
                width: "95%", // Set width to 95% of the screen width
                height: undefined, // Allow the height to adjust to maintain aspect ratio
                marginTop: 5, // Check this value
                marginBottom: 5, // If present, check this too
                alignSelf: "center",
                borderColor: "gray",
                borderWidth: 3,
              }}
              resizeMode="contain"
              onError={(error) => console.log("Image load error:", error)}
            />
          </TouchableOpacity>
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
