import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Dimensions,
  Linking,
} from "react-native";
import { Link, router } from "expo-router";
import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import AwesomeButton from 'react-native-really-awesome-button';
import Colors from "@/constants/Colors";
import Numbers from "@/constants/Numbers";

const screenWidth = Dimensions.get('window').width;

const Home = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (!user) {
        router.push("(modals)/login");
      }
    });
  }, []);

  const openURL = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

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
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        // zIndex: 10, // Try commenting this out
        // backgroundColor: 'rgba(255, 0, 0, 0.5)', // Try commenting this out
        borderColor: "gray",
        borderWidth: 3,
        padding: 10, // Add padding if needed
      }}
    >
      <Ionicons
        name="person-circle-sharp"
        size={Numbers.profileButtonSize}
        color={Colors.profileButton}
      />
    </TouchableOpacity>

      <View style={styles.buttonsContainer}>
        <AwesomeButton
          style={styles.button}
          backgroundColor="#007BFF"
          backgroundDarker="#0056b3"
          height={screenWidth * 0.3}
          width={screenWidth * 0.3}
          onPressOut={() => openURL('https://www.cfisd.net/')}
        >
          <Text style={styles.buttonText}>District Website</Text>
        </AwesomeButton>

        <AwesomeButton
          style={styles.button}
          backgroundColor="#28A745"
          backgroundDarker="#1e7e34"
          height={screenWidth * 0.3}
          width={screenWidth * 0.3}
          onPressOut={() => openURL('https://cypressfairbanksk12.scriborder.com/')}
        >
          <Text style={styles.buttonText}>Transcript Request</Text>
        </AwesomeButton>
      </View>

      <View style={styles.buttonsContainer}>
        <AwesomeButton
          style={styles.button}
          backgroundColor="#FF5733"
          backgroundDarker="#C13B1A"
          height={screenWidth * 0.3}
          width={screenWidth * 0.3}
          onPressOut={() => openURL('https://bridgeland.cfisd.net/')}
        >
          <Text style={styles.buttonText}>School Website</Text>
        </AwesomeButton>

        <AwesomeButton
          style={styles.button}
          backgroundColor="#FFC107"
          backgroundDarker="#C79100"
          height={screenWidth * 0.3}
          width={screenWidth * 0.3}
          onPressOut={() => openURL('https://voerequest.com')}
        >
          <Text style={styles.buttonText}>Request VOE</Text>
        </AwesomeButton>
      </View>

      <View style={styles.buttonsContainer}>
        <AwesomeButton
          style={styles.button}
          backgroundColor="#6F42C1"
          backgroundDarker="#4C2A8A"
          height={screenWidth * 0.3}
          width={screenWidth * 0.3}
          onPressOut={() => console.log('Scholarship Information pressed')}
        >
          <Text style={styles.buttonText}>Scholarship Information</Text>
        </AwesomeButton>

        <AwesomeButton
          style={styles.button}
          backgroundColor="#17A2B8"
          backgroundDarker="#117A8B"
          height={screenWidth * 0.3}
          width={screenWidth * 0.3}
          onPressOut={() => console.log('Contact Admin pressed')}
        >
          <Text style={styles.buttonText}>Contact Admin</Text>
        </AwesomeButton>
      </View>

      <View style={styles.buttonLink}>
          <Link href="/(modals)/report">
            <Text style={styles.buttonText2}> Report an Issue </Text>
          </Link>
      </View>

    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  home_BG_Image: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center", // Center items horizontally
  },
  profileButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    borderColor: "gray",
    borderWidth: 3,
    zIndex: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.5)', // Temporary background for visibility
    transform: [
      { translateY: Numbers.profileButtonYTranslate || 0 },
      { translateX: Numbers.profileButtonXTranslate || 0 },
    ],
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%', // Adjust as needed to control spacing
    marginTop: 20, // Space between rows
  },
  button: {
    marginHorizontal: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonLink: {
    marginTop: 30,
    width: '80%', 
    alignItems: 'center',
  },
  buttonText2: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
});

export default Home;