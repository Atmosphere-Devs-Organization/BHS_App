import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  Pressable,
  Linking,
} from "react-native";
import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import clubData from "@/assets/data/clubs-data.json";
import { Club } from "@/interfaces/club";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentClub = (clubData as Club[]).find((item) => item.id === id);

  return (
    <ImageBackground
      source={require("@/assets/images/GenericBG.png")}
      resizeMode="cover"
      style={{
        flex: 1,
        alignContent: "center",
      }}
    >
      <StatusBar
        animated={true}
        barStyle={"dark-content"}
        showHideTransition={"fade"}
        hidden={true}
      />

      <Image source={{ uri: currentClub?.imageURL }} style={styles.image} />
      <TouchableOpacity onPress={router.back} style={styles.close_button}>
        <Ionicons name="close-sharp" size={24} color="white" />
      </TouchableOpacity>
      <View
        style={{
          alignContent: "center",
          borderRadius: 30,
          width: "100%",
          borderWidth: 1,
          height: "80%",
        }}
      >
        <Text style={styles.name}>{currentClub?.name}</Text>
        <View style={styles.divider} />
        <Text style={styles.description}>{currentClub?.longDescription}</Text>
        <View style={styles.divider} />
        <Pressable
          onPress={() => {
            currentClub?.sponsorEmail.indexOf(",") === -1
              ? Linking.openURL("mailto:" + currentClub?.sponsorEmail)
              : null;
          }}
        >
          <Text style={styles.sponsorEmail}>
            Sponsor: {currentClub?.sponsorEmail}
          </Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 300,
    borderColor: "#000",
    borderWidth: 3,
  },
  name: {
    textAlign: "center",
    fontWeight: "bold",
    padding: 20,
    fontSize: 24,
    color: Colors.clubName,
    shadowColor: "#ffffff",
    shadowOpacity: 0.36,
    shadowRadius: 8,
    shadowOffset: {
      width: 1,
      height: 1,
    },
    marginBottom: 30,
  },
  description: {
    textAlign: "left",
    marginTop: 10,
    marginBottom: 10,
    paddingRight: 30,
    paddingLeft: 10,
    color: Colors.clubDesc,
    fontSize: 17,
  },
  sponsorEmail: {
    textAlign: "center",
    marginTop: 50,
    color: Colors.clubDesc,
    fontSize: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: Colors.divider,
    width: "100%",
  },
  close_button: { padding: 10 },
});

export default Page;
