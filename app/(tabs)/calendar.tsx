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
      <Text>You need to be signed in to access the calendar</Text>
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
    const unsubscribe = onSnapshot(userDocRef, async (userDocSnap) => {
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const clubs = userData.clubs || [];

        const fetchedEvents: { date: string; title: string; club: string }[] = [];
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
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.header}>
            {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={handleNextMonth}>
            <Ionicons name="arrow-forward" size={24} color="black" />
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
    backgroundColor: "#f0f0f0",
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: Colors.AmarBackground,

  },
  calendarContainer: {
    marginTop: 50,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    marginVertical: 20,
  },
  daysOfWeekContainer: {
    flexDirection: "row",
  },
  dayOfWeek: {
    width: "14.28%",
    textAlign: "center",
    fontWeight: "bold",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayBox: {
    width: "14.28%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDayBox: {
    backgroundColor: "red",
    borderRadius: 25,
  },
  eventDayBox: {
    backgroundColor: "blue",
    borderRadius: 25,
  },
  eventDayText: {
    color: "#fff",
    fontWeight: "bold",
  },
  dayText: {
    color: "#000",
  },
  selectedDayText: {
    color: "#fff",
    fontWeight: "bold",
  },
  eventInputContainer: {
    marginTop: 20,
  },
  selectedDateText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    marginVertical: 10,
    borderRadius: 4,
  },
  addButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
    marginVertical: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  eventItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  eventTitleText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  clubText: {
    marginBottom: 5,
    fontSize: 18,
  },
  removeButton: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 50,
    borderColor: "white",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  upcomingEventsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5,
  },
  upcomingEventsHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  upcomingEventItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  upcomingEventDate: {
    fontSize: 16,
    fontWeight: "bold",
  },
  upcomingEventTitle: {
    fontSize: 16,
    marginVertical: 5,
  },
  upcomingEventClub: {
    fontSize: 14,
    color: "#555",
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default Calendar;
