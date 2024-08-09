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
import { Club } from "@/interfaces/club";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AwesomeButton from "react-native-really-awesome-button";
import {
  doc,
  collection,
  getDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
  QueryDocumentSnapshot,
  writeBatch
} from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "@/FirebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const Page = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [currentClub, setCurrentClub] = useState<Club | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isClubInCalendar, setIsClubInCalendar] = useState<boolean>(false);
  const [upcomingDates, setUpcomingDates] = useState<{ name: string; time: Date }[]>([]);
  const [pastEvents, setPastEvents] = useState<{ name: string; imageURL: string; description: string }[]>([]);
  
  // State to store image dimensions
  const [imageHeight, setImageHeight] = useState<number>(screenHeight * 0.3);
  
  useEffect(() => {
    const updateAndFetch = async () => {
      await updateClubIds();
      if (id) {
        fetchClubData(); 
        const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user: User | null) => {
          if (user) {
            setUserId(user.uid);
            checkIfClubInCalendar(user.uid);
          } else {
            setUserId(null);
          }
        });

        return () => unsubscribe();
      }
    };

    updateAndFetch();
  }, [id]);

  const updateClubIds = async () => {
    try {
      const clubsRef = collection(FIREBASE_DB, "clubs");
      const clubsSnapshot = await getDocs(clubsRef);
      
      if (clubsSnapshot.empty) return;

      const batch = writeBatch(FIREBASE_DB);
      let index = 0; // Counter to ensure unique IDs
      
      clubsSnapshot.forEach((docSnap: QueryDocumentSnapshot) => {
        const docRef = doc(FIREBASE_DB, "clubs", docSnap.id);
        batch.update(docRef, { id: index++ }); 
      });

      await batch.commit();
    } catch (error) {
      console.error("Error updating club IDs: ", error);
    }
  };

  const fetchClubData = async () => {
    if (!id) return;

    try {
      const clubDocRef = doc(FIREBASE_DB, "clubs", id);
      const clubDocSnap = await getDoc(clubDocRef);
      if (clubDocSnap.exists()) {
        setCurrentClub(clubDocSnap.data() as Club);
        fetchUpcomingDates(); 
        fetchPastEvents(); 
      }
    } catch (error) {
      console.error("Error fetching club data: ", error);
    }
  };

  const fetchUpcomingDates = async () => {
    try {
      if (id) {
        const datesRef = collection(FIREBASE_DB, "clubs", id, "dates");
        const datesQuery = query(datesRef, orderBy("date"));
        const datesSnapshot = await getDocs(datesQuery);

        if (datesSnapshot.empty) return;

        const now = new Date(); 

        const datesList = datesSnapshot.docs.map(doc => {
          const data = doc.data();
          const eventTime = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date.seconds * 1000);
          return {
            name: doc.id,
            time: eventTime,
          };
        }).filter(date => date.time !== null && !isNaN(date.time.getTime()) && date.time >= now); 

        setUpcomingDates(datesList);
      }
    } catch (error) {
      console.error("Error fetching upcoming dates: ", error);
    }
  };

  const fetchPastEvents = async () => {
    try {
      if (id) {
        const pastEventsRef = collection(FIREBASE_DB, "clubs", id, "pastEvents");
        const pastEventsSnapshot = await getDocs(pastEventsRef);

        if (pastEventsSnapshot.empty) return;

        const pastEventsList = pastEventsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            name: doc.id,
            imageURL: data.imageURL || '',
            description: data.description || '',
          };
        });

        setPastEvents(pastEventsList);
      }
    } catch (error) {
      console.error("Error fetching past events: ", error);
    }
  };

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
      const clubDocRef = doc(FIREBASE_DB, "clubs", id || "");

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

  const handleImageLoad = (event: { nativeEvent: { source: { width: number; height: number } } }) => {
    const { width, height } = event.nativeEvent.source;
    const calculatedHeight = (screenWidth - 32) * (height / width);
    setImageHeight(calculatedHeight);
  };

  return (
    <View style={[styles.container, { backgroundColor: "#121212" }]}>
      <StatusBar
        animated={true}
        barStyle={"dark-content"}
        showHideTransition={"fade"}
        hidden={true}
      />
      <ScrollView style={styles.scrollView}>
        <TouchableOpacity onPress={router.back} style={styles.close_button}>
          <Ionicons name="close-sharp" size={24} color="white" />
        </TouchableOpacity>
        <Image
          source={{ uri: currentClub?.imageURL }}
          style={[styles.image, { height: imageHeight }]}
          resizeMode="cover"
          onLoad={handleImageLoad}
        />
        <Text style={styles.name}>{currentClub?.name}</Text>
        <View style={styles.divider} />
        <Text style={styles.description}>{currentClub?.longDescription}</Text>
        <View style={styles.divider} />
        <Pressable onPress={() => {
          currentClub?.sponsorEmail.indexOf(",") === -1
            ? Linking.openURL("mailto:" + currentClub?.sponsorEmail)
            : null;
        }}>
          <Text style={styles.sponsorEmail}>
            Sponsor: {currentClub?.sponsorEmail}
          </Text>
        </Pressable>

        <View style={styles.divider} />
        <Text style={styles.title}>Upcoming Dates</Text>
        {upcomingDates.length > 0 ? (
          upcomingDates.map((date, index) => (
            <View key={index} style={styles.dateContainer}>
              <Text style={styles.dateName}>{date.name}</Text>
              <Text style={styles.dateTime}>{date.time.toLocaleString()}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDates}>No upcoming dates.</Text>
        )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: isClubInCalendar ? "#d9534f" : "#007BFF" }]}
          onPress={handleAddOrRemoveClub}
        >
          <Text style={styles.buttonText}>
            {isClubInCalendar ? "Remove from Calendar" : "Add to Calendar"}
          </Text>
        </TouchableOpacity>
      </View>
        <View style={styles.divider} />
        <Text style={styles.title}>Past Events</Text>
        {pastEvents.length > 0 ? (
          pastEvents.map((event, index) => (
            <View key={index} style={styles.pastEventContainer}>
              <Image source={{ uri: event.imageURL }} style={styles.pastEventImage} />
              <View style={styles.pastEventDetails}>
                <Text style={styles.pastEventName}>{event.name}</Text>
                <Text style={styles.pastEventDescription}>{event.description}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDates}>No past events.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 42,
  },
  scrollView: {
    flex: 1,
  },
  close_button: {
    alignSelf: "flex-end",
  },
  image: {
    width: "100%",
    height: screenHeight * 0.3,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "grey",
    marginVertical: 16,
  },
  description: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
  },
  sponsorEmail: {
    fontSize: 16,
    color: "lightblue",
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  dateContainer: {
    backgroundColor: "#1e1e1e",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  dateName: {
    fontSize: 18,
    color: "white",
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 16,
    color: "grey",
  },
  noDates: {
    fontSize: 16,
    color: "grey",
    textAlign: "center",
    marginVertical: 16,
  },
  pastEventContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    padding: 16,
  },
  pastEventImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  pastEventDetails: {
    flex: 1,
  },
  pastEventName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  pastEventDescription: {
    fontSize: 16,
    color: "grey",
  },
  buttonContainer: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
});

export default Page;
