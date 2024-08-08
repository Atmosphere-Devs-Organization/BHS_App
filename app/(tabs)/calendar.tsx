import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { collection, doc, getDocs, onSnapshot } from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "@/FirebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { Ionicons } from '@expo/vector-icons';  // Import Ionicons for arrow icons
import Colors from "@/constants/Colors";

const Calendar = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.mainContainer}>
      {user ? <NormalCalendar user={user} /> : <LoggedOutCalendar />}
    </View>
  );
};

const LoggedOutCalendar = () => {
  return (
    <View style={styles.centered}>
      <Text style={styles.text}>You need to be signed in to access the calendar</Text>
    </View>
  );
};

const NormalCalendar = ({ user }: { user: User }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<{ date: string; title: string; club: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState<string>("");

  useEffect(() => {
    const userDocRef = doc(FIREBASE_DB, "users", user.uid);
    const schoolEventsRef = collection(FIREBASE_DB, "admin", "SchoolDates", "dates");

    const unsubscribe = onSnapshot(userDocRef, async (userDocSnap) => {
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const clubs = userData.clubs || [];

        const fetchedEvents: { date: string; title: string; club: string }[] = [];

        // Fetch club events
        for (const club of clubs) {
          const clubDocRef = doc(FIREBASE_DB, "clubs", club);
          const datesCollectionRef = collection(clubDocRef, "dates");
          const datesSnapshot = await getDocs(datesCollectionRef);

          datesSnapshot.forEach((doc) => {
            const dateData = doc.data();
            const eventDate = new Date(dateData.date.toDate()).toISOString().split("T")[0];
            fetchedEvents.push({ date: eventDate, title: doc.id, club });
          });
        }

        // Fetch schoolwide events
        const schoolEventsSnapshot = await getDocs(schoolEventsRef);
        schoolEventsSnapshot.forEach((doc) => {
          const dateData = doc.data();
          const eventDate = new Date(dateData.date.toDate()).toISOString().split("T")[0];
          fetchedEvents.push({ date: eventDate, title: doc.id, club: "Schoolwide" });
        });

        setEvents(fetchedEvents);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const handleAddEvent = () => {
    if (selectedDate && eventTitle) {
      setEvents([...events, { date: selectedDate, title: eventTitle, club: "Other" }]);
      setEventTitle("");
    }
  };

  const handleRemoveEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const formatDateForList = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const days = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const daysArray = Array.from({ length: days }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDay }, (_, i) => "");

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <View style={styles.container}>
      <View style={styles.calendarContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={handlePrevMonth}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.header}>
            {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
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
            const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const hasEvent = events.some(event => event.date === dateStr);
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayBox,
                  selectedDate === dateStr && styles.selectedDayBox,
                  hasEvent && styles.eventDayBox
                ]}
                onPress={() => {
                  if (selectedDate === dateStr) {
                    setSelectedDate(null);  // Deselect the current date
                  } else {
                    setSelectedDate(dateStr);
                  }
                }}
              >
                <Text style={[
                  styles.dayText,
                  selectedDate === dateStr && styles.selectedDayText,
                  hasEvent && styles.eventDayText
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {selectedDate && (
          <View style={styles.eventInputContainer}>
            <Text style={styles.selectedDateText}>Selected Date: {formatDate(selectedDate)}</Text>
            <TextInput
              style={styles.input}
              value={eventTitle}
              onChangeText={setEventTitle}
              placeholder="Event Title"
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={handleAddEvent} style={styles.addButton}>
              <Text style={styles.addButtonText}>Add Event</Text>
            </TouchableOpacity>
            <FlatList
              data={events.filter(event => event.date === selectedDate)}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.eventItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventTitleText}>{item.club}</Text>
                    <Text style={styles.clubText}>{item.title}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveEvent(index)} style={styles.removeButton}>
                    <Ionicons name="trash" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}
      </View>
      <View style={styles.upcomingEventsContainer}>
        <Text style={styles.upcomingEventsHeader}>Upcoming Events</Text>
        <FlatList
          data={upcomingEvents}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.upcomingEventItem}>
              <Text style={styles.upcomingEventDate}>{formatDateForList(item.date)}</Text>
              <Text style={styles.upcomingEventTitle}>{item.title}</Text>
              <Text style={styles.upcomingEventClub}>{item.club}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },
  container: {
    flex: 1,
    padding: 10,
  },
  calendarContainer: {
    marginTop: 50,
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
  },
  selectedDateText: {
    color: "white",
    marginBottom: 5,
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
  },
  upcomingEventsHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  upcomingEventItem: {
    marginBottom: 10,
  },
  upcomingEventDate: {
    color: "#03DAC6",
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
  },
  text: {
    color: "#FFF",
    fontSize: 18,
  },
});

export default Calendar;
