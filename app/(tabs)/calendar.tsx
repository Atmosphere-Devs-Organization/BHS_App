import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  //ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "@/FirebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for arrow icons
import { ScrollView } from "react-native-virtualized-view";
import HACNeededScreen from "@/components/HACNeededScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useClubContext } from "@/components/ClubContext"; // Import the custom hook

const Calendar = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return <View style={styles.mainContainer}>{<NormalCalendar />}</View>;
};

const NormalCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<
    { date: string; title: string; club: string }[]
  >([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState<string>("");
  const { clubsCache, setClubsCache } = useClubContext(); // Use context
  const fetchEvents = async () => {
    try {
      // Fetch user clubs from AsyncStorage
      const storedClubs = await AsyncStorage.getItem("userClubs");
      const clubs = storedClubs ? JSON.parse(storedClubs) : [];

      const fetchedEvents: { date: string; title: string; club: string }[] =
        [];

      if (clubsCache.length > 0) {
      }
      // Use cached data if available

      try {
        // Fetch cached clubs data from Firestore
        const adminCacheRef = doc(FIREBASE_DB, "admin", "CachedClubs");
        const adminCacheSnap = await getDoc(adminCacheRef);
        const cachedClubsData = adminCacheSnap.data()?.clubs || [];

        if (cachedClubsData.length === 0) {
          return;
        }

        // Cache the fetched clubs data in the context
        setClubsCache(cachedClubsData);

        // Filter clubs by category
      } catch (error) {
        // Handle error
      } finally {
      }

      // Fetch club events from AsyncStorage
      for (const clubName of clubs) {
        // Find the club in the cache by its name
        const cachedClub = clubsCache.find((club) => club.name === clubName);

        if (cachedClub) {
          // Get the events from the cache (dateNames and dateDates)
          const { dateNames, dateDates } = cachedClub;
          // Combine the event names with their corresponding dates and add them to fetchedEvents
          dateNames.forEach((title, index) => {
            const Dates = dateDates[index];
            const eventDate = new Date(Dates.toDate())
              .toISOString()
              .split("T")[0];
            fetchedEvents.push({
              date: eventDate,
              title: title,
              club: clubName,
            });
          });
        }
      }

      // Fetch schoolwide events from Firebase
      const schoolEventsRef = collection(
        FIREBASE_DB,
        "admin",
        "SchoolDates",
        "dates"
      );

      const schoolEventsSnapshot = await getDocs(schoolEventsRef);
      schoolEventsSnapshot.forEach((doc) => {
        const dateData = doc.data();
        const eventDate = new Date(dateData.date.toDate())
          .toISOString()
          .split("T")[0];
        fetchedEvents.push({
          date: eventDate,
          title: doc.id,
          club: "Schoolwide",
        });
      });

      setEvents(fetchedEvents);
    } catch (error) {
      console.error("Error fetching events: ", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const daysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
    setSelectedDate(null);
  };

  const handleAddEvent = () => {
    if (selectedDate && eventTitle) {
      setEvents([
        ...events,
        { date: selectedDate, title: eventTitle, club: "Other" },
      ]);
      setEventTitle("");
    }
  };

  const handleRemoveEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateForList = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const days = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = firstDayOfMonth(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );

  const daysArray = Array.from({ length: days }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDay }, (_, i) => "");

  const upcomingEvents = events
    .filter((event) => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <ScrollView style={styles.container}>
      {/* Title Section */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>My Calendar</Text>
      
      </View>
      <View style={styles.calendarContainer}>
        <View style = {styles.centered}>
          <Text style={styles.calendarInfo}>                 *Under Maintainence*           </Text>
          <TouchableOpacity onPress={fetchEvents} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="orange" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={handlePrevMonth}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.header}>
            {currentDate.toLocaleString("default", { month: "long" })}{" "}
            {currentDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={handleNextMonth}>
            <Ionicons name="arrow-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.daysOfWeekContainer}>
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <Text key={index} style={styles.dayOfWeek}>
              {day}
            </Text>
          ))}
        </View>
        <View style={styles.daysContainer}>
          {blankDays.map((_, index) => (
            <View key={`blank-${index}`} style={styles.dayBox} />
          ))}
          {daysArray.map((day) => {
            const dateStr = `${currentDate.getFullYear()}-${(
              currentDate.getMonth() + 1
            )
              .toString()
              .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
            const hasEvent = events.some((event) => event.date === dateStr);
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayBox,
                  selectedDate === dateStr && styles.selectedDayBox,
                  hasEvent && styles.eventDayBox,
                ]}
                onPress={() => {
                  fetchEvents();
                  if (selectedDate === dateStr) {
                    setSelectedDate(null); // Deselect the current date
                  } else {
                    setSelectedDate(dateStr);
                  }
                }}
              >
                <Text
                  style={[
                    styles.dayText,
                    selectedDate === dateStr && styles.selectedDayText,
                    hasEvent && styles.eventDayText,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {selectedDate && (
          <View style={styles.eventInputContainer}>
            <Text style={styles.selectedDateText}>
              Selected Date: {formatDate(selectedDate)}
            </Text>

            <FlatList
              data={events.filter((event) => event.date === selectedDate)}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.eventItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventTitleText}>{item.club}</Text>
                    <Text style={styles.clubText}>{item.title}</Text>
                  </View>
                </View>
              )}
              scrollEnabled={false}
              horizontal={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </View>
      <View style={styles.upcomingEventsContainer}>
      <Text style={styles.upcomingEventsHeader}>Upcoming Events</Text>
      {/*<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true} >*/}
        <FlatList
          data={upcomingEvents}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.upcomingEventItem}>
              <Text style={styles.upcomingEventDate}>
                {formatDateForList(item.date)}
              </Text>
              <Text style={styles.upcomingEventTitle}>{item.title}</Text>
              <Text style={styles.upcomingEventClub}>{item.club}</Text>
            </View>
          )}
        />
        {/*</ScrollView>*/}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#121212",
    paddingBottom: 90,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 10,
    //marginBottom: 675,
  },
  calendarContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  daysOfWeekContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 5,
  },
  dayOfWeek: {
    color: "#FFF",
    fontWeight: "bold",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayBox: {
    width: "14.28%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  selectedDayBox: {
    backgroundColor: "#2176ff",
    borderRadius: 50,
  },
  eventDayBox: {
    borderColor: "#FF8500",
    borderWidth: 2,
    borderRadius: 50,
  },
  dayText: {
    color: "#FFF",
  },
  selectedDayText: {
    color: "white",
    fontWeight: "bold",
  },
  eventDayText: {
    color: "#fff",
    fontWeight: "bold",
  },
  eventInputContainer: {
    marginTop: 10,
    backgroundColor: "#1E1E1E",
    padding: 10,
    borderRadius: 10,
    alignContent: "center",
  },
  selectedDateText: {
    color: "white",
    marginTop: -10,
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderColor: "#666",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    color: "#FFF",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#ff8500",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#292929",
    borderRadius: 5,
    marginVertical: 5,
  },
  eventTitleText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  clubText: {
    color: "#BBB",
  },
  removeButton: {
    padding: 5,
  },
  upcomingEventsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    //height: 210,
  },
  upcomingEventsHeader: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
    marginLeft: 10,
  },
  upcomingEventItem: {
    marginBottom: 10,
    marginLeft: 10,
  },
  upcomingEventDate: {
    color: "#2176ff",
    fontWeight: "bold",
  },
  calendarInfo: {
    color: "orange",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 10,
    

  },
  upcomingEventTitle: {
    color: "#FFF",
    fontWeight: "bold",
  },
  upcomingEventClub: {
    color: "#BBB",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  text: {
    color: "#FFF",
    fontSize: 18,
  },
  titleContainer: {
    marginTop: 50,
    alignItems: "center",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFF",
  },
  refreshButton: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Calendar;
