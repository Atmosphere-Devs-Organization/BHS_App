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

  useEffect(() => {
    console.log("useEffect called");

    const updateAndFetch = async () => {
      console.log("Updating club IDs...");
      await updateClubIds();
      console.log("Finished updateClubIds");

      if (id) {
        fetchClubData(); // Fetch club data after updating IDs
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
    console.log("updateClubIds function started");
    try {
      const clubsRef = collection(FIREBASE_DB, "clubs");
      const clubsSnapshot = await getDocs(clubsRef);
      
      if (clubsSnapshot.empty) {
        console.log("No clubs found.");
        return;
      }

      const batch = writeBatch(FIREBASE_DB);
      let index = 0; // Counter to ensure unique IDs
      
      clubsSnapshot.forEach((docSnap: QueryDocumentSnapshot) => {
        const docRef = doc(FIREBASE_DB, "clubs", docSnap.id);
        batch.update(docRef, { id: index++ }); // Use a counter instead of indexOf
      });

      console.log("Committing batch...");
      await batch.commit();
      console.log("Club IDs updated successfully.");
    } catch (error) {
      console.error("Error updating club IDs: ", error);
    }
  };

  const fetchClubData = async () => {
    if (!id) {
      console.error("Club ID is undefined");
      return;
    }

    try {
      const clubDocRef = doc(FIREBASE_DB, "clubs", id);
      const clubDocSnap = await getDoc(clubDocRef);
      if (clubDocSnap.exists()) {
        setCurrentClub(clubDocSnap.data() as Club);
        fetchUpcomingDates(); // Fetch dates after setting the club data
        fetchPastEvents(); // Fetch past events after setting the club data
      } else {
        console.error("Club not found");
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

        if (datesSnapshot.empty) {
          console.log("No upcoming dates found.");
          return;
        }

        const now = new Date(); // Get the current date and time

        const datesList = datesSnapshot.docs.map(doc => {
          const data = doc.data();
          // Convert Timestamp to Date
          const eventTime = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date.seconds * 1000);
          return {
            name: doc.id,
            time: eventTime,
          };
        }).filter(date => date.time !== null && !isNaN(date.time.getTime()) && date.time >= now); // Filter out past dates

        console.log("Fetched upcoming dates:", datesList);
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

        if (pastEventsSnapshot.empty) {
          console.log("No past events found.");
          return;
        }

        const pastEventsList = pastEventsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            name: doc.id,
            imageURL: data.imageURL || '',
            description: data.description || '',
          };
        });

        console.log("Fetched past events:", pastEventsList); // Debugging
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

  return (
    <View style={[styles.container, { backgroundColor: Colors.AmarBackground }]}>
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
        <Image source={{ uri: currentClub?.imageURL }} style={styles.image} />
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
        <AwesomeButton
          style={styles.button}
          backgroundColor="#007BFF"
          backgroundDarker="#0056b3"
          height={screenWidth * 0.2}
          width={screenWidth * 0.8}
          onPress={handleAddOrRemoveClub}
        >
          {isClubInCalendar ? "Remove from Calendar" : "Add to Calendar"}
        </AwesomeButton>
        <View style={styles.divider} />
        <Text style={styles.title}>Past Events</Text>
        {pastEvents.length > 0 ? (
          pastEvents.map((event, index) => (
            <View key={index} style={styles.eventContainer}>
              <Image source={{ uri: event.imageURL }} style={styles.eventImage} />
              <Text style={styles.eventName}>{event.name}</Text>
              <Text style={styles.eventDescription}>{event.description}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noEvents}>No past events.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  close_button: {
    alignSelf: 'flex-end',
    margin: 10,
  },
  image: {
    width: screenWidth - 32,
    height: screenHeight * 0.3,
    borderRadius: 10,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'white',
    marginVertical: 8,
  },
  description: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
  },
  sponsorEmail: {
    fontSize: 16,
    color: '#007BFF',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  dateContainer: {
    marginBottom: 8,
  },
  dateName: {
    fontSize: 16,
    color: 'white',
  },
  dateTime: {
    fontSize: 14,
    color: 'lightgray',
  },
  noDates: {
    fontSize: 16,
    color: 'white',
  },
  button: {
    marginVertical: 16,
  },
  eventContainer: {
    marginBottom: 16,
  },
  eventImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 8,
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: 'lightgray',
  },
  noEvents: {
    fontSize: 16,
    color: 'white',
  },
});

export default Page;
