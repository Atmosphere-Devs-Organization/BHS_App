import React, { useEffect, useState } from "react";
import {
  Pressable,
  View,
  Text,
  Image,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  Linking,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import clubData from "@/assets/data/clubs-data.json";
import { Club } from "@/interfaces/club";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AwesomeButton from 'react-native-really-awesome-button';
import { collection, doc, setDoc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "@/FirebaseConfig"; // Assuming you have configured Firestore here
import { onAuthStateChanged, User } from "firebase/auth";

const screenWidth = Dimensions.get('window').width;

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentClub = (clubData as Club[]).find((item) => item.id === id);
  const [userId, setUserId] = useState<string | null>(null);
  const [isClubInCalendar, setIsClubInCalendar] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user: User | null) => {
      if (user) {
        setUserId(user.uid);
        checkIfClubInCalendar(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const checkIfClubInCalendar = async (userId: string) => {
    try {
      const userDocRef = doc(collection(FIREBASE_DB, "users"), userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.clubs && userData.clubs.includes(currentClub?.name)) {
          setIsClubInCalendar(true);
        }
      }
    } catch (error) {
      console.error("Error checking club in calendar: ", error);
    }
  };

  const handleAddOrRemoveClub = async () => {
    try {
      if (!userId || !currentClub) {
        alert("You must be logged in to manage clubs in your calendar.");
        return;
      }

      const userDocRef = doc(collection(FIREBASE_DB, "users"), userId);
      const clubDocRef = doc(collection(FIREBASE_DB, "clubs"), currentClub.name);

      await setDoc(clubDocRef, {
        name: currentClub.name,
        id: currentClub.id,
        // Add other fields as necessary, like description, sponsor, etc.
      }, { merge: true });

      if (isClubInCalendar) {
        await updateDoc(userDocRef, {
          clubs: arrayRemove(currentClub.name)
        });
        setIsClubInCalendar(false);
        alert("Club removed from calendar!");
      } else {
        await updateDoc(userDocRef, {
          clubs: arrayUnion(currentClub.name)
        });
        setIsClubInCalendar(true);
        alert("Club added to calendar!");
      }
    } catch (error) {
      console.error("Error managing club in calendar: ", error);
      alert("Failed to manage club in calendar.");
    }
  };

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

        <AwesomeButton
          style={styles.button}
          backgroundColor="#007BFF"
          backgroundDarker="#0056b3"
          height={screenWidth * 0.2}
          width={screenWidth * 0.6}
          onPress={handleAddOrRemoveClub}
        >
          <Text style={styles.buttonText}>
            {isClubInCalendar ? "Remove Club from Calendar" : "Add Club to Calendar"}
          </Text>
        </AwesomeButton>

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
  button: {
    marginHorizontal: 10,
    alignSelf: "center",
    marginBottom: 50,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  close_button: { padding: 10 },
});

export default Page;
