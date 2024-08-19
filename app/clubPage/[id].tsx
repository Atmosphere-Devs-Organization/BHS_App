import React, { useEffect, useState, useContext } from "react";
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
import { Ionicons } from "@expo/vector-icons";
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
  writeBatch,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { useClubContext } from "@/components/ClubContext"; // Make sure this path is correct
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const Page = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { clubsCache, setClubsCache } = useClubContext(); // Use the custom hook

  const [currentClub, setCurrentClub] = useState<Club | null>(null);
  const [isClubInCalendar, setIsClubInCalendar] = useState<boolean>(false);
  const [upcomingDates, setUpcomingDates] = useState<
    { name: string; time: Date }[]
  >([]);
  const [pastEvents, setPastEvents] = useState<
    { name: string; imageURL: string; description: string }[]
  >([]);

  // State to store image dimensions
  const [imageHeight, setImageHeight] = useState<number>(screenHeight * 0.3);

  useEffect(() => {
    const updateAndFetch = async () => {
      if (id) {
        // Find the cached club by its name (id)
        const cachedClub = clubsCache.find((club) => club.name === id);

        if (cachedClub) {
          // Data is in cache, use it
          setCurrentClub(cachedClub);
          fetchUpcomingDates(cachedClub);
          fetchPastEvents(cachedClub);
        } else {
          // Data is not in cache, fetch from Firebase
          await fetchClubData();
        }

        checkIfClubInCalendar();
      }
    };

    updateAndFetch();
  }, [id, clubsCache]);

  const fetchClubData = async () => {
    if (!id) return;

    try {
      const adminCacheRef = doc(FIREBASE_DB, "admin", "CachedClubs");
      const adminCacheSnap = await getDoc(adminCacheRef);
      const cachedClubsData = adminCacheSnap.data()?.clubs || [];

      // Check if the club is already in the cache
      const cachedClub = cachedClubsData.find((club: Club) => club.name === id);

      if (cachedClub) {
        // Data is in cache, use it
        setCurrentClub(cachedClub);
        fetchUpcomingDates(cachedClub);
        fetchPastEvents(cachedClub);
      } else {
        // Data is not in cache, fetch from Firebase
        const clubDocRef = doc(FIREBASE_DB, "clubs", id);
        const clubDocSnap = await getDoc(clubDocRef);

        if (clubDocSnap.exists()) {
          const clubData = clubDocSnap.data() as Club;
          setCurrentClub(clubData);

          // Update the cache
          const updatedCachedClubsData = [...cachedClubsData, clubData];
          await updateDoc(adminCacheRef, { clubs: updatedCachedClubsData });

          // Update local cache
          setClubsCache(updatedCachedClubsData);

          fetchUpcomingDates(clubData);
          fetchPastEvents(clubData);
        }
      }
    } catch (error) {}
  };

  const fetchUpcomingDates = (clubData: Club) => {
    try {
      const dateNames: string[] = clubData.dateNames || [];
      const dateDates: Timestamp[] = clubData.dateDates || [];

      const now = new Date();
      const datesList = dateNames
        .map((name, index) => {
          const eventTime = dateDates[index]?.toDate() || new Date(0);

          return {
            name,
            time: eventTime,
          };
        })
        .filter(
          (date) =>
            date.time !== null &&
            !isNaN(date.time.getTime()) &&
            date.time >= now
        );

      setUpcomingDates(datesList);
    } catch (error) {}
  };

  const fetchPastEvents = (clubData: Club) => {
    try {
      const pastEventNames: string[] = clubData.pastEventNames || [];
      const pastEventDescriptions: string[] =
        clubData.pastEventDescriptions || [];
      const pastEventURLs: string[] = clubData.pastEventURLs || [];

      const pastEventsList = pastEventNames.map((name, index) => {
        return {
          name,
          description: pastEventDescriptions[index] || "",
          imageURL: pastEventURLs[index] || "",
        };
      });

      setPastEvents(pastEventsList);
    } catch (error) {}
  };

  const checkIfClubInCalendar = async () => {
    try {
      const storedClubs = await AsyncStorage.getItem("userClubs");
      const clubsArray = storedClubs ? JSON.parse(storedClubs) : [];
      if (clubsArray.includes(id || "")) {
        setIsClubInCalendar(true);
      }
    } catch (error) {
      // Handle errors if needed
    }
  };

  const handleAddOrRemoveClub = async () => {
    try {
      // Fetch the current list of clubs from AsyncStorage
      const storedClubs = await AsyncStorage.getItem("userClubs");
      const clubsArray = storedClubs ? JSON.parse(storedClubs) : [];

      if (isClubInCalendar) {
        // Remove the club from the list
        const updatedClubs = clubsArray.filter(
          (clubId: string) => clubId !== id
        );
        await AsyncStorage.setItem("userClubs", JSON.stringify(updatedClubs));
        setIsClubInCalendar(false);
        alert("Club removed from calendar! Reload app to see changes in calendar.");
      } else {
        // Add the club to the list
        clubsArray.push(id);
        await AsyncStorage.setItem("userClubs", JSON.stringify(clubsArray));
        setIsClubInCalendar(true);
        alert("Club added to calendar! Reload app to see changes in calendar");
        console.log("Stored clubs:", clubsArray);
      }
    } catch (error) {
      alert("Failed to manage club in calendar.");
    }
  };

  const handleImageLoad = (event: {
    nativeEvent: { source: { width: number; height: number } };
  }) => {
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
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={router.back} style={styles.close_button}>
          <Ionicons name="close-sharp" size={32} color="white" />
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

        <View style={styles.divider} />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isClubInCalendar ? "#d9534f" : "#007BFF" },
            ]}
            onPress={handleAddOrRemoveClub}
          >
            <Text style={styles.buttonText}>
              {isClubInCalendar ? "Remove from Calendar" : "Add to Calendar"}
            </Text>
          </TouchableOpacity>
        </View>

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

        <View style={styles.divider} />
        <Text style={styles.title}>Past Events</Text>
        {pastEvents.length > 0 ? (
          pastEvents.map((event, index) => (
            <View key={index} style={styles.pastEventContainer}>
              <Image
                source={{ uri: event.imageURL }}
                style={styles.pastEventImage}
              />
              <View style={{ flexDirection: "column" }}>
                <Text style={styles.pastEventName}>{event.name}</Text>
                <Text style={styles.pastEventDescription}>
                  {event.description}
                </Text>
              </View>
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
  noEvents: {
    fontSize: 16,
    color: "#888", // Light gray color for a subtle look
    textAlign: "center",
    marginVertical: 20,
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 42,
  },
  scrollView: {
    flex: 1,
  },
  close_button: {
    alignSelf: "flex-start",
    width: 50, // Adjust width as needed
    height: 50, // Adjust height as needed
    justifyContent: "center",
    alignItems: "center",
    padding: 10, // Adjust padding as needed
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
    marginRight: 110,
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
