import React, { useEffect, useState } from "react";
import {
  Pressable,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Linking,
  Dimensions,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Club } from "@/interfaces/Club";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AwesomeButton from "react-native-really-awesome-button";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "@/FirebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";

const screenWidth = Dimensions.get("window").width;

const Page = () => {
  const { id } = useLocalSearchParams<{ id?: string }>(); // Use id as optional

  // Debugging: Check if id is received correctly
  useEffect(() => {
    console.log("Received id:", id); // Debug log
  }, [id]);

  const [currentClub, setCurrentClub] = useState<Club | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isClubInCalendar, setIsClubInCalendar] = useState<boolean>(false);

  useEffect(() => {
    const fetchClubData = async () => {
      if (!id) {
        console.error("Club ID is undefined");
        return;
      }

      try {
        const clubDocRef = doc(FIREBASE_DB, "clubs", id); // Use id to fetch the document
        const clubDocSnap = await getDoc(clubDocRef);
        if (clubDocSnap.exists()) {
          setCurrentClub(clubDocSnap.data() as Club);
        } else {
          console.error("Club not found");
        }
      } catch (error) {
        console.error("Error fetching club data: ", error);
      }
    };

    const unsubscribe = onAuthStateChanged(
      FIREBASE_AUTH,
      (user: User | null) => {
        if (user) {
          setUserId(user.uid);
          fetchClubData(); // Fetch club data when user is authenticated
          checkIfClubInCalendar(user.uid);
        } else {
          setUserId(null);
        }
      }
    );

    return () => unsubscribe();
  }, [id]);

  const checkIfClubInCalendar = async (userId: string) => {
    try {
      const userDocRef = doc(FIREBASE_DB, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.clubs && userData.clubs.includes(id || "")) {
          setIsClubInCalendar(true);
        }
      }
    } catch (error) {
      console.error("Error checking club in calendar: ", error);
    }
  };

  const handleAddOrRemoveClub = async () => {
    if (!userId || !currentClub) {
      alert("You must be logged in to manage clubs in your calendar.");
      return;
    }
  
    try {
      const userDocRef = doc(FIREBASE_DB, "users", userId);
      const clubDocRef = doc(FIREBASE_DB, "clubs", id || ""); // Use id to reference the document
  
      if (isClubInCalendar) {
        await updateDoc(userDocRef, {
          clubs: arrayRemove(id || ""),
        });
        setIsClubInCalendar(false);
        alert("Club removed from calendar!");
      } else {
        await updateDoc(userDocRef, {
          clubs: arrayUnion(id || ""),
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
    <View
      style={[styles.container, { backgroundColor: Colors.AmarBackground }]}
    >
      <StatusBar
        animated={true}
        barStyle={"dark-content"}
        showHideTransition={"fade"}
        hidden={true}
      />
      <ScrollView
        style={{
          alignContent: "center",
          borderRadius: 30,
          width: "100%",
          borderWidth: 1,
          height: "80%",
        }}
      >
        <TouchableOpacity onPress={router.back} style={styles.close_button}>
          <Ionicons name="close-sharp" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.name}>{currentClub?.name}</Text>

        <Image source={{ uri: currentClub?.imageURL }} style={styles.image} />

        <AwesomeButton
          style={styles.button}
          backgroundColor="#007BFF"
          backgroundDarker="#0056b3"
          height={screenWidth * 0.2}
          width={screenWidth * 0.6}
          onPress={handleAddOrRemoveClub}
        >
          <Text style={styles.buttonText}>
            {isClubInCalendar
              ? "Remove Club from Calendar"
              : "Add Club to Calendar"}
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
      </ScrollView>
    </View>
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
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    fontSize: 40,
    color: "white",
    shadowColor: "#ffffff",
    shadowOpacity: 0.36,
    shadowRadius: 8,
    shadowOffset: {
      width: 1,
      height: 1,
    },
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
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },
  close_button: { padding: 10 },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
  },
});

export default Page;
